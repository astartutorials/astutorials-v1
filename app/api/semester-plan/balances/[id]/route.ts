import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBalance } from "@/lib/semester-plan-balances";
import { SEMESTER_PLANS } from "@/lib/semester-plan";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * What is left to pay on a plan paid in 2, for the success page. Only what the
 * payer already knows; no contact details.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const balance = await getBalance(supabase, id);
  if (!balance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    planName: SEMESTER_PLANS[balance.plan].name,
    amountDue: balance.amount_due,
    dueDate: balance.due_date,
    paid: Boolean(balance.paid_at),
  });
}
