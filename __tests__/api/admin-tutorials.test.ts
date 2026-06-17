import { NextRequest } from 'next/server';

// service-role client (used by GET — created at module scope)
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: jest.fn() })),
}));

jest.mock('@/lib/audit', () => ({ logAuditEvent: jest.fn() }));

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
import { GET as getTutorial, PUT, DELETE } from '@/app/api/admin/tutorials/[id]/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);
const ADMIN_USER = { id: 'admin-id', user_metadata: { role: 'admin' } };

function getServiceFrom() {
  return (createClient as jest.Mock).mock.results[0].value.from as jest.Mock;
}

// The [id] route creates its own service-role client (the 2nd createClient
// call, after the list route's at module load).
function getIdServiceFrom() {
  return (createClient as jest.Mock).mock.results[1].value.from as jest.Mock;
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

  function mockUpdateResult(data: object | null) {
    return jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data, error: null }),
          }),
        }),
      }),
    });
  }

  it('updates a tutorial and returns 200', async () => {
    mockAuthClient(ADMIN_USER, mockUpdateResult({ id: 'tut-1', title: 'New Title' }));

    const res = await PUT(makeRequest('PUT', { title: 'New Title' }, 'tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.tutorial.title).toBe('New Title');
  });

  it('returns 404 when the tutorial does not exist (or is out of org scope)', async () => {
    mockAuthClient(ADMIN_USER, mockUpdateResult(null));

    const res = await PUT(makeRequest('PUT', { title: 'New Title' }, 'tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(404);
  });
});

describe('GET /api/admin/tutorials/[id]', () => {
  beforeEach(() => mockServerClient.mockReset());

  function mockTutorialFetch(data: object | null) {
    getIdServiceFrom().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data, error: null }),
        }),
      }),
    });
  }

  it('returns 401 when not authenticated', async () => {
    mockAuthClient(null);
    const res = await getTutorial(makeRequest('GET', undefined, 'tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when the tutorial does not exist (or is out of org scope)', async () => {
    mockAuthClient(ADMIN_USER, jest.fn());
    mockTutorialFetch(null);
    const res = await getTutorial(makeRequest('GET', undefined, 'tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(404);
  });

  it('returns the tutorial in any status (e.g. completed)', async () => {
    mockAuthClient(ADMIN_USER, jest.fn());
    mockTutorialFetch({ id: 'tut-1', code: 'CS101', title: 'Done', status: 'completed' });
    const res = await getTutorial(makeRequest('GET', undefined, 'tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('completed');
  });
});

describe('DELETE /api/admin/tutorials/[id]', () => {
  beforeEach(() => mockServerClient.mockReset());

  it('returns 401 when not authenticated', async () => {
    mockAuthClient(null);
    const res = await DELETE(makeRequest('DELETE', undefined, 'tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(401);
  });

  // Mock the service-role paid-booking count check that runs before deletion.
  function mockPaidBookingCount(count: number) {
    getIdServiceFrom().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count }),
        }),
      }),
    });
  }

  // Auth client whose existence/ownership fetch returns the given row, and
  // whose delete resolves successfully.
  function mockAuthForDelete(tutorialRow: object | null) {
    mockAuthClient(ADMIN_USER, jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: tutorialRow, error: null }),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    }));
  }

  it('deletes a tutorial and returns 200', async () => {
    mockAuthForDelete({ code: 'CS101', title: 'Test Tutorial', org_id: null });
    mockPaidBookingCount(0);

    const res = await DELETE(makeRequest('DELETE', undefined, 'tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(200);
  });

  it('returns 404 when the tutorial does not exist (or is out of org scope)', async () => {
    mockAuthForDelete(null);

    const res = await DELETE(makeRequest('DELETE', undefined, 'tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(404);
  });

  it('refuses to delete a tutorial with paid bookings (409)', async () => {
    mockAuthForDelete({ code: 'CS101', title: 'Test Tutorial', org_id: null });
    mockPaidBookingCount(2);

    const res = await DELETE(makeRequest('DELETE', undefined, 'tut-1'), makeParams('tut-1'));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain('paid booking');
  });
});
