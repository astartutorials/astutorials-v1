import { NextRequest } from 'next/server';

const mockListUsers = jest.fn();
const mockServiceFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: (...args: any[]) => mockServiceFrom(...args),
    auth: { admin: { listUsers: (...args: any[]) => mockListUsers(...args) } },
  })),
}));

jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { GET as getOrgs, POST as createOrg } from '@/app/api/admin/orgs/route';
import { GET as getOrgById, PATCH as patchOrg, DELETE as deleteOrg } from '@/app/api/admin/orgs/[id]/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);

const SUPER_ADMIN = { id: 'super-id', user_metadata: { role: 'super_admin' } };
const ORG_ADMIN = { id: 'admin-id', user_metadata: { role: 'admin' } };

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

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

// Universal chainable/awaitable mock for Supabase query builders
function makeChain(data: any, error: any = null) {
  const result = { data, error };
  const chain: any = {
    then: (onFulfilled: any) => Promise.resolve(result).then(onFulfilled),
    catch: (onRejected: any) => Promise.resolve(result).catch(onRejected),
    finally: (onFinally: any) => Promise.resolve(result).finally(onFinally),
  };
  ['select', 'order', 'eq', 'gte', 'neq', 'in', 'limit', 'single', 'maybeSingle',
   'insert', 'update', 'delete', 'upsert'].forEach(m => {
    chain[m] = jest.fn(() => chain);
  });
  return chain;
}

// ─── GET /api/admin/orgs ────────────────────────────────────────────────────

describe('GET /api/admin/orgs', () => {
  beforeEach(() => { mockServerClient.mockReset(); mockServiceFrom.mockReset(); });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    expect((await getOrgs()).status).toBe(401);
  });

  it('returns 403 for org_admin (super_admin only route)', async () => {
    mockAuth(ORG_ADMIN);
    expect((await getOrgs()).status).toBe(403);
  });

  it('returns enriched org list with member and tutorial counts', async () => {
    mockAuth(SUPER_ADMIN);

    const orgsData = [{ id: 'org-1', name: 'Babcock', type: 'university', location: 'Ilishan', created_at: '2025-01-01' }];
    const roleRows = [{ org_id: 'org-1' }, { org_id: 'org-1' }]; // 2 members
    const tutorialRows = [{ org_id: 'org-1' }]; // 1 tutorial

    // from('organisations').select().order() → orgsData
    mockServiceFrom.mockReturnValueOnce(makeChain(orgsData));
    // from('user_roles').select().in() → roleRows
    mockServiceFrom.mockReturnValueOnce(makeChain(roleRows));
    // from('tutorials').select().in() → tutorialRows
    mockServiceFrom.mockReturnValueOnce(makeChain(tutorialRows));

    const res = await getOrgs();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].memberCount).toBe(2);
    expect(data[0].tutorialCount).toBe(1);
    expect(data[0].name).toBe('Babcock');
  });

  it('returns 500 when Supabase errors', async () => {
    mockAuth(SUPER_ADMIN);
    mockServiceFrom.mockReturnValueOnce(makeChain(null, { message: 'DB error' }));
    expect((await getOrgs()).status).toBe(500);
  });
});

// ─── POST /api/admin/orgs ───────────────────────────────────────────────────

