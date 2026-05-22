import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendGroupBookingConfirmation, sendPrivateBookingReceipt } from "@/lib/email";
import { getPostHogClient } from "@/lib/posthog-server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(`${BASE_URL}/tutorials`);
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.redirect(`${BASE_URL}/tutorials`);
  }

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } }
  );

  const data = await res.json();

  if (!res.ok || !data.status || data.data?.status !== "success") {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: reference,
      event: "payment_verification_failed",
      properties: {
        payment_reference: reference,
        reason: data.message ?? "Transaction not successful",
      },
    });
    await posthog.shutdown();
    return NextResponse.redirect(`${BASE_URL}/group-tutorials/booking-failed`);
  }

  const tx = data.data;
  const meta = tx.metadata ?? {};
  const email = tx.customer?.email ?? "";
  const fullName = meta.full_name ?? tx.customer?.first_name ?? "Student";
  const amountPaid = Math.round(tx.amount / 100);
  // For group bookings, fetch tutorial upfront so we have org_id and can reuse data for email
  let tutorialForEmail: { title: string; date: string | null; time: string } | null = null;
  let bookingOrgId: string | null = meta.org_id ?? null; // private bookings carry org_id in metadata when booking page has context
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

  // Record the payment — both private and group bookings get a DB row
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (!existing) {
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
      return NextResponse.redirect(`${BASE_URL}/group-tutorials/booking-failed`);
    }

    // Increment seat counter for group bookings
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
    },
  });
  await posthog.shutdown();

  // Private tutorial → send receipt, then collect extra details before WhatsApp
  if (meta.type === "private") {
    await sendPrivateBookingReceipt({ to: email, fullName, amountPaid, reference });
    return NextResponse.redirect(`${BASE_URL}/tutorials/private/details?ref=${reference}`);
  }

  // Group tutorial → send confirmation email, redirect to success page
  if (email && tutorialForEmail) {
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

  return NextResponse.redirect(`${BASE_URL}/group-tutorials/booking-details?ref=${reference}`);
}
