import type { SupabaseClient } from '@supabase/supabase-js';

export type AppRole = 'super_admin' | 'org_admin' | 'tutor_manager' | 'tutor' | 'viewer';

export interface UserRoleContext {
  userId: string;
  role: AppRole;
  orgId: string | null;
}

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
    const { data } = await supabase
      .from('user_roles')
      .select('role, org_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (data) {
      return { userId, role: data.role as AppRole, orgId: data.org_id ?? null };
    }
  } catch {
    // DB unavailable — fall through to metadata
  }

  // Fallback to user_metadata during migration period
  const metaRole = userMetadata?.role as string | undefined;
  if (metaRole === 'super_admin') return { userId, role: 'super_admin', orgId: null };
  if (metaRole === 'admin') return { userId, role: 'org_admin', orgId: null };

  return null;
}
