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

const mockAudit = jest.fn();
jest.mock('@/lib/audit', () => ({ logAuditEvent: (...args: unknown[]) => mockAudit(...args) }));

const mockSendApproved = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/email', () => ({ sendAmbassadorApproved: (...args: unknown[]) => mockSendApproved(...args) }));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { GET } from '@/app/api/admin/ambassadors/route';
import { PATCH } from '@/app/api/admin/ambassadors/[id]/route';

function mockAuth(user: object | null) {
  jest.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user }, error: user ? null : { message: 'no' } }) },
  } as never);
}

function asRole(role: string, orgId: string | null = 'org-1') {
  mockAuth({ id: 'u1', email: 'admin@astar.com' });
  mockGetUserRole.mockResolvedValue({ userId: 'u1', role, orgId });
}

/** Chainable, awaitable query; records eq calls. */
function chain(result: { data?: unknown; error?: unknown }) {
  const c: Record<string, jest.Mock> & { then?: unknown } = {
    eq: jest.fn(), order: jest.fn(), select: jest.fn(), update: jest.fn(),
    maybeSingle: jest.fn().mockResolvedValue(result),
  };
  for (const k of ['eq', 'order', 'select', 'update']) c[k].mockReturnValue(c);
  c.then = (r: (v: unknown) => void) => r(result);
  return c;
}

const patch = (body: object) =>
  PATCH(
    new NextRequest('http://localhost:3000/api/admin/ambassadors/a1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: 'a1' }) }
  );

const PENDING = { id: 'a1', full_name: 'Tolu Ade', email: 'tolu@x.com', status: 'pending', org_id: 'org-1' };

describe('GET /api/admin/ambassadors', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not signed in', async () => {
    mockAuth(null);
    expect((await GET()).status).toBe(401);
  });

  it.each(['tutor_manager', 'tutor', 'viewer'])('returns 403 for %s', async (role) => {
    asRole(role);
    expect((await GET()).status).toBe(403);
  });

  it('scopes org_admin to their org and lets super_admin see all', async () => {
    asRole('org_admin');
    let q = chain({ data: [], error: null });
    mockFrom.mockReturnValue(q);
    expect((await GET()).status).toBe(200);
    expect(q.eq).toHaveBeenCalledWith('org_id', 'org-1');

    asRole('super_admin', null);
    q = chain({ data: [{ id: 'x' }], error: null });
    mockFrom.mockReturnValue(q);
    const res = await GET();
    expect(await res.json()).toEqual([{ id: 'x' }]);
    expect(q.eq).not.toHaveBeenCalledWith('org_id', expect.anything());
  });
});

describe('PATCH /api/admin/ambassadors/[id]', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each(['tutor_manager', 'tutor', 'viewer'])('returns 403 for %s', async (role) => {
    asRole(role);
    expect((await patch({ action: 'approve' })).status).toBe(403);
  });

  it('returns 400 for an unknown action', async () => {
    asRole('org_admin');
    expect((await patch({ action: 'promote' })).status).toBe(400);
  });

  it("hides another org's application from org_admin", async () => {
    asRole('org_admin', 'org-2');
    const lookup = chain({ data: null });
    mockFrom.mockReturnValue(lookup);
    expect((await patch({ action: 'approve' })).status).toBe(404);
    expect(lookup.eq).toHaveBeenCalledWith('org_id', 'org-2');
  });

  it('approves: assigns a free code, emails it and logs the event', async () => {
    asRole('org_admin');
    const lookup = chain({ data: PENDING });
    const free = chain({ data: null });
    const update = chain({ error: null });
    mockFrom
      .mockReturnValueOnce(lookup) // load application
      .mockReturnValueOnce(free)   // code taken by an ambassador?
      .mockReturnValueOnce(free)   // code taken by a discount code?
      .mockReturnValueOnce(update);

    const res = await patch({ action: 'approve' });
    expect(res.status).toBe(200);
    const { referralCode } = await res.json();
    expect(referralCode).toMatch(/^TOLU\d{3}$/);
    expect(update.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'approved', referral_code: referralCode, reviewed_by: 'u1' }));
    expect(mockSendApproved).toHaveBeenCalledWith({ to: 'tolu@x.com', fullName: 'Tolu Ade', referralCode });
    expect(mockAudit).toHaveBeenCalledWith(expect.objectContaining({ action: 'ambassador.approved', orgId: 'org-1' }));
  });

  it('skips a code that is already taken', async () => {
    asRole('super_admin', null);
    mockFrom
      .mockReturnValueOnce(chain({ data: PENDING }))
      .mockReturnValueOnce(chain({ data: { id: 'other' } })) // taken
      .mockReturnValueOnce(chain({ data: null }))
      .mockReturnValueOnce(chain({ data: null }))
      .mockReturnValueOnce(chain({ data: null }))
      .mockReturnValueOnce(chain({ error: null }));
    expect((await patch({ action: 'approve' })).status).toBe(200);
  });

  it('refuses to re-review an approved ambassador', async () => {
    asRole('org_admin');
    mockFrom.mockReturnValue(chain({ data: { ...PENDING, status: 'approved' } }));
    expect((await patch({ action: 'reject' })).status).toBe(409);
  });

  it('rejects without emailing', async () => {
    asRole('org_admin');
    const update = chain({ error: null });
    mockFrom.mockReturnValueOnce(chain({ data: PENDING })).mockReturnValueOnce(update);
    const res = await patch({ action: 'reject' });
    expect(res.status).toBe(200);
    expect(update.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'rejected' }));
    expect(mockSendApproved).not.toHaveBeenCalled();
    expect(mockAudit).toHaveBeenCalledWith(expect.objectContaining({ action: 'ambassador.rejected' }));
  });
});
