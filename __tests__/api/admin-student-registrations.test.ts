import { NextRequest } from 'next/server';

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
import { GET } from '@/app/api/admin/student-registrations/route';

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

const req = (qs: string) => new NextRequest(`http://localhost:3000/api/admin/student-registrations${qs}`);

describe('GET /api/admin/student-registrations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not signed in', async () => {
    mockAuth(null);
    expect((await GET(req('?session=2026/2027'))).status).toBe(401);
  });

  it('returns 403 for roles without intake:read', async () => {
    mockAuth({ id: 'u1' });
    mockGetUserRole.mockResolvedValue({ userId: 'u1', role: 'tutor', orgId: 'org-1' });
    expect((await GET(req('?session=2026/2027'))).status).toBe(403);
  });

  it('requires a well-formed session', async () => {
    mockAuth({ id: 'u1' });
    mockGetUserRole.mockResolvedValue({ userId: 'u1', role: 'super_admin', orgId: null });
    expect((await GET(req(''))).status).toBe(400);
    expect((await GET(req('?session=everything'))).status).toBe(400);
  });

  it('lets super_admin read a session across every org', async () => {
    mockAuth({ id: 'u1' });
    mockGetUserRole.mockResolvedValue({ userId: 'u1', role: 'super_admin', orgId: null });
    const eq = mockQuery({ data: [{ id: 'r1' }], error: null });

    const res = await GET(req('?session=2026/2027'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: 'r1' }]);
    expect(eq).toHaveBeenCalledWith('session', '2026/2027');
    expect(eq).not.toHaveBeenCalledWith('org_id', expect.anything());
  });

  it("scopes org_admin to their own organisation", async () => {
    mockAuth({ id: 'u2' });
    mockGetUserRole.mockResolvedValue({ userId: 'u2', role: 'org_admin', orgId: 'org-1' });
    const eq = mockQuery({ data: [], error: null });

    expect((await GET(req('?session=2026/2027'))).status).toBe(200);
    expect(eq).toHaveBeenCalledWith('org_id', 'org-1');
  });
});
