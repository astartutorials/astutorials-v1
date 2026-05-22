import type { SupabaseClient } from '@supabase/supabase-js';

export type AppRole = 'super_admin' | 'org_admin' | 'tutor_manager' | 'tutor' | 'viewer';

export interface UserRoleContext {
  userId: string;
  role: AppRole;
  orgId: string | null;
}

const PERMISSIONS: Record<AppRole, string[]> = {
  super_admin: ['*'],
  org_admin: [
    'tutorials:read', 'tutorials:create', 'tutorials:update', 'tutorials:delete',
    'bookings:read', 'bookings:update',
    'payments:read',
    'careers:read', 'careers:create', 'careers:update', 'careers:delete',
    'feedback:read',
    'applications:read',
    'invites:create',
    'settings:read',
  ],
  tutor_manager: [
    'tutorials:read', 'tutorials:create', 'tutorials:update',
    'bookings:read', 'bookings:update',
    'payments:read',
    'feedback:read',
  ],
  tutor: ['tutorials:read', 'bookings:read'],
  viewer: ['tutorials:read', 'bookings:read', 'payments:read'],
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

  // Fallback to user_metadata during migration period
  const metaRole = userMetadata?.role as string | undefined;
  if (metaRole === 'super_admin') return { userId, role: 'super_admin', orgId: null };
  if (metaRole === 'admin') return { userId, role: 'org_admin', orgId: null };

  return null;
}
