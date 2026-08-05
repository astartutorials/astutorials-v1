import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAuditEvent } from '@/lib/audit';
import { fetchSuccessfulTransactions, recordBookingFromTransaction } from '@/lib/record-booking';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_LOOKBACK_DAYS = 3;
const MAX_LOOKBACK_DAYS = 90;

/**
 * Safety net for payments that neither the browser callback nor the webhook
 * recorded. Pulls successful Paystack transactions and inserts any booking that
 * is missing. Idempotent — re-running never double-books.
 *
 * `?days=N` widens the window for a one-off backfill; `?dryRun=1` reports what
 * would be inserted without writing.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
  }

  const daysParam = Number(request.nextUrl.searchParams.get('days'));
  const days = Number.isFinite(daysParam) && daysParam > 0
    ? Math.min(daysParam, MAX_LOOKBACK_DAYS)
    : DEFAULT_LOOKBACK_DAYS;
  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  let transactions;
  try {
    transactions = await fetchSuccessfulTransactions(secret, from);
  } catch (err) {
    console.error('[reconcile] could not list Paystack transactions', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }

  const recovered: string[] = [];
  const failed: { reference: string; error?: string }[] = [];
  let alreadyRecorded = 0;

  for (const tx of transactions) {
    if (!tx.reference) continue;

    if (dryRun) {
      const { data: existing } = await serviceSupabase
        .from('bookings')
        .select('id')
        .eq('payment_reference', tx.reference)
        .maybeSingle();
      if (existing) alreadyRecorded++;
      else recovered.push(tx.reference);
      continue;
    }

    const result = await recordBookingFromTransaction(serviceSupabase, tx);

    if (result.outcome === 'inserted') {
      recovered.push(tx.reference);
      // Deliberately awaited, not fire-and-forget: a recovered payment is a
      // money-touching event and the trail matters more than a few extra ms.
      await logAuditEvent({
        actorId: '00000000-0000-0000-0000-000000000000',
        actorEmail: 'system',
        action: 'booking.reconciled',
        targetType: 'booking',
        targetLabel: tx.reference,
        orgId: tx.metadata?.org_id ?? null,
        details: {
          reason: 'payment succeeded on Paystack but no booking row existed',
          amount_paid: Math.round((tx.amount ?? 0) / 100),
          email: tx.customer?.email ?? null,
        },
      });
    } else if (result.outcome === 'already_recorded') {
      alreadyRecorded++;
    } else {
      failed.push({ reference: result.reference, error: result.error });
    }
  }

  if (recovered.length > 0) {
    console.error(
      `[reconcile] recovered ${recovered.length} unrecorded payment(s): ${recovered.join(', ')}`
    );
  }

  return NextResponse.json({
    dryRun,
    windowDays: days,
    scanned: transactions.length,
    recovered: recovered.length,
    recoveredReferences: recovered,
    alreadyRecorded,
    failed,
  });
}
