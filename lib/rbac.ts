import type { SupabaseClient } from '@supabase/supabase-js';

export type AppRole = 'super_admin' | 'org_admin' | 'tutor_manager' | 'tutor' | 'viewer';

export interface UserRoleContext {
  userId: string;
  role: AppRole;
  orgId: string | null;
}

/**
 * Every permission in the system. A typo in a `can()` call is a compile error
 * rather than a silent deny.
 *
 * Two kinds of data, and the rule that follows from each:
 *
 *  - ORG DATA carries an org_id: tutorials, bookings, payments, feedback,
 *    student intake, BUCC registrations, invites. Every role below super_admin
 *    reads and writes it only for their own organisation — the API filters by
 *    ctx.orgId, and getUserRole refuses a non-super_admin with no org.
 *
 *  - A-STAR-WIDE DATA has no org to scope by: careers, organisations, the
 *    audit log, platform settings. It belongs to super_admin. The two
 *    exceptions, playbooks:read and applications:*, were granted to org_admin
 *    on request and are shared reads — every org_admin sees every row. That is
 *    safe only while each org_admin works for A-Star itself; see the note on
 *    org_admin below.
 *
 * Money is its own permission. bookings:read is the class roster (names,
 * contacts, attendance); amounts, references and revenue need payments:read,
 * and cancelling a booking — which releases a seat and marks a payment as
 * cancelled — needs bookings:cancel.
 */
export type Permission =
  | 'tutorials:read' | 'tutorials:create' | 'tutorials:update' | 'tutorials:delete'
  | 'bookings:read' | 'bookings:cancel' | 'attendance:update'
  | 'payments:read'
  | 'feedback:read'
  | 'intake:read'
  | 'bucc:read'
  | 'playbooks:read'
  | 'applications:read' | 'applications:update' | 'applications:delete'
  | 'careers:read' | 'careers:create' | 'careers:update' | 'careers:delete'
  | 'invites:create'
  | 'orgs:manage'
  | 'users:create'
  | 'audit:read';

/**
 * What each role is FOR, then exactly what it may do. Before adding a grant,
 * check it against the role's purpose and the org/A-Star-wide rule above; a
 * grant that doesn't fit either is a sign the role is being stretched into
 * another one.
 *
 * Deliberately absent: a permission for your own profile and password. Every
 * signed-in user may manage their own account (/api/admin/me,
 * /api/admin/auth/update-password), which is identity, not authority.
 */
const PERMISSIONS: Record<AppRole, readonly (Permission | '*')[]> = {
  // A-Star itself. Every organisation, every A-Star-wide dataset, the only role
  // that can create organisations, create admin accounts or read the audit log.
  super_admin: ['*'],

  // Runs one university's operation end to end: the tutorials, the money, the
  // students and the team. Nothing A-Star-wide except the two shared reads.
  //
  // playbooks:read and applications:* are A-Star-wide and granted on request.
  // Today every org_admin is Babcock staff who also run A-Star's events, so
  // this is fine; the moment an org_admin is added for a second university,
  // they would see Babcock's playbook registrants and every tutor applicant.
  // Revisit then — either tag those rows with an org or move the grant to a
  // dedicated A-Star staff role.
  org_admin: [
    'tutorials:read', 'tutorials:create', 'tutorials:update', 'tutorials:delete',
    'bookings:read', 'bookings:cancel', 'attendance:update',
    'payments:read',
    'feedback:read',
    'intake:read',
    'bucc:read',
    'invites:create',
    'playbooks:read',
    'applications:read', 'applications:update',
  ],

  // Runs the timetable: schedules and edits tutorials, takes attendance, and
  // sees revenue to plan capacity. Cannot delete a tutorial or cancel a booking
  // — both destroy a paying student's record and stay with org_admin.
  tutor_manager: [
    'tutorials:read', 'tutorials:create', 'tutorials:update',
    'bookings:read', 'attendance:update',
    'payments:read',
    'feedback:read',
  ],

  // Teaches. Sees the tutorials and who is booked on them, takes attendance,
  // reads feedback. No money: a tutor is not shown what students paid.
  tutor: [
    'tutorials:read',
    'bookings:read', 'attendance:update',
    'feedback:read',
  ],

  // Read-only stakeholder (e.g. someone reporting to the university). Sees the
  // org's tutorials, rosters, payments and feedback; changes nothing.
  viewer: [
    'tutorials:read',
    'bookings:read',
    'payments:read',
    'feedback:read',
  ],
};

export function can(role: AppRole, action: Permission): boolean {
  const perms = PERMISSIONS[role] ?? [];
  return perms.includes('*') || perms.includes(action);
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
