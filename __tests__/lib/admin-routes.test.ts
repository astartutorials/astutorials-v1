import { ADMIN_ROUTES, ALL_ROLES, UNGATED_ADMIN_PATHS, routeForPath, canAccessAdminPath } from '@/lib/admin-routes';
import type { AppRole } from '@/lib/rbac';

const NON_SUPER: AppRole[] = ['org_admin', 'tutor_manager', 'tutor', 'viewer'];

describe('routeForPath', () => {
  it('matches an exact page', () => {
    expect(routeForPath('/admin/dashboard')?.href).toBe('/admin/dashboard');
  });

  it('matches a nested page against its parent', () => {
    expect(routeForPath('/admin/tutorials/abc-123/edit')?.href).toBe('/admin/tutorials');
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
  it.each(['/admin/bucc', '/admin/careers', '/admin/applications', '/admin/audit-logs', '/admin/orgs'])(
    'refuses %s to every non-super_admin',
    (path) => {
      expect(canAccessAdminPath('super_admin', path)).toBe(true);
      for (const role of NON_SUPER) {
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
