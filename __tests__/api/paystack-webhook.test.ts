import { NextRequest } from 'next/server';
import crypto from 'crypto';

const mockInsert = jest.fn().mockResolvedValue({ error: null });
const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null });
const mockSingle = jest.fn().mockResolvedValue({ data: null });
const mockEq = jest.fn(() => ({ maybeSingle: mockMaybeSingle, single: mockSingle }));
const mockSelectChain = jest.fn(() => ({ eq: mockEq }));
const mockRpc = jest.fn().mockResolvedValue({ error: null });
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({ insert: mockInsert, select: mockSelectChain })),
    rpc: (...args: any[]) => mockRpc(...args),
  })),
}));

jest.mock('@/lib/posthog-server', () => ({
  getPostHogClient: jest.fn(() => ({ capture: jest.fn(), shutdown: jest.fn() })),
}));

jest.mock('@/lib/email', () => ({
  sendGroupBookingConfirmation: jest.fn(),
  sendPrivateBookingReceipt: jest.fn(),
  sendNewBookingNotification: jest.fn(),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy';

import { POST } from '@/app/api/paystack/webhook/route';

const SECRET = 'sk_test_dummy';

function sign(body: string) {
  return crypto.createHmac('sha512', SECRET).update(body).digest('hex');
}

function makeRequest(body: object, signature?: string) {
  const raw = JSON.stringify(body);
  return new NextRequest('http://localhost:3000/api/paystack/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(signature !== undefined ? { 'x-paystack-signature': signature } : {}),
    },
    body: raw,
  });
}

const GROUP_EVENT = {
  event: 'charge.success',
  data: {
    reference: 'REF_GROUP_001',
    amount: 507500,
    customer: { email: 'ada@test.com', first_name: 'Ada' },
    metadata: { full_name: 'Ada Okonkwo', phone: '08012345678', tutorial_id: 'tut-1' },
  },
};

const PRIVATE_EVENT = {
  event: 'charge.success',
  data: {
    reference: 'REF_PRIV_001',
    amount: 609000,
    customer: { email: 'bob@test.com' },
    metadata: { full_name: 'Bob Smith', phone: '08000000001', type: 'private', course: 'MTH101' },
  },
};

describe('POST /api/paystack/webhook', () => {
  beforeEach(() => {
    mockInsert.mockReset().mockResolvedValue({ error: null });
    mockMaybeSingle.mockReset().mockResolvedValue({ data: null });
    mockSingle.mockReset().mockResolvedValue({ data: null });
    mockRpc.mockReset().mockResolvedValue({ error: null });
  });

  it('returns 401 when signature is missing', async () => {
    const res = await POST(makeRequest(GROUP_EVENT));
    expect(res.status).toBe(401);
  });

  it('returns 401 when signature is wrong', async () => {
    const res = await POST(makeRequest(GROUP_EVENT, 'bad_signature'));
    expect(res.status).toBe(401);
  });

  it('returns 200 and ignores non-charge.success events', async () => {
    const body = { event: 'transfer.success', data: {} };
    const raw = JSON.stringify(body);
    const sig = sign(raw);
    const req = new NextRequest('http://localhost:3000/api/paystack/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-paystack-signature': sig },
      body: raw,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('inserts a group booking on charge.success with valid signature', async () => {
    mockSingle.mockResolvedValueOnce({ data: { title: 'Calculus', date: '2026-06-01', time: '10:00', org_id: 'org-1' } });
    const raw = JSON.stringify(GROUP_EVENT);
    const req = new NextRequest('http://localhost:3000/api/paystack/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-paystack-signature': sign(raw) },
      body: raw,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      payment_reference: 'REF_GROUP_001',
      amount_paid: 5075,
      payment_status: 'paid',
    }));
  });

  it('skips insert if booking already exists (idempotency)', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'existing-booking' } });
    const raw = JSON.stringify(GROUP_EVENT);
    const req = new NextRequest('http://localhost:3000/api/paystack/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-paystack-signature': sign(raw) },
      body: raw,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('inserts a private booking without tutorial_id', async () => {
    const raw = JSON.stringify(PRIVATE_EVENT);
    const req = new NextRequest('http://localhost:3000/api/paystack/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-paystack-signature': sign(raw) },
      body: raw,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      tutorial_id: null,
      course: 'MTH101',
    }));
    expect(mockRpc).not.toHaveBeenCalled();
  });
});
