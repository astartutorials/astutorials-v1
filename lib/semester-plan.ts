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
  sessions: number;
  blurb: string;
  features: string[];
}

export const SEMESTER_PLANS: Record<SemesterPlanId, SemesterPlan> = {
  group: {
    id: "group",
    name: "Group Semester Plan",
    price: 75000,
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
    price: 250000,
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
