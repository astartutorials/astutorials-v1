const mockServiceFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: (...args: unknown[]) => mockServiceFrom(...args) })),
}));

jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { GET } from '@/app/api/admin/dashboard/route';
import { asServerClient, makeChain } from '../helpers/supabase';

const mockServerClient = jest.mocked(createSupabaseServerClient);

// Friday 13 Nov 2026, 10:00 in Lagos.
const NOW = new Date('2026-11-13T09:00:00Z');

function mockAuth(user: object | null) {
  mockServerClient.mockResolvedValue(asServerClient({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Unauthorized' },
      }),
    },
  }));
}

/** A signed-in user whose user_roles row gives `role` in org-1. */
function mockAuthAs(role: string) {
  mockServerClient.mockResolvedValue(asServerClient({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1', user_metadata: {} } }, error: null }) },
    from: jest.fn(() => ({
      select: () => ({ eq: () => ({ order: () => ({ limit: async () => ({ data: [{ role, org_id: 'org-1' }] }) }) }) }),
    })),
  }));
}

const SUPER_ADMIN = { id: 'super-id', user_metadata: { role: 'super_admin' } };

const booking = (over: object) => ({
  id: 'b', full_name: 'Ada Okonkwo', email: 'ada@test.com', amount_paid: 5000,
  payment_reference: 'ref', created_at: '2026-11-05T10:00:00Z', course: null,
  tutorials: { title: 'Calculus' }, ...over,
});

const DEFAULT_TABLES: Record<string, unknown[]> = {
  tutorials: [
    { id: 't1', code: 'MTH201', title: 'Calculus', date: '2026-11-15', time: '10am', organisations: [{ name: 'Babcock' }] },
    { id: 't2', code: 'PHY101', title: 'Mechanics', date: '2026-11-30', time: '2pm', organisations: { name: 'Babcock' } },
  ],
  bookings: [
    booking({ id: 'b1', amount_paid: 55000, payment_reference: 'plan-1', course: 'Full Semester Plan: Group' }),
    booking({ id: 'b2', email: 'bob@test.com', amount_paid: 55000, payment_reference: 'plan-2', course: 'Full Semester Plan: Group' }),
    booking({ id: 'b3', email: 'ADA@test.com', amount_paid: 5000 }),
    booking({ id: 'b4', email: 'old@test.com', amount_paid: 20000, created_at: '2026-10-10T10:00:00Z' }),
    booking({ id: 'b5', amount_paid: 9000, created_at: '2026-09-01T10:00:00Z' }),
  ],
  feedback: [
    { rating: 5, created_at: '2026-11-02T10:00:00Z', tutorials: { org_id: 'org-1' } },
    { rating: 3, created_at: '2026-11-03T10:00:00Z', tutorials: [{ org_id: 'org-2' }] },
  ],
  semester_plan_enquiries: [{ id: 'e1' }, { id: 'e2' }, { id: 'e3' }],
  student_registrations: [
    { created_at: '2026-11-01T10:00:00Z' },
    { created_at: '2026-11-02T10:00:00Z' },
    { created_at: '2026-10-20T10:00:00Z' },
  ],
  tutor_applications: [{ id: 'a1' }, { id: 'a2' }],
  ambassador_applications: [{ id: 'm1' }],
  semester_plan_balances: [
    { due_date: '2026-11-10', paid_at: null, paid_reference: null },          // overdue
    { due_date: '2026-11-18', paid_at: null, paid_reference: null },          // due this week
    { due_date: '2026-11-16', paid_at: null, paid_reference: null },          // due this week, sooner
    { due_date: '2026-12-14', paid_at: null, paid_reference: null },          // later
    { due_date: '2026-11-12', paid_at: '2026-11-08', paid_reference: 'plan-2' }, // b2 was a second instalment
  ],
};

/** Every from(table) returns that table's rows; chains are kept for assertions. */
const chains: { table: string; chain: ReturnType<typeof makeChain> }[] = [];
function setupTables(overrides: Record<string, unknown[]> = {}) {
  const tables = { ...DEFAULT_TABLES, ...overrides };
  mockServiceFrom.mockImplementation((table: string) => {
    const chain = makeChain(tables[table] ?? []);
    chains.push({ table, chain });
    return chain;
  });
}
const queried = () => chains.map((c) => c.table);
const scopedTo = (table: string) =>
  (chains.find((c) => c.table === table)!.chain.eq as jest.Mock).mock.calls.some(
    ([col, v]) => col === 'org_id' && v === 'org-1'
  );

beforeAll(() => { jest.useFakeTimers({ now: NOW }); });
afterAll(() => { jest.useRealTimers(); });
beforeEach(() => {
  mockServerClient.mockReset();
  mockServiceFrom.mockReset();
  chains.length = 0;
});

