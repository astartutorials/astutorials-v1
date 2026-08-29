/**
 * Single source of truth for The BUCC Advantage — the free 90-minute webinar
 * for BUCC (Babcock University Computer Club) 200-level students.
 *
 * The landing page, the registration modal, the confirmation email and the
 * site-wide promo links all read from here, so a date or link change lands
 * everywhere at once.
 *
 * To run another edition: update the date, time and meeting link below. To pull
 * the promo down early: set BUCC_CLOSES_AT to a past date, or drop the entries
 * from Navbar/Footer.
 */
export const BUCC_EVENT_NAME = "The BUCC Advantage";
export const BUCC_TAGLINE = "Your Blueprint for Thriving in 200 Level";

export const BUCC_DATE_LABEL = "Sunday, 30th August 2026";
export const BUCC_TIME_LABEL = "7:00 pm WAT";
export const BUCC_DURATION_LABEL = "90 minutes";
export const BUCC_PLATFORM = "Google Meet";

/**
 * The join link, sent in the confirmation email and shown on the success page.
 * Hardcoded so no Vercel env change is needed to ship it; the env var stays as
 * an override for a last-minute room change. Set both to "" and callers fall
 * back to "we'll send it to you before the event" rather than a dead link.
 */
export const BUCC_MEETING_URL =
  process.env.NEXT_PUBLIC_BUCC_MEETING_URL ?? "https://meet.google.com/qft-fsxv-pkf";

/** Registration closes when the webinar starts (19:00 WAT = 18:00 UTC). */
const CLOSES_AT = new Date("2026-08-30T18:00:00Z");

export const BUCC_LEVELS = [
  "200 Level",
  "100 Level (incoming 200)",
  "300 Level",
  "400 Level",
  "Other",
];

export const BUCC_PROGRAMMES = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Cyber Security",
  "Computer Technology",
  "Information Systems",
  "Other (School of Computing)",
];

export const BUCC_HEARD_OPTIONS = [
  "BUCC WhatsApp group",
  "Instagram",
  "X (Twitter)",
  "A coursemate",
  "A BUCC exco",
  "Class rep",
  "Other",
];

/**
 * Whether registration is still open. Callers on statically rendered pages
 * should evaluate this on the client (see useBuccOpen) — a build-time answer
 * would be frozen into the HTML until the next deploy.
 */
export function isBuccOpen(now: Date = new Date()): boolean {
  return now <= CLOSES_AT;
}
