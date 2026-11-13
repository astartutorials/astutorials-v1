const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: (...args: unknown[]) => mockFrom(...args) })),
}));

jest.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient: jest.fn() }));
jest.mock('@/lib/audit', () => ({ logAuditEvent: jest.fn() }));
jest.mock('@/lib/posthog-server', () => ({ getPostHogClient: jest.fn() }));

const mockGetUserRole = jest.fn();
jest.mock('@/lib/rbac', () => ({
  ...jest.requireActual('@/lib/rbac'),
  getUserRole: (...args: unknown[]) => mockGetUserRole(...args),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { GET } from '@/app/api/admin/semester-plan-payments/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);

function mockAuth(user: object | null) {
  mockServerClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user }, error: user ? null : { message: 'no' } }),
    },
  } as never);
}

/** Each table gets a chainable query; every eq call is recorded per table. */
function mockTables(data: Record<string, unknown[]>) {
  const eqCalls: Record<string, unknown[][]> = {};
  mockFrom.mockImplementation((t: string) => {
    eqCalls[t] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain: any = {
      select: () => chain,
      like: () => chain,
      order: () => chain,
      eq: (...a: unknown[]) => { eqCalls[t].push(a); return chain; },
      then: (r: (v: unknown) => void) => r({ data: data[t] ?? [], error: null }),
    };
    return chain;
  });
  return eqCalls;
}

const booking = (ref: string, created_at: string, amount_paid: number, notes = '') => ({
  full_name: 'Student ' + ref,
  email: `${ref}@x.com`,
  phone: '0801',
  course: 'Full Semester Plan: Group Semester Plan (First Semester, 2026/2027)',
  notes,
  amount_paid,
  payment_reference: ref,
  created_at,
});

describe('GET /api/admin/semester-plan-payments', () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.useRealTimers());

  it('returns 401 when not signed in', async () => {
    mockAuth(null);
    expect((await GET()).status).toBe(401);
  });

  it('returns 403 for a tutor (no payments:read)', async () => {
    mockAuth({ id: 'u1' });
    mockGetUserRole.mockResolvedValue({ userId: 'u1', role: 'tutor', orgId: 'org-1' });
    expect((await GET()).status).toBe(403);
  });

  it('scopes org_admin to their organisation, on both tables', async () => {
    mockAuth({ id: 'u2' });
    mockGetUserRole.mockResolvedValue({ userId: 'u2', role: 'org_admin', orgId: 'org-1' });
    const eqCalls = mockTables({});
    expect((await GET()).status).toBe(200);
    expect(eqCalls.bookings).toContainEqual(['org_id', 'org-1']);
    expect(eqCalls.semester_plan_balances).toContainEqual(['org_id', 'org-1']);
  });

  it('marks each buyer paid in full, part paid or overdue', async () => {
    jest.useFakeTimers({ now: new Date('2026-12-16T10:00:00Z') });
    mockAuth({ id: 'u1' });
    mockGetUserRole.mockResolvedValue({ userId: 'u1', role: 'super_admin', orgId: null });
    const eqCalls = mockTables({
      bookings: [
        booking('full', '2026-11-14T10:00:00Z', 100000),
        booking('s1a', '2026-11-15T10:00:00Z', 55000, 'Paying in 2: instalment 1 of 2'),
        booking('s1b', '2026-12-10T10:00:00Z', 55000),
        booking('s2a', '2026-11-16T10:00:00Z', 55000, 'Paying in 2: instalment 1 of 2'),
        booking('s3a', '2026-12-10T10:00:00Z', 55000, 'Paying in 2: instalment 1 of 2'),
      ],
      semester_plan_balances: [
        { id: 'b1', first_reference: 's1a', paid_reference: 's1b', paid_at: '2026-12-10T10:00:00Z', plan: 'group', full_name: 'A', email: 'a@x.com', phone: null, amount_due: 55000, due_date: '2026-12-14', created_at: '2026-11-15T10:00:00Z' },
        { id: 'b2', first_reference: 's2a', paid_reference: null, paid_at: null, plan: 'group', full_name: 'B', email: 'b@x.com', phone: null, amount_due: 55000, due_date: '2026-12-14', created_at: '2026-11-16T10:00:00Z' },
        { id: 'b3', first_reference: 's3a', paid_reference: null, paid_at: null, plan: 'group', full_name: 'C', email: 'c@x.com', phone: null, amount_due: 55000, due_date: '2026-12-24', created_at: '2026-12-10T10:00:00Z' },
      ],
    });

    const rows = await (await GET()).json();
    expect(eqCalls.bookings).not.toContainEqual(['org_id', expect.anything()]);
    const byKey = Object.fromEntries(rows.map((r: { key: string }) => [r.key, r]));
    expect(rows).toHaveLength(4);
    expect(byKey.full).toMatchObject({ option: 'full', status: 'paid_in_full', amountPaid: 100000, total: 100000 });
    expect(byKey.b1).toMatchObject({ option: 'split', status: 'paid_in_full', amountPaid: 110000, total: 110000, secondReference: 's1b' });
    expect(byKey.b2).toMatchObject({ status: 'overdue', amountPaid: 55000, dueDate: '2026-12-14', balanceId: 'b2' });
    expect(byKey.b3).toMatchObject({ status: 'part_paid', dueDate: '2026-12-24' });
  });
});
