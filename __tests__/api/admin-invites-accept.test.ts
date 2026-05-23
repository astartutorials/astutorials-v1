import { NextRequest } from 'next/server';

const mockCreateUser = jest.fn();
const mockDeleteUser = jest.fn();
const mockFromImpl = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
};
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { admin: { createUser: (...a: any[]) => mockCreateUser(...a), deleteUser: (...a: any[]) => mockDeleteUser(...a) } },
    from: jest.fn(() => mockFromImpl),
  })),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { POST } from '@/app/api/admin/invites/accept/route';

const VALID_INVITE = {
  id: 'inv-1',
  email: 'new@test.com',
  role: 'org_admin',
  org_id: 'org-uuid',
  expires_at: new Date(Date.now() + 86400000).toISOString(),
  accepted_at: null,
  token: 'abc123',
};

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/admin/invites/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockInviteLookup(invite: any) {
  mockFromImpl.select.mockReturnValue({
    eq: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: invite, error: invite ? null : { message: 'Not found' } }),
    }),
  });
}

describe('POST /api/admin/invites/accept', () => {
  beforeEach(() => {
    mockCreateUser.mockReset();
    mockDeleteUser.mockReset();
    mockFromImpl.select.mockReset();
    mockFromImpl.insert.mockReset().mockResolvedValue({ error: null });
    mockFromImpl.update.mockReset().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
  });

  it('returns 400 when token is missing', async () => {
    const res = await POST(makeRequest({ name: 'Ada', password: 'password123' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when name is missing', async () => {
    const res = await POST(makeRequest({ token: 'tok', password: 'password123' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    const res = await POST(makeRequest({ token: 'tok', name: 'Ada', password: 'short' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when token is invalid', async () => {
    mockInviteLookup(null);
    const res = await POST(makeRequest({ token: 'bad-token', name: 'Ada', password: 'password123' }));
    expect(res.status).toBe(404);
  });

  it('returns 409 when invite already accepted', async () => {
    mockInviteLookup({ ...VALID_INVITE, accepted_at: '2025-01-01T00:00:00Z' });
    const res = await POST(makeRequest({ token: 'abc123', name: 'Ada', password: 'password123' }));
    expect(res.status).toBe(409);
  });

  it('returns 410 when invite is expired', async () => {
    mockInviteLookup({ ...VALID_INVITE, expires_at: new Date(Date.now() - 1000).toISOString() });
    const res = await POST(makeRequest({ token: 'abc123', name: 'Ada', password: 'password123' }));
    expect(res.status).toBe(410);
  });

  it('returns 200 and creates user + user_roles on valid invite', async () => {
    mockInviteLookup(VALID_INVITE);
    mockCreateUser.mockResolvedValue({ data: { user: { id: 'new-user-id' } }, error: null });

    const res = await POST(makeRequest({ token: 'abc123', name: 'Ada Okonkwo', password: 'securepass1' }));
    expect(res.status).toBe(200);
    expect(mockCreateUser).toHaveBeenCalledWith(expect.objectContaining({
      email: 'new@test.com',
      password: 'securepass1',
      email_confirm: true,
    }));
    expect(mockFromImpl.insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'new-user-id',
      org_id: 'org-uuid',
      role: 'org_admin',
    }));
  });

  it('rolls back user creation if user_roles insert fails', async () => {
    mockInviteLookup(VALID_INVITE);
    mockCreateUser.mockResolvedValue({ data: { user: { id: 'new-user-id' } }, error: null });
    mockFromImpl.insert.mockResolvedValueOnce({ error: { message: 'Conflict' } });

    const res = await POST(makeRequest({ token: 'abc123', name: 'Ada', password: 'password123' }));
    expect(res.status).toBe(500);
    expect(mockDeleteUser).toHaveBeenCalledWith('new-user-id');
  });
});
