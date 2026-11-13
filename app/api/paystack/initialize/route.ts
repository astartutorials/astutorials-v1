import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/lib/turnstile";
import { upsertPaystackCustomer } from "@/lib/paystack-customer";
import { SEMESTER_PLANS, isSemesterPlanId, isSplitOpen } from "@/lib/semester-plan";
import { checkDiscountCode, normaliseCode } from "@/lib/discount-codes";
import { initializePaystackTransaction } from "@/lib/paystack-transaction";

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

  // The amount comes from the browser. A semester plan is a large fixed price,
  // so it is checked against the plan here rather than trusted. A discount code
  // is checked again here too, and the discount fields are set by the server.
  let paystackMeta = metadata ?? {};
  if (metadata?.type === "semester-plan") {
    const plan: unknown = metadata.plan;
    if (!isSemesterPlanId(plan)) {
      return NextResponse.json({ error: "Invalid plan or amount." }, { status: 400 });
    }

    // The discount and instalment fields are only ever set below, never taken
    // from the browser. The second instalment starts from the balance page, not
    // here.
    const rest = { ...metadata };
    const discount_code = rest.discount_code;
    const split = rest.payment_option === "split";
    delete rest.discount_code;
    delete rest.discount_amount;
    delete rest.code_kind;
    delete rest.ambassador_id;
    delete rest.payment_option;
    delete rest.instalment;
    delete rest.balance_id;

    if (split && !isSplitOpen()) {
      return NextResponse.json(
        { error: "Paying in 2 instalments has closed for this semester. Please pay in full." },
        { status: 400 }
      );
    }
    if (split) {
      rest.payment_option = "split";
      rest.instalment = 1;
      rest.notes = rest.notes ? `${rest.notes} | Paying in 2 instalments: 1 of 2` : "Paying in 2 instalments: 1 of 2";
    }
    paystackMeta = rest;
    let expected = split ? SEMESTER_PLANS[plan].instalment : SEMESTER_PLANS[plan].price;

    if (normaliseCode(discount_code)) {
      const discount = await checkDiscountCode(supabase, discount_code, plan, email, { split });
      if (!discount.ok) {
        return NextResponse.json({ error: discount.error }, { status: 400 });
      }
      expected = discount.price;
      const label = discount.kind === "referral" ? "Referral" : "Discount";
      const note = split
        ? `${label}: ${discount.code}`
        : `${label}: ${discount.code} (−₦${discount.amountOff.toLocaleString()})`;
      paystackMeta = {
        ...rest,
        discount_code: discount.code,
        discount_amount: discount.amountOff,
        code_kind: discount.kind,
        ...(discount.ambassadorId ? { ambassador_id: discount.ambassadorId } : {}),
        notes: rest.notes ? `${rest.notes} | ${note}` : note,
      };
    }

    if (amount !== expected) {
      return NextResponse.json({ error: "Invalid plan or amount." }, { status: 400 });
    }
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

  // Attach name and phone to the Paystack customer record before charging.
  // transaction/initialize ignores these fields, so without this the dashboard
  // shows an email and nothing else.
  await upsertPaystackCustomer({
    secret,
    email,
    fullName: metadata?.full_name,
    phone: metadata?.phone,
  });

  const result = await initializePaystackTransaction({ secret, email, amount, metadata: paystackMeta });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ authorization_url: result.url });
}
