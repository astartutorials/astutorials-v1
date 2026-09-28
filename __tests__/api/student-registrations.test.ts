import { NextRequest } from 'next/server';

const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: (...args: unknown[]) => mockFrom(...args) })),
}));

const mockVerifyTurnstile = jest.fn().mockResolvedValue(true);
jest.mock('@/lib/turnstile', () => ({
  verifyTurnstile: (...args: unknown[]) => mockVerifyTurnstile(...args),
}));

const mockSendConfirmation = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/email', () => ({
  sendStudentRegistrationConfirmation: (...args: unknown[]) => mockSendConfirmation(...args),
}));

jest.mock('@/lib/posthog-server', () => ({
  getPostHogClient: () => ({
    identify: jest.fn(),
    capture: jest.fn(),
    shutdown: jest.fn().mockResolvedValue(undefined),
  }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { POST } from '@/app/api/student-registrations/route';
import { BABCOCK_ORG_ID } from '@/lib/programme-org';

function mockUpsert(result: { error: unknown } = { error: null }) {
  const upsert = jest.fn().mockResolvedValue(result);
  mockFrom.mockReturnValue({ upsert });
  return upsert;
}

const VALID = {
  level: 100,
  fullName: 'Okonkwo Adaeze Grace',
  phone: '08012345678',
  whatsapp: '08087654321',
  email: 'Ada@Example.com',
  courseOfStudy: 'Nursing Science',
  instagram: 'https://www.instagram.com/ada.codes/',
  tiktok: '@adacodes',
  birthDay: 14,
  birthMonth: 2,
  parentName: 'Okonkwo Chinedu',
  parentPhone: '08011112222',
  parentEmail: '',
};

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/student-registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/student-registrations', () => {
  beforeAll(() => jest.useFakeTimers({ now: new Date('2026-10-01T12:00:00Z'), doNotFake: ['nextTick', 'setImmediate'] }));
  afterAll(() => jest.useRealTimers());

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyTurnstile.mockResolvedValue(true);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 400 on invalid JSON', async () => {
    const req = new NextRequest('http://localhost:3000/api/student-registrations', {
      method: 'POST',
      body: 'not json',
    });
    expect((await POST(req)).status).toBe(400);
  });

  it('rejects a level with no open intake before touching the database', async () => {
    const upsert = mockUpsert();
    const res = await POST(makeRequest({ ...VALID, level: 300 }));
    expect(res.status).toBe(400);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('returns 403 when bot verification fails', async () => {
    mockVerifyTurnstile.mockResolvedValue(false);
    const upsert = mockUpsert();
    expect((await POST(makeRequest(VALID))).status).toBe(403);
    expect(upsert).not.toHaveBeenCalled();
  });

  it.each([
    ['fullName', ''],
    ['whatsapp', ''],
    ['email', 'not-an-email'],
    ['courseOfStudy', ''],
    ['parentName', ''],
    ['parentPhone', ''],
  ])('returns 400 when %s is invalid', async (field, value) => {
    const upsert = mockUpsert();
    expect((await POST(makeRequest({ ...VALID, [field]: value }))).status).toBe(400);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('rejects an impossible birthday', async () => {
    mockUpsert();
    expect((await POST(makeRequest({ ...VALID, birthDay: 31, birthMonth: 4 }))).status).toBe(400);
    expect((await POST(makeRequest({ ...VALID, birthDay: 1, birthMonth: 13 }))).status).toBe(400);
  });

  // The session comes from the intake registry, never the browser.
  it('files the row under the intake session and ignores a client-sent session', async () => {
    const upsert = mockUpsert();
    const res = await POST(makeRequest({ ...VALID, session: '1999/2000' }));

    expect(res.status).toBe(201);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        session: '2026/2027',
        entry_level: 100,
        org_id: BABCOCK_ORG_ID,
        email: 'ada@example.com',
        instagram: 'ada.codes',
        tiktok: 'adacodes',
        birth_day: 14,
        birth_month: 2,
        parent_email: null,
      }),
      { onConflict: 'session,entry_level,email' }
    );
    expect(mockSendConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'ada@example.com', level: 100, session: '2026/2027' })
    );
  });

  it('returns 500 when the upsert fails, without sending the email', async () => {
    mockUpsert({ error: { message: 'boom' } });
    expect((await POST(makeRequest(VALID))).status).toBe(500);
    expect(mockSendConfirmation).not.toHaveBeenCalled();
  });

  it('still returns 201 when the confirmation email fails', async () => {
    mockUpsert();
    mockSendConfirmation.mockRejectedValueOnce(new Error('resend down'));
    expect((await POST(makeRequest(VALID))).status).toBe(201);
  });
});
