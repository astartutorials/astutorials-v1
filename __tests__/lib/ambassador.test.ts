import { proposeReferralCode, AMBASSADOR_COMMISSIONS } from '@/lib/ambassador';

describe('proposeReferralCode', () => {
  it('uses the first name in capitals plus three digits', () => {
    expect(proposeReferralCode('Tolu Adeyemi', () => 0)).toBe('TOLU100');
    expect(proposeReferralCode('  chidinma okafor', () => 0.999)).toBe('CHIDIN999');
  });

  it('drops anything that is not a letter and falls back when nothing is left', () => {
    expect(proposeReferralCode("O'Neil-Smith", () => 0.5)).toBe('ONEILS550');
    expect(proposeReferralCode('123', () => 0)).toBe('ASTAR100');
  });
});

describe('commission', () => {
  it("matches Uche's figures: 5% of each plan", () => {
    expect(AMBASSADOR_COMMISSIONS).toEqual({ group: 5000, private: 15000 });
  });
});
