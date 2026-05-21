import { NextRequest } from 'next/server';

const mockSbInsert = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({ insert: mockSbInsert })),
  })),
}));

jest.mock('@/lib/posthog-server', () => ({
  getPostHogClient: jest.fn(() => ({ capture: jest.fn(), identify: jest.fn(), shutdown: jest.fn() })),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.NOTION_CONNECTION_KEY = 'secret_notion_key';

import { POST } from '@/app/api/tutor-applications/route';

const validBody = {
  fullName: 'Ada Okonkwo',
  email: 'ada@example.com',
  phone: '08012345678',
  educationLevel: "Bachelor's",
  institution: 'University of Lagos',
  fieldOfStudy: 'Computer Science',
  coursesCanTeach: 'Mathematics, Physics',
  levelsCanTeach: ['100 Level', '200 Level'],
  yearsOfExperience: '1-2 years',
  teachingMode: 'Online',
  hasTutoredBefore: 'Yes',
  whyAstar: 'Passionate about education',
  difficultConceptExplanation: 'I use analogies',
  daysAvailable: ['Monday', 'Wednesday'],
  timeOfDay: ['Morning'],
};

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/tutor-applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/tutor-applications', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
    mockSbInsert.mockReset();
  });

  it('returns 500 when NOTION_CONNECTION_KEY is not set', async () => {
    const saved = process.env.NOTION_CONNECTION_KEY;
    delete process.env.NOTION_CONNECTION_KEY;

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);

    process.env.NOTION_CONNECTION_KEY = saved;
  });

  it('returns 400 when fullName is missing', async () => {
    const { fullName, ...bodyWithoutName } = validBody;
    const res = await POST(makeRequest(bodyWithoutName));
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is missing', async () => {
    const { email, ...bodyWithoutEmail } = validBody;
    const res = await POST(makeRequest(bodyWithoutEmail));
    expect(res.status).toBe(400);
  });

  it('returns 400 when email has no @ sign', async () => {
    const res = await POST(makeRequest({ ...validBody, email: 'notanemail' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new NextRequest('http://localhost:3000/api/tutor-applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 201 and calls Notion on a valid submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'notion-page-id' }),
    });
    mockSbInsert.mockResolvedValue({ error: null });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.notion.com/v1/pages',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('mirrors the application to Supabase after a successful Notion insert', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'notion-page-id' }),
    });
    mockSbInsert.mockResolvedValue({ error: null });

    await POST(makeRequest(validBody));

    expect(mockSbInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: 'Ada Okonkwo',
        email: 'ada@example.com',
        phone: '08012345678',
        status: 'new',
      })
    );
  });

  it('joins array fields with commas when saving to Supabase', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'notion-page-id' }),
    });
    mockSbInsert.mockResolvedValue({ error: null });

    await POST(makeRequest(validBody));

    expect(mockSbInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        levels_can_teach: '100 Level, 200 Level',
        days_available: 'Monday, Wednesday',
        time_of_day: 'Morning',
      })
    );
  });

  it('returns 502 and does NOT write to Supabase when Notion fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Notion error' }),
    });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(502);
    expect(mockSbInsert).not.toHaveBeenCalled();
  });

  it('returns 201 even when the Supabase mirror fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'notion-page-id' }),
    });
    mockSbInsert.mockResolvedValue({ error: { message: 'DB unavailable' } });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
  });

  it('stores null for optional cv_link when not provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'notion-page-id' }),
    });
    mockSbInsert.mockResolvedValue({ error: null });

    await POST(makeRequest({ ...validBody, cvLink: undefined }));

    expect(mockSbInsert).toHaveBeenCalledWith(
      expect.objectContaining({ cv_link: null })
    );
  });
});
