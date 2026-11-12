import { NextRequest } from 'next/server';

const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: (...args: unknown[]) => mockFrom(...args) })),
}));

const mockVerifyTurnstile = jest.fn().mockResolvedValue(true);
jest.mock('@/lib/turnstile', () => ({
  verifyTurnstile: (...args: unknown[]) => mockVerifyTurnstile(...args),
}));

const mockSendReceived = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/email', () => ({
  sendAmbassadorApplicationReceived: (...args: unknown[]) => mockSendReceived(...args),
}));

jest.mock('@/lib/posthog-server', () => ({
  getPostHogClient: () => ({ identify: jest.fn(), capture: jest.fn(), shutdown: jest.fn().mockResolvedValue(undefined) }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { POST } from '@/app/api/ambassador-applications/route';
import { BABCOCK_ORG_ID } from '@/lib/programme-org';

function mockInsert(result: { error: unknown } = { error: null }) {
  const insert = jest.fn().mockResolvedValue(result);
  mockFrom.mockReturnValue({ insert });
  return insert;
}

const VALID = {
  fullName: 'Ada Lovelace',
  email: 'Ada@Babcock.edu.ng ',
  phone: '08012345678',
  courseOfStudy: 'Nursing',
  level: '200L',
  motivation: 'My department WhatsApp groups and hostel.',
  socialHandle: '@ada',
  heardVia: 'WhatsApp',
  turnstileToken: 't',
};

const post = (body: object | string) =>
  POST(new NextRequest('http://localhost:3000/api/ambassador-applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }));

describe('POST /api/ambassador-applications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyTurnstile.mockResolvedValue(true);
  });

  it('saves a pending application for Babcock and emails the applicant', async () => {
    const insert = mockInsert();
    const res = await post(VALID);
    expect(res.status).toBe(201);
    expect(mockFrom).toHaveBeenCalledWith('ambassador_applications');
    const row = insert.mock.calls[0][0];
    expect(row).toMatchObject({ org_id: BABCOCK_ORG_ID, email: 'ada@babcock.edu.ng', level: '200L', full_name: 'Ada Lovelace' });
    // Status and code are never taken from the browser.
    expect(row.status).toBeUndefined();
    expect(row.referral_code).toBeUndefined();
    expect(mockSendReceived).toHaveBeenCalledWith({ to: 'ada@babcock.edu.ng', fullName: 'Ada Lovelace' });
  });

  it('ignores a status or referral code sent by the browser', async () => {
    const insert = mockInsert();
    await post({ ...VALID, status: 'approved', referral_code: 'FREE999' });
    expect(insert.mock.calls[0][0]).not.toHaveProperty('status');
    expect(insert.mock.calls[0][0]).not.toHaveProperty('referral_code');
  });

  it('returns 403 when Turnstile fails', async () => {
    mockVerifyTurnstile.mockResolvedValueOnce(false);
    expect((await post(VALID)).status).toBe(403);
  });

  it.each([
    ['fullName', ''],
    ['email', 'not-an-email'],
    ['phone', ''],
    ['courseOfStudy', ''],
    ['level', '900L'],
    ['motivation', '  '],
    ['heardVia', 'Carrier pigeon'],
  ])('returns 400 when %s is %p', async (field, value) => {
    mockInsert();
    expect((await post({ ...VALID, [field]: value })).status).toBe(400);
  });

  it('returns 409 on a second application with the same email, without overwriting', async () => {
    mockInsert({ error: { code: '23505', message: 'duplicate' } });
    const res = await post(VALID);
    expect(res.status).toBe(409);
    expect(mockSendReceived).not.toHaveBeenCalled();
  });

  it('returns 400 on a malformed body', async () => {
    expect((await post('{nope')).status).toBe(400);
  });

  it('still succeeds when the email fails', async () => {
    mockInsert();
    mockSendReceived.mockRejectedValueOnce(new Error('resend down'));
    expect((await post(VALID)).status).toBe(201);
  });
});
