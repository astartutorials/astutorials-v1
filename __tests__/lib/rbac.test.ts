import { can, getUserRole, AppRole } from '@/lib/rbac';

import type { Permission } from '@/lib/rbac';

/**
 * The whole permission model as a table. Each row is a permission; each column
 * a role (super_admin, org_admin, tutor_manager, tutor, viewer). Changing who
 * can do what means changing a cell here on purpose — the tests below fail on
 * any grant or revocation that was not also made in this table.
 */
const MATRIX: Record<Permission, [boolean, boolean, boolean, boolean, boolean]> = {
  //                       super  org    mgr    tutor  viewer
  'tutorials:read':       [true,  true,  true,  true,  true ],
  'tutorials:create':     [true,  true,  true,  false, false],
  'tutorials:update':     [true,  true,  true,  false, false],
  'tutorials:delete':     [true,  true,  false, false, false],
  'bookings:read':        [true,  true,  true,  true,  true ],
  'attendance:update':    [true,  true,  true,  true,  false],
  'bookings:cancel':      [true,  true,  false, false, false],
  'payments:read':        [true,  true,  true,  false, true ],
  'feedback:read':        [true,  true,  true,  true,  true ],
  'intake:read':          [true,  true,  false, false, false],
  'bucc:read':            [true,  true,  false, false, false],
  'playbooks:read':       [true,  true,  false, false, false],
  'applications:read':    [true,  true,  false, false, false],
  'applications:update':  [true,  true,  false, false, false],
  'applications:delete':  [true,  false, false, false, false],
  'careers:read':         [true,  false, false, false, false],
  'careers:create':       [true,  false, false, false, false],
  'careers:update':       [true,  false, false, false, false],
  'careers:delete':       [true,  false, false, false, false],
  'invites:create':       [true,  true,  false, false, false],
  'orgs:manage':          [true,  false, false, false, false],
  'users:create':         [true,  false, false, false, false],
  'audit:read':           [true,  false, false, false, false],
};

const ROLES: AppRole[] = ['super_admin', 'org_admin', 'tutor_manager', 'tutor', 'viewer'];

describe('can()', () => {
  it.each(Object.entries(MATRIX))('%s is granted exactly as the matrix says', (perm, row) => {
    ROLES.forEach((role, i) => {
      expect([role, can(role, perm as Permission)]).toEqual([role, row[i]]);
    });
  });

  it('returns false for an unknown role', () => {
    expect(can('ghost' as AppRole, 'tutorials:read')).toBe(false);
  });

  // The split that used to be one permission: taking attendance is a tutor's
  // job, cancelling a paid booking is not.
  it('lets a tutor take attendance but not cancel a booking', () => {
    expect(can('tutor', 'attendance:update')).toBe(true);
    expect(can('tutor', 'bookings:cancel')).toBe(false);
  });

  it('keeps money away from tutors', () => {
    expect(can('tutor', 'payments:read')).toBe(false);
  });

  it('gives viewer no write permission of any kind', () => {
    const writes = (Object.keys(MATRIX) as Permission[]).filter((p) => !p.endsWith(':read'));
    for (const p of writes) expect([p, can('viewer', p)]).toEqual([p, false]);
  });

  // A-Star-wide data belongs to super_admin; the careers API used to let
  // org_admin write while the page was hidden from them.
  it('keeps A-Star-wide admin (careers, orgs, users, audit) with super_admin', () => {
    for (const p of ['careers:read', 'careers:update', 'orgs:manage', 'users:create', 'audit:read'] as const) {
      for (const role of ROLES.slice(1)) expect([role, p, can(role, p)]).toEqual([role, p, false]);
    }
  });
});

describe('getUserRole()', () => {
  function makeSupabaseWithRows(rows: object[] | null) {
    const limit = jest.fn().mockResolvedValue({ data: rows });
    const order = jest.fn().mockReturnValue({ limit });
    const eq = jest.fn().mockReturnValue({ order });
    const select = jest.fn().mockReturnValue({ eq });
    return { from: jest.fn().mockReturnValue({ select }) } as any;
  }

  it('returns the role and orgId from the DB when a row is found', async () => {
    const supabase = makeSupabaseWithRows([{ role: 'org_admin', org_id: 'org-uuid' }]);
    const result = await getUserRole(supabase, 'user-1');
    expect(result?.role).toBe('org_admin');
    expect(result?.orgId).toBe('org-uuid');
  });

  it('returns null orgId when org_id is null in the DB', async () => {
    const supabase = makeSupabaseWithRows([{ role: 'super_admin', org_id: null }]);
    const result = await getUserRole(supabase, 'user-1');
    expect(result?.role).toBe('super_admin');
    expect(result?.orgId).toBeNull();
  });

  it('prefers the platform-wide row (org_id NULL) over an org-scoped row', async () => {
    // DB returns nulls-first: super_admin row comes before org_admin row
    const supabase = makeSupabaseWithRows([
      { role: 'super_admin', org_id: null },
      { role: 'org_admin', org_id: 'org-uuid' },
    ]);
    const result = await getUserRole(supabase, 'user-1');
    expect(result?.role).toBe('super_admin');
    expect(result?.orgId).toBeNull();
  });

  it('falls back to user_metadata when DB throws', async () => {
    const supabase = {
      from: jest.fn().mockImplementation(() => { throw new Error('DB unavailable'); }),
    } as any;
    const result = await getUserRole(supabase, 'user-1', { role: 'super_admin' });
    expect(result?.role).toBe('super_admin');
  });

  // Previously this mapped to org_admin with a null orgId. Callers filter with
  // `ctx.role !== 'super_admin' && ctx.orgId`, so that combination skipped the
  // org filter entirely and read every organisation's data. It is now denied.
  it('denies metadata role "admin" because it carries no org scope', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const supabase = {
      from: jest.fn().mockImplementation(() => { throw new Error(); }),
    } as any;
    const result = await getUserRole(supabase, 'user-1', { role: 'admin' });
    expect(result).toBeNull();
    jest.restoreAllMocks();
  });

  it('returns null when DB has no row and metadata has no recognized role', async () => {
    const supabase = makeSupabaseWithRows([]);
    const result = await getUserRole(supabase, 'user-1', { role: 'unknown' });
    expect(result).toBeNull();
  });

  it('prefers DB data over user_metadata', async () => {
    const supabase = makeSupabaseWithRows([{ role: 'tutor', org_id: 'org-2' }]);
    // Even though metadata says super_admin, DB says tutor
    const result = await getUserRole(supabase, 'user-1', { role: 'super_admin' });
    expect(result?.role).toBe('tutor');
  });
});
