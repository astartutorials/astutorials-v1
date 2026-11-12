import { SEMESTER_PLANS } from '@/lib/semester-plan';

/**
 * Single source of truth for the A-Star Ambassadors programme (/ambassador).
 *
 * Students apply, an admin approves them and assigns a unique referral code,
 * and they earn a commission on every Full Semester Plan bought with it. Brief
 * from Uche, 2026-11-12. Babcock is the test market.
 *
 * Not built yet: crediting referrals at checkout, an earnings view for admins,
 * and a dashboard for ambassadors themselves. Payouts are manual and monthly.
 */
export const AMBASSADOR_PROGRAMME_NAME = 'A-Star Ambassadors';
export const AMBASSADOR_HREF = '/ambassador';

/** 5% of the plan price, rounded to the naira. */
export const AMBASSADOR_COMMISSION_RATE = 0.05;

export const AMBASSADOR_COMMISSIONS = {
  group: Math.round(SEMESTER_PLANS.group.price * AMBASSADOR_COMMISSION_RATE),
  private: Math.round(SEMESTER_PLANS.private.price * AMBASSADOR_COMMISSION_RATE),
} as const;

export const AMBASSADOR_LEVELS = ['100L', '200L', '300L', '400L', '500L', '600L'] as const;

export const AMBASSADOR_HEARD_OPTIONS = [
  "The Freshers' Advantage",
  'An A-Star tutorial',
  'A friend or coursemate',
  'WhatsApp',
  'Instagram',
  'TikTok',
  'Other',
];

export type AmbassadorStatus = 'pending' | 'approved' | 'rejected';

/**
 * A referral code students can read out and type: the first name in capitals
 * (letters only, up to 6) and three digits, e.g. TOLU482. Uniqueness is the
 * caller's job; this just proposes one.
 */
export function proposeReferralCode(fullName: string, random: () => number = Math.random): string {
  const first = fullName.trim().split(/\s+/)[0] ?? '';
  const letters = first.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) || 'ASTAR';
  const digits = String(Math.floor(random() * 900) + 100);
  return `${letters}${digits}`;
}

/** What an ambassador does, from Uche's brief. */
export const AMBASSADOR_ROLE = [
  'Tell students and parents about A-Star Tutorials',
  'Bring people to A-Star events',
  `Get students signed up for the Full Semester Plan with your code`,
];

/**
 * Benefits. Only what's been agreed so far; Uche is sending the full list
 * (2026-11-12), which replaces or extends this.
 */
export const AMBASSADOR_BENEFITS = [
  {
    title: 'Earn on every sign-up',
    desc: `₦${AMBASSADOR_COMMISSIONS.group.toLocaleString()} for each Group Semester Plan and ₦${AMBASSADOR_COMMISSIONS.private.toLocaleString()} for each Private Semester Plan bought with your code.`,
  },
  {
    title: 'Your own referral code',
    desc: 'A personal code that credits every sign-up to you. Share it in class, on WhatsApp, anywhere.',
  },
  {
    title: 'Paid monthly',
    desc: 'Commissions are added up and paid out at the end of every month.',
  },
];

export const AMBASSADOR_STEPS = [
  { title: 'Apply', desc: 'Fill in the short form on this page. It takes two minutes.' },
  { title: 'Get approved', desc: 'Our team reviews your application and emails you your referral code.' },
  { title: 'Share your code', desc: 'Tell coursemates and parents about A-Star and give them your code.' },
  { title: 'Earn', desc: 'Every Semester Plan paid for with your code earns you commission.' },
];
