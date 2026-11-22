import { NextRequest } from 'next/server';

const mockSingle = jest.fn().mockResolvedValue({ data: { seats_total: 30, seats_booked: 0, price: 5000 } });
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: jest.fn(() => ({ select: mockSelect })) })),
}));

const mockVerifyTurnstile = jest.fn().mockResolvedValue(true);
jest.mock('@/lib/turnstile', () => ({
  verifyTurnstile: (...args: unknown[]) => mockVerifyTurnstile(...args),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';

import { POST } from '@/app/api/paystack/initialize/route';

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/paystack/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/paystack/initialize', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
    mockSingle.mockReset().mockResolvedValue({ data: { seats_total: 30, seats_booked: 0, price: 5000 } });
    mockVerifyTurnstile.mockResolvedValue(true);
  });

  it('returns 403 when Turnstile verification fails', async () => {
    mockVerifyTurnstile.mockResolvedValueOnce(false);
    const res = await POST(makeRequest({ email: 'test@example.com', amount: 5000, turnstileToken: 'bad' }));
    expect(res.status).toBe(403);
  });

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeRequest({ amount: 5000 }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 400 when amount is missing', async () => {
    const res = await POST(makeRequest({ email: 'test@example.com' }));
    expect(res.status).toBe(400);
  });

  it('returns the authorization_url on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: true,
        data: { authorization_url: 'https://checkout.paystack.com/abc123' },
      }),
    });

    const res = await POST(makeRequest({ email: 'test@example.com', amount: 5000, metadata: { tutorial_id: 'tut-1' } }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.authorization_url).toBe('https://checkout.paystack.com/abc123');
  });

  it('sends the amount multiplied by 100 (kobo) to Paystack', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true, data: { authorization_url: 'https://paystack.com/pay/x' } }),
    });

    await POST(makeRequest({ email: 'test@example.com', amount: 6090, metadata: { type: 'private' } }));

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.amount).toBe(609000);
  });

  it('returns 409 when the tutorial is fully booked', async () => {
    mockSingle.mockResolvedValueOnce({ data: { seats_total: 30, seats_booked: 30, price: 5000 } });

    const res = await POST(makeRequest({
      email: 'test@example.com',
      amount: 5000,
      metadata: { tutorial_id: 'tut-1' },
    }));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain('fully booked');
  });

  it('returns 502 when Paystack returns an error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid secret key' }),
    });

    const res = await POST(makeRequest({ email: 'test@example.com', amount: 5000, metadata: { tutorial_id: 'tut-1' } }));
    expect(res.status).toBe(502);
  });

  it('returns 500 when PAYSTACK_SECRET_KEY is not set', async () => {
    const saved = process.env.PAYSTACK_SECRET_KEY;
    delete process.env.PAYSTACK_SECRET_KEY;

    const res = await POST(makeRequest({ email: 'test@example.com', amount: 5000, metadata: { tutorial_id: 'tut-1' } }));
    expect(res.status).toBe(500);

    process.env.PAYSTACK_SECRET_KEY = saved;
  });

  it('registers the customer name and phone with Paystack before charging', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true }) // customer upsert
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: true, data: { authorization_url: 'https://paystack.com/pay/x' } }),
      });

    const res = await POST(makeRequest({
      email: 'ada@example.com',
      amount: 6090,
      metadata: { type: 'private', full_name: 'Ada Obi', phone: '+2348012345678' },
    }));
    expect(res.status).toBe(200);

    const [customerUrl, customerInit] = (global.fetch as jest.Mock).mock.calls[0];
    expect(customerUrl).toBe('https://api.paystack.co/customer');
    expect(JSON.parse(customerInit.body)).toMatchObject({
      email: 'ada@example.com',
      first_name: 'Ada',
      last_name: 'Obi',
      phone: '+2348012345678',
    });

    expect((global.fetch as jest.Mock).mock.calls[1][0]).toBe(
      'https://api.paystack.co/transaction/initialize'
    );
  });

  it('still initialises the payment when the customer upsert fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new TypeError('fetch failed')) // customer upsert dies
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: true, data: { authorization_url: 'https://paystack.com/pay/x' } }),
      });

    const res = await POST(makeRequest({
      email: 'ada@example.com',
      amount: 6090,
      metadata: { type: 'private', full_name: 'Ada Obi' },
    }));

    expect(res.status).toBe(200);
    expect((await res.json()).authorization_url).toBe('https://paystack.com/pay/x');
  });

  describe('price checks', () => {
    const okPaystack = () =>
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ status: true, data: { authorization_url: 'https://paystack.com/pay/x' } }),
      });
    const sent = () => JSON.parse((global.fetch as jest.Mock).mock.calls.at(-1)[1].body);

    it.each([
      ['a private session', 6090, { type: 'private' }],
      ['Pre-Clinicals', 60000, { type: 'preclinicals' }],
      ['BUCC classes', 60000, { type: 'bucc-classes' }],
      ['a group tutorial', 5000, { tutorial_id: 'tut-1' }],
    ])('accepts the listed price for %s and refuses any other', async (_label, price, metadata) => {
      okPaystack();
      for (const amount of [100, price - 1, price + 1, -price, String(price)]) {
        const res = await POST(makeRequest({ email: 'p@example.com', amount, metadata }));
        expect(res.status).toBe(400);
      }
      expect(global.fetch).not.toHaveBeenCalled();

      const res = await POST(makeRequest({ email: 'p@example.com', amount: price, metadata }));
      expect(res.status).toBe(200);
      expect(sent().amount).toBe(price * 100);
    });

    it.each([
      ['no metadata', undefined],
      ['empty metadata', {}],
      ['an unknown type', { type: 'vip' }],
      ['an unknown type on a tutorial', { type: 'vip', tutorial_id: 'tut-1' }],
      ['an inherited object key as the type', { type: 'constructor' }],
    ])('refuses %s', async (_label, metadata) => {
      const res = await POST(makeRequest({ email: 'p@example.com', amount: 100, metadata }));
      expect(res.status).toBe(400);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('refuses a tutorial that does not exist', async () => {
      mockSingle.mockResolvedValueOnce({ data: null });
      const res = await POST(makeRequest({ email: 'p@example.com', amount: 100, metadata: { tutorial_id: 'nope' } }));
      expect(res.status).toBe(404);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('does not let a fixed-price booking or a plan carry a tutorial seat', async () => {
      okPaystack();
      for (const [amount, metadata] of [
        [6090, { type: 'private', tutorial_id: 'tut-1' }],
        [60000, { type: 'preclinicals', tutorial_id: 'tut-1' }],
        [100000, { type: 'semester-plan', plan: 'group', tutorial_id: 'tut-1' }],
      ] as const) {
        const res = await POST(makeRequest({ email: 'p@example.com', amount, metadata }));
        expect(res.status).toBe(200);
        expect(sent().metadata).not.toHaveProperty('tutorial_id');
      }
    });

    it('drops payment fields the browser must not set, and keeps the payer details', async () => {
      okPaystack();
      await POST(makeRequest({
        email: 'p@example.com',
        amount: 6090,
        metadata: {
          type: 'private', full_name: 'Ada Obi', phone: '1', course: 'PHY 102', notes: 'n', org_id: 'org-1',
          payment_option: 'split', instalment: 2, balance_id: 'b', discount_code: 'X', ambassador_id: 'a',
        },
      }));
      expect(sent().metadata).toEqual({
        type: 'private', full_name: 'Ada Obi', phone: '1', course: 'PHY 102', notes: 'n', org_id: 'org-1',
      });
    });
  });

  describe('full semester plan', () => {
    const okPaystack = () =>
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ status: true, data: { authorization_url: 'https://paystack.com/pay/x' } }),
      });

    it('accepts the listed price for each plan', async () => {
      okPaystack();
      for (const [plan, amount] of [['group', 100000], ['private', 300000]] as const) {
        const res = await POST(makeRequest({ email: 'p@example.com', amount, metadata: { type: 'semester-plan', plan } }));
        expect(res.status).toBe(200);
      }
    });

    it('refuses an amount that does not match the plan', async () => {
      const res = await POST(makeRequest({ email: 'p@example.com', amount: 100, metadata: { type: 'semester-plan', plan: 'private' } }));
      expect(res.status).toBe(400);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('refuses an unknown plan', async () => {
      const res = await POST(makeRequest({ email: 'p@example.com', amount: 100000, metadata: { type: 'semester-plan', plan: 'vip' } }));
      expect(res.status).toBe(400);
    });
  });
});
