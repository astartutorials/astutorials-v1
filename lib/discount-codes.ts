import type { SupabaseClient } from '@supabase/supabase-js';
import { SEMESTER_PLANS, isSemesterPlanId, type SemesterPlanId } from '@/lib/semester-plan';
import { AMBASSADOR_COMMISSIONS, referralDiscount } from '@/lib/ambassador';

/**
 * Codes at Semester Plan checkout. One field, one code at a time, two kinds:
 *
 *  - discount codes (migration 016): a fixed amount off, with a use cap.
 *  - referral codes (migration 018): an approved ambassador's code. The
 *    student gets 10% off and the ambassador earns a flat commission. An
 *    ambassador can't use their own code.
 *
 * The browser only previews a code; initialize re-checks it and sets the
 * price, and the use is recorded when the payment is.
 */

export type CodeKind = 'discount' | 'referral';

export type DiscountCheck =
  | { ok: true; code: string; amountOff: number; price: number; kind: CodeKind; ambassadorId?: string }
  | { ok: false; error: string };

export function normaliseCode(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toUpperCase() : '';
}

export async function checkDiscountCode(
  supabase: SupabaseClient,
  rawCode: unknown,
  plan: SemesterPlanId,
  /** The payer's email, when known: an ambassador can't use their own code. */
  payerEmail?: string
): Promise<DiscountCheck> {
  const code = normaliseCode(rawCode);
  if (!code) return { ok: false, error: 'Enter a discount code.' };

  const { data: row } = await supabase
    .from('discount_codes')
    .select('code, amount_off, max_uses, plans, active')
    .eq('code', code)
    .maybeSingle();

  if (!row) return checkReferralCode(supabase, code, plan, payerEmail);
  if (!row.active) return { ok: false, error: 'That code isn’t valid.' };
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
  return { ok: true, code, amountOff, price: base - amountOff, kind: 'discount' };
}

async function checkReferralCode(
  supabase: SupabaseClient,
  code: string,
  plan: SemesterPlanId,
  payerEmail?: string
): Promise<DiscountCheck> {
  const { data: ambassador } = await supabase
    .from('ambassador_applications')
    .select('id, email, status')
    .eq('referral_code', code)
    .maybeSingle();

  if (!ambassador || ambassador.status !== 'approved') return { ok: false, error: 'That code isn’t valid.' };
  if (payerEmail && ambassador.email?.toLowerCase() === payerEmail.trim().toLowerCase()) {
    return { ok: false, error: 'You can’t use your own referral code.' };
  }

  const amountOff = referralDiscount(plan);
  return {
    ok: true,
    code,
    amountOff,
    price: SEMESTER_PLANS[plan].price - amountOff,
    kind: 'referral',
    ambassadorId: ambassador.id,
  };
}

export interface CodeMeta {
  type?: string;
  plan?: string;
  discount_code?: string;
  discount_amount?: number | string;
  code_kind?: string;
  ambassador_id?: string;
}

/**
 * Records one use of a code for a recorded payment: a discount-code use, or a
 * referral with the commission owed. Idempotent on the Paystack reference, so
 * the verify callback, webhook and reconcile can all call it. Never throws: a
 * missed record must not break recording the booking.
 */
export async function recordDiscountRedemption(
  supabase: SupabaseClient,
  reference: string,
  meta: CodeMeta | null | undefined,
  amountPaid: number
): Promise<void> {
  const code = normaliseCode(meta?.discount_code);
  if (!code || meta?.type !== 'semester-plan') return;
  const plan = isSemesterPlanId(meta.plan) ? meta.plan : null;
  try {
    const { error } =
      meta.code_kind === 'referral' && meta.ambassador_id
        ? await supabase.from('referral_redemptions').upsert(
            {
              payment_reference: reference,
              ambassador_id: meta.ambassador_id,
              referral_code: code,
              plan,
              discount_amount: Number(meta.discount_amount) || 0,
              amount_paid: amountPaid,
              commission: plan ? AMBASSADOR_COMMISSIONS[plan] : 0,
            },
            { onConflict: 'payment_reference', ignoreDuplicates: true }
          )
        : await supabase.from('discount_redemptions').upsert(
            {
              payment_reference: reference,
              code,
              plan,
              amount_off: Number(meta.discount_amount) || 0,
              amount_paid: amountPaid,
            },
            { onConflict: 'payment_reference', ignoreDuplicates: true }
          );
    if (error) console.error(`[discount] use not recorded for ${reference}`, error);
  } catch (err) {
    console.error(`[discount] use not recorded for ${reference}`, err);
  }
}
