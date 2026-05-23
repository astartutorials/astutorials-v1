import { NextRequest } from 'next/server';

const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: (...args: any[]) => mockFrom(...args) })),
}));

jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock('@/lib/audit', () => ({ logAuditEvent: jest.fn() }));

jest.mock('@/lib/email', () => ({
  sendApplicationShortlisted: jest.fn().mockResolvedValue(undefined),
  sendApplicationRejected: jest.fn().mockResolvedValue(undefined),
  sendApplicationAccepted: jest.fn().mockResolvedValue(undefined),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { sendApplicationShortlisted, sendApplicationRejected, sendApplicationAccepted } from '@/lib/email';
import { GET } from '@/app/api/admin/applications/route';
import { PATCH } from '@/app/api/admin/applications/[id]/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);
const ADMIN_USER = { id: 'admin-id', email: 'admin@test.com', user_metadata: { role: 'super_admin' } };

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

function patchReq(body: object) {
  return { json: jest.fn().mockResolvedValue(body) } as unknown as NextRequest;
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function mockSelectThenUpdate(application: object | null, fetchError: object | null = null, updateError: object | null = null) {
  mockFrom
    .mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: application, error: fetchError }),
        }),
      }),
    })
    .mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: updateError }),
      }),
    });
}

const SAMPLE_APP = { full_name: 'Alice Smith', email: 'alice@test.com', status: 'new' };

describe('GET /api/admin/applications', () => {
  beforeEach(() => {
    mockServerClient.mockReset();
    mockFrom.mockReset();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns all applications ordered by created_at desc', async () => {
    mockAuth(ADMIN_USER);
    const rows = [
      { id: 'app-1', full_name: 'Alice', email: 'alice@test.com', status: 'new', created_at: '2025-01-02T00:00:00Z' },
      { id: 'app-2', full_name: 'Bob', email: 'bob@test.com', status: 'reviewing', created_at: '2025-01-01T00:00:00Z' },
    ];
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: rows, error: null }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(data[0].full_name).toBe('Alice');
  });

  it('returns 500 when Supabase errors', async () => {
    mockAuth(ADMIN_USER);
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/admin/applications/[id]', () => {
  beforeEach(() => {
    mockServerClient.mockReset();
    mockFrom.mockReset();
    jest.mocked(sendApplicationShortlisted).mockClear();
    jest.mocked(sendApplicationRejected).mockClear();
    jest.mocked(sendApplicationAccepted).mockClear();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    const res = await PATCH(patchReq({ status: 'reviewing' }), makeParams('app-1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid status', async () => {
    mockAuth(ADMIN_USER);
    const res = await PATCH(patchReq({ status: 'approved' }), makeParams('app-1'));
    expect(res.status).toBe(400);
  });

  it('returns 404 when application not found', async () => {
    mockAuth(ADMIN_USER);
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
        }),
      }),
    });

    const res = await PATCH(patchReq({ status: 'reviewing' }), makeParams('app-1'));
    expect(res.status).toBe(404);
  });

  it('updates status and returns success', async () => {
    mockAuth(ADMIN_USER);
    mockSelectThenUpdate(SAMPLE_APP);

    const res = await PATCH(patchReq({ status: 'reviewing' }), makeParams('app-1'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('returns 500 when update errors', async () => {
    mockAuth(ADMIN_USER);
    mockSelectThenUpdate(SAMPLE_APP, null, { message: 'DB error' });

    const res = await PATCH(patchReq({ status: 'rejected' }), makeParams('app-1'));
    expect(res.status).toBe(500);
  });

  it('accepts all valid statuses', async () => {
    const VALID = ['new', 'reviewing', 'shortlisted', 'rejected', 'accepted'];
    for (const status of VALID) {
      mockServerClient.mockReset();
      mockFrom.mockReset();
      mockAuth(ADMIN_USER);
      mockSelectThenUpdate({ ...SAMPLE_APP, status: 'new' });
      const res = await PATCH(patchReq({ status }), makeParams('app-1'));
      expect(res.status).toBe(200);
    }
  });

  it('sends shortlisted email when transitioning to shortlisted', async () => {
    mockAuth(ADMIN_USER);
    mockSelectThenUpdate({ ...SAMPLE_APP, status: 'reviewing' });

    await PATCH(patchReq({ status: 'shortlisted' }), makeParams('app-1'));
    expect(sendApplicationShortlisted).toHaveBeenCalledWith({
      to: SAMPLE_APP.email,
      fullName: SAMPLE_APP.full_name,
    });
  });

  it('sends rejected email when transitioning to rejected', async () => {
    mockAuth(ADMIN_USER);
    mockSelectThenUpdate({ ...SAMPLE_APP, status: 'reviewing' });

    await PATCH(patchReq({ status: 'rejected' }), makeParams('app-1'));
    expect(sendApplicationRejected).toHaveBeenCalledWith({
      to: SAMPLE_APP.email,
      fullName: SAMPLE_APP.full_name,
    });
  });

  it('sends accepted email when transitioning to accepted', async () => {
    mockAuth(ADMIN_USER);
    mockSelectThenUpdate({ ...SAMPLE_APP, status: 'shortlisted' });

    await PATCH(patchReq({ status: 'accepted' }), makeParams('app-1'));
    expect(sendApplicationAccepted).toHaveBeenCalledWith({
      to: SAMPLE_APP.email,
      fullName: SAMPLE_APP.full_name,
    });
  });

  it('does not send email when status is unchanged', async () => {
    mockAuth(ADMIN_USER);
    mockSelectThenUpdate({ ...SAMPLE_APP, status: 'shortlisted' });

    await PATCH(patchReq({ status: 'shortlisted' }), makeParams('app-1'));
    expect(sendApplicationShortlisted).not.toHaveBeenCalled();
  });

  it('does not send email for non-notification statuses (new, reviewing)', async () => {
    mockAuth(ADMIN_USER);
    mockSelectThenUpdate({ ...SAMPLE_APP, status: 'new' });

    await PATCH(patchReq({ status: 'reviewing' }), makeParams('app-1'));
    expect(sendApplicationShortlisted).not.toHaveBeenCalled();
    expect(sendApplicationRejected).not.toHaveBeenCalled();
    expect(sendApplicationAccepted).not.toHaveBeenCalled();
  });
});
