const { getMfaStatus, mfaGate, MFA_REQUIRED_ROLES } = jest.requireActual('@/lib/mfa') as typeof import('@/lib/mfa');
import { asSupabaseClient } from '../helpers/supabase';

const aal = (currentLevel: string | null, nextLevel: string | null, error: unknown = null) =>
  asSupabaseClient({
    auth: { mfa: { getAuthenticatorAssuranceLevel: jest.fn().mockResolvedValue({ data: { currentLevel, nextLevel }, error }) } },
  });

describe('getMfaStatus()', () => {
  it('reads a session that has entered its code', async () => {
    expect(await getMfaStatus(aal('aal2', 'aal2'))).toEqual({ verified: true, hasFactor: true });
  });

  it('reads a session that still owes its code', async () => {
    expect(await getMfaStatus(aal('aal1', 'aal2'))).toEqual({ verified: false, hasFactor: true });
  });

  it('reads a user with no authenticator', async () => {
    expect(await getMfaStatus(aal('aal1', 'aal1'))).toEqual({ verified: false, hasFactor: false });
  });

  it('returns null on an error or a client without MFA, never a pass', async () => {
    expect(await getMfaStatus(aal(null, null, { message: 'no session' }))).toBeNull();
    expect(await getMfaStatus(asSupabaseClient({ auth: {} }))).toBeNull();
  });
});

describe('mfaGate()', () => {
  it('requires it of super_admin and org_admin only', () => {
    expect(MFA_REQUIRED_ROLES).toEqual(['super_admin', 'org_admin']);
  });

  it.each([
    // role,            verified, hasFactor, gate
    ['super_admin',     false,    false,     'enroll'],
    ['org_admin',       false,    false,     'enroll'],
    ['super_admin',     false,    true,      'verify'],
    ['super_admin',     true,     true,      'ok'],
    ['tutor_manager',   false,    false,     'ok'],
    ['tutor',           false,    true,      'verify'], // turned it on, so it's enforced
    ['viewer',          true,     true,      'ok'],
  ] as const)('%s, verified=%s, hasFactor=%s → %s', (role, verified, hasFactor, gate) => {
    expect(mfaGate(role, { verified, hasFactor })).toBe(gate);
  });

  it('fails closed when the status is unknown, for every role', () => {
    expect(mfaGate('super_admin', null)).toBe('verify');
    expect(mfaGate('tutor', null)).toBe('verify');
  });
});