describe('POST /api/admin/orgs', () => {
  beforeEach(() => { mockServerClient.mockReset(); mockServiceFrom.mockReset(); });

  function makeReq(body: object) {
    return new NextRequest('http://localhost:3000/api/admin/orgs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    expect((await createOrg(makeReq({ name: 'X', type: 'university' }))).status).toBe(401);
  });

  it('returns 403 for org_admin', async () => {
    mockAuth(ORG_ADMIN);
    expect((await createOrg(makeReq({ name: 'X', type: 'university' }))).status).toBe(403);
  });

  it('returns 400 when name is missing', async () => {
    mockAuth(SUPER_ADMIN);
    expect((await createOrg(makeReq({ type: 'university' }))).status).toBe(400);
  });

  it('returns 400 when type is missing', async () => {
    mockAuth(SUPER_ADMIN);
    expect((await createOrg(makeReq({ name: 'Test Uni' }))).status).toBe(400);
  });

  it('returns 400 for an invalid type', async () => {
    mockAuth(SUPER_ADMIN);
    expect((await createOrg(makeReq({ name: 'Test Uni', type: 'invalid' }))).status).toBe(400);
  });

  it('creates an org and returns 201', async () => {
    mockAuth(SUPER_ADMIN);
    const newOrg = { id: 'org-new', name: 'Test Uni', type: 'university', location: null };
    mockServiceFrom.mockReturnValueOnce(makeChain(newOrg));

    const res = await createOrg(makeReq({ name: 'Test Uni', type: 'university' }));
    expect(res.status).toBe(201);
    expect((await res.json()).name).toBe('Test Uni');
  });

  it('accepts all valid institution types', async () => {
    const validTypes = ['university', 'secondary', 'primary'];
    for (const type of validTypes) {
      mockServerClient.mockReset();
      mockServiceFrom.mockReset();
      mockAuth(SUPER_ADMIN);
      mockServiceFrom.mockReturnValueOnce(makeChain({ id: 'x', name: 'X', type }));
      const res = await createOrg(makeReq({ name: 'X', type }));
      expect(res.status).toBe(201);
    }
  });

  it('returns 500 on DB error', async () => {
    mockAuth(SUPER_ADMIN);
    mockServiceFrom.mockReturnValueOnce(makeChain(null, { message: 'DB error' }));
    expect((await createOrg(makeReq({ name: 'X', type: 'university' }))).status).toBe(500);
  });
});

// ─── GET /api/admin/orgs/[id] ───────────────────────────────────────────────

describe('GET /api/admin/orgs/[id]', () => {
  beforeEach(() => { mockServerClient.mockReset(); mockServiceFrom.mockReset(); mockListUsers.mockReset(); });

  const orgRecord = { id: 'org-1', name: 'Babcock', type: 'university', location: 'Ilishan' };
  const fakeReq = new NextRequest('http://localhost:3000/api/admin/orgs/org-1');

  function setupSuccess() {
    // Promise.all order: org, user_roles, tutorials, paid bookings, all bookings, recent bookings
    mockServiceFrom
      .mockReturnValueOnce(makeChain(orgRecord))   // organisations.select('*').eq().single()
      .mockReturnValueOnce(makeChain([]))           // user_roles.select().eq().order()
      .mockReturnValueOnce(makeChain([]))           // tutorials.select().eq().order()
      .mockReturnValueOnce(makeChain([]))           // bookings paid
      .mockReturnValueOnce(makeChain([]))           // bookings all
      .mockReturnValueOnce(makeChain([]));          // bookings recent
    mockListUsers.mockResolvedValue({ data: { users: [] } });
  }

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    expect((await getOrgById(fakeReq, makeParams('org-1'))).status).toBe(401);
  });

  it('returns 403 for org_admin', async () => {
    mockAuth(ORG_ADMIN);
    expect((await getOrgById(fakeReq, makeParams('org-1'))).status).toBe(403);
  });

  it('returns 404 when org does not exist', async () => {
    mockAuth(SUPER_ADMIN);
    // First from call (organisations) returns null → 404
    mockServiceFrom
      .mockReturnValueOnce(makeChain(null, { message: 'Not found' }))
      .mockReturnValue(makeChain([])); // default for parallel queries
    mockListUsers.mockResolvedValue({ data: { users: [] } });

    expect((await getOrgById(fakeReq, makeParams('bad-id'))).status).toBe(404);
  });

  it('returns 200 with org details, stats, tutorials, members and recent bookings', async () => {
    mockAuth(SUPER_ADMIN);
    setupSuccess();

    const res = await getOrgById(fakeReq, makeParams('org-1'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.org.name).toBe('Babcock');
    expect(data).toHaveProperty('stats');
    expect(data).toHaveProperty('members');
    expect(data).toHaveProperty('tutorials');
    expect(data).toHaveProperty('recentBookings');
  });

  it('aggregates revenue correctly', async () => {
    mockAuth(SUPER_ADMIN);
    const paidBookings = [{ id: 'b1', amount_paid: 5000, email: 'a@test.com' }];
    mockServiceFrom
      .mockReturnValueOnce(makeChain(orgRecord))
      .mockReturnValueOnce(makeChain([]))           // user_roles
      .mockReturnValueOnce(makeChain([]))           // tutorials
      .mockReturnValueOnce(makeChain(paidBookings)) // paid bookings
      .mockReturnValueOnce(makeChain(paidBookings)) // all bookings
      .mockReturnValueOnce(makeChain([]));          // recent bookings
    mockListUsers.mockResolvedValue({ data: { users: [] } });

    const res = await getOrgById(fakeReq, makeParams('org-1'));
    const data = await res.json();
    expect(data.stats.revenue).toBe(5000);
    expect(data.stats.students).toBe(1);
  });
});

