jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { POST } from '@/app/api/admin/auth/update-password/route';
import { NextRequest } from 'next/server';

const mockServer = jest.mocked(createSupabaseServerClient);

const ADMIN_USER = { id: 'admin-id', email: 'admin@astar.ng', user_metadata: {} };

function mockClient(opts: {
  user?: object | null;
  signInError?: any;
  updateError?: any;
} = {}) {
  const user = opts.user !== undefined ? opts.user : ADMIN_USER;
  mockServer.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Unauthorized' },
      }),
      signInWithPassword: jest.fn().mockResolvedValue({ error: opts.signInError ?? null }),
      updateUser: jest.fn().mockResolvedValue({ error: opts.updateError ?? null }),
    },
  } as any);
}

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/admin/auth/update-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/auth/update-password', () => {
  beforeEach(() => mockServer.mockReset());

  it('returns 401 when not authenticated', async () => {
    mockClient({ user: null });
    const res = await POST(makeRequest({ currentPassword: 'old', newPassword: 'newpass123' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when currentPassword is missing', async () => {
    mockClient();
    const res = await POST(makeRequest({ newPassword: 'newpass123' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/required/i);
  });

  it('returns 400 when newPassword is missing', async () => {
    mockClient();
    const res = await POST(makeRequest({ currentPassword: 'oldpass' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when new password is shorter than 8 characters', async () => {
    mockClient();
    const res = await POST(makeRequest({ currentPassword: 'oldpass', newPassword: 'short' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/8 characters/i);
  });

  it('returns 400 when current password is incorrect', async () => {
    mockClient({ signInError: { message: 'Invalid credentials' } });
    const res = await POST(makeRequest({ currentPassword: 'wrongpass', newPassword: 'newpass123' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/incorrect/i);
  });

  it('returns 500 when updateUser fails', async () => {
    mockClient({ updateError: { message: 'Update failed' } });
    const res = await POST(makeRequest({ currentPassword: 'correct', newPassword: 'newpass123' }));
    expect(res.status).toBe(500);
  });

  it('returns 200 on successful password update', async () => {
    mockClient();
    const res = await POST(makeRequest({ currentPassword: 'correct', newPassword: 'newpass123' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('verifies current password before updating — passes email and current password to signInWithPassword', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ error: null });
    const mockUpdateUser = jest.fn().mockResolvedValue({ error: null });
    mockServer.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: ADMIN_USER }, error: null }),
        signInWithPassword: mockSignIn,
        updateUser: mockUpdateUser,
      },
    } as any);

    await POST(makeRequest({ currentPassword: 'myoldpass', newPassword: 'betterpassword' }));

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'admin@astar.ng',
      password: 'myoldpass',
    });
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'betterpassword' });
  });
});
