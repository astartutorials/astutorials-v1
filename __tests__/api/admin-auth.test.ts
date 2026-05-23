jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock('@/lib/audit', () => ({ logAuditEvent: jest.fn() }));

jest.mock('@/lib/posthog-server', () => ({
  getPostHogClient: jest.fn(() => ({ capture: jest.fn(), identify: jest.fn(), shutdown: jest.fn() })),
}));

const mockCheckLoginRateLimit = jest.fn().mockResolvedValue({ allowed: true });
jest.mock('@/lib/rate-limit', () => ({
  checkLoginRateLimit: (...args: any[]) => mockCheckLoginRateLimit(...args),
}));

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { POST as login } from '@/app/api/auth/admin/login/route';
import { POST as logout } from '@/app/api/auth/admin/logout/route';
import { NextRequest } from 'next/server';

const mockSupabase = jest.mocked(createSupabaseServerClient);

function mockClient(auth: object) {
  mockSupabase.mockResolvedValue({ auth } as any);
}

function makeLoginRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/auth/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/admin/login', () => {
  beforeEach(() => {
    mockSupabase.mockReset();
    mockCheckLoginRateLimit.mockResolvedValue({ allowed: true });
  });

  it('returns 429 when the rate limit is exceeded', async () => {
    mockCheckLoginRateLimit.mockResolvedValueOnce({ allowed: false });
    const res = await login(makeLoginRequest({ email: 'admin@test.com', password: 'pass' }));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toMatch(/too many/i);
  });

  it('returns 400 when email is missing', async () => {
    const res = await login(makeLoginRequest({ password: 'secret' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is missing', async () => {
    const res = await login(makeLoginRequest({ email: 'admin@test.com' }));
    expect(res.status).toBe(400);
  });

  it('returns 401 when credentials are wrong', async () => {
    mockClient({
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login' },
      }),
    });
    const res = await login(makeLoginRequest({ email: 'admin@test.com', password: 'wrong' }));
    expect(res.status).toBe(401);
  });

  it('returns 403 and signs out when user lacks admin role', async () => {
    const mockSignOut = jest.fn().mockResolvedValue({ error: null });
    mockClient({
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: '1', email: 'user@test.com', user_metadata: { role: 'user' } } },
        error: null,
      }),
      signOut: mockSignOut,
    });

    const res = await login(makeLoginRequest({ email: 'user@test.com', password: 'pass' }));
    expect(res.status).toBe(403);
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('returns 403 when user has no role metadata', async () => {
    mockClient({
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: '1', email: 'user@test.com', user_metadata: {} } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    });

    const res = await login(makeLoginRequest({ email: 'user@test.com', password: 'pass' }));
    expect(res.status).toBe(403);
  });

  it('returns 200 with admin profile for a valid admin', async () => {
    mockClient({
      signInWithPassword: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'admin-uuid',
            email: 'admin@astar.com',
            user_metadata: { role: 'admin', full_name: 'Admin User' },
          },
        },
        error: null,
      }),
    });

    const res = await login(makeLoginRequest({ email: 'admin@astar.com', password: 'correct' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.admin.email).toBe('admin@astar.com');
    expect(data.admin.role).toBe('org_admin');
    expect(data.admin.name).toBe('Admin User');
  });

  it('accepts the super_admin role', async () => {
    mockClient({
      signInWithPassword: jest.fn().mockResolvedValue({
        data: {
          user: { id: 'super-uuid', email: 'super@astar.com', user_metadata: { role: 'super_admin' } },
        },
        error: null,
      }),
    });

    const res = await login(makeLoginRequest({ email: 'super@astar.com', password: 'correct' }));
    expect(res.status).toBe(200);
  });
});

describe('POST /api/auth/admin/logout', () => {
  beforeEach(() => mockSupabase.mockReset());

  it('returns 200 on successful logout', async () => {
    mockClient({ signOut: jest.fn().mockResolvedValue({ error: null }) });
    const res = await logout();
    expect(res.status).toBe(200);
  });

  it('returns 500 when signOut fails', async () => {
    mockClient({ signOut: jest.fn().mockResolvedValue({ error: { message: 'Session error' } }) });
    const res = await logout();
    expect(res.status).toBe(500);
  });
});
