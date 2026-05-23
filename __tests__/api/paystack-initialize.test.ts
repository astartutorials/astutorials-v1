import { NextRequest } from 'next/server';

const mockSingle = jest.fn().mockResolvedValue({ data: { seats_total: 30, seats_booked: 0 } });
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: jest.fn(() => ({ select: mockSelect })) })),
}));

const mockVerifyTurnstile = jest.fn().mockResolvedValue(true);
jest.mock('@/lib/turnstile', () => ({
  verifyTurnstile: (...args: any[]) => mockVerifyTurnstile(...args),
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
    mockSingle.mockReset().mockResolvedValue({ data: { seats_total: 30, seats_booked: 0 } });
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

    const res = await POST(makeRequest({ email: 'test@example.com', amount: 5000 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.authorization_url).toBe('https://checkout.paystack.com/abc123');
  });

  it('sends the amount multiplied by 100 (kobo) to Paystack', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true, data: { authorization_url: 'https://paystack.com/pay/x' } }),
    });

    await POST(makeRequest({ email: 'test@example.com', amount: 5075 }));

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.amount).toBe(507500);
  });

  it('returns 409 when the tutorial is fully booked', async () => {
    mockSingle.mockResolvedValueOnce({ data: { seats_total: 30, seats_booked: 30 } });

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

    const res = await POST(makeRequest({ email: 'test@example.com', amount: 5000 }));
    expect(res.status).toBe(502);
  });

  it('returns 500 when PAYSTACK_SECRET_KEY is not set', async () => {
    const saved = process.env.PAYSTACK_SECRET_KEY;
    delete process.env.PAYSTACK_SECRET_KEY;

    const res = await POST(makeRequest({ email: 'test@example.com', amount: 5000 }));
    expect(res.status).toBe(500);

    process.env.PAYSTACK_SECRET_KEY = saved;
  });

  it('allows a private booking through even when the tutorial is fully booked', async () => {
    mockSingle.mockResolvedValueOnce({ data: { seats_total: 30, seats_booked: 30 } });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: true, data: { authorization_url: 'https://paystack.com/pay/x' } }),
    });

    const res = await POST(makeRequest({
      email: 'test@example.com',
      amount: 5000,
      metadata: { tutorial_id: 'tut-1', type: 'private' },
    }));
    expect(res.status).toBe(200);
  });
});
