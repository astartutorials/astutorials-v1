import { NextRequest } from 'next/server';

const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: (...args: any[]) => mockFrom(...args) })),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { GET, PATCH } from '@/app/api/bookings/[ref]/route';

function makeGetReq(ref: string) {
  return new NextRequest(`http://localhost:3000/api/bookings/${ref}`);
}

function makePatchReq(ref: string, body: object) {
  return new NextRequest(`http://localhost:3000/api/bookings/${ref}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeParams(ref: string) {
  return { params: Promise.resolve({ ref }) };
}

describe('GET /api/bookings/[ref]', () => {
  beforeEach(() => mockFrom.mockReset());

  it('returns booking data when found', async () => {
    const booking = {
      full_name: 'Ada Okonkwo',
      email: 'ada@test.com',
      phone: '08012345678',
      course: 'MTH201',
      notes: null,
    };
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: booking, error: null }),
        }),
      }),
    });

    const res = await GET(makeGetReq('ref-123'), makeParams('ref-123'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.full_name).toBe('Ada Okonkwo');
    expect(data.course).toBe('MTH201');
  });

  it('returns 404 when booking is not found', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'No rows' } }),
        }),
      }),
    });

    const res = await GET(makeGetReq('unknown-ref'), makeParams('unknown-ref'));
    expect(res.status).toBe(404);
  });

  it('returns 404 when data is null with no error', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    const res = await GET(makeGetReq('empty-ref'), makeParams('empty-ref'));
    expect(res.status).toBe(404);
  });

  it('queries by payment_reference', async () => {
    const mockEq = jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: { full_name: 'Test' }, error: null }),
    });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({ eq: mockEq }),
    });

    await GET(makeGetReq('my-ref-abc'), makeParams('my-ref-abc'));
    expect(mockEq).toHaveBeenCalledWith('payment_reference', 'my-ref-abc');
  });
});

describe('PATCH /api/bookings/[ref]', () => {
  beforeEach(() => mockFrom.mockReset());

  it('returns 200 on successful update', async () => {
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    const res = await PATCH(
      makePatchReq('ref-update', { courseOfStudy: 'Computer Science', level: '300 Level', preferredSchedule: 'Saturday' }),
      makeParams('ref-update')
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('returns 500 when DB update fails', async () => {
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'DB write error' } }),
      }),
    });

    const res = await PATCH(
      makePatchReq('ref-fail', { courseOfStudy: 'Law', level: '200 Level' }),
      makeParams('ref-fail')
    );
    expect(res.status).toBe(500);
  });

  it('maps camelCase body fields to snake_case columns', async () => {
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockReturnValue({ update: mockUpdate });

    await PATCH(
      makePatchReq('ref-map', {
        course: 'ENG101',
        courseOfStudy: 'English',
        level: '100 Level',
        preferredSchedule: 'Weekday Mornings (8am – 12pm)',
      }),
      makeParams('ref-map')
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        course: 'ENG101',
        course_of_study: 'English',
        level: '100 Level',
        preferred_schedule: 'Weekday Mornings (8am – 12pm)',
      })
    );
  });

  it('filters update by payment_reference', async () => {
    const mockEq = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({
      update: jest.fn().mockReturnValue({ eq: mockEq }),
    });

    await PATCH(
      makePatchReq('specific-ref-456', { courseOfStudy: 'Medicine' }),
      makeParams('specific-ref-456')
    );
    expect(mockEq).toHaveBeenCalledWith('payment_reference', 'specific-ref-456');
  });
});
