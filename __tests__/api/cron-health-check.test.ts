import { NextRequest } from 'next/server';

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn(() => ({ from: jest.fn() })) }));

const mockCollect = jest.fn();
jest.mock('@/lib/health', () => ({ collectHealthIssues: (...a: unknown[]) => mockCollect(...a) }));

const mockAlert = jest.fn();
jest.mock('@/lib/email', () => ({ sendSystemAlert: (...a: unknown[]) => mockAlert(...a) }));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.CRON_SECRET = 'test-cron-secret';

import { GET } from '@/app/api/cron/health-check/route';

const req = (auth?: string) =>
  new NextRequest('http://localhost:3000/api/cron/health-check', {
    headers: auth ? { authorization: auth } : {},
  });

const OK = 'Bearer test-cron-secret';

describe('GET /api/cron/health-check', () => {
  beforeEach(() => {
    mockCollect.mockReset().mockResolvedValue([]);
    mockAlert.mockReset().mockResolvedValue({ sent: true });
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('rejects an unauthenticated request', async () => {
    expect((await GET(req())).status).toBe(401);
    expect(mockCollect).not.toHaveBeenCalled();
  });

  it('reports healthy and sends nothing when there are no issues', async () => {
    const body = await (await GET(req(OK))).json();

    expect(body.healthy).toBe(true);
    expect(body.critical).toBe(0);
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('emails an alert when issues are found', async () => {
    mockCollect.mockResolvedValue([
      { severity: 'critical', title: 'Payment reconciler has stopped running', detail: 'x' },
      { severity: 'warning', title: '1 payment(s) had to be recovered', detail: 'y' },
    ]);

    const body = await (await GET(req(OK))).json();

    expect(body.healthy).toBe(false);
    expect(body.critical).toBe(1);
    expect(body.issues).toHaveLength(2);
    expect(mockAlert).toHaveBeenCalledWith({ issues: expect.arrayContaining([]) });
    expect(body.alert).toEqual({ sent: true });
  });

  // The alerting channel failing silently is the exact bug class this exists to
  // catch, so an undelivered alert must be visible in the response and the logs.
  it('surfaces an undelivered alert rather than reporting success', async () => {
    mockCollect.mockResolvedValue([{ severity: 'critical', title: 'x', detail: 'y' }]);
    mockAlert.mockResolvedValue({ sent: false, reason: 'ADMIN_NOTIFICATION_EMAIL is not set' });

    const body = await (await GET(req(OK))).json();

    expect(body.alert.sent).toBe(false);
    expect(body.alert.reason).toContain('ADMIN_NOTIFICATION_EMAIL');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('ALERT NOT DELIVERED')
    );
  });
});
