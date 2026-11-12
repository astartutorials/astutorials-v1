import type { SupabaseClient } from '@supabase/supabase-js';
import { SEMESTER_PLANS, isSemesterPlanId, type SemesterPlanId } from '@/lib/semester-plan';

/**
 * Discount codes for the Full Semester Plan (migration 016). A code takes a
 * fixed amount off a plan and has a use cap. The browser only previews a code;
 * initialize re-checks it and sets the price, and a use is counted when the
 * discounted payment is recorded.
 */

export type DiscountCheck =
  | { ok: true; code: string; amountOff: number; price: number }
  | { ok: false; error: string };

export function normaliseCode(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toUpperCase() : '';
}

export async function checkDiscountCode(
  supabase: SupabaseClient,
  rawCode: unknown,
  plan: SemesterPlanId
): Promise<DiscountCheck> {
  const code = normaliseCode(rawCode);
  if (!code) return { ok: false, error: 'Enter a discount code.' };

  const { data: row } = await supabase
    .from('discount_codes')
    .select('code, amount_off, max_uses, plans, active')
    .eq('code', code)
    .maybeSingle();

  if (!row || !row.active) return { ok: false, error: 'That code isn’t valid.' };
  if (Array.isArray(row.plans) && !row.plans.includes(plan)) {
    return { ok: false, error: 'That code doesn’t apply to this plan.' };
  }

  const { count, error } = await supabase
    .from('discount_redemptions')
    .select('payment_reference', { count: 'exact', head: true })
    .eq('code', code);

  if (error) return { ok: false, error: 'Couldn’t check that code. Please try again.' };
  if ((count ?? 0) >= row.max_uses) return { ok: false, error: 'That code has been fully used.' };

  const base = SEMESTER_PLANS[plan].price;
  const amountOff = Math.min(row.amount_off, base);
  return { ok: true, code, amountOff, price: base - amountOff };
}

/**
 * Counts one use of a code for a recorded payment. Idempotent on the Paystack
 * reference, so the verify callback, webhook and reconcile can all call it.
 * Never throws: a missed count must not break recording the booking.
 */
export async function recordDiscountRedemption(
  supabase: SupabaseClient,
  reference: string,
  meta: { type?: string; plan?: string; discount_code?: string; discount_amount?: number | string } | null | undefined,
  amountPaid: number
): Promise<void> {
  const code = normaliseCode(meta?.discount_code);
  if (!code || meta?.type !== 'semester-plan') return;
  try {
    const { error } = await supabase.from('discount_redemptions').upsert(
      {
        payment_reference: reference,
        code,
        plan: isSemesterPlanId(meta.plan) ? meta.plan : null,
        amount_off: Number(meta.discount_amount) || 0,
        amount_paid: amountPaid,
      },
      { onConflict: 'payment_reference', ignoreDuplicates: true }
    );
    if (error) console.error(`[discount] redemption not recorded for ${reference}`, error);
  } catch (err) {
    console.error(`[discount] redemption not recorded for ${reference}`, err);
  }
}
