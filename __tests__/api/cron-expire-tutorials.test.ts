import { NextRequest } from 'next/server';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: jest.fn() })),
}));

jest.mock('@/lib/audit', () => ({ logAuditEvent: jest.fn() }));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.CRON_SECRET = 'test-cron-secret';

import { createClient } from '@supabase/supabase-js';
import { logAuditEvent } from '@/lib/audit';
import { GET } from '@/app/api/cron/expire-tutorials/route';

// createClient is called once at module scope — capture from() then reset it between tests
let serviceFrom: jest.Mock;
beforeAll(() => {
  serviceFrom = (createClient as jest.Mock).mock.results[0].value.from as jest.Mock;
});
beforeEach(() => {
  serviceFrom.mockReset();
  jest.mocked(logAuditEvent).mockClear();
});

function makeRequest(authHeader?: string) {
  return new NextRequest('http://localhost:3000/api/cron/expire-tutorials', {
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

function mockFetchAndUpdate(
  fetchResult: { data: unknown[]; error: null } | { data: null; error: { message: string } },
  updateError: { message: string } | null = null
) {
  serviceFrom
    .mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          lt: jest.fn().mockResolvedValue(fetchResult),
        }),
      }),
    })
    .mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ error: updateError }),
      }),
    });
}

const EXPIRED = [
  { id: 'tut-1', code: 'MTH201', title: 'Calculus', org_id: 'org-1' },
  { id: 'tut-2', code: 'PHY101', title: 'Physics', org_id: 'org-1' },
];

describe('GET /api/cron/expire-tutorials', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('returns 401 when Authorization header is wrong', async () => {
    const res = await GET(makeRequest('Bearer wrong-secret'));
    expect(res.status).toBe(401);
  });

  it('returns { updated: 0 } when no tutorials have expired', async () => {
    serviceFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          lt: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    });

    const res = await GET(makeRequest('Bearer test-cron-secret'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ updated: 0 });
  });

  it('returns 500 when the fetch query fails', async () => {
    serviceFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          lt: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB fetch error' } }),
        }),
      }),
    });

    const res = await GET(makeRequest('Bearer test-cron-secret'));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('DB fetch error');
  });

  it('returns 500 when the update query fails', async () => {
    mockFetchAndUpdate({ data: EXPIRED, error: null }, { message: 'DB update error' });

    const res = await GET(makeRequest('Bearer test-cron-secret'));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('DB update error');
  });

  it('marks expired tutorials as completed and returns the count', async () => {
    mockFetchAndUpdate({ data: EXPIRED, error: null });

    const res = await GET(makeRequest('Bearer test-cron-secret'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ updated: 2 });
  });

  it('calls logAuditEvent once per expired tutorial', async () => {
    mockFetchAndUpdate({ data: EXPIRED, error: null });

    await GET(makeRequest('Bearer test-cron-secret'));

    expect(logAuditEvent).toHaveBeenCalledTimes(2);
    expect(logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'tutorial.auto_expired', targetId: 'tut-1' })
    );
    expect(logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'tutorial.auto_expired', targetId: 'tut-2' })
    );
  });

  it('does not call logAuditEvent when no tutorials expire', async () => {
    serviceFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          lt: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    });

    await GET(makeRequest('Bearer test-cron-secret'));
    expect(logAuditEvent).not.toHaveBeenCalled();
  });
});
