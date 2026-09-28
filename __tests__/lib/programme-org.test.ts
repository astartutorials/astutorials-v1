import { programmeOrgId, BABCOCK_ORG_ID } from '@/lib/programme-org';

describe('programmeOrgId', () => {
  it('maps the Babcock-only programmes to Babcock', () => {
    expect(programmeOrgId('preclinicals')).toBe(BABCOCK_ORG_ID);
    expect(programmeOrgId('bucc-classes')).toBe(BABCOCK_ORG_ID);
  });

  it('returns null for group, private and unknown bookings', () => {
    expect(programmeOrgId(undefined)).toBeNull();
    expect(programmeOrgId('private')).toBeNull();
    expect(programmeOrgId('something-else')).toBeNull();
  });
});
