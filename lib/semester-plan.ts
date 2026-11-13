/**
 * Single source of truth for the Full Semester Plan — a semester of tutorials
 * sold up front, aimed at 100L students (and the parents who pay for them), as
 * an alternative to booking one tutorial at a time.
 *
 * The homepage button, the landing pages, the checkout, the enquiry form, the
 * receipt email and the server-side price check all read from here.
 *
 * Babcock-only for now: bookings and enquiries are attributed to Babcock via
 * lib/programme-org.ts.
 *
 * A plan can be paid in full or in 2 instalments; see "Pay in 2" below.
 *
 * Not built yet: per-student session credits. A paid plan is recorded as a
 * programme booking and the team enrols the student by hand; credits arrive
 * with student accounts.
 */
export const SEMESTER_PLAN_NAME = "Full Semester Plan";
export const SEMESTER_PLAN_TERM = "First Semester, 2026/2027";
export const SEMESTER_PLAN_SESSION = "2026/2027";

export type SemesterPlanId = "group" | "private";

export interface SemesterPlan {
  id: SemesterPlanId;
  name: string;
  price: number;
  /** One of two payments when paying in 2: 10% more than paying in full, overall. */
  instalment: number;
  /** Shown struck through beside the price, when the plan is on offer. */
  originalPrice?: number;
  sessions: number;
  blurb: string;
  features: string[];
}

export const SEMESTER_PLANS: Record<SemesterPlanId, SemesterPlan> = {
  group: {
    id: "group",
    name: "Group Semester Plan",
    price: 100000,
    instalment: 55000,
    sessions: 50,
    blurb: "Small-group classes with coursemates, all semester long.",
    features: [
      "50 group tutorial sessions",
      "Taught by distinction-level tutors",
      "Focused on your 100L courses",
      "Exam and test revision built in",
      "Study community with your coursemates",
    ],
  },
  private: {
    id: "private",
    name: "Private Semester Plan",
    price: 300000,
    instalment: 165000,
    sessions: 50,
    blurb: "One-on-one sessions built around one student.",
    features: [
      "50 one-on-one sessions",
      "A dedicated tutor matched to the student",
      "Scheduled around the student’s timetable",
      "Paced to the student’s strengths and gaps",
      "Exam and test revision built in",
    ],
  },
};

export const SEMESTER_PLAN_IDS: SemesterPlanId[] = ["group", "private"];

export function isSemesterPlanId(value: unknown): value is SemesterPlanId {
  return value === "group" || value === "private";
}

/** Rounded to the naira: what one session costs on a plan. */
export function perSessionPrice(plan: SemesterPlan): number {
  return Math.round(plan.price / plan.sessions);
}

/** The label stored on the booking row and shown in admin and receipts. */
export function semesterPlanCourseLabel(id: SemesterPlanId): string {
  return `${SEMESTER_PLAN_NAME}: ${SEMESTER_PLANS[id].name} (${SEMESTER_PLAN_TERM})`;
}

export const SEMESTER_PLAN_HREF = "/semester-plan";
export const SEMESTER_PLAN_PARENTS_HREF = "/semester-plan/parents";

/**
 * Pay in 2 (Uche, 2026-11-13). Two payments of `instalment`, 10% more overall
 * than paying in full. Discount codes don't apply; an ambassador's referral
 * code still credits the ambassador, with no discount.
 *
 * The second payment is due on the later of 14 December and 14 days after the
 * first, so everyone who joins by 30 November shares one date. Paying in 2 is
 * offered until 25 January, two weeks before exams start on 8 February.
 *
 * Dates are calendar days in Lagos (UTC+1, no daylight saving).
 */
export type PaymentOption = "full" | "split";

export const SPLIT_DUE_DATE = "2026-12-14";
export const SPLIT_MIN_DAYS = 14;
export const SPLIT_LAST_DAY = "2027-01-25";

export function isPaymentOption(value: unknown): value is PaymentOption {
  return value === "full" || value === "split";
}

/** What the two payments add up to. */
export function splitTotal(id: SemesterPlanId): number {
  return SEMESTER_PLANS[id].instalment * 2;
}

/** The calendar date in Lagos, as YYYY-MM-DD. */
export function lagosDate(at: Date = new Date()): string {
  return new Date(at.getTime() + 60 * 60 * 1000).toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Whether checkout offers paying in 2 today. */
export function isSplitOpen(at: Date = new Date()): boolean {
  return lagosDate(at) <= SPLIT_LAST_DAY;
}

/** When the second payment is due, for a first payment made at `firstPaidAt`. */
export function secondPaymentDueDate(firstPaidAt: Date = new Date()): string {
  const twoWeeks = addDays(lagosDate(firstPaidAt), SPLIT_MIN_DAYS);
  return twoWeeks > SPLIT_DUE_DATE ? twoWeeks : SPLIT_DUE_DATE;
}

/** Whole days from `at` (in Lagos) until `isoDate`; negative once it has passed. */
export function daysUntil(isoDate: string, at: Date = new Date()): number {
  const ms = Date.parse(`${isoDate}T00:00:00Z`) - Date.parse(`${lagosDate(at)}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/** "Monday 14 December" */
export function formatDueDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function balancePaymentHref(balanceId: string): string {
  return `/semester-plan/balance/${balanceId}`;
}
