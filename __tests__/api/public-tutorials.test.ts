import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { GET } from '@/app/api/tutorials/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);

function mockFrom(fromFn: jest.Mock) {
  mockServerClient.mockResolvedValue({ from: fromFn } as any);
}

describe('GET /api/tutorials', () => {
  beforeEach(() => mockServerClient.mockReset());

  it('returns only active tutorials', async () => {
    const tutorials = [{ id: '1', code: 'MTH201', title: 'Calculus', status: 'active' }];
    const mockEq = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: tutorials, error: null }),
    });
    mockFrom(jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ eq: mockEq }) }));

    const res = await GET(new NextRequest('http://localhost:3000/api/tutorials'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.tutorials).toHaveLength(1);
    expect(mockEq).toHaveBeenCalledWith('status', 'active');
  });

  it('returns an empty array when no active tutorials exist', async () => {
    mockFrom(jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }));

    const res = await GET(new NextRequest('http://localhost:3000/api/tutorials'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.tutorials).toHaveLength(0);
  });

  it('returns 500 on database error', async () => {
    mockFrom(jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    }));

    const res = await GET(new NextRequest('http://localhost:3000/api/tutorials'));
    expect(res.status).toBe(500);
  });
});
