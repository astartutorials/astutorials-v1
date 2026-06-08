import { compareTutorialDates } from '@/app/admin/(dashboard)/tutorials/page';

describe('compareTutorialDates', () => {
  it('sorts null dates before dated entries (ascending)', () => {
    expect(compareTutorialDates(null, '2026-06-10', 1)).toBeLessThan(0);
  });

  it('sorts null dates before dated entries (descending)', () => {
    expect(compareTutorialDates(null, '2026-06-10', -1)).toBeLessThan(0);
  });

  it('sorts dated entries after null dates (ascending)', () => {
    expect(compareTutorialDates('2026-06-10', null, 1)).toBeGreaterThan(0);
  });

  it('treats two null dates as equal', () => {
    expect(compareTutorialDates(null, null, 1)).toBe(0);
  });

  it('sorts earlier date first in ascending order', () => {
    expect(compareTutorialDates('2026-06-01', '2026-06-10', 1)).toBeLessThan(0);
  });

  it('sorts later date first in descending order', () => {
    expect(compareTutorialDates('2026-06-01', '2026-06-10', -1)).toBeGreaterThan(0);
  });

  it('treats equal dates as equal', () => {
    expect(compareTutorialDates('2026-06-10', '2026-06-10', 1)).toBe(0);
  });
});
