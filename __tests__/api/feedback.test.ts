import { NextRequest } from 'next/server';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: jest.fn() })),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { createClient } from '@supabase/supabase-js';
import { POST } from '@/app/api/feedback/route';

function getFrom() {
  return (createClient as jest.Mock).mock.results[0].value.from as jest.Mock;
}

function mockInsert(result: { error: any }) {
  getFrom().mockReturnValue({ insert: jest.fn().mockResolvedValue(result) });
}

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/feedback', () => {
  it('returns 400 on invalid JSON body', async () => {
    const req = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when rating is missing', async () => {
    const res = await POST(makeRequest({ comment: 'great' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when rating is 0', async () => {
    const res = await POST(makeRequest({ rating: 0 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when rating is 6', async () => {
    const res = await POST(makeRequest({ rating: 6 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when rating is a non-numeric string', async () => {
    const res = await POST(makeRequest({ rating: 'abc' }));
    expect(res.status).toBe(400);
  });

  it('saves feedback and returns 201 with just a rating', async () => {
    mockInsert({ error: null });
    const res = await POST(makeRequest({ rating: 4 }));
    expect(res.status).toBe(201);
  });

  it('saves both rating and trimmed comment', async () => {
    const insertFn = jest.fn().mockResolvedValue({ error: null });
    getFrom().mockReturnValue({ insert: insertFn });

    await POST(makeRequest({ rating: 5, comment: '  Really helpful!  ' }));
    expect(insertFn).toHaveBeenCalledWith({ rating: 5, comment: 'Really helpful!' });
  });

  it('stores null when comment is whitespace-only', async () => {
    const insertFn = jest.fn().mockResolvedValue({ error: null });
    getFrom().mockReturnValue({ insert: insertFn });

    await POST(makeRequest({ rating: 3, comment: '   ' }));
    expect(insertFn).toHaveBeenCalledWith({ rating: 3, comment: null });
  });

  it('returns 500 when Supabase returns an error', async () => {
    mockInsert({ error: { message: 'DB error' } });
    const res = await POST(makeRequest({ rating: 4 }));
    expect(res.status).toBe(500);
  });
});
