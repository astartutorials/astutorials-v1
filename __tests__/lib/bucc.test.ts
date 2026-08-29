import { isBuccOpen, BUCC_DATE_LABEL, BUCC_LEVELS, BUCC_PROGRAMMES } from '@/lib/bucc';

describe('isBuccOpen', () => {
  it('is open well before the webinar starts', () => {
    expect(isBuccOpen(new Date('2026-08-25T12:00:00Z'))).toBe(true);
  });

  it('is still open in the final hour before the 7pm WAT start', () => {
    expect(isBuccOpen(new Date('2026-08-30T17:30:00Z'))).toBe(true);
  });

  it('closes once the webinar has started', () => {
    expect(isBuccOpen(new Date('2026-08-30T18:00:01Z'))).toBe(false);
  });

  it('is closed the day after', () => {
    expect(isBuccOpen(new Date('2026-08-31T09:00:00Z'))).toBe(false);
  });
});

describe('BUCC constants', () => {
  it('labels the event date as the Sunday it falls on', () => {
    expect(BUCC_DATE_LABEL).toBe('Sunday, 30th August 2026');
  });

  it('offers 200 Level as a selectable level', () => {
    expect(BUCC_LEVELS).toContain('200 Level');
  });

  it('covers the School of Computing programmes', () => {
    expect(BUCC_PROGRAMMES).toContain('Computer Science');
    expect(BUCC_PROGRAMMES).toContain('Software Engineering');
  });
});
