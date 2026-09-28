/**
 * Org attribution for bookings that don't hang off a tutorial.
 *
 * Group bookings inherit org_id from their tutorial, but programme bookings
 * (Pre-Clinicals, BUCC Classes) have no tutorial, and their checkout never sent
 * an org, so they landed unattributed: counted in the global revenue total but
 * missing from the org's own figure. Both programmes are Babcock-only, so the
 * org is fixed here on the server rather than trusted from Paystack metadata.
 */

// Seeded in migration 001 (originally named "A-Star HQ", renamed to Babcock).
export const BABCOCK_ORG_ID = '00000000-0000-0000-0000-000000000001';

const PROGRAMME_ORG: Record<string, string> = {
  preclinicals: BABCOCK_ORG_ID,
  'bucc-classes': BABCOCK_ORG_ID,
};

export function programmeOrgId(type: string | undefined): string | null {
  return (type && PROGRAMME_ORG[type]) || null;
}
