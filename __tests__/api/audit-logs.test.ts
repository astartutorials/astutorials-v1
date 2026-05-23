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
import { GET } from '@/app/api/admin/audit-logs/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);

// super_admin via metadata fallback (no DB row needed)
const SUPER_ADMIN = { id: 'sa-id', email: 'super@test.com', user_metadata: { role: 'super_admin' } };
// org_admin metadata fallback (role: 'admin' maps to org_admin)
const ORG_ADMIN = { id: 'oa-id', email: 'orgadmin@test.com', user_metadata: { role: 'admin' } };

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

function makeGetRequest(page?: number) {
  const url = page
    ? `http://localhost:3000/api/admin/audit-logs?page=${page}`
    : 'http://localhost:3000/api/admin/audit-logs';
  return new NextRequest(url);
}

describe('GET /api/admin/audit-logs', () => {
  beforeEach(() => { mockServerClient.mockReset(); mockFrom.mockReset(); });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-super_admin roles', async () => {
    mockAuth(ORG_ADMIN);
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(403);
  });

  it('returns paginated logs for super_admin', async () => {
    mockAuth(SUPER_ADMIN);
    const rows = [
      { id: 'log-1', actor_email: 'super@test.com', action: 'org.created', created_at: new Date().toISOString() },
    ];
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({ data: rows, error: null, count: 1 }),
        }),
      }),
    });

    const res = await GET(makeGetRequest(1));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.logs).toHaveLength(1);
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
    expect(body.pages).toBe(1);
  });

  it('returns 500 when DB errors', async () => {
    mockAuth(SUPER_ADMIN);
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' }, count: null }),
        }),
      }),
    });

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(500);
  });

  it('defaults to page 1 when no page param is given', async () => {
    mockAuth(SUPER_ADMIN);
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
        }),
      }),
    });

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.page).toBe(1);
  });
});
