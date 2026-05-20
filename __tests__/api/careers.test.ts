import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { GET as getPublicCareers } from '@/app/api/careers/route';
import { POST as createCareer } from '@/app/api/admin/careers/route';
import { PUT as updateCareer, DELETE as deleteCareer } from '@/app/api/admin/careers/[id]/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);
const ADMIN_USER = { id: 'admin-id', user_metadata: { role: 'admin' } };

function mockClient(user: object | null, fromFn = jest.fn()) {
  mockServerClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Unauthorized' },
      }),
    },
    from: fromFn,
  } as any);
}

function makeRequest(method: string, body?: object, id?: string) {
  const url = id
    ? `http://localhost:3000/api/admin/careers/${id}`
    : 'http://localhost:3000/api/admin/careers';
  return new NextRequest(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

const dbCareer = {
  id: 'c1', job_id: '#ENG-123', title: 'Software Engineer', category: 'Engineering',
  type: 'Full-time', location: 'Remote', description: 'Build great things',
  responsibilities: 'Code stuff', requirements: 'JavaScript',
  application_link: 'https://apply.example.com', status: 'active',
  created_at: '2025-01-01T00:00:00Z',
};

describe('GET /api/careers', () => {
  beforeEach(() => mockServerClient.mockReset());

  it('returns active careers with camelCase field names', async () => {
    mockClient(null, jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [dbCareer], error: null }),
        }),
      }),
    }));

    const res = await getPublicCareers(new NextRequest('http://localhost:3000/api/careers'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.jobs).toHaveLength(1);
    expect(data.jobs[0].jobId).toBe('#ENG-123');
    expect(data.jobs[0].applicationLink).toBe('https://apply.example.com');
    expect(data.jobs[0].application_link).toBeUndefined();
  });

  it('returns 500 on database error', async () => {
    mockClient(null, jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    }));

    const res = await getPublicCareers(new NextRequest('http://localhost:3000/api/careers'));
    expect(res.status).toBe(500);
  });
});

describe('POST /api/admin/careers', () => {
  beforeEach(() => mockServerClient.mockReset());

  it('returns 401 when not authenticated', async () => {
    mockClient(null);
    const res = await createCareer(makeRequest('POST', {
      roleTitle: 'Dev', department: 'Eng', jobType: 'Full-time', applicationLink: 'https://x.com',
    }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    mockClient(ADMIN_USER);
    const res = await createCareer(makeRequest('POST', { roleTitle: 'Dev' }));
    expect(res.status).toBe(400);
  });

  it('creates a career role and returns 201 with a generated jobId', async () => {
    const mockFrom = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: dbCareer, error: null }),
        }),
      }),
    });
    mockClient(ADMIN_USER, mockFrom);

    const res = await createCareer(makeRequest('POST', {
      roleTitle: 'Software Engineer', department: 'Engineering',
      jobType: 'Full-time', applicationLink: 'https://apply.example.com',
    }));

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.job.jobId).toBe('#ENG-123');
  });
});

describe('PUT /api/admin/careers/[id]', () => {
  beforeEach(() => mockServerClient.mockReset());

  it('returns 401 when not authenticated', async () => {
    mockClient(null);
    const res = await updateCareer(makeRequest('PUT', { status: 'inactive' }, 'c1'), makeParams('c1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 when no valid fields are provided', async () => {
    mockClient(ADMIN_USER);
    const res = await updateCareer(makeRequest('PUT', { unknownField: 'value' }, 'c1'), makeParams('c1'));
    expect(res.status).toBe(400);
  });

  it('updates a career and returns 200 with camelCase response', async () => {
    const mockFrom = jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { ...dbCareer, status: 'inactive' }, error: null }),
          }),
        }),
      }),
    });
    mockClient(ADMIN_USER, mockFrom);

    const res = await updateCareer(makeRequest('PUT', { status: 'inactive' }, 'c1'), makeParams('c1'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.job.status).toBe('inactive');
  });
});

describe('DELETE /api/admin/careers/[id]', () => {
  beforeEach(() => mockServerClient.mockReset());

  it('returns 401 when not authenticated', async () => {
    mockClient(null);
    const res = await deleteCareer(makeRequest('DELETE', undefined, 'c1'), makeParams('c1'));
    expect(res.status).toBe(401);
  });

  it('deletes a career and returns 200', async () => {
    const mockFrom = jest.fn().mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });
    mockClient(ADMIN_USER, mockFrom);

    const res = await deleteCareer(makeRequest('DELETE', undefined, 'c1'), makeParams('c1'));
    expect(res.status).toBe(200);
  });
});
