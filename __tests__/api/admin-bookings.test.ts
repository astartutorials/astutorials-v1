import { NextRequest } from 'next/server';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: jest.fn() })),
}));

jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test_anon_key';

import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { GET } from '@/app/api/admin/bookings/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);
const ADMIN_USER = { id: 'admin-id' };

function mockAuth(user: object | null) {
  mockServerClient.mockResolvedValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user }, error: user ? null : { message: 'Unauthorized' } }) },
  } as any);
}

// The route creates supabase at module scope — grab it from the first createClient call
function getFrom() {
  return (createClient as jest.Mock).mock.results[0].value.from as jest.Mock;
}

describe('GET /api/admin/bookings', () => {
  beforeEach(() => mockServerClient.mockReset());

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns all bookings with joined tutorial data', async () => {
    mockAuth(ADMIN_USER);
    const bookingData = [
      {
        id: 'b1', full_name: 'Ada Okonkwo', email: 'ada@example.com',
        phone: '08012345678', notes: null, payment_status: 'paid',
        payment_reference: 'ref_123', created_at: '2025-05-01T10:00:00Z',
        tutorials: { title: 'Calculus', price: 5000 },
      },
    ];

    getFrom().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: bookingData, error: null }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].full_name).toBe('Ada Okonkwo');
    expect(data[0].tutorials.title).toBe('Calculus');
  });

  it('returns 500 when Supabase errors', async () => {
    mockAuth(ADMIN_USER);
    getFrom().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'connection failed' } }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(500);
  });

  it('queries for phone and notes fields', async () => {
    mockAuth(ADMIN_USER);
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
    getFrom().mockReturnValue({ select: mockSelect });

    await GET();

    const selectArg: string = mockSelect.mock.calls[0][0];
    expect(selectArg).toContain('phone');
    expect(selectArg).toContain('notes');
    expect(selectArg).toContain('course');
    expect(selectArg).toContain('amount_paid');
  });
});
