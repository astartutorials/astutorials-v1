import { NextRequest } from 'next/server';

const mockFrom = jest.fn();
const mockRpc = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: (...args: any[]) => mockFrom(...args),
    rpc: (...args: any[]) => mockRpc(...args),
  })),
}));

jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock('@/lib/audit', () => ({ logAuditEvent: jest.fn() }));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { PATCH } from '@/app/api/admin/bookings/[id]/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);
const ADMIN_USER = { id: 'admin-id', email: 'admin@test.com', user_metadata: { role: 'admin' } };

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

describe('PATCH /api/admin/bookings/[id] — attendance', () => {
  beforeEach(() => {
    mockServerClient.mockReset();
    mockFrom.mockReset();
    mockRpc.mockReset();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    const res = await PATCH(makeRequest('b1', { attended: true }), makeParams('b1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 when body has neither attended nor valid status', async () => {
    mockAuth(ADMIN_USER);
    const res = await PATCH(makeRequest('b1', {}), makeParams('b1'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when attended is not a boolean', async () => {
    mockAuth(ADMIN_USER);
    const res = await PATCH(makeRequest('b1', { attended: 'yes' }), makeParams('b1'));
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

  it('returns 500 when Supabase errors on attended update', async () => {
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

describe('PATCH /api/admin/bookings/[id] — cancellation', () => {
  beforeEach(() => {
    mockServerClient.mockReset();
    mockFrom.mockReset();
    mockRpc.mockReset();
  });

  const PAID_GROUP_BOOKING = {
    id: 'b1',
    full_name: 'Alice',
    email: 'alice@test.com',
    payment_status: 'paid',
    tutorial_id: 'tut-1',
    org_id: null,
  };

  function mockFetchThenUpdate(booking: object | null, fetchError: object | null = null, updateError: object | null = null) {
    mockFrom
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: booking, error: fetchError }),
          }),
        }),
      })
      .mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: updateError }),
        }),
      });
    mockRpc.mockResolvedValue({ error: null });
  }

  it('returns 404 when booking not found', async () => {
    mockAuth(ADMIN_USER);
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
        }),
      }),
    });

    const res = await PATCH(makeRequest('b1', { status: 'cancelled' }), makeParams('b1'));
    expect(res.status).toBe(404);
  });

  it('returns 409 when booking is already cancelled', async () => {
    mockAuth(ADMIN_USER);
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...PAID_GROUP_BOOKING, payment_status: 'cancelled' },
            error: null,
          }),
        }),
      }),
    });

    const res = await PATCH(makeRequest('b1', { status: 'cancelled' }), makeParams('b1'));
    expect(res.status).toBe(409);
  });

  it('cancels a paid group booking and decrements seats', async () => {
    mockAuth(ADMIN_USER);
    mockFetchThenUpdate(PAID_GROUP_BOOKING);

    const res = await PATCH(makeRequest('b1', { status: 'cancelled' }), makeParams('b1'));
    expect(res.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith('decrement_seats_booked', { tid: 'tut-1' });
  });

  it('cancels a pending booking without decrementing seats', async () => {
    mockAuth(ADMIN_USER);
    mockFetchThenUpdate({ ...PAID_GROUP_BOOKING, payment_status: 'pending', tutorial_id: 'tut-1' });

    const res = await PATCH(makeRequest('b1', { status: 'cancelled' }), makeParams('b1'));
    expect(res.status).toBe(200);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('cancels a private booking (no tutorial_id) without decrementing seats', async () => {
    mockAuth(ADMIN_USER);
    mockFetchThenUpdate({ ...PAID_GROUP_BOOKING, tutorial_id: null });

    const res = await PATCH(makeRequest('b1', { status: 'cancelled' }), makeParams('b1'));
    expect(res.status).toBe(200);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('returns 500 when update errors', async () => {
    mockAuth(ADMIN_USER);
    mockFetchThenUpdate(PAID_GROUP_BOOKING, null, { message: 'DB error' });

    const res = await PATCH(makeRequest('b1', { status: 'cancelled' }), makeParams('b1'));
    expect(res.status).toBe(500);
  });
});
