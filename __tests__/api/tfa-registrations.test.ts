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
  sendTfaRegistrationConfirmation: (...args: unknown[]) => mockSendConfirmation(...args),
}));

const mockCapture = jest.fn();
jest.mock('@/lib/posthog-server', () => ({
  getPostHogClient: () => ({
    identify: jest.fn(),
    capture: mockCapture,
    shutdown: jest.fn().mockResolvedValue(undefined),
  }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { POST } from '@/app/api/tfa-registrations/route';
import { BABCOCK_ORG_ID } from '@/lib/programme-org';
import { TFA_CLOSES_AT } from '@/lib/tfa';

function mockUpsert(result: { error: unknown } = { error: null }) {
  const upsert = jest.fn().mockResolvedValue(result);
  mockFrom.mockReturnValue({ upsert });
  return upsert;
}

const VALID = {
  fullName: 'Ada Lovelace',
  email: 'ada@babcock.edu.ng',
  phone: '08012345678',
  attendeeType: 'Fresher (100 Level)',
};

function makeRequest(body: object | string) {
  return new NextRequest('http://localhost:3000/api/tfa-registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/tfa-registrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: new Date('2026-11-07T12:00:00Z'), doNotFake: ['nextTick', 'setImmediate'] });
    mockVerifyTurnstile.mockResolvedValue(true);
    mockSendConfirmation.mockResolvedValue(undefined);
  });
  afterEach(() => jest.useRealTimers());

  it('returns 410 once the event has ended', async () => {
    jest.setSystemTime(new Date(TFA_CLOSES_AT.getTime() + 1000));
    const upsert = mockUpsert();
    expect((await POST(makeRequest(VALID))).status).toBe(410);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('still accepts registrations on the morning of the event', async () => {
    jest.setSystemTime(new Date('2026-11-08T10:30:00Z'));
    mockUpsert();
    expect((await POST(makeRequest(VALID))).status).toBe(201);
  });

  it('returns 403 when Turnstile verification fails', async () => {
    mockVerifyTurnstile.mockResolvedValueOnce(false);
    expect((await POST(makeRequest(VALID))).status).toBe(403);
  });

  it('returns 400 on invalid JSON body', async () => {
    expect((await POST(makeRequest('not json'))).status).toBe(400);
  });

  it.each([
    ['full name', { fullName: '  ' }],
    ['email', { email: 'not-an-email' }],
    ['WhatsApp number', { phone: '' }],
    ['attendee type', { attendeeType: '' }],
    ['unknown attendee type', { attendeeType: 'Lecturer' }],
  ])('returns 400 for a bad %s', async (_label, patch) => {
    const upsert = mockUpsert();
    expect((await POST(makeRequest({ ...VALID, ...patch }))).status).toBe(400);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('saves a trimmed, lowercased row for Babcock and upserts on email', async () => {
    const upsert = mockUpsert();
    const res = await POST(
      makeRequest({
        ...VALID,
        fullName: '  Ada Lovelace ',
        email: ' Ada@Babcock.Edu.NG ',
        courseOfStudy: ' Nursing ',
        question: '',
        orgId: 'some-other-org',
      })
    );
    expect(res.status).toBe(201);
    expect(upsert).toHaveBeenCalledWith(
      {
        org_id: BABCOCK_ORG_ID,
        full_name: 'Ada Lovelace',
        email: 'ada@babcock.edu.ng',
        phone: '08012345678',
        attendee_type: 'Fresher (100 Level)',
        course_of_study: 'Nursing',
        parent_phone: null,
        question: null,
        heard_via: null,
      },
      { onConflict: 'email' }
    );
  });

  it('caps a very long answer', async () => {
    const upsert = mockUpsert();
    await POST(makeRequest({ ...VALID, question: 'x'.repeat(5000) }));
    expect(upsert.mock.calls[0][0].question).toHaveLength(1000);
  });

  it('returns 500 and sends no email when Supabase fails', async () => {
    mockUpsert({ error: { message: 'DB error' } });
    expect((await POST(makeRequest(VALID))).status).toBe(500);
    expect(mockSendConfirmation).not.toHaveBeenCalled();
  });

  it('sends the confirmation to the saved address', async () => {
    mockUpsert();
    await POST(makeRequest(VALID));
    expect(mockSendConfirmation).toHaveBeenCalledWith({ to: 'ada@babcock.edu.ng', fullName: 'Ada Lovelace' });
  });

  it('still returns 201 when the email or PostHog throws', async () => {
    mockUpsert();
    mockSendConfirmation.mockRejectedValueOnce(new Error('Resend down'));
    mockCapture.mockImplementationOnce(() => {
      throw new Error('PostHog down');
    });
    expect((await POST(makeRequest(VALID))).status).toBe(201);
  });
});