// ─── PATCH /api/admin/orgs/[id] ─────────────────────────────────────────────

describe('PATCH /api/admin/orgs/[id]', () => {
  beforeEach(() => { mockServerClient.mockReset(); mockServiceFrom.mockReset(); });

  function makeReq(body: object) {
    return new NextRequest('http://localhost:3000/api/admin/orgs/org-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    expect((await patchOrg(makeReq({ name: 'New Name' }), makeParams('org-1'))).status).toBe(401);
  });

  it('returns 403 for org_admin', async () => {
    mockAuth(ORG_ADMIN);
    expect((await patchOrg(makeReq({ name: 'New Name' }), makeParams('org-1'))).status).toBe(403);
  });

  it('updates and returns the patched org', async () => {
    mockAuth(SUPER_ADMIN);
    const updated = { id: 'org-1', name: 'New Name', type: 'university' };
    mockServiceFrom.mockReturnValueOnce(makeChain(updated));

    const res = await patchOrg(makeReq({ name: 'New Name' }), makeParams('org-1'));
    expect(res.status).toBe(200);
    expect((await res.json()).name).toBe('New Name');
  });

  it('returns 500 on DB error', async () => {
    mockAuth(SUPER_ADMIN);
    mockServiceFrom.mockReturnValueOnce(makeChain(null, { message: 'DB error' }));
    expect((await patchOrg(makeReq({ name: 'X' }), makeParams('org-1'))).status).toBe(500);
  });
});

// ─── DELETE /api/admin/orgs/[id] ────────────────────────────────────────────

describe('DELETE /api/admin/orgs/[id]', () => {
  beforeEach(() => { mockServerClient.mockReset(); mockServiceFrom.mockReset(); });

  const fakeReq = new NextRequest('http://localhost:3000/api/admin/orgs/org-1', { method: 'DELETE' });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    expect((await deleteOrg(fakeReq, makeParams('org-1'))).status).toBe(401);
  });

  it('returns 403 for org_admin', async () => {
    mockAuth(ORG_ADMIN);
    expect((await deleteOrg(fakeReq, makeParams('org-1'))).status).toBe(403);
  });

  it('returns 409 when the org has existing tutorials', async () => {
    mockAuth(SUPER_ADMIN);
    // select with count returns count > 0
    const countChain = makeChain(null);
    countChain.count = 2; // simulate count
    // The route does: serviceSupabase.from('tutorials').select('id', { count: 'exact', head: true }).eq('org_id', id)
    // Then checks (count ?? 0) > 0
    // We need to mock this returning { count: 2 }
    const mockEq = jest.fn().mockResolvedValue({ count: 2, error: null });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockServiceFrom.mockReturnValueOnce({ select: mockSelect });

    const res = await deleteOrg(fakeReq, makeParams('org-1'));
    expect(res.status).toBe(409);
  });

  it('deletes the org and returns 200 when no tutorials exist', async () => {
    mockAuth(SUPER_ADMIN);
    // Call 1: tutorial count check
    const mockEq = jest.fn().mockResolvedValue({ count: 0, error: null });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockServiceFrom.mockReturnValueOnce({ select: mockSelect });
    // Call 2: org name fetch before delete
    mockServiceFrom.mockReturnValueOnce(makeChain({ name: 'Test Org' }));
    // Call 3: delete
    mockServiceFrom.mockReturnValueOnce(makeChain(null));

    const res = await deleteOrg(fakeReq, makeParams('org-1'));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it('returns 500 on DB error during delete', async () => {
    mockAuth(SUPER_ADMIN);
    // Call 1: tutorial count check
    const mockEq = jest.fn().mockResolvedValue({ count: 0, error: null });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockServiceFrom.mockReturnValueOnce({ select: mockSelect });
    // Call 2: org name fetch before delete
    mockServiceFrom.mockReturnValueOnce(makeChain({ name: 'Test Org' }));
    // Call 3: delete with error
    mockServiceFrom.mockReturnValueOnce(makeChain(null, { message: 'DB error' }));

    expect((await deleteOrg(fakeReq, makeParams('org-1'))).status).toBe(500);
  });
});