describe('GET /api/admin/dashboard', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    expect((await GET()).status).toBe(401);
  });

  it('returns 403 for a user with no valid role', async () => {
    mockAuth({ id: 'no-role', user_metadata: {} });
    expect((await GET()).status).toBe(403);
  });

  it('counts what needs attention', async () => {
    mockAuth(SUPER_ADMIN);
    setupTables();
    const { attention } = await (await GET()).json();

    expect(attention).toEqual({
      instalmentsOverdue: 1,
      instalmentsDueSoon: { count: 2, nextDue: '2026-11-16' },
      enquiriesThisWeek: 3,
      applicationsNew: 2,
      ambassadorsPending: 1,
      sessionsThisWeek: 1, // 15 Nov is within 7 days; 30 Nov is not
    });
  });

  it('gives this month against last month', async () => {
    mockAuth(SUPER_ADMIN);
    setupTables();
    const { month } = await (await GET()).json();

    expect(month.revenue).toEqual({ current: 115000, previous: 20000 });
    // ada@ and ADA@ are one student.
    expect(month.students).toEqual({ current: 2, previous: 1 });
    // b2 settled a balance: a second instalment, not a new sale.
    expect(month.plansSold).toEqual({ current: 1, previous: 0 });
    expect(month.registrations).toEqual({ current: 2, previous: 1 });
    expect(month.rating).toEqual({ average: 4, count: 2 });
  });

  it('flattens the organisation on upcoming sessions and caps the list', async () => {
    mockAuth(SUPER_ADMIN);
    const many = Array.from({ length: 8 }, (_, i) => ({
      id: `t${i}`, code: 'X', title: 'Y', date: '2026-11-20', time: '1pm', organisations: [{ name: 'Babcock' }],
    }));
    setupTables({ tutorials: many });
    const { upcoming } = await (await GET()).json();

    expect(upcoming).toHaveLength(5);
    expect(upcoming[0].organisations).toEqual({ name: 'Babcock' });
  });

  it('lists recent payments with a title, falling back to the course', async () => {
    mockAuth(SUPER_ADMIN);
    setupTables();
    const { recentPayments, revenueSeries } = await (await GET()).json();

    expect(recentPayments[0]).toEqual({
      id: 'b1', full_name: 'Ada Okonkwo', amount_paid: 55000,
      created_at: '2026-11-05T10:00:00Z', title: 'Calculus',
    });
    expect(revenueSeries).toHaveLength(5);

    mockServiceFrom.mockReset();
    setupTables({ bookings: [booking({ tutorials: null, course: 'Full Semester Plan: Private' })] });
    const again = await (await GET()).json();
    expect(again.recentPayments[0].title).toBe('Full Semester Plan: Private');
  });

  it('says so when nothing needs attention', async () => {
    mockAuth(SUPER_ADMIN);
    setupTables({
      tutorials: [], semester_plan_enquiries: [], tutor_applications: [],
      ambassador_applications: [], semester_plan_balances: [],
    });
    const { attention } = await (await GET()).json();
    expect(attention).toEqual({
      instalmentsOverdue: 0,
      instalmentsDueSoon: { count: 0, nextDue: null },
      enquiriesThisWeek: 0,
      applicationsNew: 0,
      ambassadorsPending: 0,
      sessionsThisWeek: 0,
    });
  });
});

// Every role gets the dashboard, so each part must reach only roles holding
// its permission: hiding a card leaves the numbers in the JSON.
describe('GET /api/admin/dashboard — role-shaped response', () => {
  it('withholds money, intake and applicants from a tutor, and never queries them', async () => {
    mockAuthAs('tutor');
    setupTables();
    const data = await (await GET()).json();

    expect(data.month.revenue).toBeNull();
    expect(data.month.plansSold).toBeNull();
    expect(data.month.registrations).toBeNull();
    expect(data.attention.instalmentsOverdue).toBeNull();
    expect(data.attention.instalmentsDueSoon).toBeNull();
    expect(data.attention.enquiriesThisWeek).toBeNull();
    expect(data.attention.applicationsNew).toBeNull();
    expect(data.attention.ambassadorsPending).toBeNull();
    expect(data.revenueSeries).toEqual([]);
    expect(data.recentPayments).toEqual([]);

    for (const t of ['semester_plan_balances', 'semester_plan_enquiries', 'student_registrations', 'tutor_applications', 'ambassador_applications']) {
      expect(queried()).not.toContain(t);
    }

    // What a tutor may see still arrives.
    expect(data.upcoming).toHaveLength(2);
    expect(data.attention.sessionsThisWeek).toBe(1);
    expect(data.month.students.current).toBe(2);
    // Feedback is scoped through the tutorial's org: only the org-1 review.
    expect(data.month.rating).toEqual({ average: 5, count: 1 });
  });

  it('sends money to a viewer, who holds payments:read, but not intake', async () => {
    mockAuthAs('viewer');
    setupTables();
    const data = await (await GET()).json();

    expect(data.month.revenue.current).toBe(115000);
    expect(data.recentPayments.length).toBeGreaterThan(0);
    expect(data.attention.instalmentsOverdue).toBe(1);
    expect(data.month.registrations).toBeNull();
  });

  it("scopes an org_admin's org data to their org, but not A-Star-wide tutor applications", async () => {
    mockAuthAs('org_admin');
    setupTables();
    await GET();

    for (const t of ['tutorials', 'bookings', 'semester_plan_enquiries', 'student_registrations', 'ambassador_applications', 'semester_plan_balances']) {
      expect(scopedTo(t)).toBe(true);
    }
    expect(scopedTo('tutor_applications')).toBe(false);
  });

  it('does not scope a super_admin', async () => {
    mockAuth(SUPER_ADMIN);
    setupTables();
    await GET();
    expect(scopedTo('bookings')).toBe(false);
  });
});
