/**
 * Single source of truth for the Pre-Clinicals cohort. The landing page, the
 * registration modal, and the site-wide promo links all read from here so a
 * price or date change lands everywhere at once.
 *
 * To run a new cohort: update the dates, price and label below. Once
 * PRECLINICALS_END_DATE passes the homepage band retires itself, but the cohort
 * stays listed under Programmes as past work — see components/shared/programmes.ts.
 */
export const PRECLINICALS_PRICE = 60000;
export const PRECLINICALS_OLD_PRICE = 100000;
export const PRECLINICALS_COURSE_LABEL = "Pre-Clinicals Introductory Classes (Aug 2026)";

export const PRECLINICALS_DATE_RANGE = "3rd – 30th August 2026";

/** Registration closes at the end of the final class day. */
export const PRECLINICALS_END_DATE = new Date("2026-08-30T23:59:59Z");

export const PRECLINICALS_SUBJECTS = [
  "Gross Anatomy",
  "Histology",
  "Embryology",
  "Physiology",
  "Biochemistry",
];

/**
 * Whether the cohort is still open. Callers on statically rendered pages should
 * evaluate this on the client (see PreClinicalsCTA) — a build-time answer would
 * be frozen into the HTML until the next deploy.
 */
export function isPreClinicalsOpen(now: Date = new Date()): boolean {
  return now <= PRECLINICALS_END_DATE;
}
