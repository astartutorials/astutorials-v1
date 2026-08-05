import type { SupabaseClient } from '@supabase/supabase-js';
import {
  sendGroupBookingConfirmation,
  sendPrivateBookingReceipt,
  sendPreClinicalsReceipt,
  sendNewBookingNotification,
} from '@/lib/email';

export interface PaystackTransaction {
  reference: string;
  amount: number;
  status: string;
  customer?: { email?: string; first_name?: string; phone?: string } | null;
  metadata?: {
    type?: string;
    tutorial_id?: string;
    org_id?: string;
    full_name?: string;
    phone?: string;
    course?: string;
    notes?: string;
  } | null;
}

export type RecordOutcome = 'inserted' | 'already_recorded' | 'insert_failed';

/**
 * Writes a booking for a successful Paystack transaction, mirroring what the
 * verify callback and webhook do, and sends the confirmation the student never
 * got. Idempotent on payment_reference, so it is safe to re-run over a window
 * that includes bookings already recorded by the other two paths.
 */
export async function recordBookingFromTransaction(
  supabase: SupabaseClient,
  tx: PaystackTransaction,
  opts: { sendEmails?: boolean } = {}
): Promise<{ outcome: RecordOutcome; reference: string; error?: string }> {
  const { sendEmails = true } = opts;
  const reference = tx.reference;
  const meta = tx.metadata ?? {};
  const email = tx.customer?.email ?? '';
  const fullName = meta.full_name ?? tx.customer?.first_name ?? 'Student';
  const amountPaid = Math.round((tx.amount ?? 0) / 100);
  const isPrivate = meta.type === 'private';
  const isPreclinicals = meta.type === 'preclinicals';

  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('payment_reference', reference)
    .maybeSingle();

  if (existing) return { outcome: 'already_recorded', reference };

  // Group bookings hang off a tutorial, which also supplies the org scope.
  let tutorialForEmail: { title: string; date: string | null; time: string } | null = null;
  let bookingOrgId: string | null = meta.org_id ?? null;

  if (!isPrivate && meta.tutorial_id) {
    const { data: tut } = await supabase
      .from('tutorials')
      .select('title, date, time, org_id')
      .eq('id', meta.tutorial_id)
      .single();
    if (tut) {
      tutorialForEmail = { title: tut.title, date: tut.date, time: tut.time };
      bookingOrgId = tut.org_id ?? null;
    }
  }

  const { error: insertError } = await supabase.from('bookings').insert({
    tutorial_id: isPrivate ? null : (meta.tutorial_id ?? null),
    org_id: bookingOrgId,
    full_name: fullName,
    email,
    phone: meta.phone ?? tx.customer?.phone ?? null,
    course: meta.course ?? null,
    notes: meta.notes ?? null,
    amount_paid: amountPaid,
    payment_status: 'paid',
    payment_reference: reference,
  });

  if (insertError) {
    console.error(`[reconcile] insert failed for ${reference}`, insertError);
    return { outcome: 'insert_failed', reference, error: insertError.message };
  }

  if (!isPrivate && meta.tutorial_id) {
    await supabase.rpc('increment_seats_booked', { tid: meta.tutorial_id });
  }

  if (sendEmails) {
    await sendNewBookingNotification({
      bookingType: isPrivate ? 'private' : isPreclinicals ? 'preclinicals' : 'group',
      fullName,
      email,
      phone: meta.phone ?? tx.customer?.phone ?? null,
      amountPaid,
      reference,
      tutorialTitle: tutorialForEmail?.title,
      course: meta.course ?? undefined,
    });

    if (email) {
      if (isPreclinicals) {
        await sendPreClinicalsReceipt({ to: email, fullName, amountPaid, reference });
      } else if (isPrivate) {
        await sendPrivateBookingReceipt({ to: email, fullName, amountPaid, reference });
      } else if (tutorialForEmail) {
        await sendGroupBookingConfirmation({
          to: email,
          fullName,
          tutorialTitle: tutorialForEmail.title,
          tutorialDate: tutorialForEmail.date ?? 'Date TBD',
          tutorialTime: tutorialForEmail.time,
          amountPaid,
          reference,
        });
      }
    }
  }

  return { outcome: 'inserted', reference };
}

/**
 * Pages through successful Paystack transactions since `from`. Paystack caps
 * perPage at 100; the page cap stops a misconfigured window from looping.
 */
export async function fetchSuccessfulTransactions(
  secret: string,
  from: Date,
  maxPages = 10
): Promise<PaystackTransaction[]> {
  const out: PaystackTransaction[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const url =
      `https://api.paystack.co/transaction?status=success&perPage=100&page=${page}` +
      `&from=${encodeURIComponent(from.toISOString())}`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${secret}` } });
    if (!res.ok) {
      const body = await res.text().catch(() => '<unreadable>');
      throw new Error(`Paystack transaction list failed: ${res.status} ${body}`);
    }

    const json = await res.json();
    const rows: PaystackTransaction[] = json.data ?? [];
    out.push(...rows);

    const pageCount = json.meta?.pageCount ?? 1;
    if (page >= pageCount || rows.length === 0) break;
  }

  return out;
}
