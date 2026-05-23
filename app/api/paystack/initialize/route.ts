import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/lib/turnstile";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, amount, metadata, turnstileToken } = await req.json();

  if (!await verifyTurnstile(turnstileToken)) {
    return NextResponse.json({ error: "Bot verification failed. Please try again." }, { status: 403 });
  }

  if (!email || !amount) {
    return NextResponse.json({ error: "Email and amount are required" }, { status: 400 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Payment service not configured" }, { status: 500 });
  }

  // For group bookings, refuse payment if the tutorial is already full
  if (metadata?.tutorial_id && metadata?.type !== "private") {
    const { data: tutorial } = await supabase
      .from("tutorials")
      .select("seats_total, seats_booked")
      .eq("id", metadata.tutorial_id)
      .single();

    if (tutorial && tutorial.seats_booked >= tutorial.seats_total) {
      return NextResponse.json({ error: "This tutorial is fully booked." }, { status: 409 });
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amount * 100, // Paystack expects kobo
      callback_url: `${baseUrl}/api/paystack/verify`,
      metadata: metadata ?? {},
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.status) {
    return NextResponse.json({ error: data.message ?? "Failed to initialise payment" }, { status: 502 });
  }

  return NextResponse.json({ authorization_url: data.data.authorization_url });
}
