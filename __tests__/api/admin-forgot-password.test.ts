import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient: jest.fn() }));

const mockCheck = jest.fn().mockResolvedValue({ allowed: true });
jest.mock('@/lib/rate-limit', () => ({
  checkPasswordResetRateLimit: (...a: unknown[]) => mockCheck(...a),
}));

process.env.NEXT_PUBLIC_BASE_URL = 'https://www.astartutorials.com';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { POST } from '@/app/api/admin/auth/forgot-password/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);
const mockReset = jest.fn().mockResolvedValue({});

function makeRequest(body: object, ip = '1.2.3.4') {
  return new NextRequest('http://localhost:3000/api/admin/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/auth/forgot-password', () => {
  beforeEach(() => {
    mockCheck.mockReset().mockResolvedValue({ allowed: true });
    mockReset.mockReset().mockResolvedValue({});
    mockServerClient.mockResolvedValue({
      auth: { resetPasswordForEmail: mockReset },
    } as never);
  });

  it('returns 400 when no email is supplied', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('sends the reset email with the configured redirect', async () => {
    const res = await POST(makeRequest({ email: 'admin@astar.com' }));

    expect(res.status).toBe(200);
    expect(mockReset).toHaveBeenCalledWith('admin@astar.com', {
      redirectTo: 'https://www.astartutorials.com/admin/reset-password',
    });
  });

  it('throttles on both the caller IP and the target address', async () => {
    await POST(makeRequest({ email: 'victim@astar.com' }, '9.9.9.9'));
    expect(mockCheck).toHaveBeenCalledWith('9.9.9.9', 'victim@astar.com');
  });

  it('returns 429 and sends nothing once the limit is hit', async () => {
    mockCheck.mockResolvedValue({ allowed: false });

    const res = await POST(makeRequest({ email: 'victim@astar.com' }));

    expect(res.status).toBe(429);
    expect((await res.json()).error).toMatch(/too many/i);
    // The whole point: no mail goes out on a throttled request.
    expect(mockReset).not.toHaveBeenCalled();
  });

  // Enumeration guard — an unknown address must look identical to a known one.
  it('returns the same 200 whether or not the address exists', async () => {
    const known = await POST(makeRequest({ email: 'admin@astar.com' }));
    mockReset.mockResolvedValue({ error: { message: 'User not found' } });
    const unknown = await POST(makeRequest({ email: 'nobody@nowhere.com' }));

    expect(known.status).toBe(unknown.status);
    expect(await known.json()).toEqual(await unknown.json());
  });
});
