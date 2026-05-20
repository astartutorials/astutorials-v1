import { NextRequest } from 'next/server';
import { POST } from '@/app/api/paystack/initialize/route';

process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';

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

  it('returns 502 when Paystack returns an error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid secret key' }),
    });

    const res = await POST(makeRequest({ email: 'test@example.com', amount: 5000 }));
    expect(res.status).toBe(502);
  });
});
