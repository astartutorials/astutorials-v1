import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkDiscountCode } from "@/lib/discount-codes";
import { isSemesterPlanId } from "@/lib/semester-plan";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Previews a discount code at checkout. Only a preview: initialize checks the
 * code again and sets the price itself.
 */
export async function POST(req: NextRequest) {
  const { code, plan, email } = await req.json().catch(() => ({}));
  if (!isSemesterPlanId(plan)) {
    return NextResponse.json({ error: "Choose a plan first." }, { status: 400 });
  }

  const result = await checkDiscountCode(supabase, code, plan, typeof email === "string" ? email : undefined);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ code: result.code, amountOff: result.amountOff, price: result.price });
}
