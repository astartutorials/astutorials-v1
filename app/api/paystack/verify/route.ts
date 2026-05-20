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

  // Create the booking in the database
  await supabase.from("bookings").insert({
    tutorial_id: meta.tutorial_id ?? null,
    full_name: meta.full_name ?? tx.customer?.first_name ?? "Student",
    email: tx.customer?.email ?? "",
    phone: meta.phone ?? null,
    course: meta.course ?? null,
    matric_id: meta.matric_id ?? null,
    payment_status: "paid",
    payment_reference: reference,
  });

  return NextResponse.redirect(`${BASE_URL}/group-tutorials/booking-success?ref=${reference}`);
}
