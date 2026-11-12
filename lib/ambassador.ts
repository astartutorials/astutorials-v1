import { SEMESTER_PLANS } from '@/lib/semester-plan';

/**
 * Single source of truth for the A-Star Ambassadors programme (/ambassador).
 *
 * Students apply, an admin approves them and assigns a unique referral code,
 * and they earn a commission on every Full Semester Plan bought with it. Brief
 * from Uche, 2026-11-12. Babcock is the test market.
 *
 * A student who pays with an ambassador's code gets 10% off; the ambassador
 * earns a flat commission per plan, whatever the discount. One code per
 * checkout, and an ambassador can't use their own (Uche, 2026-11-12).
 * Payouts are manual and monthly. Not built yet: a dashboard for ambassadors.
 */
export const AMBASSADOR_PROGRAMME_NAME = 'A-Star Ambassadors';
export const AMBASSADOR_HREF = '/ambassador';

/**
 * Flat commission per referred plan. Uche described it as 5% of the list
 * price, but confirmed it stays flat when the student pays less.
 */
export const AMBASSADOR_COMMISSIONS = {
  group: 5000,
  private: 15000,
} as const;

/** What a student saves by paying with an ambassador's referral code. */
export const REFERRAL_DISCOUNT_RATE = 0.1;

export function referralDiscount(plan: keyof typeof SEMESTER_PLANS): number {
  return Math.round(SEMESTER_PLANS[plan].price * REFERRAL_DISCOUNT_RATE);
}

export const AMBASSADOR_LEVELS = ['100L', '200L', '300L', '400L', '500L', '600L'] as const;

export const AMBASSADOR_INSTITUTIONS = ['Babcock University'] as const;

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

/** Benefits, from Uche's list (2026-11-12). */
export const AMBASSADOR_BENEFITS = [
  {
    title: 'Commission on every referral',
    desc: `Up to ₦${AMBASSADOR_COMMISSIONS.private.toLocaleString()} per sign-up: ₦${AMBASSADOR_COMMISSIONS.group.toLocaleString()} for each Group Semester Plan and ₦${AMBASSADOR_COMMISSIONS.private.toLocaleString()} for each Private Semester Plan bought with your code. Paid monthly.`,
  },
  {
    title: 'Your friends save 10%',
    desc: 'Anyone who uses your code gets 10% off their Semester Plan, so it’s an easy yes.',
  },
  {
    title: 'Discount on your own semester',
    desc: 'Ambassadors get a discount on their own Semester Plan subscription.',
  },
  {
    title: 'Sales & marketing training',
    desc: 'Learn how to pitch, sell and build an audience, skills that last beyond university.',
  },
  {
    title: 'A-Star merch',
    desc: 'A-Star Tutorials branded merchandise to rep on campus.',
  },
  {
    title: 'Early access',
    desc: 'Be first to try new A-Star Tutorials products before anyone else.',
  },
  {
    title: 'Ambassadors’ community',
    desc: 'An exclusive community of ambassadors across departments.',
  },
  {
    title: 'Internship opportunity',
    desc: 'Top ambassadors can be considered for an internship at A-Star Tutorials.',
  },
];

export const AMBASSADOR_STEPS = [
  { title: 'Apply', desc: 'Fill in the form on this page, including where to pay your commission.' },
  { title: 'Get approved', desc: 'Our team reviews your application and emails you your referral code.' },
  { title: 'Share your code', desc: 'Tell coursemates and parents about A-Star and give them your code.' },
  { title: 'Earn', desc: 'Every Semester Plan paid for with your code earns you commission.' },
];
