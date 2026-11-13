import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBalance } from "@/lib/semester-plan-balances";
import { SEMESTER_PLANS, semesterPlanCourseLabel } from "@/lib/semester-plan";
import { initializePaystackTransaction } from "@/lib/paystack-transaction";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Starts the second payment on a plan paid in 2. Everything comes from the
 * balance row; the browser only names which balance. The balance id is the
 * unguessable link from the receipt and reminder emails, and paying someone
 * else's balance would only settle it for them, so there is no other check.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const balance = await getBalance(supabase, id);
  if (!balance) {
    return NextResponse.json({ error: "We couldn’t find that payment." }, { status: 404 });
  }
  if (balance.paid_at) {
    return NextResponse.json({ error: "This plan is already paid in full." }, { status: 409 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Payment service not configured" }, { status: 500 });
  }

  const referral = balance.ambassador_id && balance.referral_code;
  const result = await initializePaystackTransaction({
    secret,
    email: balance.email,
    amount: balance.amount_due,
    metadata: {
      type: "semester-plan",
      plan: balance.plan,
      payment_option: "split",
      instalment: 2,
      balance_id: balance.id,
      full_name: balance.full_name,
      phone: balance.phone,
      course: semesterPlanCourseLabel(balance.plan),
      notes: `Plan: ${SEMESTER_PLANS[balance.plan].name} | Paying in 2 instalments: 2 of 2 | First payment: ${balance.first_reference}`,
      // Carried over so the ambassador's commission is recorded now.
      ...(referral
        ? {
            discount_code: balance.referral_code,
            discount_amount: 0,
            code_kind: "referral",
            ambassador_id: balance.ambassador_id,
          }
        : {}),
    },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ authorization_url: result.url });
}
