import { isBuccClassesOpen, BUCC_CLASSES_END_DATE } from '@/lib/bucc-classes';
import { isPreClinicalsOpen, PRECLINICALS_END_DATE } from '@/lib/preclinicals';
import { isBuccOpen, BUCC_CLOSES_AT } from '@/lib/bucc';
import { PLAYBOOKS, isPlaybookOpen } from '@/lib/playbooks';

/**
 * The Programmes menu lists past cohorts as a track record rather than dropping
 * them, and orders the past group by when each one ended. That ordering is only
 * meaningful if the exported end dates line up with the isOpen predicates, so
 * these lock the two together.
 */
describe('programme windows', () => {
  const windows = [
    { name: 'bucc-classes', endsAt: BUCC_CLASSES_END_DATE, isOpen: isBuccClassesOpen },
    { name: 'preclinicals', endsAt: PRECLINICALS_END_DATE, isOpen: isPreClinicalsOpen },
    { name: 'bucc-advantage', endsAt: BUCC_CLOSES_AT, isOpen: isBuccOpen },
    // The Playbook webinars join the same menu, so they are held to the same
    // invariants — including the distinct-end-instant rule below, which now has
    // to hold across two independently edited sets of configs.
    ...PLAYBOOKS.map((pb) => ({
      name: `playbook-${pb.slug}`,
      endsAt: pb.closesAt,
      isOpen: (now: Date) => isPlaybookOpen(pb, now),
    })),
  ];

  it.each(windows)('$name is open at its end instant and closed just after', ({ endsAt, isOpen }) => {
    expect(isOpen(new Date(endsAt.getTime()))).toBe(true);
    expect(isOpen(new Date(endsAt.getTime() + 1000))).toBe(false);
  });

  it.each(windows)('$name is open well before it ends', ({ endsAt, isOpen }) => {
    expect(isOpen(new Date(endsAt.getTime() - 7 * 24 * 60 * 60 * 1000))).toBe(true);
  });

  // The nav sorts past programmes most-recently-ended first, which only reads
  // as a history if no two share an end instant.
  it('gives every programme a distinct end instant', () => {
    const times = windows.map((w) => w.endsAt.getTime());
    expect(new Set(times).size).toBe(times.length);
  });

  it('ended the BUCC Advantage before the 200L cohort it feeds', () => {
    expect(BUCC_CLOSES_AT.getTime()).toBeLessThan(BUCC_CLASSES_END_DATE.getTime());
  });
});
