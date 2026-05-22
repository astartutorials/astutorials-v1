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
import { GET, POST, DELETE } from '@/app/api/admin/invites/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);

// org_admin via metadata fallback — orgId will be null
const ADMIN_USER = { id: 'admin-id', user_metadata: { role: 'admin' } };
// viewer metadata doesn't map to any valid role → getUserRole returns null → 403
const NO_ROLE_USER = { id: 'no-role-id', user_metadata: {} };

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

function postReq(body: object) {
  return new NextRequest('http://localhost:3000/api/admin/invites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function deleteReq(body: object) {
  return new NextRequest('http://localhost:3000/api/admin/invites', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/admin/invites', () => {
  beforeEach(() => { mockServerClient.mockReset(); mockFrom.mockReset(); });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    expect((await GET()).status).toBe(401);
  });

  it('returns 403 for a user without a valid admin role', async () => {
    mockAuth(NO_ROLE_USER);
    expect((await GET()).status).toBe(403);
  });

  it('returns the invites list for org_admin', async () => {
    mockAuth(ADMIN_USER);
    const rows = [{ id: 'inv-1', email: 'new@test.com', role: 'tutor', org_id: null }];
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: rows, error: null }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });

  it('returns 500 when DB errors', async () => {
    mockAuth(ADMIN_USER);
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    });
    expect((await GET()).status).toBe(500);
  });
});

describe('POST /api/admin/invites', () => {
  beforeEach(() => { mockServerClient.mockReset(); mockFrom.mockReset(); });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    expect((await POST(postReq({ email: 'a@b.com', role: 'tutor' }))).status).toBe(401);
  });

  it('returns 403 for a user without a valid admin role', async () => {
    mockAuth(NO_ROLE_USER);
    expect((await POST(postReq({ email: 'a@b.com', role: 'tutor' }))).status).toBe(403);
  });

  it('returns 400 when email is missing', async () => {
    mockAuth(ADMIN_USER);
    expect((await POST(postReq({ role: 'tutor' }))).status).toBe(400);
  });

  it('returns 400 when role is missing', async () => {
    mockAuth(ADMIN_USER);
    expect((await POST(postReq({ email: 'a@b.com' }))).status).toBe(400);
  });

  it('returns 400 for an invalid role (super_admin is not assignable)', async () => {
    mockAuth(ADMIN_USER);
    const res = await POST(postReq({ email: 'a@b.com', role: 'super_admin' }));
    expect(res.status).toBe(400);
  });

  it('creates an invite and returns 201 with the invite data', async () => {
    mockAuth(ADMIN_USER);
    const invite = { id: 'inv-new', email: 'new@test.com', role: 'tutor' };
    mockFrom.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: invite, error: null }),
        }),
      }),
    });

    const res = await POST(postReq({ email: 'new@test.com', role: 'tutor' }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.email).toBe('new@test.com');
  });

  it('accepts all valid invite roles', async () => {
    const validRoles = ['org_admin', 'tutor_manager', 'tutor', 'viewer'];
    for (const role of validRoles) {
      mockServerClient.mockReset();
      mockFrom.mockReset();
      mockAuth(ADMIN_USER);
      mockFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: 'inv', email: 'x@y.com', role }, error: null }),
          }),
        }),
      });
      const res = await POST(postReq({ email: 'x@y.com', role }));
      expect(res.status).toBe(201);
    }
  });

  it('returns 500 on DB error', async () => {
    mockAuth(ADMIN_USER);
    mockFrom.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    });
    expect((await POST(postReq({ email: 'new@test.com', role: 'tutor' }))).status).toBe(500);
  });
});

describe('DELETE /api/admin/invites', () => {
  beforeEach(() => { mockServerClient.mockReset(); mockFrom.mockReset(); });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    expect((await DELETE(deleteReq({ id: 'inv-1' }))).status).toBe(401);
  });

  it('returns 403 for a user without a valid admin role', async () => {
    mockAuth(NO_ROLE_USER);
    expect((await DELETE(deleteReq({ id: 'inv-1' }))).status).toBe(403);
  });

  it('returns 400 when invite id is missing', async () => {
    mockAuth(ADMIN_USER);
    expect((await DELETE(deleteReq({}))).status).toBe(400);
  });

  it('deletes the invite and returns 200', async () => {
    mockAuth(ADMIN_USER);
    mockFrom.mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    const res = await DELETE(deleteReq({ id: 'inv-1' }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it('returns 500 on DB error', async () => {
    mockAuth(ADMIN_USER);
    mockFrom.mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      }),
    });
    expect((await DELETE(deleteReq({ id: 'inv-1' }))).status).toBe(500);
  });
});
