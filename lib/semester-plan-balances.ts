import type { SupabaseClient } from '@supabase/supabase-js';
import {
  SEMESTER_PLANS,
  isSemesterPlanId,
  secondPaymentDueDate,
  type SemesterPlanId,
} from '@/lib/semester-plan';
import { normaliseCode } from '@/lib/discount-codes';
import { programmeOrgId } from '@/lib/programme-org';

/**
 * The second payment on a Full Semester Plan paid in 2 (migration 019).
 *
 * Both payments are ordinary bookings with Paystack metadata
 * `payment_option: "split"` and `instalment: 1 | 2`. The first opens a balance;
 * the second carries `balance_id` and settles it. The verify callback, webhook
 * and reconcile all call recordSplitPayment, so it is idempotent and never
 * throws: a missed balance must not break recording the booking.
 */

export interface SemesterPlanBalance {
  id: string;
  first_reference: string;
  org_id: string | null;
  plan: SemesterPlanId;
  full_name: string;
  email: string;
  phone: string | null;
  amount_due: number;
  due_date: string;
  referral_code: string | null;
  ambassador_id: string | null;
  paid_reference: string | null;
  paid_at: string | null;
  reminder_week_sent_at: string | null;
  reminder_due_sent_at: string | null;
  created_at: string;
}

export const BALANCE_COLUMNS =
  'id, first_reference, org_id, plan, full_name, email, phone, amount_due, due_date, referral_code, ambassador_id, paid_reference, paid_at, reminder_week_sent_at, reminder_due_sent_at, created_at';

export interface SplitMeta {
  type?: string;
  plan?: string;
  payment_option?: string;
  instalment?: number | string;
  balance_id?: string;
  discount_code?: string;
  code_kind?: string;
  ambassador_id?: string;
  full_name?: string;
  phone?: string;
}

export function isSplitPayment(meta: SplitMeta | null | undefined): boolean {
  return meta?.type === 'semester-plan' && meta.payment_option === 'split';
}

export function instalmentNumber(meta: SplitMeta | null | undefined): 1 | 2 | null {
  if (!isSplitPayment(meta)) return null;
  const n = String(meta?.instalment);
  return n === '1' ? 1 : n === '2' ? 2 : null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isBalanceId(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

export async function getBalance(
  supabase: SupabaseClient,
  id: string
): Promise<SemesterPlanBalance | null> {
  if (!isBalanceId(id)) return null;
  const { data } = await supabase
    .from('semester_plan_balances')
    .select(BALANCE_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  return (data as SemesterPlanBalance | null) ?? null;
}

/**
 * Opens the balance for a first instalment, or settles it for a second.
 * Returns the balance as it stands afterwards, or null when the payment is not
 * a split plan or the write failed.
 */
export async function recordSplitPayment(
  supabase: SupabaseClient,
  payment: {
    reference: string;
    meta: SplitMeta | null | undefined;
    email: string;
    fullName: string;
    phone: string | null;
    paidAt?: string | null;
  }
): Promise<SemesterPlanBalance | null> {
  const { reference, meta } = payment;
  const n = instalmentNumber(meta);
  if (!n || !meta) return null;

  try {
    if (n === 1) {
      if (!isSemesterPlanId(meta.plan)) return null;
      const paidAt = payment.paidAt ? new Date(payment.paidAt) : new Date();
      const referral = meta.code_kind === 'referral' && meta.ambassador_id;
      const { error } = await supabase.from('semester_plan_balances').upsert(
        {
          first_reference: reference,
          org_id: programmeOrgId(meta.type),
          plan: meta.plan,
          full_name: payment.fullName,
          email: payment.email,
          phone: payment.phone,
          amount_due: SEMESTER_PLANS[meta.plan].instalment,
          due_date: secondPaymentDueDate(Number.isNaN(paidAt.getTime()) ? new Date() : paidAt),
          referral_code: referral ? normaliseCode(meta.discount_code) || null : null,
          ambassador_id: referral ? meta.ambassador_id : null,
        },
        { onConflict: 'first_reference', ignoreDuplicates: true }
      );
      if (error) {
        console.error(`[balance] not opened for ${reference}`, error);
        return null;
      }
      const { data } = await supabase
        .from('semester_plan_balances')
        .select(BALANCE_COLUMNS)
        .eq('first_reference', reference)
        .maybeSingle();
      return (data as SemesterPlanBalance | null) ?? null;
    }

    if (!isBalanceId(meta.balance_id)) return null;
    const { error } = await supabase
      .from('semester_plan_balances')
      .update({ paid_reference: reference, paid_at: payment.paidAt ?? new Date().toISOString() })
      .eq('id', meta.balance_id)
      .is('paid_reference', null);
    if (error) console.error(`[balance] not settled by ${reference}`, error);
    return getBalance(supabase, meta.balance_id);
  } catch (err) {
    console.error(`[balance] not recorded for ${reference}`, err);
    return null;
  }
}

export type PaymentStatus = 'paid_in_full' | 'part_paid' | 'overdue';

/** `today` is a Lagos calendar date, YYYY-MM-DD. */
export function balanceStatus(b: Pick<SemesterPlanBalance, 'paid_at' | 'due_date'>, today: string): PaymentStatus {
  if (b.paid_at) return 'paid_in_full';
  return b.due_date < today ? 'overdue' : 'part_paid';
}
