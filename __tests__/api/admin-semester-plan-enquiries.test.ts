const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: (...args: unknown[]) => mockFrom(...args) })),
}));

jest.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient: jest.fn() }));

const mockGetUserRole = jest.fn();
jest.mock('@/lib/rbac', () => ({
  ...jest.requireActual('@/lib/rbac'),
  getUserRole: (...args: unknown[]) => mockGetUserRole(...args),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { GET } from '@/app/api/admin/semester-plan-enquiries/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);

function mockAuth(user: object | null) {
  mockServerClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user }, error: user ? null : { message: 'no' } }),
    },
  } as never);
}

/** A chainable query whose `eq` calls are recorded; awaiting it yields `result`. */
function mockQuery(result: { data: unknown; error: unknown }) {
  const eq = jest.fn();
  const chain = { eq, order: jest.fn(), then: (r: (v: unknown) => void) => r(result) };
  eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  mockFrom.mockReturnValue({ select: jest.fn().mockReturnValue(chain) });
  return eq;
}

describe('GET /api/admin/semester-plan-enquiries', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not signed in', async () => {
    mockAuth(null);
    expect((await GET()).status).toBe(401);
  });

  it.each(['tutor_manager', 'tutor', 'viewer'])('returns 403 for %s (no intake:read)', async (role) => {
    mockAuth({ id: 'u1' });
    mockGetUserRole.mockResolvedValue({ userId: 'u1', role, orgId: 'org-1' });
    expect((await GET()).status).toBe(403);
  });

  it('lets super_admin read across every org', async () => {
    mockAuth({ id: 'u1' });
    mockGetUserRole.mockResolvedValue({ userId: 'u1', role: 'super_admin', orgId: null });
    const eq = mockQuery({ data: [{ id: 'e1' }], error: null });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: 'e1' }]);
    expect(mockFrom).toHaveBeenCalledWith('semester_plan_enquiries');
    expect(eq).not.toHaveBeenCalledWith('org_id', expect.anything());
  });

  it('scopes org_admin to their own organisation', async () => {
    mockAuth({ id: 'u2' });
    mockGetUserRole.mockResolvedValue({ userId: 'u2', role: 'org_admin', orgId: 'org-1' });
    const eq = mockQuery({ data: [], error: null });

    expect((await GET()).status).toBe(200);
    expect(eq).toHaveBeenCalledWith('org_id', 'org-1');
  });
});
