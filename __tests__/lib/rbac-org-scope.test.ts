import { getUserRole } from '@/lib/rbac';

/**
 * Guards the multi-tenancy invariant: a non-super_admin must always resolve to
 * a concrete org, because every caller filters with
 * `ctx.role !== 'super_admin' && ctx.orgId`. A null orgId on a non-super_admin
 * silently skips that filter and exposes every organisation's data.
 */

function supabaseReturning(rows: { role: string; org_id: string | null }[] | null) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: async () => ({ data: rows }),
          }),
        }),
      }),
    }),
  } as never;
}

const ORG_A = 'aaaaaaaa-0000-0000-0000-000000000001';
const ORG_B = 'bbbbbbbb-0000-0000-0000-000000000002';

describe('getUserRole org scoping', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('scopes an org_admin to their own org', async () => {
    const ctx = await getUserRole(supabaseReturning([{ role: 'org_admin', org_id: ORG_A }]), 'u1');
    expect(ctx).toEqual({ userId: 'u1', role: 'org_admin', orgId: ORG_A });
  });

  it('gives super_admin no org scope', async () => {
    const ctx = await getUserRole(supabaseReturning([{ role: 'super_admin', org_id: null }]), 'u1');
    expect(ctx).toEqual({ userId: 'u1', role: 'super_admin', orgId: null });
  });

  // The core leak: null org on a non-super_admin skips `.eq('org_id', …)` entirely.
  it.each(['org_admin', 'tutor_manager', 'tutor', 'viewer'])(
    'denies a %s carrying no org rather than granting unscoped access',
    async (role) => {
      const ctx = await getUserRole(supabaseReturning([{ role, org_id: null }]), 'u1');
      expect(ctx).toBeNull();
    }
  );

  it('prefers the org-scoped row over a null-org row for the same user', async () => {
    // Null org_id sorts first, so a naive rows[0] would pick the unscopable row.
    const ctx = await getUserRole(
      supabaseReturning([
        { role: 'org_admin', org_id: null },
        { role: 'org_admin', org_id: ORG_B },
      ]),
      'u1'
    );
    expect(ctx).toEqual({ userId: 'u1', role: 'org_admin', orgId: ORG_B });
  });

  it('lets a super_admin row win even when an org-scoped row sorts first', async () => {
    const ctx = await getUserRole(
      supabaseReturning([
        { role: 'org_admin', org_id: ORG_A },
        { role: 'super_admin', org_id: null },
      ]),
      'u1'
    );
    expect(ctx).toEqual({ userId: 'u1', role: 'super_admin', orgId: null });
  });

  it('never returns an org_admin from user_metadata, which carries no org', async () => {
    const ctx = await getUserRole(supabaseReturning([]), 'u1', { role: 'admin' });
    expect(ctx).toBeNull();
  });

  it('still honours a super_admin from user_metadata', async () => {
    const ctx = await getUserRole(supabaseReturning([]), 'u1', { role: 'super_admin' });
    expect(ctx).toEqual({ userId: 'u1', role: 'super_admin', orgId: null });
  });

  it('returns null for a user with no role at all', async () => {
    expect(await getUserRole(supabaseReturning([]), 'u1')).toBeNull();
  });

  it('logs why an unscopable role was denied', async () => {
    await getUserRole(supabaseReturning([{ role: 'org_admin', org_id: null }]), 'u1');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('no org scope'));
  });
});

describe('the org filter condition used by callers', () => {
  // Mirrors `ctx.role !== 'super_admin' && ctx.orgId` from the routes. With the
  // fix above, the third case is now unreachable — this documents why it must be.
  const filtersByOrg = (ctx: { role: string; orgId: string | null }) =>
    ctx.role !== 'super_admin' && Boolean(ctx.orgId);

  it('filters for an org-scoped admin', () => {
    expect(filtersByOrg({ role: 'org_admin', orgId: ORG_A })).toBe(true);
  });

  it('does not filter for super_admin, who legitimately sees everything', () => {
    expect(filtersByOrg({ role: 'super_admin', orgId: null })).toBe(false);
  });

  it('would NOT filter for a null-org org_admin — hence getUserRole denies them', () => {
    expect(filtersByOrg({ role: 'org_admin', orgId: null })).toBe(false);
  });
});
