import { can, type AppRole, type Permission } from './rbac';

/**
 * Which roles may open which admin page — the single source of truth for both
 * the middleware gate and the sidebar.
 *
 * Each page names the permission it needs, and the roles are derived from the
 * PERMISSIONS map in lib/rbac.ts. Pages used to list their roles by hand, which
 * drifted from the API: /admin/careers was super_admin-only here while the
 * careers API let org_admin write. Deriving the roles means a page can never
 * admit someone its API would refuse, or hide from someone it would serve.
 *
 * Matching is longest-prefix, so /admin/tutorials/<id> inherits
 * /admin/tutorials; a `*` segment matches any single segment. Anything under
 * /admin that matches nothing here is DENIED: a new page added without an entry
 * fails closed instead of shipping open.
 */
export const ALL_ROLES: AppRole[] = [
  'super_admin',
  'org_admin',
  'tutor_manager',
  'tutor',
  'viewer',
];

export interface AdminRoute {
  href: string;
  /** Null: any signed-in role (the page only shows the user's own account). */
  permission: Permission | null;
  roles: AppRole[];
}

const ROUTE_PERMISSIONS: { href: string; permission: Permission | null }[] = [
  // Every role has tutorials:read, so every role gets a dashboard; the API
  // strips money and feedback for roles without those permissions.
  { href: '/admin/dashboard',         permission: 'tutorials:read' },
  { href: '/admin/tutorials',         permission: 'tutorials:read' },
  { href: '/admin/tutorials/*/edit',  permission: 'tutorials:update' },
  { href: '/admin/create-tutorial',   permission: 'tutorials:create' },
  { href: '/admin/feedback',          permission: 'feedback:read' },
  { href: '/admin/payments',          permission: 'payments:read' },
  { href: '/admin/orgs',              permission: 'orgs:manage' },
  { href: '/admin/bucc',              permission: 'bucc:read' },
  { href: '/admin/playbooks',         permission: 'playbooks:read' },
  { href: '/admin/intake',            permission: 'intake:read' },
  { href: '/admin/careers',           permission: 'careers:read' },
  { href: '/admin/applications',      permission: 'applications:read' },
  { href: '/admin/audit-logs',        permission: 'audit:read' },
  // Everyone may manage their own profile and password. The page gates its
  // platform tabs (Tutorials/Notifications/Payments/Security) to super_admin.
  { href: '/admin/settings',          permission: null },
];

export const ADMIN_ROUTES: AdminRoute[] = ROUTE_PERMISSIONS.map((r) => ({
  ...r,
  roles: ALL_ROLES.filter((role) => r.permission === null || can(role, r.permission)),
}));

/**
 * Pages served outside the dashboard shell: they handle their own auth (or are
 * deliberately public) and must never be caught by the default-deny rule.
 */
export const UNGATED_ADMIN_PATHS = [
  '/admin/login',
  '/admin/invite',
  '/admin/forgot-password',
  '/admin/reset-password',
];

/** Segment-wise prefix match; `*` in the route matches any one segment. */
function routeMatches(href: string, pathname: string): boolean {
  const want = href.split('/');
  const got = pathname.split('/');
  if (got.length < want.length) return false;
  return want.every((seg, i) => seg === '*' || seg === got[i]);
}

/** Longest-prefix match, so nested routes inherit their parent's rule. */
export function routeForPath(pathname: string): AdminRoute | null {
  let best: AdminRoute | null = null;
  for (const route of ADMIN_ROUTES) {
    const matches = routeMatches(route.href, pathname);
    if (matches && (!best || route.href.length > best.href.length)) best = route;
  }
  return best;
}

/** Fails closed: an unrecognised /admin path is denied, not waved through. */
export function canAccessAdminPath(role: AppRole, pathname: string): boolean {
  const route = routeForPath(pathname);
  if (!route) return false;
  return route.roles.includes(role);
}
