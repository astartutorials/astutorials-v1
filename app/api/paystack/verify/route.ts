import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendGroupBookingConfirmation, sendPrivateBookingReceipt } from "@/lib/email";

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
    return NextResponse.redirect(`${BASE_URL}/group-tutorials/booking-failed`);
  }

  const tx = data.data;
  const meta = tx.metadata ?? {};
  const email = tx.customer?.email ?? "";
  const fullName = meta.full_name ?? tx.customer?.first_name ?? "Student";
  const amountPaid = Math.round(tx.amount / 100);

  // Record the payment — both private and group bookings get a DB row
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (!existing) {
    const { error: insertError } = await supabase.from("bookings").insert({
      tutorial_id: meta.type === "private" ? null : (meta.tutorial_id ?? null),
      full_name: fullName,
      email,
      phone: meta.phone ?? null,
      notes: meta.notes ?? null,
      amount_paid: amountPaid,
      payment_status: "paid",
      payment_reference: reference,
    });

    if (insertError) {
      return NextResponse.redirect(`${BASE_URL}/group-tutorials/booking-failed`);
    }
  }

  // Private tutorial → connect student with tutor via WhatsApp, send email receipt
  if (meta.type === "private") {
    const phone = meta.phone ?? "";
    const notes = meta.notes ? `\nNotes: ${meta.notes}` : "";
    const message = `Hello! I just paid for a private tutorial session.\n\nName: ${fullName}\nPhone: ${phone}${notes}`;
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=2349160465678&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;

    sendPrivateBookingReceipt({ to: email, fullName, amountPaid, reference });
    return NextResponse.redirect(whatsappUrl);
  }

  // Group tutorial → send confirmation email, redirect to success page
  if (email && meta.tutorial_id) {
    const { data: tutorial } = await supabase
      .from("tutorials")
      .select("title, date, time")
      .eq("id", meta.tutorial_id)
      .single();

    if (tutorial) {
      sendGroupBookingConfirmation({
        to: email,
        fullName,
        tutorialTitle: tutorial.title,
        tutorialDate: tutorial.date ?? "Date TBD",
        tutorialTime: tutorial.time,
        amountPaid,
        reference,
      });
    }
  }

  return NextResponse.redirect(`${BASE_URL}/group-tutorials/booking-success?ref=${reference}`);
}
