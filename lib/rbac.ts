import type { SupabaseClient } from '@supabase/supabase-js';

export type AppRole = 'super_admin' | 'org_admin' | 'tutor_manager' | 'tutor' | 'viewer';

export interface UserRoleContext {
  userId: string;
  role: AppRole;
  orgId: string | null;
}

/**
 * Some actions are deliberately absent from every array below, which leaves them
 * reachable only by super_admin's '*'. They cover first-party data that carries
 * no org_id and therefore cannot be org-scoped, so granting them to a tenant
 * role would leak across tenants rather than filter:
 *
 *   bucc:read — registrations for A-Star's own BUCC Advantage webinar
 */
const PERMISSIONS: Record<AppRole, string[]> = {
  super_admin: ['*'],

  // Runs the organisation: full tutorial control, sees all org data, can invite people
  org_admin: [
    'tutorials:read', 'tutorials:create', 'tutorials:update', 'tutorials:delete',
    'bookings:read', 'bookings:update',
    'payments:read',
    'feedback:read',
    'invites:create',
    'careers:read', 'careers:create', 'careers:update', 'careers:delete',
    'settings:read', 'settings:update',
  ],

  // Schedules and manages tutorials: can create/update but not delete, marks attendance, sees revenue
  tutor_manager: [
    'tutorials:read', 'tutorials:create', 'tutorials:update',
    'bookings:read', 'bookings:update',
    'payments:read',
    'feedback:read',
    'careers:read',
    'settings:read', 'settings:update',
  ],

  // Teaches tutorials: sees bookings for their sessions, marks attendance, reads feedback
  tutor: [
    'tutorials:read',
    'bookings:read', 'bookings:update',
    'feedback:read',
    'settings:read', 'settings:update',
  ],

  // Read-only stakeholder: sees everything but changes nothing
  viewer: [
    'tutorials:read',
    'bookings:read',
    'payments:read',
    'feedback:read',
    'settings:read',
  ],
};

export function can(role: AppRole, action: string): boolean {
  const perms = PERMISSIONS[role] ?? [];
  if (perms.includes('*')) return true;
  if (perms.includes(action)) return true;
  return perms.includes(`${action.split(':')[0]}:*`);
}

export async function getUserRole(
  supabase: SupabaseClient,
  userId: string,
  userMetadata?: Record<string, unknown>
): Promise<UserRoleContext | null> {
  try {
    const { data: rows } = await supabase
      .from('user_roles')
      .select('role, org_id')
      .eq('user_id', userId)
      .order('org_id', { ascending: true, nullsFirst: true })
      .limit(10);

    if (rows && rows.length > 0) {
      // super_admin is platform-wide and has no org scope, so it wins outright.
      const superRow = rows.find((r) => r.role === 'super_admin');
      if (superRow) return { userId, role: 'super_admin', orgId: null };

      // Everyone else must resolve to a real org. Picking the first row blindly
      // would select an org_id IS NULL row (they sort first), which then skips
      // every org filter downstream — see withSafeScope.
      const scoped = rows.find((r) => r.org_id);
      if (scoped) {
        return withSafeScope({ userId, role: scoped.role as AppRole, orgId: scoped.org_id });
      }

      return withSafeScope({ userId, role: rows[0].role as AppRole, orgId: null });
    }
  } catch {
    // DB unavailable — fall through to metadata
  }

  // Fallback to user_metadata during migration period
  const metaRole = userMetadata?.role as string | undefined;
  if (metaRole === 'super_admin') return { userId, role: 'super_admin', orgId: null };
  if (metaRole === 'admin') {
    // Carries no org, so it cannot be scoped safely. Denied rather than granted
    // unscoped access to every organisation.
    return withSafeScope({ userId, role: 'org_admin', orgId: null });
  }

  return null;
}

/**
 * Fails closed on an unscopable role.
 *
 * Callers filter with `ctx.role !== 'super_admin' && ctx.orgId`, so a
 * non-super_admin carrying a null orgId silently skips the org filter and reads
 * every organisation's data. Denying here closes that at the source rather than
 * relying on eleven separate call sites getting the condition right.
 */
function withSafeScope(ctx: UserRoleContext): UserRoleContext | null {
  if (ctx.role !== 'super_admin' && !ctx.orgId) {
    console.error(
      `[rbac] denying ${ctx.role} ${ctx.userId}: role has no org scope, which would bypass org filtering`
    );
    return null;
  }
  return ctx;
}
