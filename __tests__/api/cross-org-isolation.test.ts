import { NextRequest } from 'next/server';

/**
 * Route-level proof that an org_admin scoped to org A cannot read or mutate
 * org B's data. The existing suites cover roles ("a viewer cannot create") but
 * never tenants, and org scoping is enforced by hand-written `.eq('org_id', …)`
 * calls that a future edit could drop without any test noticing.
 */

const mockFrom = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: (...a: unknown[]) => mockFrom(...a), rpc: jest.fn() })),
}));

jest.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient: jest.fn() }));
jest.mock('@/lib/audit', () => ({ logAuditEvent: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/lib/email', () => ({
  sendBookingCancelled: jest.fn().mockResolvedValue(undefined),
  sendGroupBookingConfirmation: jest.fn().mockResolvedValue(undefined),
  sendPrivateBookingReceipt: jest.fn().mockResolvedValue(undefined),
  sendPreClinicalsReceipt: jest.fn().mockResolvedValue(undefined),
  sendNewBookingNotification: jest.fn().mockResolvedValue(undefined),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test_anon_key';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { GET as getTutorial, DELETE as deleteTutorial } from '@/app/api/admin/tutorials/[id]/route';
import { PATCH as patchBooking } from '@/app/api/admin/bookings/[id]/route';

const mockServerClient = jest.mocked(createSupabaseServerClient);

const ORG_A = 'org-a';
const ORG_B = 'org-b';

/** The user_roles lookup getUserRole performs. */
function roleChain(rows: { role: string; org_id: string | null }[]) {
  return {
    select: () => ({
      eq: () => ({ order: () => ({ limit: async () => ({ data: rows }) }) }),
    }),
  };
}

/**
 * Signs the caller in as an org_admin scoped to `orgId`.
 *
 * Some handlers read domain tables off the auth client rather than the service
 * client, so `tables` lets a test supply those chains too.
 */
function signInAsOrgAdmin(orgId: string, tables: Record<string, unknown> = {}) {
  mockServerClient.mockResolvedValue({
    from: jest.fn((table: string) =>
      table in tables ? tables[table] : roleChain([{ role: 'org_admin', org_id: orgId }])
    ),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-a' } }, error: null }),
    },
  } as never);
}

const params = (id: string) => ({ params: Promise.resolve({ id }) });

function patchRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/admin/bookings/b1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockFrom.mockReset();
  mockServerClient.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('GET /api/admin/tutorials/[id] — tenant isolation', () => {
  it('filters the query by the caller’s own org', async () => {
    signInAsOrgAdmin(ORG_A);
    const eq = jest.fn();
    const chain = {
      select: () => chain,
      eq: (...args: unknown[]) => {
        eq(...args);
        return chain;
      },
      maybeSingle: async () => ({ data: null, error: null }),
    } as Record<string, unknown>;
    mockFrom.mockReturnValue(chain);

    await getTutorial({} as NextRequest, params('tut-in-org-b'));

    // Without this filter the row would be returned regardless of owner.
    expect(eq).toHaveBeenCalledWith('org_id', ORG_A);
  });

  it('returns 404 rather than another org’s tutorial', async () => {
    signInAsOrgAdmin(ORG_A);
    const chain = {
      select: () => chain,
      eq: () => chain,
      // Scoped query finds nothing because the row belongs to org B.
      maybeSingle: async () => ({ data: null, error: null }),
    } as Record<string, unknown>;
    mockFrom.mockReturnValue(chain);

    const res = await getTutorial({} as NextRequest, params('tut-in-org-b'));
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/tutorials/[id] — tenant isolation', () => {
  it('refuses to delete a tutorial owned by another org', async () => {
    const del = jest.fn();
    // The existence lookup is deliberately unscoped (it needs the title for the
    // audit label), so the route must compare org_id itself before deleting.
    const tutorials: Record<string, unknown> = {
      select: () => tutorials,
      eq: () => tutorials,
      delete: () => {
        del();
        return tutorials;
      },
      maybeSingle: async () => ({ data: { code: 'X', title: 'Y', org_id: ORG_B } }),
    };
    signInAsOrgAdmin(ORG_A, { tutorials });
    mockFrom.mockReturnValue(tutorials);

    const res = await deleteTutorial({} as NextRequest, params('tut-1'));

    expect(res.status).toBe(403);
    expect(del).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/admin/bookings/[id] — tenant isolation', () => {
  it('scopes an attendance update to the caller’s org', async () => {
    signInAsOrgAdmin(ORG_A);
    const eq = jest.fn();
    const chain = {
      update: () => chain,
      eq: (...args: unknown[]) => {
        eq(...args);
        return chain;
      },
      then: (resolve: (v: unknown) => unknown) => resolve({ error: null }),
    } as Record<string, unknown>;
    mockFrom.mockReturnValue(chain);

    await patchBooking(patchRequest({ attended: true }), params('b-in-org-b'));

    // The update must carry the org filter, or it would flip attendance on
    // any booking id in any organisation.
    expect(eq).toHaveBeenCalledWith('org_id', ORG_A);
  });

  it('refuses to cancel a booking owned by another org', async () => {
    signInAsOrgAdmin(ORG_A);
    const chain = {
      select: () => chain,
      update: () => chain,
      eq: () => chain,
      single: async () => ({
        data: {
          id: 'b1',
          full_name: 'Ada',
          email: 'ada@example.com',
          payment_status: 'paid',
          tutorial_id: null,
          org_id: ORG_B,
        },
        error: null,
      }),
    } as Record<string, unknown>;
    mockFrom.mockReturnValue(chain);

    const res = await patchBooking(patchRequest({ status: 'cancelled' }), params('b1'));
    expect(res.status).toBe(403);
  });
});

describe('super_admin is deliberately unscoped', () => {
  it('does not add an org filter for super_admin', async () => {
    mockServerClient.mockResolvedValue({
      from: jest.fn(() => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: async () => ({ data: [{ role: 'super_admin', org_id: null }] }),
            }),
          }),
        }),
      })),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'super' } }, error: null }),
      },
    } as never);

    const eq = jest.fn();
    const chain = {
      select: () => chain,
      eq: (...args: unknown[]) => {
        eq(...args);
        return chain;
      },
      maybeSingle: async () => ({ data: { id: 'tut-1', org_id: ORG_B }, error: null }),
    } as Record<string, unknown>;
    mockFrom.mockReturnValue(chain);

    const res = await getTutorial({} as NextRequest, params('tut-1'));

    expect(res.status).toBe(200);
    expect(eq).not.toHaveBeenCalledWith('org_id', expect.anything());
  });
});
