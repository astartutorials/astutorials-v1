import { NextRequest } from 'next/server';

const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: (...args: unknown[]) => mockFrom(...args) })),
}));

const mockVerifyTurnstile = jest.fn().mockResolvedValue(true);
jest.mock('@/lib/turnstile', () => ({
  verifyTurnstile: (...args: unknown[]) => mockVerifyTurnstile(...args),
}));

const mockNotify = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/email', () => ({
  sendSemesterPlanEnquiryNotification: (...args: unknown[]) => mockNotify(...args),
}));

jest.mock('@/lib/posthog-server', () => ({
  getPostHogClient: () => ({
    capture: jest.fn(),
    shutdown: jest.fn().mockResolvedValue(undefined),
  }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { POST } from '@/app/api/semester-plan-enquiries/route';
import { BABCOCK_ORG_ID } from '@/lib/programme-org';

function mockInsert(result: { error: unknown } = { error: null }) {
  const insert = jest.fn().mockResolvedValue(result);
  mockFrom.mockReturnValue({ insert });
  return insert;
}

const VALID = {
  plan: 'private',
  submittedBy: 'parent',
  studentName: 'Okonkwo Adaeze',
  studentPhone: '08012345678',
  studentEmail: '',
  courseOfStudy: 'Nursing Science',
  parentName: 'Okonkwo Chinedu',
  parentPhone: '08011112222',
  parentEmail: 'Chinedu@Example.com',
  notes: '  Evenings work best  ',
};

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/semester-plan-enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/semester-plan-enquiries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyTurnstile.mockResolvedValue(true);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 403 when Turnstile fails', async () => {
    mockVerifyTurnstile.mockResolvedValueOnce(false);
    const insert = mockInsert();
    expect((await POST(makeRequest(VALID))).status).toBe(403);
    expect(insert).not.toHaveBeenCalled();
  });

  it('stores a cleaned enquiry against Babcock and notifies the team', async () => {
    const insert = mockInsert();
    const res = await POST(makeRequest(VALID));

    expect(res.status).toBe(201);
    expect(mockFrom).toHaveBeenCalledWith('semester_plan_enquiries');
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        org_id: BABCOCK_ORG_ID,
        session: '2026/2027',
        plan: 'private',
        submitted_by: 'parent',
        student_email: null,
        parent_email: 'chinedu@example.com',
        notes: 'Evenings work best',
      })
    );
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({ planName: 'Private Semester Plan', submittedBy: 'Parent/guardian' })
    );
  });

  it('accepts an undecided plan', async () => {
    const insert = mockInsert();
    expect((await POST(makeRequest({ ...VALID, plan: 'undecided' }))).status).toBe(201);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ plan: 'undecided' }));
  });

  it.each([
    ['plan', { plan: 'vip' }],
    ['submittedBy', { submittedBy: 'tutor' }],
    ['studentName', { studentName: '  ' }],
    ['studentPhone', { studentPhone: '' }],
    ['courseOfStudy', { courseOfStudy: '' }],
    ['parentName', { parentName: '' }],
    ['parentPhone', { parentPhone: '' }],
    ['parentEmail', { parentEmail: 'not-an-email' }],
  ])('returns 400 when %s is invalid', async (_field, override) => {
    const insert = mockInsert();
    expect((await POST(makeRequest({ ...VALID, ...override }))).status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it('returns 500 when the insert fails', async () => {
    mockInsert({ error: { message: 'db down' } });
    expect((await POST(makeRequest(VALID))).status).toBe(500);
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it('still succeeds when the notification email fails', async () => {
    mockInsert();
    mockNotify.mockRejectedValueOnce(new Error('resend down'));
    expect((await POST(makeRequest(VALID))).status).toBe(201);
  });
});
