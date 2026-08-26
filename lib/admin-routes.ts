import type { AppRole } from './rbac';

/**
 * Which roles may open which admin page — the single source of truth for both
 * the middleware gate and the sidebar.
 *
 * These lived in two places before: SUPER_ADMIN_ONLY in middleware.ts and a
 * `roles` field per NAV_ITEM in AdminSidebar.tsx. They had already drifted —
 * /admin/careers, /admin/applications, /admin/audit-logs and /admin/orgs were
 * hidden from the sidebar for non-super-admins but reachable by typing the URL,
 * leaning entirely on each API route to refuse. That is one forgotten `can()`
 * check away from an exposed page.
 *
 * Matching is longest-prefix, so /admin/tutorials/<id>/edit inherits
 * /admin/tutorials. Anything under /admin that matches nothing here is DENIED:
 * a new page added without an entry fails closed instead of shipping open.
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
  roles: AppRole[];
}

export const ADMIN_ROUTES: AdminRoute[] = [
  { href: '/admin/dashboard',       roles: ALL_ROLES },
  { href: '/admin/tutorials',       roles: ALL_ROLES },
  { href: '/admin/feedback',        roles: ALL_ROLES },
  { href: '/admin/create-tutorial', roles: ['super_admin', 'org_admin', 'tutor_manager'] },
  { href: '/admin/payments',        roles: ['super_admin', 'org_admin', 'tutor_manager', 'viewer'] },
  { href: '/admin/orgs',            roles: ['super_admin'] },
  { href: '/admin/bucc',            roles: ['super_admin'] },
  { href: '/admin/careers',         roles: ['super_admin'] },
  { href: '/admin/applications',    roles: ['super_admin'] },
  { href: '/admin/audit-logs',      roles: ['super_admin'] },
  // Open to everyone, matching settings:read in PERMISSIONS. The page gates
  // itself: ALL_TABS marks Tutorials/Notifications/Payments/Security
  // superAdminOnly and filters them out, leaving other roles on Profile to
  // manage their own account. The old super_admin-only rule here meant a tutor
  // could not reach the page to change their own password.
  { href: '/admin/settings',        roles: ALL_ROLES },
];

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

/** Longest-prefix match, so nested routes inherit their parent's rule. */
export function routeForPath(pathname: string): AdminRoute | null {
  let best: AdminRoute | null = null;
  for (const route of ADMIN_ROUTES) {
    const matches = pathname === route.href || pathname.startsWith(`${route.href}/`);
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
