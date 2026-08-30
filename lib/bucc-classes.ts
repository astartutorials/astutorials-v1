/**
 * Single source of truth for the BUCC 200L Preparatory Online Classes — the
 * paid four-week cohort for Babcock School of Computing students moving into
 * 200 level.
 *
 * The landing page, the registration modal, the receipt email and the site-wide
 * promo links all read from here, so a price or date change lands everywhere at
 * once.
 *
 * Distinct from lib/bucc.ts, which drives The BUCC Advantage — the free webinar
 * that feeds this cohort and now lives at /bucc/advantage.
 *
 * To run a new cohort: update the dates, price and label below. Once
 * BUCC_CLASSES_END_DATE passes the homepage band retires itself, but the cohort
 * stays listed under Programmes as past work — see components/shared/programmes.ts.
 */
export const BUCC_CLASSES_NAME = "BUCC 200L Preparatory Online Classes";
export const BUCC_CLASSES_TAGLINE =
  "Maximise your break and resume 200 level with confidence!";

export const BUCC_CLASSES_PRICE = 60000;
export const BUCC_CLASSES_OLD_PRICE = 100000;
export const BUCC_CLASSES_COURSE_LABEL =
  "BUCC 200L Preparatory Classes (Sept 2026)";

export const BUCC_CLASSES_DATE_RANGE = "7th September – 4th October 2026";

/** Registration closes at the end of the final class day. */
export const BUCC_CLASSES_END_DATE = new Date("2026-10-04T23:59:59Z");

/**
 * Course codes exactly as printed on the flyer. Deliberately codes only — the
 * full Babcock course titles are not on the flyer and guessing them would put
 * wrong names in front of students who know better.
 */
export const BUCC_CLASSES_COURSES = ["SEN 201", "MTH 201", "COS 201", "IFT 211"];

export const BUCC_CLASSES_FEATURES = [
  "Daily & Weekly quizzes",
  "Cash prizes for top students",
  "Community interaction",
];

export const BUCC_CLASSES_LEVELS = [
  "100 Level (incoming 200)",
  "200 Level",
  "300 Level",
  "Other / Direct Entry",
];

export const BUCC_CLASSES_PROGRAMMES = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Cyber Security",
  "Computer Technology",
  "Information Systems",
  "Other (School of Computing)",
];

export const BUCC_CLASSES_HEARD_OPTIONS = [
  "BUCC WhatsApp group",
  "The BUCC Advantage webinar",
  "Instagram",
  "TikTok",
  "A coursemate",
  "A BUCC exco",
  "Class rep",
  "Other",
];

/**
 * Whether the cohort is still open. Callers on statically rendered pages should
 * evaluate this on the client (see useBuccClassesOpen) — a build-time answer
 * would be frozen into the HTML until the next deploy.
 */
export function isBuccClassesOpen(now: Date = new Date()): boolean {
  return now <= BUCC_CLASSES_END_DATE;
}
