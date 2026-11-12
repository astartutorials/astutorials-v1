import { SEMESTER_PLANS, SEMESTER_PLAN_TERM, perSessionPrice } from '@/lib/semester-plan';
import { AMBASSADOR_COMMISSIONS, referralDiscount } from '@/lib/ambassador';

/**
 * Every FAQ answer on the site. The homepage shows the ones marked `home`;
 * /faq shows them all, grouped. Facts confirmed by the user and Uche on
 * 2026-11-12: private tutorials are matched by A-Star at ₦6,090 a session,
 * tutorials run both in person and online, and payments are non-refundable
 * except duplicate payments.
 */
export interface Faq {
  question: string;
  answer: string;
  /** Shown on the homepage as well as /faq. */
  home?: boolean;
}

export interface FaqGroup {
  title: string;
  items: Faq[];
}

const group = SEMESTER_PLANS.group;
const priv = SEMESTER_PLANS.private;
const naira = (n: number) => `₦${n.toLocaleString()}`;

export const WHATSAPP_NUMBER_LABEL = '0916 046 5678';
export const SUPPORT_EMAIL = 'support@astartutorials.com';

export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: 'Booking',
    items: [
      {
        question: 'How do I book a group tutorial?',
        answer:
          'Go to Tutorials, pick a session for your course and pay online with Paystack. You’ll get a confirmation email straight away. Seats are limited, so book early.',
        home: true,
      },
      {
        question: 'How do private (one-on-one) tutorials work?',
        answer:
          'Pay ₦6,090 for a session, then fill in a short form with your course, goals and preferred times. We’ll match you with a tutor who fits and set things up with you on WhatsApp.',
      },
      {
        question: 'Who are the tutors?',
        answer:
          'High-performing students who have excelled in the courses they teach and passed our vetting process.',
      },
      {
        question: 'Are tutorials in person or online?',
        answer:
          'Both. Each group tutorial shows where it holds. For private tutorials, tell us which you prefer and we’ll arrange it.',
      },
    ],
  },
  {
    title: 'Full Semester Plan',
    items: [
      {
        question: 'What is the Full Semester Plan?',
        answer: `A whole semester of tutorials paid for once: ${group.sessions} sessions across ${SEMESTER_PLAN_TERM}, built for 100 level students at Babcock. Group is ${naira(group.price)} (about ${naira(perSessionPrice(group))} a session) and Private is ${naira(priv.price)} (${naira(perSessionPrice(priv))} a session).`,
        home: true,
      },
      {
        question: 'Can my parents pay for me?',
        answer:
          'Yes. On the Semester Plan page, choose “Parent / guardian” and the receipt goes to their email. If they’d rather talk to someone first, pick “Call me first” and we’ll reach out.',
        home: true,
      },
      {
        question: 'What happens after I pay?',
        answer: 'You’ll get a receipt by email. Then message us on WhatsApp and we’ll enrol you and sort out your schedule.',
      },
      {
        // Remove once ASTAR20K is used up.
        question: 'Is there a discount?',
        answer:
          'Yes. Use code ASTAR20K at checkout for ₦20,000 off either plan. It’s for the first 100 subscriptions only.',
        home: true,
      },
    ],
  },
  {
    title: 'Earning with A-Star',
    items: [
      {
        question: 'Can I earn money with A-Star?',
        answer: `Yes. Become an A-Star Ambassador. Apply at astartutorials.com/ambassador; once you’re approved, you get your own referral code. Anyone who uses it gets 10% off, and you earn ${naira(AMBASSADOR_COMMISSIONS.group)} for every Group Semester Plan and ${naira(AMBASSADOR_COMMISSIONS.private)} for every Private Semester Plan bought with it, paid monthly.`,
        home: true,
      },
      {
        question: 'I have an ambassador’s referral code. What do I get?',
        answer: `10% off your Semester Plan (${naira(referralDiscount('group'))} off Group, ${naira(referralDiscount('private'))} off Private). Enter it in the discount or referral code box at checkout. One code per order, so it can’t be combined with another code.`,
      },
      {
        question: 'Can I teach with A-Star?',
        answer: 'If you’re a high-performing student, apply to become a tutor at astartutorials.com/apply.',
      },
    ],
  },
  {
    title: 'Payments and help',
    items: [
      {
        question: 'Can I get a refund?',
        answer:
          'Payments for Semester Plans and individual tutorial bookings are non-refundable. The only exception is a duplicate payment: if you were charged twice for the same thing, message us on WhatsApp and we’ll refund the extra payment.',
      },
      {
        question: 'How do I reach you?',
        answer: `WhatsApp us on ${WHATSAPP_NUMBER_LABEL} or email ${SUPPORT_EMAIL}.`,
      },
    ],
  },
];

export const ALL_FAQS: Faq[] = FAQ_GROUPS.flatMap((g) => g.items);
export const HOME_FAQS: Faq[] = ALL_FAQS.filter((f) => f.home);
