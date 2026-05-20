import { NextRequest } from 'next/server';

const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: (...args: any[]) => mockFrom(...args) })),
}));

jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { PATCH } from '@/app/api/admin/bookings/[id]/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);
const ADMIN_USER = { id: 'admin-id' };

function mockAuth(user: object | null) {
  mockServerClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Unauthorized' },
      }),
    },
  } as any);
}

function makeRequest(id: string, body: object) {
  return new NextRequest(`http://localhost:3000/api/admin/bookings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('PATCH /api/admin/bookings/[id]', () => {
  beforeEach(() => {
    mockServerClient.mockReset();
    mockFrom.mockReset();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    const res = await PATCH(makeRequest('b1', { attended: true }), makeParams('b1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 when attended is not a boolean', async () => {
    mockAuth(ADMIN_USER);
    const res = await PATCH(makeRequest('b1', { attended: 'yes' }), makeParams('b1'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when attended is missing', async () => {
    mockAuth(ADMIN_USER);
    const res = await PATCH(makeRequest('b1', {}), makeParams('b1'));
    expect(res.status).toBe(400);
  });

  it('marks a booking as attended and returns 200', async () => {
    mockAuth(ADMIN_USER);
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnValue({ eq: mockEq }),
    });

    const res = await PATCH(makeRequest('b1', { attended: true }), makeParams('b1'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('passes the booking id and attended value to Supabase', async () => {
    mockAuth(ADMIN_USER);
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockReturnValue({ update: mockUpdate });

    await PATCH(makeRequest('booking-xyz', { attended: false }), makeParams('booking-xyz'));

    expect(mockUpdate).toHaveBeenCalledWith({ attended: false });
    const mockEq = mockUpdate.mock.results[0].value.eq as jest.Mock;
    expect(mockEq).toHaveBeenCalledWith('id', 'booking-xyz');
  });

  it('returns 500 when Supabase errors', async () => {
    mockAuth(ADMIN_USER);
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      }),
    });

    const res = await PATCH(makeRequest('b1', { attended: true }), makeParams('b1'));
    expect(res.status).toBe(500);
  });
});
