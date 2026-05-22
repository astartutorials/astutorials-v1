import { NextRequest } from 'next/server';

const mockServiceFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: (...args: any[]) => mockServiceFrom(...args) })),
}));

jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { GET } from '@/app/api/admin/dashboard/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);

const SUPER_ADMIN = { id: 'super-id', user_metadata: { role: 'super_admin' } };
const ORG_ADMIN = { id: 'admin-id', user_metadata: { role: 'admin' } };

function mockAuth(user: object | null) {
  mockServerClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Unauthorized' },
      }),
    },
  } as any);
}

// Universal chainable/awaitable mock for Supabase query builders.
// The dashboard route builds upcomingQuery and feedbackQuery BEFORE Promise.all,
// so from() is called in this order:
//   1. from('tutorials')  → upcomingQuery
//   2. from('feedback')   → feedbackQuery
//   3. from('organisations')
//   4. from('tutorials')
//   5. from('bookings')   (paid)
//   6. from('bookings')   (all)
//   7. from('feedback')   (ratings)
function makeChain(data: any) {
  const result = { data, error: null };
  const chain: any = {
    then: (onFulfilled: any) => Promise.resolve(result).then(onFulfilled),
    catch: (onRejected: any) => Promise.resolve(result).catch(onRejected),
    finally: (onFinally: any) => Promise.resolve(result).finally(onFinally),
  };
  ['select', 'order', 'eq', 'gte', 'neq', 'in', 'limit'].forEach(m => {
    chain[m] = jest.fn(() => chain);
  });
  return chain;
}

const ORG = { id: 'org-1', name: 'Babcock', type: 'university', location: 'Ilishan' };
const ACTIVE_TUT = { id: 'tut-1', org_id: 'org-1', status: 'active' };
const DRAFT_TUT = { id: 'tut-2', org_id: 'org-1', status: 'draft' };
const PAID_BOOKING = { id: 'b1', email: 'ada@test.com', amount_paid: 5000, created_at: '2025-06-01', org_id: 'org-1' };
const ALL_BOOKING = { id: 'b1', email: 'ada@test.com', org_id: 'org-1', created_at: '2025-06-01' };
const FEEDBACK_ROW = { rating: 4, tutorials: { org_id: 'org-1' } };
const UPCOMING_ROW = { id: 'tut-1', code: 'MTH201', title: 'Calculus', date: '2026-06-01', time: '10am', org_id: 'org-1', organisations: { name: 'Babcock' } };
const RECENT_FEEDBACK = { full_name: 'Ada', rating: 4, created_at: '2025-06-01', tutorials: { title: 'Calculus', org_id: 'org-1', organisations: { name: 'Babcock' } } };

function setupMocks(opts: {
  upcoming?: any[];
  recentFeedback?: any[];
  orgs?: any[];
  tutorials?: any[];
  paidBookings?: any[];
  allBookings?: any[];
  feedbackRows?: any[];
} = {}) {
  const {
    upcoming = [UPCOMING_ROW],
    recentFeedback = [RECENT_FEEDBACK],
    orgs = [ORG],
    tutorials = [ACTIVE_TUT, DRAFT_TUT],
    paidBookings = [PAID_BOOKING],
    allBookings = [ALL_BOOKING],
    feedbackRows = [FEEDBACK_ROW],
  } = opts;

  // Call order matches the route (upcomingQuery and feedbackQuery built first)
  mockServiceFrom
    .mockReturnValueOnce(makeChain(upcoming))      // 1: tutorials → upcomingQuery
    .mockReturnValueOnce(makeChain(recentFeedback))// 2: feedback  → feedbackQuery
    .mockReturnValueOnce(makeChain(orgs))          // 3: organisations (Promise.all[0])
    .mockReturnValueOnce(makeChain(tutorials))     // 4: tutorials  (Promise.all[1])
    .mockReturnValueOnce(makeChain(paidBookings))  // 5: bookings paid (Promise.all[2])
    .mockReturnValueOnce(makeChain(allBookings))   // 6: bookings all  (Promise.all[3])
    .mockReturnValueOnce(makeChain(feedbackRows)); // 7: feedback ratings (Promise.all[4])
}

