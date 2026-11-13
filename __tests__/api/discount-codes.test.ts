import { NextRequest } from 'next/server';

// A tiny in-memory stand-in for the two tables the discount code touches.
let codes: Record<string, { code: string; amount_off: number; max_uses: number; plans: string[]; active: boolean }>;
let redemptions: { payment_reference: string; code: string }[];
const mockUpsert = jest.fn();
const mockReferralUpsert = jest.fn();
// Lets a describe block add tables without rewriting the base mock.
let extraFrom: ((table: string) => unknown) | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function from(table: string): any {
  if (extraFrom) { const f = extraFrom; extraFrom = null; try { return f(table); } finally { extraFrom = f; } }
  if (table === 'discount_codes') {
    return {
      select: () => ({
        eq: (_col: string, code: string) => ({
          maybeSingle: async () => ({ data: codes[code] ?? null }),
        }),
      }),
    };
  }
  if (table === 'discount_redemptions') {
    return {
      select: () => ({
        eq: async (_col: string, code: string) => ({
          count: redemptions.filter((r) => r.code === code).length,
          error: null,
        }),
      }),
      upsert: async (row: { payment_reference: string; code: string }) => {
        mockUpsert(row);
        if (!redemptions.some((r) => r.payment_reference === row.payment_reference)) redemptions.push(row);
        return { error: null };
      },
    };
  }
  if (table === 'ambassador_applications') {
    return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) };
  }
  throw new Error(`unexpected table ${table}`);
}

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn(() => ({ from: (t: string) => from(t) })) }));
jest.mock('@/lib/turnstile', () => ({ verifyTurnstile: jest.fn().mockResolvedValue(true) }));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy';

import { POST as initialize } from '@/app/api/paystack/initialize/route';
import { POST as check } from '@/app/api/discount-codes/check/route';
import { recordDiscountRedemption } from '@/lib/discount-codes';
import { createClient } from '@supabase/supabase-js';

