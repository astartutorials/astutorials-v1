import { NextRequest } from 'next/server';

const mockCreateUser = jest.fn();
const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      admin: {
        createUser: (...args: any[]) => mockCreateUser(...args),
      },
    },
    from: (...args: any[]) => mockFrom(...args),
  })),
}));

jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { POST } from '@/app/api/admin/auth/register/route';

const mockServer = jest.mocked(createSupabaseServerClient);
const ADMIN_USER = { id: 'admin-id', email: 'admin@astar.ng', user_metadata: { role: 'super_admin' } };

function mockAuth(user: object | null) {
  mockServer.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Unauthorized' },
      }),
    },
  } as any);
}

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/admin/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/auth/register', () => {
  beforeEach(() => {
    mockServer.mockReset();
    mockCreateUser.mockReset();
    mockFrom.mockReset();
    mockFrom.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
    });
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    const res = await POST(makeRequest({ name: 'Test', email: 'new@astar.ng', password: 'password123' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when name is missing', async () => {
    mockAuth(ADMIN_USER);
    const res = await POST(makeRequest({ email: 'new@test.com', password: 'password123' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/required/i);
  });

  it('returns 400 when email is missing', async () => {
    mockAuth(ADMIN_USER);
    const res = await POST(makeRequest({ name: 'New Admin', password: 'password123' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is missing', async () => {
    mockAuth(ADMIN_USER);
    const res = await POST(makeRequest({ name: 'New Admin', email: 'new@test.com' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is shorter than 8 characters', async () => {
    mockAuth(ADMIN_USER);
    const res = await POST(makeRequest({ name: 'New Admin', email: 'new@test.com', password: 'short' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/8 characters/i);
  });

  it('returns 500 when createUser fails', async () => {
    mockAuth(ADMIN_USER);
    mockCreateUser.mockResolvedValue({ data: null, error: { message: 'Email already exists' } });

    const res = await POST(makeRequest({ name: 'New Admin', email: 'existing@test.com', password: 'password123' }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Email already exists');
  });

  it('returns 201 with userId on success', async () => {
    mockAuth(ADMIN_USER);
    mockCreateUser.mockResolvedValue({
      data: { user: { id: 'new-user-uuid' } },
      error: null,
    });

    const res = await POST(makeRequest({ name: 'New Admin', email: 'new@test.com', password: 'password123' }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.userId).toBe('new-user-uuid');
  });

  it('calls createUser with email_confirm: true and full_name in user_metadata', async () => {
    mockAuth(ADMIN_USER);
    mockCreateUser.mockResolvedValue({
      data: { user: { id: 'new-uuid' } },
      error: null,
    });

    await POST(makeRequest({ name: 'Staff Member', email: 'staff@test.com', password: 'securepass1' }));

    expect(mockCreateUser).toHaveBeenCalledWith({
      email: 'staff@test.com',
      password: 'securepass1',
      user_metadata: { full_name: 'Staff Member' },
      email_confirm: true,
    });
  });
});
