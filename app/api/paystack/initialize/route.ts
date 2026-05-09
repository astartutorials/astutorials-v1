import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Payment service not configured" }, { status: 500 });
  }

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: 500000,
      callback_url: "http://localhost:3000/api/paystack/verify",
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.status) {
    return NextResponse.json({ error: data.message ?? "Failed to initialize payment" }, { status: 502 });
  }

  return NextResponse.json({ authorization_url: data.data.authorization_url });
}