describe('GET /api/admin/dashboard', () => {
  beforeEach(() => { mockServerClient.mockReset(); mockServiceFrom.mockReset(); });

  it('returns 401 when not authenticated', async () => {
    mockAuth(null);
    expect((await GET()).status).toBe(401);
  });

  it('returns 403 for a user with no valid role', async () => {
    mockAuth({ id: 'no-role', user_metadata: {} });
    expect((await GET()).status).toBe(403);
  });

  it('returns 200 with the expected response shape', async () => {
    mockAuth(SUPER_ADMIN);
    setupMocks();

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data).toHaveProperty('totals');
    expect(data).toHaveProperty('byOrg');
    expect(data).toHaveProperty('orgNames');
    expect(data).toHaveProperty('upcoming');
    expect(data).toHaveProperty('recentFeedback');
    expect(data).toHaveProperty('rawPaidBookings');
    expect(data).toHaveProperty('rawAllBookings');
  });

  it('totals.revenue sums all paid bookings for super_admin', async () => {
    mockAuth(SUPER_ADMIN);
    setupMocks({ paidBookings: [PAID_BOOKING, { ...PAID_BOOKING, id: 'b2', amount_paid: 3000 }] });

    const res = await GET();
    const data = await res.json();
    expect(data.totals.revenue).toBe(8000);
  });

  it('totals.students counts unique emails', async () => {
    mockAuth(SUPER_ADMIN);
    const twoBookings = [
      { id: 'b1', email: 'ada@test.com', org_id: 'org-1', created_at: '2025-06-01' },
      { id: 'b2', email: 'ada@test.com', org_id: 'org-1', created_at: '2025-06-02' }, // same email
      { id: 'b3', email: 'bob@test.com', org_id: 'org-1', created_at: '2025-06-03' },
    ];
    setupMocks({ allBookings: twoBookings });

    const res = await GET();
    const data = await res.json();
    expect(data.totals.students).toBe(2); // 2 unique emails
  });

  it('totals.activeTutorials counts only active (not draft) tutorials', async () => {
    mockAuth(SUPER_ADMIN);
    setupMocks({ tutorials: [ACTIVE_TUT, DRAFT_TUT, { id: 'tut-3', org_id: 'org-1', status: 'completed' }] });

    const res = await GET();
    const data = await res.json();
    expect(data.totals.activeTutorials).toBe(1);
  });

  it('totals.avgRating is the mean of all feedback ratings', async () => {
    mockAuth(SUPER_ADMIN);
    setupMocks({
      feedbackRows: [
        { rating: 5, tutorials: { org_id: 'org-1' } },
        { rating: 3, tutorials: { org_id: 'org-1' } },
      ],
    });

    const res = await GET();
    const data = await res.json();
    expect(data.totals.avgRating).toBe(4);
  });

  it('totals.avgRating is null when there is no feedback', async () => {
    mockAuth(SUPER_ADMIN);
    setupMocks({ feedbackRows: [] });

    const res = await GET();
    const data = await res.json();
    expect(data.totals.avgRating).toBeNull();
  });

  it('byOrg contains one entry per visible organisation', async () => {
    mockAuth(SUPER_ADMIN);
    setupMocks({ orgs: [ORG, { id: 'org-2', name: 'Test Sec', type: 'secondary' }] });

    const res = await GET();
    const data = await res.json();
    expect(data.byOrg).toHaveLength(2);
  });

  it('byOrg is sorted by revenue descending', async () => {
    mockAuth(SUPER_ADMIN);
    const org2 = { id: 'org-2', name: 'Rich Uni', type: 'university' };
    const org2PaidBooking = { id: 'b2', email: 'x@test.com', amount_paid: 99000, created_at: '2025-06-01', org_id: 'org-2' };
    setupMocks({
      orgs: [ORG, org2],
      paidBookings: [PAID_BOOKING, org2PaidBooking],
      allBookings: [ALL_BOOKING, { id: 'b2', email: 'x@test.com', org_id: 'org-2', created_at: '2025-06-01' }],
    });

    const res = await GET();
    const data = await res.json();
    expect(data.byOrg[0].orgName).toBe('Rich Uni');
    expect(data.byOrg[0].revenue).toBe(99000);
  });

  it('upcoming contains the tutorials from upcomingQuery', async () => {
    mockAuth(SUPER_ADMIN);
    setupMocks({ upcoming: [UPCOMING_ROW] });

    const res = await GET();
    const data = await res.json();
    expect(data.upcoming).toHaveLength(1);
    expect(data.upcoming[0].code).toBe('MTH201');
  });

  it('rawPaidBookings contains amount_paid and org_id for each paid booking', async () => {
    mockAuth(SUPER_ADMIN);
    setupMocks();

    const res = await GET();
    const data = await res.json();
    expect(data.rawPaidBookings[0].amount_paid).toBe(5000);
    expect(data.rawPaidBookings[0].org_id).toBe('org-1');
  });
});
