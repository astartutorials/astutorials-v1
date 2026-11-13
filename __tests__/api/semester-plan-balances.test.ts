import { NextRequest } from 'next/server';

/**
 * Paying in 2: the balance opened by the first payment, settled by the second,
 * the page that starts the second payment, and the reminder job.
 */

type Row = Record<string, unknown>;
let balances: Row[];

// A small in-memory table: eq / is / gte filters, upsert, update, maybeSingle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function table(): any {
  const filters: ((r: Row) => boolean)[] = [];
  let patch: Row | null = null;
  const q = {
    select: () => q,
    eq: (c: string, v: unknown) => { filters.push((r) => r[c] === v); return q; },
    is: (c: string, v: unknown) => { filters.push((r) => (r[c] ?? null) === v); return q; },
    gte: (c: string, v: string) => { filters.push((r) => String(r[c]) >= v); return q; },
    update: (p: Row) => { patch = p; return q; },
    upsert: async (row: Row) => {
      if (!balances.some((b) => b.first_reference === row.first_reference)) {
        balances.push({ id: `0000000${balances.length + 1}-0000-4000-8000-000000000000`, paid_at: null, paid_reference: null, reminder_week_sent_at: null, reminder_due_sent_at: null, ...row });
      }
      return { error: null };
    },
    maybeSingle: async () => ({ data: balances.find((r) => filters.every((f) => f(r))) ?? null }),
    then: (resolve: (v: unknown) => void) => {
      const rows = balances.filter((r) => filters.every((f) => f(r)));
      if (patch) rows.forEach((r) => Object.assign(r, patch));
      resolve({ data: rows, error: null });
    },
  };
  return q;
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: (t: string) => {
      if (t !== 'semester_plan_balances') throw new Error(`unexpected table ${t}`);
      return table();
    },
  })),
}));

const mockReminder = jest.fn().mockResolvedValue(true);
jest.mock('@/lib/email', () => ({ sendBalanceReminder: (...a: unknown[]) => mockReminder(...a) }));
jest.mock('@/lib/health', () => ({ recordHeartbeat: jest.fn() }));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy';
process.env.CRON_SECRET = 'cron';

import { createClient } from '@supabase/supabase-js';
import { recordSplitPayment, balanceStatus } from '@/lib/semester-plan-balances';
import { POST as payBalance } from '@/app/api/semester-plan/balances/[id]/pay/route';
import { GET as reminders } from '@/app/api/cron/semester-plan-reminders/route';

const supabase = (createClient as jest.Mock)();
const first = (ref: string, meta: object = {}, paidAt = '2026-11-20T10:00:00Z') =>
  recordSplitPayment(supabase, {
    reference: ref,
    meta: { type: 'semester-plan', plan: 'group', payment_option: 'split', instalment: 1, ...meta },
    email: 'p@example.com',
    fullName: 'Ada Obi',
    phone: '0801',
    paidAt,
  });

beforeEach(() => {
  balances = [];
  mockReminder.mockClear().mockResolvedValue(true);
  (global.fetch as jest.Mock).mockReset().mockResolvedValue({
    ok: true,
    json: async () => ({ status: true, data: { authorization_url: 'https://paystack.com/pay/2' } }),
  });
});

describe('recordSplitPayment', () => {
  it('opens one balance for the first payment, due 14 December', async () => {
    const b = await first('ref1');
    await first('ref1');
    expect(balances).toHaveLength(1);
    expect(b).toMatchObject({
      first_reference: 'ref1', plan: 'group', amount_due: 55000, due_date: '2026-12-14',
      org_id: '00000000-0000-0000-0000-000000000001', referral_code: null, ambassador_id: null,
    });
  });

  it('gives a December joiner two weeks', async () => {
    expect((await first('ref1', {}, '2026-12-05T10:00:00Z'))?.due_date).toBe('2026-12-19');
  });

  it('keeps the referral for the second payment', async () => {
    const b = await first('ref1', { discount_code: 'tolu123', code_kind: 'referral', ambassador_id: 'amb-1' });
    expect(b).toMatchObject({ referral_code: 'TOLU123', ambassador_id: 'amb-1' });
  });

  it('settles the balance with the second payment, once', async () => {
    const b = await first('ref1');
    const meta = { type: 'semester-plan', plan: 'group', payment_option: 'split', instalment: 2, balance_id: b!.id };
    const settled = await recordSplitPayment(supabase, { reference: 'ref2', meta, email: '', fullName: '', phone: null, paidAt: '2026-12-01T09:00:00Z' });
    expect(settled).toMatchObject({ paid_reference: 'ref2', paid_at: '2026-12-01T09:00:00Z' });

    await recordSplitPayment(supabase, { reference: 'ref3', meta, email: '', fullName: '', phone: null });
    expect(balances[0].paid_reference).toBe('ref2');
  });

  it('ignores payments in full and other bookings', async () => {
    expect(await recordSplitPayment(supabase, { reference: 'x', meta: { type: 'semester-plan', plan: 'group' }, email: '', fullName: '', phone: null })).toBeNull();
    expect(await recordSplitPayment(supabase, { reference: 'y', meta: { type: 'private', payment_option: 'split', instalment: 1 }, email: '', fullName: '', phone: null })).toBeNull();
    expect(balances).toHaveLength(0);
  });
});

