import { can, getUserRole, AppRole } from '@/lib/rbac';

describe('can()', () => {
  it('returns true for super_admin on any action', () => {
    expect(can('super_admin', 'tutorials:read')).toBe(true);
    expect(can('super_admin', 'applications:delete')).toBe(true);
    expect(can('super_admin', 'anything:whatsoever')).toBe(true);
  });

  it('returns true for an exact permission match', () => {
    expect(can('org_admin', 'tutorials:read')).toBe(true);
    expect(can('org_admin', 'bookings:update')).toBe(true);
    expect(can('tutor', 'feedback:read')).toBe(true);
  });

  it('returns false when the role does not have the permission', () => {
    expect(can('viewer', 'tutorials:create')).toBe(false);
    expect(can('viewer', 'bookings:update')).toBe(false);
    expect(can('tutor', 'tutorials:create')).toBe(false);
    expect(can('tutor_manager', 'tutorials:delete')).toBe(false);
  });

  it('returns false for an unknown role', () => {
    expect(can('ghost' as AppRole, 'tutorials:read')).toBe(false);
  });

  it('org_admin has full tutorial CRUD', () => {
    (['read', 'create', 'update', 'delete'] as const).forEach(action => {
      expect(can('org_admin', `tutorials:${action}`)).toBe(true);
    });
  });

  it('tutor_manager can create and update tutorials but not delete', () => {
    expect(can('tutor_manager', 'tutorials:create')).toBe(true);
    expect(can('tutor_manager', 'tutorials:update')).toBe(true);
    expect(can('tutor_manager', 'tutorials:delete')).toBe(false);
  });

  it('tutor can mark attendance (bookings:update) but cannot create tutorials', () => {
    expect(can('tutor', 'bookings:update')).toBe(true);
    expect(can('tutor', 'tutorials:create')).toBe(false);
  });

  it('viewer is read-only across all resources', () => {
    expect(can('viewer', 'tutorials:read')).toBe(true);
    expect(can('viewer', 'bookings:read')).toBe(true);
    expect(can('viewer', 'feedback:read')).toBe(true);
    (['create', 'update', 'delete'] as const).forEach(action => {
      expect(can('viewer', `tutorials:${action}`)).toBe(false);
    });
    expect(can('viewer', 'bookings:update')).toBe(false);
  });

  it('org_admin can manage careers (read/create/update/delete)', () => {
    (['read', 'create', 'update', 'delete'] as const).forEach(action => {
      expect(can('org_admin', `careers:${action}`)).toBe(true);
    });
  });

  it('tutor_manager can read careers but not create or delete', () => {
    expect(can('tutor_manager', 'careers:read')).toBe(true);
    expect(can('tutor_manager', 'careers:create')).toBe(false);
    expect(can('tutor_manager', 'careers:delete')).toBe(false);
  });

  it('applications:read is super_admin only', () => {
    expect(can('super_admin', 'applications:read')).toBe(true);
    expect(can('org_admin', 'applications:read')).toBe(false);
    expect(can('tutor_manager', 'applications:read')).toBe(false);
  });

  it('invites:create is available to org_admin and super_admin', () => {
    expect(can('super_admin', 'invites:create')).toBe(true);
    expect(can('org_admin', 'invites:create')).toBe(true);
    expect(can('tutor_manager', 'invites:create')).toBe(false);
    expect(can('tutor', 'invites:create')).toBe(false);
    expect(can('viewer', 'invites:create')).toBe(false);
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

  it('maps metadata role "admin" to org_admin', async () => {
    const supabase = {
      from: jest.fn().mockImplementation(() => { throw new Error(); }),
    } as any;
    const result = await getUserRole(supabase, 'user-1', { role: 'admin' });
    expect(result?.role).toBe('org_admin');
    expect(result?.orgId).toBeNull();
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
