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
import { GET } from '@/app/api/admin/tutorials/[id]/bookings/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);
const ADMIN_USER = { id: 'admin-id', user_metadata: { role: 'admin' } };

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

function makeRequest(id: string) {
  return new NextRequest(`http://localhost:3000/api/admin/tutorials/${id}/bookings`);
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/admin/tutorials/[id]/bookings', () => {
  beforeEach(() => {
    mockServerClient.mockReset();
    mockFrom.mockReset();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    const res = await GET(makeRequest('tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(401);
  });

  it('returns bookings for the given tutorial', async () => {
    mockAuth(ADMIN_USER);
    const bookings = [
      { id: 'b1', full_name: 'Ada Okonkwo', email: 'ada@example.com', phone: '080', payment_status: 'paid', attended: false, created_at: '2025-01-01T00:00:00Z' },
    ];
    const mockEq = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: bookings, error: null }),
    });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({ eq: mockEq }),
    });

    const res = await GET(makeRequest('tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].full_name).toBe('Ada Okonkwo');
  });

  it('filters by the tutorial id from the URL', async () => {
    mockAuth(ADMIN_USER);
    const mockEq = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({ eq: mockEq }),
    });

    await GET(makeRequest('tut-abc'), makeParams('tut-abc'));
    expect(mockEq).toHaveBeenCalledWith('tutorial_id', 'tut-abc');
  });

  it('returns 500 when Supabase errors', async () => {
    mockAuth(ADMIN_USER);
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    });

    const res = await GET(makeRequest('tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(500);
  });
});
