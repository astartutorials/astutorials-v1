import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/lib/turnstile";
import { upsertPaystackCustomer } from "@/lib/paystack-customer";
import { SEMESTER_PLANS, isSemesterPlanId, isSplitOpen } from "@/lib/semester-plan";
import { checkDiscountCode, normaliseCode } from "@/lib/discount-codes";
import { initializePaystackTransaction } from "@/lib/paystack-transaction";
import { PRIVATE_SESSION_PRICE } from "@/lib/private-tutorials";
import { PRECLINICALS_PRICE } from "@/lib/preclinicals";
import { BUCC_CLASSES_PRICE } from "@/lib/bucc-classes";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Bookings with one fixed price, by metadata type. */
const FIXED_PRICES = new Map<unknown, number>([
  ["private", PRIVATE_SESSION_PRICE],
  ["preclinicals", PRECLINICALS_PRICE],
  ["bucc-classes", BUCC_CLASSES_PRICE],
]);

/** The only fields copied from the browser's metadata. Everything else is set here. */
function payerDetails(metadata: Record<string, unknown>) {
  const details: Record<string, unknown> = {};
  for (const key of ["full_name", "phone", "course", "notes"]) {
    if (metadata[key] !== undefined) details[key] = metadata[key];
  }
  return details;
}

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

  // The browser's amount is never trusted: every kind of booking has its price
  // worked out here, and a different amount is refused. Metadata is rebuilt
  // rather than passed through, because the verify callback and webhook act on
  // it (tutorial_id takes a seat, instalment and balance_id settle a plan).
  let expected: number;
  let paystackMeta: Record<string, unknown>;
  const fixedPrice = FIXED_PRICES.get(metadata?.type);

  if (metadata?.type === "semester-plan") {
    const plan: unknown = metadata.plan;
    if (!isSemesterPlanId(plan)) {
      return NextResponse.json({ error: "Invalid plan or amount." }, { status: 400 });
    }

    // The second instalment starts from the balance page, not here.
    const discount_code = metadata.discount_code;
    const split = metadata.payment_option === "split";
    const rest: Record<string, unknown> = { type: "semester-plan", plan, ...payerDetails(metadata) };

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
    expected = split ? SEMESTER_PLANS[plan].instalment : SEMESTER_PLANS[plan].price;

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
  } else if (fixedPrice !== undefined) {
    expected = fixedPrice;
    paystackMeta = {
      type: metadata.type,
      ...payerDetails(metadata),
      // Private bookings have no tutorial to take their org from.
      ...(metadata.type === "private" && metadata.org_id ? { org_id: metadata.org_id } : {}),
    };
  } else if (metadata?.tutorial_id && !metadata.type) {
    const { data: tutorial } = await supabase
      .from("tutorials")
      .select("seats_total, seats_booked, price")
      .eq("id", metadata.tutorial_id)
      .single();

    if (!tutorial) {
      return NextResponse.json({ error: "We couldn’t find that tutorial." }, { status: 404 });
    }
    // Refuse payment if the tutorial is already full
    if (tutorial.seats_booked >= tutorial.seats_total) {
      return NextResponse.json({ error: "This tutorial is fully booked." }, { status: 409 });
    }
    expected = tutorial.price;
    paystackMeta = { tutorial_id: metadata.tutorial_id, ...payerDetails(metadata) };
  } else {
    return NextResponse.json({ error: "Invalid booking." }, { status: 400 });
  }

  // Also catches an honest page left open across a price change.
  if (amount !== expected) {
    return NextResponse.json(
      { error: "This price has changed. Please refresh the page and try again." },
      { status: 400 }
    );
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

  const result = await initializePaystackTransaction({ secret, email, amount: expected, metadata: paystackMeta });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ authorization_url: result.url });
}