const req = (url: string, body: object) =>
  new NextRequest(`http://localhost:3000${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const pay = (amount: number, meta: object, email = 'p@example.com') =>
  initialize(req('/api/paystack/initialize', { email, amount, metadata: { type: 'semester-plan', ...meta } }));

const paystackBody = () => JSON.parse((global.fetch as jest.Mock).mock.calls.at(-1)[1].body);

beforeEach(() => {
  codes = { ASTAR20K: { code: 'ASTAR20K', amount_off: 20000, max_uses: 2, plans: ['group', 'private'], active: true } };
  redemptions = [];
  mockUpsert.mockClear();
  mockReferralUpsert.mockClear();
  (global.fetch as jest.Mock).mockReset().mockResolvedValue({
    ok: true,
    json: async () => ({ status: true, data: { authorization_url: 'https://paystack.com/pay/x' } }),
  });
});

describe('POST /api/discount-codes/check', () => {
  it('previews the discounted price for each plan, ignoring case and spaces', async () => {
    for (const [plan, price] of [['group', 80000], ['private', 280000]] as const) {
      const res = await check(req('/api/discount-codes/check', { code: ' astar20k ', plan }));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ code: 'ASTAR20K', amountOff: 20000, price });
    }
  });

  it('refuses an unknown or inactive code', async () => {
    expect((await check(req('/api/discount-codes/check', { code: 'NOPE', plan: 'group' }))).status).toBe(400);
    codes.ASTAR20K.active = false;
    expect((await check(req('/api/discount-codes/check', { code: 'ASTAR20K', plan: 'group' }))).status).toBe(400);
  });

  it('refuses a code once it has been used max_uses times', async () => {
    redemptions = [{ payment_reference: 'a', code: 'ASTAR20K' }, { payment_reference: 'b', code: 'ASTAR20K' }];
    const res = await check(req('/api/discount-codes/check', { code: 'ASTAR20K', plan: 'group' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/fully used/);
  });
});

describe('initialize with a discount code', () => {
  it('charges the discounted price and stamps the discount into metadata', async () => {
    const res = await pay(80000, { plan: 'group', discount_code: 'astar20k', notes: 'Plan: Group' });
    expect(res.status).toBe(200);
    const body = paystackBody();
    expect(body.amount).toBe(8000000);
    expect(body.metadata).toMatchObject({ discount_code: 'ASTAR20K', discount_amount: 20000 });
    expect(body.metadata.notes).toBe('Plan: Group | Discount: ASTAR20K (−₦20,000)');
  });

  it('refuses the full price when a code is given, and the discounted price without one', async () => {
    expect((await pay(100000, { plan: 'group', discount_code: 'ASTAR20K' })).status).toBe(400);
    expect((await pay(80000, { plan: 'group' })).status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('refuses a used-up code', async () => {
    redemptions = [{ payment_reference: 'a', code: 'ASTAR20K' }, { payment_reference: 'b', code: 'ASTAR20K' }];
    expect((await pay(80000, { plan: 'group', discount_code: 'ASTAR20K' })).status).toBe(400);
  });

  it('ignores a discount_amount sent by the browser', async () => {
    const res = await pay(100000, { plan: 'group', discount_amount: 99999 });
    expect(res.status).toBe(200);
    expect(paystackBody().metadata.discount_amount).toBeUndefined();
  });
});

describe('recordDiscountRedemption', () => {
  const supabase = (createClient as jest.Mock)();
  const meta = { type: 'semester-plan', plan: 'group', discount_code: 'ASTAR20K', discount_amount: 20000 };

  it('counts a use once per payment reference', async () => {
    await recordDiscountRedemption(supabase, 'ref1', meta, 80000);
    await recordDiscountRedemption(supabase, 'ref1', meta, 80000);
    expect(redemptions).toHaveLength(1);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ payment_reference: 'ref1', code: 'ASTAR20K', amount_off: 20000, amount_paid: 80000 })
    );
  });

  it('does nothing without a code or outside the semester plan', async () => {
    await recordDiscountRedemption(supabase, 'ref2', { type: 'semester-plan', plan: 'group' }, 100000);
    await recordDiscountRedemption(supabase, 'ref3', { ...meta, type: 'private' }, 80000);
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});

describe('referral codes', () => {
  let ambassadors: Record<string, { id: string; email: string; status: string }>;
  const realFrom = from;

  beforeEach(() => {
    ambassadors = {
      TOLU123: { id: 'amb-1', email: 'tolu@x.com', status: 'approved' },
      PEND456: { id: 'amb-2', email: 'p@x.com', status: 'pending' },
    };
    extraFrom = (table: string) => {
      if (table === 'ambassador_applications') {
        return {
          select: () => ({
            eq: (_c: string, code: string) => ({ maybeSingle: async () => ({ data: ambassadors[code] ?? null }) }),
          }),
        };
      }
      if (table === 'referral_redemptions') {
        return {
          upsert: async (row: { payment_reference: string }) => {
            mockReferralUpsert(row);
            return { error: null };
          },
        };
      }
      return realFrom(table);
    };
  });

  afterEach(() => { extraFrom = null; });

  it('gives 10% off each plan with an approved ambassador code', async () => {
    for (const [plan, price] of [['group', 90000], ['private', 270000]] as const) {
      const res = await check(req('/api/discount-codes/check', { code: 'tolu123', plan }));
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ code: 'TOLU123', price });
    }
  });

  it('refuses a code from an ambassador who is not approved', async () => {
    expect((await check(req('/api/discount-codes/check', { code: 'PEND456', plan: 'group' }))).status).toBe(400);
  });

  it("refuses an ambassador's own code", async () => {
    const res = await pay(90000, { plan: 'group', discount_code: 'TOLU123' }, 'Tolu@X.com');
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/own referral code/);
  });

  it('charges the referral price and stamps the ambassador into metadata', async () => {
    const res = await pay(270000, { plan: 'private', discount_code: 'TOLU123', ambassador_id: 'spoofed' });
    expect(res.status).toBe(200);
    expect(paystackBody().metadata).toMatchObject({
      discount_code: 'TOLU123',
      discount_amount: 30000,
      code_kind: 'referral',
      ambassador_id: 'amb-1',
    });
  });

  it('records the flat commission for the plan, whatever the discount', async () => {
    const supabase = (createClient as jest.Mock)();
    await recordDiscountRedemption(
      supabase,
      'ref9',
      { type: 'semester-plan', plan: 'group', discount_code: 'TOLU123', discount_amount: 10000, code_kind: 'referral', ambassador_id: 'amb-1' },
      90000
    );
    expect(mockReferralUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ payment_reference: 'ref9', ambassador_id: 'amb-1', commission: 5000, amount_paid: 90000 })
    );
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});

describe('paying in 2', () => {
  let ambassadors: Record<string, { id: string; email: string; status: string }>;
  const realFrom = from;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-11-20T10:00:00Z') });
    ambassadors = { TOLU123: { id: 'amb-1', email: 'tolu@x.com', status: 'approved' } };
    extraFrom = (table: string) => {
      if (table === 'ambassador_applications') {
        return {
          select: () => ({
            eq: (_c: string, code: string) => ({ maybeSingle: async () => ({ data: ambassadors[code] ?? null }) }),
          }),
        };
      }
      if (table === 'referral_redemptions') {
        return { upsert: async (row: object) => { mockReferralUpsert(row); return { error: null }; } };
      }
      return realFrom(table);
    };
  });

  afterEach(() => {
    extraFrom = null;
    jest.useRealTimers();
  });

  it('charges the first instalment and marks it as 1 of 2', async () => {
    for (const [plan, amount] of [['group', 55000], ['private', 165000]] as const) {
      const res = await pay(amount, { plan, payment_option: 'split', notes: 'Plan: X' });
      expect(res.status).toBe(200);
      const body = paystackBody();
      expect(body.amount).toBe(amount * 100);
      expect(body.metadata).toMatchObject({ payment_option: 'split', instalment: 1 });
      expect(body.metadata.notes).toBe('Plan: X | Paying in 2 instalments: 1 of 2');
    }
  });

  it('refuses the full price, or half the full price, when splitting', async () => {
    expect((await pay(100000, { plan: 'group', payment_option: 'split' })).status).toBe(400);
    expect((await pay(50000, { plan: 'group', payment_option: 'split' })).status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('never takes an instalment number or balance from the browser', async () => {
    const res = await pay(100000, { plan: 'group', instalment: 2, balance_id: 'b-1' });
    expect(res.status).toBe(200);
    const meta = paystackBody().metadata;
    expect(meta.instalment).toBeUndefined();
    expect(meta.balance_id).toBeUndefined();
    expect(meta.payment_option).toBeUndefined();
  });

  it('refuses a discount code when splitting', async () => {
    const res = await pay(35000, { plan: 'group', payment_option: 'split', discount_code: 'ASTAR20K' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/pay in full/);
    const preview = await check(req('/api/discount-codes/check', { code: 'ASTAR20K', plan: 'group', paymentOption: 'split' }));
    expect(preview.status).toBe(400);
  });

  it('accepts a referral code at no discount, so the ambassador is credited', async () => {
    const preview = await check(req('/api/discount-codes/check', { code: 'TOLU123', plan: 'group', paymentOption: 'split' }));
    expect(await preview.json()).toEqual({ code: 'TOLU123', amountOff: 0, price: 55000 });

    const res = await pay(55000, { plan: 'group', payment_option: 'split', discount_code: 'TOLU123' });
    expect(res.status).toBe(200);
    expect(paystackBody().metadata).toMatchObject({
      discount_code: 'TOLU123',
      discount_amount: 0,
      code_kind: 'referral',
      ambassador_id: 'amb-1',
      instalment: 1,
    });
  });

  it('closes after 25 January', async () => {
    jest.setSystemTime(new Date('2027-01-25T22:00:00Z')); // 23:00 in Lagos: still the 25th
    expect((await pay(55000, { plan: 'group', payment_option: 'split' })).status).toBe(200);
    jest.setSystemTime(new Date('2027-01-25T23:30:00Z')); // 00:30 on the 26th in Lagos
    const res = await pay(55000, { plan: 'group', payment_option: 'split' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/closed/);
  });

  it('records the commission on the second payment only, against the full amount', async () => {
    const supabase = (createClient as jest.Mock)();
    const meta = {
      type: 'semester-plan', plan: 'private', payment_option: 'split',
      discount_code: 'TOLU123', discount_amount: 0, code_kind: 'referral', ambassador_id: 'amb-1',
    };
    await recordDiscountRedemption(supabase, 'first', { ...meta, instalment: 1 }, 165000);
    expect(mockReferralUpsert).not.toHaveBeenCalled();

    await recordDiscountRedemption(supabase, 'second', { ...meta, instalment: 2 }, 165000);
    expect(mockReferralUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ payment_reference: 'second', commission: 15000, amount_paid: 330000, discount_amount: 0 })
    );
  });
});
