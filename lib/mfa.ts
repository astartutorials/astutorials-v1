import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppRole } from './rbac';

/**
 * Two-step sign-in (TOTP authenticator app) for the admin.
 *
 * These roles see money, parents' contact details or ambassadors' bank
 * details across a whole org (or all of A-Star), so a stolen password alone
 * must not be enough. Everyone else may turn it on, and once on it is enforced
 * for them too.
 */
export const MFA_REQUIRED_ROLES: readonly AppRole[] = ['super_admin', 'org_admin'];

/** What a signed-in session must do before it may use the admin. */
export type MfaGate = 'ok' | 'verify' | 'enroll';

export interface MfaStatus {
  /** The session has passed the second step. */
  verified: boolean;
  /** The user has a confirmed authenticator. */
  hasFactor: boolean;
}

/**
 * Reads the session's assurance level. aal2 means the code was entered this
 * session; nextLevel aal2 means a confirmed authenticator exists.
 *
 * Returns null when it cannot tell, and callers treat null as "not verified":
 * an unreadable status must never wave a session through.
 */
export async function getMfaStatus(supabase: SupabaseClient): Promise<MfaStatus | null> {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error || !data) return null;
    return { verified: data.currentLevel === 'aal2', hasFactor: data.nextLevel === 'aal2' };
  } catch {
    return null;
  }
}

export function mfaGate(role: AppRole, status: MfaStatus | null): MfaGate {
  // Can't tell: fail closed. The sign-in page re-checks in the browser.
  if (!status) return 'verify';
  if (status.hasFactor) return status.verified ? 'ok' : 'verify';
  return MFA_REQUIRED_ROLES.includes(role) ? 'enroll' : 'ok';
}
