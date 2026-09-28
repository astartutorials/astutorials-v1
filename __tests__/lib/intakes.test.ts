import {
  sessionFor,
  levelInSession,
  openIntakeFor,
  levelFromSlug,
  intakeHref,
  daysInMonth,
  INTAKES,
} from '@/lib/intakes';

describe('sessionFor', () => {
  it('rolls over to the new session in September', () => {
    expect(sessionFor(new Date('2026-08-31T12:00:00'))).toBe('2025/2026');
    expect(sessionFor(new Date('2026-09-01T12:00:00'))).toBe('2026/2027');
    expect(sessionFor(new Date('2027-03-15T12:00:00'))).toBe('2026/2027');
  });
});

// The reason the session is stored: last year's freshers must not read as 100L.
describe('levelInSession', () => {
  it('advances a level for every session since entry', () => {
    expect(levelInSession(100, '2026/2027', '2026/2027')).toBe(100);
    expect(levelInSession(100, '2026/2027', '2027/2028')).toBe(200);
    expect(levelInSession(100, '2026/2027', '2029/2030')).toBe(400);
  });
});

describe('openIntakeFor', () => {
  const intake = INTAKES.find((i) => i.level === 100)!;

  it('returns the 100 level intake once it has opened', () => {
    expect(openIntakeFor(100, new Date(intake.opensAt.getTime() + 1000))).toBe(intake);
  });

  it('returns nothing before the intake opens', () => {
    expect(openIntakeFor(100, new Date(intake.opensAt.getTime() - 1000))).toBeUndefined();
  });

  it('returns nothing for a level without an intake', () => {
    expect(openIntakeFor(300, new Date('2026-10-01'))).toBeUndefined();
  });
});

describe('slugs', () => {
  it('round-trips a level through its URL segment', () => {
    expect(intakeHref(100)).toBe('/register/100-level');
    expect(levelFromSlug('100-level')).toBe(100);
  });

  it('rejects anything that is not a level with an intake', () => {
    expect(levelFromSlug('300-level')).toBeNull();
    expect(levelFromSlug('100')).toBeNull();
    expect(levelFromSlug('../etc')).toBeNull();
  });
});

describe('daysInMonth', () => {
  it('allows 29 February, since the year is not asked for', () => {
    expect(daysInMonth(2)).toBe(29);
    expect(daysInMonth(4)).toBe(30);
    expect(daysInMonth(12)).toBe(31);
  });
});