describe('balanceStatus', () => {
  it('is part paid until the due date passes, then overdue', () => {
    expect(balanceStatus({ paid_at: null, due_date: '2026-12-14' }, '2026-12-14')).toBe('part_paid');
    expect(balanceStatus({ paid_at: null, due_date: '2026-12-14' }, '2026-12-15')).toBe('overdue');
    expect(balanceStatus({ paid_at: '2026-12-20', due_date: '2026-12-14' }, '2026-12-21')).toBe('paid_in_full');
  });
});

describe('POST /api/semester-plan/balances/[id]/pay', () => {
  const call = (id: string) =>
    payBalance(new NextRequest(`http://localhost:3000/api/semester-plan/balances/${id}/pay`, { method: 'POST' }), {
      params: Promise.resolve({ id }),
    });

  it('starts the second payment from the balance, carrying the referral', async () => {
    const b = await first('ref1', { plan: 'private', discount_code: 'TOLU123', code_kind: 'referral', ambassador_id: 'amb-1' });
    const res = await call(b!.id);
    expect(res.status).toBe(200);
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body).toMatchObject({ email: 'p@example.com', amount: 16500000 });
    expect(body.metadata).toMatchObject({
      type: 'semester-plan', plan: 'private', payment_option: 'split', instalment: 2, balance_id: b!.id,
      code_kind: 'referral', ambassador_id: 'amb-1', discount_code: 'TOLU123', discount_amount: 0,
    });
  });

  it('refuses an unknown or already-paid balance', async () => {
    expect((await call('not-a-uuid')).status).toBe(404);
    const b = await first('ref1');
    balances[0].paid_at = '2026-12-01T00:00:00Z';
    expect((await call(b!.id)).status).toBe(409);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('GET /api/cron/semester-plan-reminders', () => {
  const run = (auth = 'Bearer cron') =>
    reminders(new NextRequest('http://localhost:3000/api/cron/semester-plan-reminders', { headers: { authorization: auth } }));

  afterEach(() => jest.useRealTimers());

  it('needs the cron secret', async () => {
    expect((await run('Bearer nope')).status).toBe(401);
  });

  it('reminds a week before and on the day, once each, and never once paid', async () => {
    await first('ref1');
    await first('ref2');
    balances[1].paid_at = '2026-11-25T00:00:00Z';

    jest.useFakeTimers({ now: new Date('2026-12-01T07:00:00Z') });
    await run();
    expect(mockReminder).not.toHaveBeenCalled();

    jest.setSystemTime(new Date('2026-12-07T07:00:00Z'));
    await run();
    await run();
    expect(mockReminder).toHaveBeenCalledTimes(1);
    expect(mockReminder).toHaveBeenLastCalledWith(expect.objectContaining({ stage: 'week', to: 'p@example.com' }));

    jest.setSystemTime(new Date('2026-12-14T07:00:00Z'));
    await run();
    await run();
    expect(mockReminder).toHaveBeenCalledTimes(2);
    expect(mockReminder).toHaveBeenLastCalledWith(expect.objectContaining({ stage: 'due' }));

    jest.setSystemTime(new Date('2026-12-15T07:00:00Z'));
    await run();
    expect(mockReminder).toHaveBeenCalledTimes(2);
  });

  it('tries again the next day when the email fails', async () => {
    await first('ref1');
    jest.useFakeTimers({ now: new Date('2026-12-08T07:00:00Z') });
    mockReminder.mockResolvedValueOnce(false);
    await run();
    expect(balances[0].reminder_week_sent_at).toBeNull();
    jest.setSystemTime(new Date('2026-12-09T07:00:00Z'));
    await run();
    expect(balances[0].reminder_week_sent_at).not.toBeNull();
  });
});
