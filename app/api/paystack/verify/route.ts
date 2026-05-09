import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_URL =
  "https://api.whatsapp.com/send/?phone=2349160465678&text=Hello%2C+I+am+interested+in+requesting+a+private+tutorial.&type=phone_number&app_absent=0";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Payment service not configured" }, { status: 500 });
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  });

  const data = await res.json();

  if (!res.ok || !data.status || data.data?.status !== "success") {
    return new NextResponse("Payment verification failed. Please contact support.", { status: 402 });
  }

  return NextResponse.redirect(WHATSAPP_URL);
}
