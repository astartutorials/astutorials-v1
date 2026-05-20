import { NextRequest } from 'next/server';

// service-role client (used by GET — created at module scope)
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: jest.fn() })),
}));

// auth client (used by POST / PUT / DELETE)
jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test_anon_key';

import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { GET, POST } from '@/app/api/admin/tutorials/route';
import { PUT, DELETE } from '@/app/api/admin/tutorials/[id]/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);
const ADMIN_USER = { id: 'admin-id', user_metadata: { role: 'admin' } };

function getServiceFrom() {
  return (createClient as jest.Mock).mock.results[0].value.from as jest.Mock;
}

function mockAuthClient(user: object | null, fromFn = jest.fn()) {
  mockServerClient.mockResolvedValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user }, error: user ? null : { message: 'Unauthorized' } }) },
    from: fromFn,
  } as any);
}

function makeRequest(method: string, body?: object, id?: string) {
  const url = id
    ? `http://localhost:3000/api/admin/tutorials/${id}`
    : 'http://localhost:3000/api/admin/tutorials';
  return new NextRequest(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/admin/tutorials', () => {
  beforeEach(() => mockServerClient.mockReset());

  it('returns 401 when not authenticated', async () => {
    mockAuthClient(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns all tutorials including drafts', async () => {
    mockAuthClient(ADMIN_USER);
    const tutorialData = [
      { id: '1', code: 'MTH201', title: 'Calculus', status: 'active', bookings: [] },
      { id: '2', code: 'PHY101', title: 'Physics', status: 'draft', bookings: [] },
    ];
    getServiceFrom().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: tutorialData, error: null }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(data.some((t: any) => t.status === 'draft')).toBe(true);
  });

  it('returns 500 when Supabase errors', async () => {
    mockAuthClient(ADMIN_USER);
    getServiceFrom().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB failure' } }),
      }),
    });
    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe('POST /api/admin/tutorials', () => {
  beforeEach(() => mockServerClient.mockReset());

  it('returns 401 when not authenticated', async () => {
    mockAuthClient(null);
    const res = await POST(makeRequest('POST', { code: 'MTH201', title: 'Calculus', status: 'draft' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when code is missing', async () => {
    mockAuthClient(ADMIN_USER);
    const res = await POST(makeRequest('POST', { title: 'Calculus', status: 'draft' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when title is missing', async () => {
    mockAuthClient(ADMIN_USER);
    const res = await POST(makeRequest('POST', { code: 'MTH201', status: 'draft' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when publishing without a teacher', async () => {
    mockAuthClient(ADMIN_USER);
    const res = await POST(makeRequest('POST', { code: 'MTH201', title: 'Calculus', capacity: 30, status: 'active' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when publishing without capacity', async () => {
    mockAuthClient(ADMIN_USER);
    const res = await POST(makeRequest('POST', { code: 'MTH201', title: 'Calculus', teacher: 'Dr A', status: 'active' }));
    expect(res.status).toBe(400);
  });

  it('creates a draft with only code and title', async () => {
    const newTutorial = { id: 'new-id', code: 'MTH201', title: 'Calculus', status: 'draft' };
    const mockFrom = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: newTutorial, error: null }),
        }),
      }),
    });
    mockAuthClient(ADMIN_USER, mockFrom);
    const res = await POST(makeRequest('POST', { code: 'MTH201', title: 'Calculus', status: 'draft' }));
    expect(res.status).toBe(201);
  });

  it('creates an active tutorial with all required fields', async () => {
    const newTutorial = { id: 'new-id', code: 'MTH201', title: 'Calculus', status: 'active' };
    const mockFrom = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: newTutorial, error: null }),
        }),
      }),
    });
    mockAuthClient(ADMIN_USER, mockFrom);
    const res = await POST(makeRequest('POST', {
      code: 'MTH201', title: 'Calculus', teacher: 'Dr A', capacity: 30, status: 'active',
    }));
    expect(res.status).toBe(201);
  });
});

describe('PUT /api/admin/tutorials/[id]', () => {
  beforeEach(() => mockServerClient.mockReset());

  it('returns 401 when not authenticated', async () => {
    mockAuthClient(null);
    const res = await PUT(makeRequest('PUT', { title: 'New Title' }, 'tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(401);
  });

  it('updates a tutorial and returns 200', async () => {
    const updated = { id: 'tut-1', title: 'New Title' };
    const mockFrom = jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: updated, error: null }),
          }),
        }),
      }),
    });
    mockAuthClient(ADMIN_USER, mockFrom);

    const res = await PUT(makeRequest('PUT', { title: 'New Title' }, 'tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.tutorial.title).toBe('New Title');
  });
});

describe('DELETE /api/admin/tutorials/[id]', () => {
  beforeEach(() => mockServerClient.mockReset());

  it('returns 401 when not authenticated', async () => {
    mockAuthClient(null);
    const res = await DELETE(makeRequest('DELETE', undefined, 'tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(401);
  });

  it('deletes a tutorial and returns 200', async () => {
    const mockFrom = jest.fn().mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });
    mockAuthClient(ADMIN_USER, mockFrom);

    const res = await DELETE(makeRequest('DELETE', undefined, 'tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(200);
  });
});
