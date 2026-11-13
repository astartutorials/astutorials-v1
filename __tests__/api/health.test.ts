const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: (...args: unknown[]) => mockFrom(...args) })),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { GET } from '@/app/api/health/route';
import { makeChain } from '../helpers/supabase';

describe('GET /api/health', () => {
  beforeEach(() => mockFrom.mockReset());

  it('is 200 when the database answers', async () => {
    mockFrom.mockReturnValue(makeChain(null));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, database: 'up' });
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('is 503 when the database returns an error', async () => {
    mockFrom.mockReturnValue(makeChain(null, { message: 'connection refused' }));
    const res = await GET();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toMatchObject({ ok: false, database: 'down' });
    // Never leaks the underlying error.
    expect(JSON.stringify(body)).not.toContain('connection refused');
  });

  it('is 503 when the query throws', async () => {
    mockFrom.mockImplementation(() => { throw new Error('boom'); });
    expect((await GET()).status).toBe(503);
  });
});
