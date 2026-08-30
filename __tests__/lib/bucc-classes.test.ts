import {
  isBuccClassesOpen,
  BUCC_CLASSES_PRICE,
  BUCC_CLASSES_OLD_PRICE,
  BUCC_CLASSES_DATE_RANGE,
  BUCC_CLASSES_COURSES,
  BUCC_CLASSES_FEATURES,
  BUCC_CLASSES_LEVELS,
  BUCC_CLASSES_PROGRAMMES,
} from '@/lib/bucc-classes';

describe('isBuccClassesOpen', () => {
  it('is open before the cohort starts', () => {
    expect(isBuccClassesOpen(new Date('2026-08-31T12:00:00Z'))).toBe(true);
  });

  it('is open on the first day of classes', () => {
    expect(isBuccClassesOpen(new Date('2026-09-07T09:00:00Z'))).toBe(true);
  });

  it('is still open mid-cohort, so late joiners can register', () => {
    expect(isBuccClassesOpen(new Date('2026-09-20T09:00:00Z'))).toBe(true);
  });

  it('is open on the final class day', () => {
    expect(isBuccClassesOpen(new Date('2026-10-04T12:00:00Z'))).toBe(true);
  });

  it('closes once the cohort has ended', () => {
    expect(isBuccClassesOpen(new Date('2026-10-05T00:00:00Z'))).toBe(false);
  });
});

describe('BUCC 200L classes constants', () => {
  it('prices the cohort as the flyer does', () => {
    expect(BUCC_CLASSES_PRICE).toBe(60000);
    expect(BUCC_CLASSES_OLD_PRICE).toBe(100000);
    expect(BUCC_CLASSES_PRICE).toBeLessThan(BUCC_CLASSES_OLD_PRICE);
  });

  it('labels the date range as printed on the flyer', () => {
    expect(BUCC_CLASSES_DATE_RANGE).toBe('7th September – 4th October 2026');
  });

  it('lists exactly the four courses on the flyer', () => {
    expect(BUCC_CLASSES_COURSES).toEqual(['SEN 201', 'MTH 201', 'COS 201', 'IFT 211']);
  });

  it('lists the three featured perks', () => {
    expect(BUCC_CLASSES_FEATURES).toHaveLength(3);
    expect(BUCC_CLASSES_FEATURES[1]).toMatch(/cash prizes/i);
  });

  it('offers the levels a 200-level intake would select', () => {
    expect(BUCC_CLASSES_LEVELS).toContain('200 Level');
    expect(BUCC_CLASSES_LEVELS).toContain('100 Level (incoming 200)');
  });

  it('covers the School of Computing programmes', () => {
    expect(BUCC_CLASSES_PROGRAMMES).toContain('Computer Science');
    expect(BUCC_CLASSES_PROGRAMMES).toContain('Software Engineering');
  });
});
