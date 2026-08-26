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
import { GET } from '@/app/api/admin/bucc-registrations/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);

/**
 * getUserRole reads user_roles off the *auth* client, so the role a test wants
 * is supplied there; user_metadata is only the fallback path.
 */
function mockAuth(user: object | null, roleRows: object[] | null = null) {
  mockServerClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Unauthorized' },
      }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: roleRows }),
    }),
  } as any);
}

function mockRows(result: { data: any; error: any }) {
  const order = jest.fn().mockResolvedValue(result);
  mockFrom.mockReturnValue({ select: jest.fn().mockReturnValue({ order }) });
  return { order };
}

const USER = { id: 'u1', user_metadata: {} };

const ROW = {
  id: 'r1',
  full_name: 'Ada Lovelace',
  email: 'ada@babcock.edu.ng',
  phone: '08012345678',
  level: '200 Level',
  programme: 'Computer Science',
  concern: 'The workload',
  question: 'How many hours should I study?',
  heard_via: 'BUCC WhatsApp group',
  created_at: '2026-08-26T10:00:00Z',
};

describe('GET /api/admin/bucc-registrations', () => {
  beforeEach(() => {
    mockServerClient.mockReset();
    mockFrom.mockReset();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    expect((await GET()).status).toBe(401);
  });

  it('returns 200 for a super_admin', async () => {
    mockAuth(USER, [{ role: 'super_admin', org_id: null }]);
    mockRows({ data: [ROW], error: null });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([ROW]);
  });

  // The table carries no org_id, so an org-scoped role has nothing to filter on.
  // Anything short of super_admin must be refused outright rather than served
  // another tenant's view of A-Star's own registrant list.
  it.each(['org_admin', 'tutor_manager', 'tutor', 'viewer'])(
    'returns 403 for %s',
    async (role) => {
      mockAuth(USER, [{ role, org_id: 'org-1' }]);
      expect((await GET()).status).toBe(403);
    }
  );

  it('returns 403 when the user has no role at all', async () => {
    mockAuth(USER, []);
    expect((await GET()).status).toBe(403);
  });

  it('never queries the registrations table for a non-super_admin', async () => {
    mockAuth(USER, [{ role: 'org_admin', org_id: 'org-1' }]);
    await GET();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns newest registrations first', async () => {
    mockAuth(USER, [{ role: 'super_admin', org_id: null }]);
    const { order } = mockRows({ data: [], error: null });
    await GET();
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('returns 500 when the query fails', async () => {
    mockAuth(USER, [{ role: 'super_admin', org_id: null }]);
    mockRows({ data: null, error: { message: 'DB error' } });
    expect((await GET()).status).toBe(500);
  });

  it('returns an empty array rather than null when there are no rows', async () => {
    mockAuth(USER, [{ role: 'super_admin', org_id: null }]);
    mockRows({ data: null, error: null });
    expect(await (await GET()).json()).toEqual([]);
  });
});

describe('bucc:read permission', () => {
  it('is held by super_admin only', () => {
    const { can } = jest.requireActual('@/lib/rbac');
    expect(can('super_admin', 'bucc:read')).toBe(true);
    for (const role of ['org_admin', 'tutor_manager', 'tutor', 'viewer']) {
      expect(can(role, 'bucc:read')).toBe(false);
    }
  });
});
