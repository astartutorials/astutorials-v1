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
import { PATCH, DELETE } from '@/app/api/admin/orgs/[id]/members/route';

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

function makeReq(method: string, body: object, orgId = 'org-1') {
  return new NextRequest(`http://localhost:3000/api/admin/orgs/${orgId}/members`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('PATCH /api/admin/orgs/[id]/members', () => {
  beforeEach(() => { mockServerClient.mockReset(); mockFrom.mockReset(); });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    const res = await PATCH(makeReq('PATCH', { userId: 'u1', role: 'tutor' }), makeParams('org-1'));
    expect(res.status).toBe(401);
  });

  it('returns 403 for org_admin (only super_admin can manage members)', async () => {
    mockAuth(ORG_ADMIN);
    const res = await PATCH(makeReq('PATCH', { userId: 'u1', role: 'tutor' }), makeParams('org-1'));
    expect(res.status).toBe(403);
  });

  it('returns 400 when userId is missing', async () => {
    mockAuth(SUPER_ADMIN);
    const res = await PATCH(makeReq('PATCH', { role: 'tutor' }), makeParams('org-1'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when role is missing', async () => {
    mockAuth(SUPER_ADMIN);
    const res = await PATCH(makeReq('PATCH', { userId: 'u1' }), makeParams('org-1'));
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid role (super_admin is not assignable)', async () => {
    mockAuth(SUPER_ADMIN);
    const res = await PATCH(makeReq('PATCH', { userId: 'u1', role: 'super_admin' }), makeParams('org-1'));
    expect(res.status).toBe(400);
  });

  it('updates the member role and returns 200', async () => {
    mockAuth(SUPER_ADMIN);
    const mockEq2 = jest.fn().mockResolvedValue({ error: null });
    const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
    mockFrom.mockReturnValue({ update: jest.fn().mockReturnValue({ eq: mockEq1 }) });

    const res = await PATCH(makeReq('PATCH', { userId: 'u1', role: 'tutor' }), makeParams('org-1'));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(mockEq2).toHaveBeenCalledWith('org_id', 'org-1');
  });

  it('accepts all valid org roles', async () => {
    const validRoles = ['org_admin', 'tutor_manager', 'tutor', 'viewer'];
    for (const role of validRoles) {
      mockServerClient.mockReset();
      mockFrom.mockReset();
      mockAuth(SUPER_ADMIN);
      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
      });
      const res = await PATCH(makeReq('PATCH', { userId: 'u1', role }), makeParams('org-1'));
      expect(res.status).toBe(200);
    }
  });

  it('returns 500 on DB error', async () => {
    mockAuth(SUPER_ADMIN);
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
        }),
      }),
    });
    const res = await PATCH(makeReq('PATCH', { userId: 'u1', role: 'tutor' }), makeParams('org-1'));
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/admin/orgs/[id]/members', () => {
  beforeEach(() => { mockServerClient.mockReset(); mockFrom.mockReset(); });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    const res = await DELETE(makeReq('DELETE', { userId: 'u1' }), makeParams('org-1'));
    expect(res.status).toBe(401);
  });

  it('returns 403 for org_admin (super_admin only)', async () => {
    mockAuth(ORG_ADMIN);
    const res = await DELETE(makeReq('DELETE', { userId: 'u1' }), makeParams('org-1'));
    expect(res.status).toBe(403);
  });

  it('returns 400 when userId is missing', async () => {
    mockAuth(SUPER_ADMIN);
    const res = await DELETE(makeReq('DELETE', {}), makeParams('org-1'));
    expect(res.status).toBe(400);
  });

  it('removes the member and returns 200', async () => {
    mockAuth(SUPER_ADMIN);
    const mockEq2 = jest.fn().mockResolvedValue({ error: null });
    const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
    mockFrom.mockReturnValue({ delete: jest.fn().mockReturnValue({ eq: mockEq1 }) });

    const res = await DELETE(makeReq('DELETE', { userId: 'u1' }), makeParams('org-1'));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(mockEq2).toHaveBeenCalledWith('org_id', 'org-1');
  });

  it('returns 500 on DB error', async () => {
    mockAuth(SUPER_ADMIN);
    mockFrom.mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
        }),
      }),
    });
    const res = await DELETE(makeReq('DELETE', { userId: 'u1' }), makeParams('org-1'));
    expect(res.status).toBe(500);
  });
});
