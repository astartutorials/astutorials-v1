import { ADMIN_ROUTES, ALL_ROLES, UNGATED_ADMIN_PATHS, routeForPath, canAccessAdminPath } from '@/lib/admin-routes';
import { can, type AppRole } from '@/lib/rbac';

const NON_SUPER: AppRole[] = ['org_admin', 'tutor_manager', 'tutor', 'viewer'];

describe('routeForPath', () => {
  it('matches an exact page', () => {
    expect(routeForPath('/admin/dashboard')?.href).toBe('/admin/dashboard');
  });

  it('matches a nested page against its parent', () => {
    expect(routeForPath('/admin/tutorials/abc-123')?.href).toBe('/admin/tutorials');
  });

  it('matches a wildcard segment, preferring it over the shorter parent', () => {
    expect(routeForPath('/admin/tutorials/abc-123/edit')?.href).toBe('/admin/tutorials/*/edit');
  });

  it('prefers the longest matching prefix', () => {
    // /admin/orgs/<id> must not be captured by some shorter neighbour.
    expect(routeForPath('/admin/orgs/org-1/members')?.href).toBe('/admin/orgs');
  });

  it('does not treat a shared word-prefix as a match', () => {
    // /admin/tutorials must not swallow /admin/tutorials-archive.
    expect(routeForPath('/admin/tutorials-archive')).toBeNull();
  });

  it('returns null for an unknown page', () => {
    expect(routeForPath('/admin/nope')).toBeNull();
  });
});

describe('canAccessAdminPath', () => {
  it('lets every role reach the dashboard', () => {
    for (const role of ALL_ROLES) {
      expect(canAccessAdminPath(role, '/admin/dashboard')).toBe(true);
    }
  });

  // The regression this map exists to prevent: these pages were hidden from the
  // sidebar but reachable by typing the URL.
  it.each(['/admin/careers', '/admin/audit-logs', '/admin/orgs'])(
    'refuses %s to every non-super_admin',
    (path) => {
      expect(canAccessAdminPath('super_admin', path)).toBe(true);
      for (const role of NON_SUPER) {
        expect(canAccessAdminPath(role, path)).toBe(false);
      }
    }
  );

  // The pages on that list org_admin is let into: the two webinar consoles and
  // the tutor application queue. All three stay shut to every role below.
  it.each(['/admin/bucc', '/admin/playbooks', '/admin/applications'])(
    'opens %s to super_admin and org_admin only',
    (path) => {
      expect(canAccessAdminPath('super_admin', path)).toBe(true);
      expect(canAccessAdminPath('org_admin', path)).toBe(true);
      for (const role of ['tutor_manager', 'tutor', 'viewer'] as const) {
        expect(canAccessAdminPath(role, path)).toBe(false);
      }
    }
  );

  it('carries the rule down to nested pages', () => {
    expect(canAccessAdminPath('org_admin', '/admin/orgs/org-1/members')).toBe(false);
    expect(canAccessAdminPath('super_admin', '/admin/orgs/org-1/members')).toBe(true);
  });

  it('fails closed on an unrecognised admin page', () => {
    for (const role of ALL_ROLES) {
      expect(canAccessAdminPath(role, '/admin/some-new-page')).toBe(false);
    }
  });

  // The settings page filters its own admin-only tabs, so every role needs the
  // page itself to manage their account — notably to change their password.
  it('lets every role reach settings', () => {
    for (const role of ALL_ROLES) {
      expect(canAccessAdminPath(role, '/admin/settings')).toBe(true);
    }
  });

  // The edit page used to inherit /admin/tutorials and open for every role,
  // including viewer and tutor, who could then submit a form the API refused.
  it('opens the edit page only to roles that may update tutorials', () => {
    for (const role of ['super_admin', 'org_admin', 'tutor_manager'] as const) {
      expect(canAccessAdminPath(role, '/admin/tutorials/abc/edit')).toBe(true);
    }
    for (const role of ['tutor', 'viewer'] as const) {
      expect(canAccessAdminPath(role, '/admin/tutorials/abc/edit')).toBe(false);
      expect(canAccessAdminPath(role, '/admin/tutorials/abc')).toBe(true);
    }
  });

  it('keeps payments away from tutors, who are not shown money', () => {
    expect(canAccessAdminPath('tutor', '/admin/payments')).toBe(false);
    for (const role of ['org_admin', 'tutor_manager', 'viewer'] as const) {
      expect(canAccessAdminPath(role, '/admin/payments')).toBe(true);
    }
  });

  it('keeps scheduling restricted to the roles that may create tutorials', () => {
    expect(canAccessAdminPath('tutor_manager', '/admin/create-tutorial')).toBe(true);
    expect(canAccessAdminPath('tutor', '/admin/create-tutorial')).toBe(false);
    expect(canAccessAdminPath('viewer', '/admin/create-tutorial')).toBe(false);
  });
});

describe('the map itself', () => {
  it('never leaves a page unreachable by anyone', () => {
    for (const route of ADMIN_ROUTES) {
      expect(route.roles.length).toBeGreaterThan(0);
    }
  });

  it('always admits super_admin, so the platform owner is never locked out', () => {
    for (const route of ADMIN_ROUTES) {
      expect(route.roles).toContain('super_admin');
    }
  });

  // The drift this derivation exists to prevent: a page open to a role its API
  // refuses (or shut to one it serves).
  it('derives every page\'s roles from the permission it names', () => {
    for (const route of ADMIN_ROUTES) {
      for (const role of ALL_ROLES) {
        const expected = route.permission === null || can(role, route.permission);
        expect(route.roles.includes(role)).toBe(expected);
      }
    }
  });

  it('lists no duplicate hrefs, which would make matching order-dependent', () => {
    const hrefs = ADMIN_ROUTES.map((r) => r.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('keeps the redirect target reachable by every role, so no loop is possible', () => {
    // The middleware bounces a denied request to /admin/dashboard; if any role
    // were denied there it would redirect forever.
    for (const role of ALL_ROLES) {
      expect(canAccessAdminPath(role, '/admin/dashboard')).toBe(true);
    }
  });

  it('does not gate the auth pages, which must stay reachable when logged out', () => {
    for (const path of UNGATED_ADMIN_PATHS) {
      expect(routeForPath(path)).toBeNull();
    }
  });
});
