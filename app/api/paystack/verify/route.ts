import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  // Private tutorial payment → redirect to WhatsApp with pre-filled details
  if (meta.type === "private") {
    const name = meta.full_name ?? tx.customer?.first_name ?? "Student";
    const phone = meta.phone ?? "";
    const notes = meta.notes ? `\nNotes: ${meta.notes}` : "";

    const message = `Hello! I just paid for a private tutorial session.\n\nName: ${name}\nPhone: ${phone}${notes}`;

    const whatsappUrl = `https://api.whatsapp.com/send/?phone=2349160465678&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
    return NextResponse.redirect(whatsappUrl);
  }

  // Group tutorial booking → create DB record and redirect to success page
  await supabase.from("bookings").insert({
    tutorial_id: meta.tutorial_id ?? null,
    full_name: meta.full_name ?? tx.customer?.first_name ?? "Student",
    email: tx.customer?.email ?? "",
    phone: meta.phone ?? null,
    notes: meta.notes ?? null,
    payment_status: "paid",
    payment_reference: reference,
  });

  return NextResponse.redirect(`${BASE_URL}/group-tutorials/booking-success?ref=${reference}`);
}
