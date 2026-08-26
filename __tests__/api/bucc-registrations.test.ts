import { NextRequest } from 'next/server';

// Held outside the factory so `jest.clearAllMocks()` between tests can't wipe
// the handle we need to stub the query chain.
const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: (...args: any[]) => mockFrom(...args) })),
}));

const mockVerifyTurnstile = jest.fn().mockResolvedValue(true);
jest.mock('@/lib/turnstile', () => ({
  verifyTurnstile: (...args: any[]) => mockVerifyTurnstile(...args),
}));

const mockSendConfirmation = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/email', () => ({
  sendBuccRegistrationConfirmation: (...args: any[]) => mockSendConfirmation(...args),
}));

const mockCapture = jest.fn();
const mockIdentify = jest.fn();
jest.mock('@/lib/posthog-server', () => ({
  getPostHogClient: () => ({
    identify: mockIdentify,
    capture: mockCapture,
    shutdown: jest.fn().mockResolvedValue(undefined),
  }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { POST } from '@/app/api/bucc-registrations/route';

/** Wires the `from().upsert()` chain and hands back the upsert spy. */
function mockUpsert(result: { error: any } = { error: null }) {
  const upsert = jest.fn().mockResolvedValue(result);
  mockFrom.mockReturnValue({ upsert });
  return upsert;
}

const VALID = {
  fullName: 'Ada Lovelace',
  email: 'ada@babcock.edu.ng',
  phone: '08012345678',
  level: '200 Level',
  programme: 'Computer Science',
};

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/bucc-registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/bucc-registrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyTurnstile.mockResolvedValue(true);
    mockSendConfirmation.mockResolvedValue(undefined);
  });

  it('returns 403 when Turnstile verification fails', async () => {
    mockVerifyTurnstile.mockResolvedValueOnce(false);
    const res = await POST(makeRequest({ ...VALID, turnstileToken: 'bad-token' }));
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new NextRequest('http://localhost:3000/api/bucc-registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    expect((await POST(req)).status).toBe(400);
  });

  it('returns 400 when the full name is missing or blank', async () => {
    expect((await POST(makeRequest({ ...VALID, fullName: '   ' }))).status).toBe(400);
  });

  it('returns 400 when the email has no @', async () => {
    expect((await POST(makeRequest({ ...VALID, email: 'not-an-email' }))).status).toBe(400);
  });

  it('returns 400 when the WhatsApp number is missing', async () => {
    expect((await POST(makeRequest({ ...VALID, phone: '' }))).status).toBe(400);
  });

  it('saves a registration and returns 201', async () => {
    mockUpsert();
    expect((await POST(makeRequest(VALID))).status).toBe(201);
  });

  it('lowercases the email and trims every field', async () => {
    const upsert = mockUpsert();
    await POST(
      makeRequest({
        ...VALID,
        fullName: '  Ada Lovelace  ',
        email: '  Ada@Babcock.Edu.NG ',
        question: '  How many hours should I study?  ',
      })
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: 'Ada Lovelace',
        email: 'ada@babcock.edu.ng',
        question: 'How many hours should I study?',
      }),
      { onConflict: 'email' }
    );
  });

  it('stores null for optional fields left empty', async () => {
    const upsert = mockUpsert();
    await POST(makeRequest({ ...VALID, concern: '   ', question: '', heardVia: undefined }));
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ concern: null, question: null, heard_via: null }),
      { onConflict: 'email' }
    );
  });

  it('caps a very long answer so one submission cannot fill the row', async () => {
    const upsert = mockUpsert();
    await POST(makeRequest({ ...VALID, question: 'x'.repeat(5000) }));
    expect(upsert.mock.calls[0][0].question).toHaveLength(1000);
  });

  it('upserts on email so a repeat submission updates instead of duplicating', async () => {
    const upsert = mockUpsert();
    await POST(makeRequest(VALID));
    expect(upsert).toHaveBeenCalledWith(expect.any(Object), { onConflict: 'email' });
  });

  it('returns 500 when Supabase returns an error', async () => {
    mockUpsert({ error: { message: 'DB error' } });
    expect((await POST(makeRequest(VALID))).status).toBe(500);
  });

  it('does not send a confirmation email when the save failed', async () => {
    mockUpsert({ error: { message: 'DB error' } });
    await POST(makeRequest(VALID));
    expect(mockSendConfirmation).not.toHaveBeenCalled();
  });

  it('sends the confirmation email to the saved address', async () => {
    mockUpsert();
    await POST(makeRequest(VALID));
    expect(mockSendConfirmation).toHaveBeenCalledWith({
      to: 'ada@babcock.edu.ng',
      fullName: 'Ada Lovelace',
    });
  });

  it('still returns 201 when the confirmation email throws', async () => {
    mockUpsert();
    mockSendConfirmation.mockRejectedValueOnce(new Error('Resend down'));
    expect((await POST(makeRequest(VALID))).status).toBe(201);
  });

  it('still returns 201 when PostHog throws', async () => {
    mockUpsert();
    mockCapture.mockImplementationOnce(() => {
      throw new Error('PostHog down');
    });
    expect((await POST(makeRequest(VALID))).status).toBe(201);
  });
});
