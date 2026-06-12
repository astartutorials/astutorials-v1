import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPaystackSignature } from "@/lib/paystack-signature";
import { sendGroupBookingConfirmation, sendPrivateBookingReceipt, sendNewBookingNotification } from "@/lib/email";
import { getPostHogClient } from "@/lib/posthog-server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  type PaystackMetadata = { full_name?: string; org_id?: string; type?: string; tutorial_id?: string; phone?: string; course?: string; notes?: string };
  type PaystackTxData = { metadata?: PaystackMetadata; reference?: string; customer?: { email?: string; first_name?: string }; amount?: number };
  let event: { event: string; data: PaystackTxData };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const tx = event.data;
  const meta = tx.metadata ?? {};
  const reference = tx.reference as string;
  const email = tx.customer?.email ?? "";
  const fullName = meta.full_name ?? tx.customer?.first_name ?? "Student";
  const amountPaid = Math.round(tx.amount / 100);

  let tutorialForEmail: { title: string; date: string | null; time: string } | null = null;
  let bookingOrgId: string | null = meta.org_id ?? null;

  if (meta.type !== "private" && meta.tutorial_id) {
    const { data: tut } = await supabase
      .from("tutorials")
      .select("title, date, time, org_id")
      .eq("id", meta.tutorial_id)
      .single();
    if (tut) {
      tutorialForEmail = { title: tut.title, date: tut.date, time: tut.time };
      bookingOrgId = tut.org_id ?? null;
    }
  }

  // Idempotency — skip if already processed
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (!existing) {
    if (meta.type !== "private" && meta.tutorial_id) {
      const { data: tutorial } = await supabase
        .from("tutorials")
        .select("seats_total, seats_booked")
        .eq("id", meta.tutorial_id)
        .single();
      if (tutorial && tutorial.seats_booked >= tutorial.seats_total) {
        return NextResponse.json({ error: "Tutorial fully booked" }, { status: 409 });
      }
    }

    const { error: insertError } = await supabase.from("bookings").insert({
      tutorial_id: meta.type === "private" ? null : (meta.tutorial_id ?? null),
      org_id: bookingOrgId,
      full_name: fullName,
      email,
      phone: meta.phone ?? null,
      course: meta.course ?? null,
      notes: meta.notes ?? null,
      amount_paid: amountPaid,
      payment_status: "paid",
      payment_reference: reference,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    if (meta.type !== "private" && meta.tutorial_id) {
      await supabase.rpc("increment_seats_booked", { tid: meta.tutorial_id });
    }
  }

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: email || reference,
    event: "payment_verified",
    properties: {
      payment_reference: reference,
      amount_paid: amountPaid,
      booking_type: meta.type === "private" ? "private" : "group",
      tutorial_id: meta.tutorial_id ?? null,
      course: meta.course ?? null,
      source: "webhook",
    },
  });
  await posthog.shutdown();

  await sendNewBookingNotification({
    bookingType: meta.type === "private" ? "private" : "group",
    fullName,
    email,
    phone: meta.phone ?? null,
    amountPaid,
    reference,
    tutorialTitle: tutorialForEmail?.title,
    course: meta.course ?? undefined,
  });

  if (meta.type === "private") {
    await sendPrivateBookingReceipt({ to: email, fullName, amountPaid, reference });
  } else if (email && tutorialForEmail) {
    await sendGroupBookingConfirmation({
      to: email,
      fullName,
      tutorialTitle: tutorialForEmail.title,
      tutorialDate: tutorialForEmail.date ?? "Date TBD",
      tutorialTime: tutorialForEmail.time,
      amountPaid,
      reference,
    });
  }

  return NextResponse.json({ received: true });
}
