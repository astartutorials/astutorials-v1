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
  sendPlaybookRegistrationConfirmation: (...args: any[]) => mockSendConfirmation(...args),
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

import { POST } from '@/app/api/playbook-registrations/route';
import { getPlaybook } from '@/lib/playbooks';

/** Wires the `from().upsert()` chain and hands back the upsert spy. */
function mockUpsert(result: { error: any } = { error: null }) {
  const upsert = jest.fn().mockResolvedValue(result);
  mockFrom.mockReturnValue({ upsert });
  return upsert;
}

const VALID = {
  playbook: 'engineering',
  fullName: 'Ada Lovelace',
  email: 'ada@babcock.edu.ng',
  phone: '08012345678',
  university: 'Babcock University',
  level: '300 Level',
  discipline: 'Mechanical Engineering',
};

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/playbook-registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/playbook-registrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyTurnstile.mockResolvedValue(true);
    mockSendConfirmation.mockResolvedValue(undefined);
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new NextRequest('http://localhost:3000/api/playbook-registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    expect((await POST(req)).status).toBe(400);
  });

  // The whole point of validating against the registry: an arbitrary slug must
  // never reach the table, where nothing downstream knows how to render it.
  it('rejects an unknown playbook before doing anything else', async () => {
    const upsert = mockUpsert();
    const res = await POST(makeRequest({ ...VALID, playbook: 'astrology' }));
    expect(res.status).toBe(400);
    expect(upsert).not.toHaveBeenCalled();
    expect(mockVerifyTurnstile).not.toHaveBeenCalled();
  });

  it('rejects a missing playbook field', async () => {
    const withoutPlaybook = { ...VALID, playbook: undefined };
    expect((await POST(makeRequest(withoutPlaybook))).status).toBe(400);
  });

  it('returns 403 when Turnstile verification fails', async () => {
    mockVerifyTurnstile.mockResolvedValueOnce(false);
    const res = await POST(makeRequest({ ...VALID, turnstileToken: 'bad-token' }));
    expect(res.status).toBe(403);
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

  it('writes to playbook_registrations, stamped with the slug', async () => {
    const upsert = mockUpsert();
    await POST(makeRequest(VALID));
    expect(mockFrom).toHaveBeenCalledWith('playbook_registrations');
    expect(upsert.mock.calls[0][0]).toEqual(
      expect.objectContaining({ playbook: 'engineering' })
    );
  });

  it('lowercases the email and trims every field', async () => {
    const upsert = mockUpsert();
    await POST(
      makeRequest({
        ...VALID,
        fullName: '  Ada Lovelace  ',
        email: '  Ada@Babcock.Edu.NG ',
        question: '  Which skill should I learn first?  ',
      })
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: 'Ada Lovelace',
        email: 'ada@babcock.edu.ng',
        question: 'Which skill should I learn first?',
      }),
      { onConflict: 'playbook,email' }
    );
  });

  it('stores null for optional fields left empty', async () => {
    const upsert = mockUpsert();
    await POST(
      makeRequest({
        ...VALID,
        challengeAcademic: '   ',
        challengeOther: '',
        question: undefined,
        heardVia: '',
        parentPhone: '  ',
      })
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        challenge_academic: null,
        challenge_other: null,
        question: null,
        heard_via: null,
        parent_phone: null,
      }),
      { onConflict: 'playbook,email' }
    );
  });

  it('caps a very long answer so one submission cannot fill the row', async () => {
    const upsert = mockUpsert();
    await POST(makeRequest({ ...VALID, question: 'x'.repeat(5000) }));
    expect(upsert.mock.calls[0][0].question).toHaveLength(1000);
  });

  // (playbook, email) rather than email alone: the same student should be able
  // to attend two of the three webinars.
  it('scopes the upsert conflict to the playbook, not the address', async () => {
    const upsert = mockUpsert();
    await POST(makeRequest(VALID));
    expect(upsert).toHaveBeenCalledWith(expect.any(Object), { onConflict: 'playbook,email' });
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

  it('sends the confirmation for the playbook that was registered for', async () => {
    mockUpsert();
    await POST(makeRequest({ ...VALID, playbook: 'law' }));
    expect(mockSendConfirmation).toHaveBeenCalledWith({
      to: 'ada@babcock.edu.ng',
      fullName: 'Ada Lovelace',
      playbook: getPlaybook('law'),
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

  it('tags the analytics event with the playbook', async () => {
    mockUpsert();
    await POST(makeRequest({ ...VALID, playbook: 'health-sciences' }));
    expect(mockCapture).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'playbook_registration_received',
        properties: expect.objectContaining({ playbook: 'health-sciences' }),
      })
    );
  });
});
