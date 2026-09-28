/**
 * Student intake — the "join A-Star" registration for new students.
 *
 * The form is reused every year, so a registration is never just "a 100 level
 * student". Each row records the academic session it was made in and the level
 * the student entered at; the level they are in *now* is derived from those two
 * (see levelInSession), so last year's freshers show up as 200 level instead of
 * piling into one ever-growing 100 level list.
 *
 * Running next year's intake: append an entry below with the new session. The
 * public page, the homepage band, the API and the admin console all read this
 * array, so nothing else needs touching.
 */

import { BABCOCK_ORG_ID } from '@/lib/programme-org';

export type IntakeLevel = 100 | 200 | 300 | 400 | 500;

export interface Intake {
  /** The level students are entering at. */
  level: IntakeLevel;
  /** Academic session the registrations count toward, e.g. "2026/2027". */
  session: string;
  /** The org the registrations are attributed to, for org_admin scoping. */
  orgId: string;
  opensAt: Date;
  /** Null keeps the intake open until the next one for the same level opens. */
  closesAt: Date | null;
}

export const INTAKES: Intake[] = [
  {
    level: 100,
    session: '2026/2027',
    orgId: BABCOCK_ORG_ID,
    opensAt: new Date('2026-09-01T00:00:00+01:00'),
    closesAt: null,
  },
];

/**
 * Babcock's session starts in September. Used only to work out which session
 * "now" falls in for the admin view's current-level column; which session a
 * registration counts toward comes from the intake, never from the clock.
 */
const SESSION_START_MONTH = 8; // 0-indexed: September

export function sessionFor(date: Date = new Date()): string {
  const y = date.getFullYear();
  const start = date.getMonth() >= SESSION_START_MONTH ? y : y - 1;
  return `${start}/${start + 1}`;
}

function sessionStartYear(session: string): number {
  return parseInt(session.slice(0, 4), 10);
}

/** The level a student who entered at `entryLevel` in `entrySession` is at in `session`. */
export function levelInSession(entryLevel: number, entrySession: string, session: string): number {
  return entryLevel + 100 * (sessionStartYear(session) - sessionStartYear(entrySession));
}

/**
 * The intake currently taking registrations for a level, or undefined. When
 * two overlap, the one that opened most recently wins — so opening next year's
 * intake retires this year's without having to set a close date on it.
 */
export function openIntakeFor(level: number, now: Date = new Date()): Intake | undefined {
  return INTAKES
    .filter((i) => i.level === level && i.opensAt <= now && (!i.closesAt || now <= i.closesAt))
    .sort((a, b) => b.opensAt.getTime() - a.opensAt.getTime())[0];
}

/** URL segment for a level's registration page: 100 → "100-level". */
export function intakeSlug(level: IntakeLevel): string {
  return `${level}-level`;
}

export function intakeHref(level: IntakeLevel): string {
  return `/register/${intakeSlug(level)}`;
}

/** "100-level" → 100, or null for anything that isn't a level with an intake. */
export function levelFromSlug(slug: string): IntakeLevel | null {
  const m = /^(\d{3})-level$/.exec(slug);
  if (!m) return null;
  const level = parseInt(m[1], 10);
  return INTAKES.some((i) => i.level === level) ? (level as IntakeLevel) : null;
}

/** Every level that has ever had an intake — the set of pages to generate. */
export const INTAKE_LEVELS: IntakeLevel[] = [...new Set(INTAKES.map((i) => i.level))];

/** Every session with an intake, newest first — the admin console's session picker. */
export const INTAKE_SESSIONS: string[] = [...new Set(INTAKES.map((i) => i.session))].sort().reverse();

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Days in a month, allowing 29 February — the year isn't asked for. */
export function daysInMonth(month: number): number {
  return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 31;
}
