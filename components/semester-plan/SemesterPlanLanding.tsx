"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  MessageCircle,
  PhoneCall,
  Repeat,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  Users,
  Wallet,
} from "lucide-react";
import posthog from "posthog-js";
import PlanModal, { type Audience, type PlanModalMode } from "./PlanModal";
import {
  SEMESTER_PLANS,
  SEMESTER_PLAN_IDS,
  SEMESTER_PLAN_TERM,
  SEMESTER_PLAN_PARENTS_HREF,
  SEMESTER_PLAN_HREF,
  perSessionPrice,
  type SemesterPlanId,
} from "@/lib/semester-plan";

/**
 * The same page in two voices. Students land on /semester-plan; the "Send to my
 * parents" button shares /semester-plan/parents, which leads with what a parent
 * weighs (value, consistency, who is teaching) instead of exam nerves.
 *
 * Copy is deliberately generic for now: no stats, testimonials or tutor names
 * until the team supplies real ones.
 */
const COPY: Record<
  Audience,
  { eyebrow: string; title: ReactNode; lead: string; why: string }
> = {
  student: {
    eyebrow: "New for 100L",
    title: (
      <>
        Your whole first semester,
        <br className="hidden sm:block" /> sorted.
      </>
    ),
    lead: "Stop booking tutorials one at a time the week before a test. Get 50 sessions with strong tutors who stay with you from the first lecture to the last exam.",
    why: "Why a whole semester?",
  },
  parent: {
    eyebrow: "For parents of 100L students",
    title: (
      <>
        Give your child a strong start
        <br className="hidden sm:block" /> at university.
      </>
    ),
    lead: "100 level sets the pattern for the rest of the degree. The Full Semester Plan gives your child 50 tutorial sessions across the first semester, taught by tutors who did well in the same courses.",
    why: "Why parents choose a full semester",
  },
};

const REASONS: Record<Audience, { icon: typeof Target; title: string; desc: string }[]> = {
  student: [
    {
      icon: Repeat,
      title: "Steady, not last-minute",
      desc: "Sessions run through the semester, so topics click as they're taught instead of the night before the test.",
    },
    {
      icon: Wallet,
      title: "One payment, all semester",
      desc: `One payment covers the semester. On the group plan that's about ₦${perSessionPrice(SEMESTER_PLANS.group).toLocaleString()} a session.`,
    },
    {
      icon: GraduationCap,
      title: "Tutors who've been there",
      desc: "Taught by students who did well in these exact courses and know where people lose marks.",
    },
    {
      icon: Target,
      title: "Built around your courses",
      desc: "Focused on your 100L courses, with revision ahead of tests and exams.",
    },
  ],
  parent: [
    {
      icon: ShieldCheck,
      title: "One decision, the whole semester",
      desc: "One payment covers the semester. No repeat requests for money every time a test is coming.",
    },
    {
      icon: Repeat,
      title: "Consistency that builds habits",
      desc: "Regular sessions from week one keep your child on top of their courses instead of catching up later.",
    },
    {
      icon: GraduationCap,
      title: "Strong, experienced tutors",
      desc: "Tutors are students who excelled in the same courses at the same university, and know what lecturers expect.",
    },
    {
      icon: HeartHandshake,
      title: "A team you can talk to",
      desc: "Questions before or during the semester? Reach the A-Star team directly on WhatsApp.",
    },
  ],
};

const STEPS = [
  { title: "Pick a plan", desc: "Group or private, for the first semester." },
  { title: "Pay or talk to us", desc: "Pay securely on Paystack, or leave your details and we'll call." },
  { title: "Get matched", desc: "We confirm your courses on WhatsApp and set up your tutor and timetable." },
  { title: "Learn all semester", desc: "Your sessions run from the first weeks right up to exams." },
];

const FAQS: Record<Audience, { q: string; a: string }[]> = {
  student: [
    {
      q: "What's the difference between group and private?",
      a: "Group sessions are small classes with your coursemates. Private sessions are one-on-one with a tutor who works at your pace.",
    },
    {
      q: "Can I still book single tutorials?",
      a: "Yes. Book a Tutorial works exactly as before. The Full Semester Plan is an extra option for students who want the whole semester covered.",
    },
    {
      q: "My parents pay for my tutorials. How do I show them?",
      a: "Tap “Send to my parents”. It opens WhatsApp with a short message and a page written for them, where they can pay directly or ask for a call.",
    },
    {
      q: "Which courses are covered?",
      a: "Your 100L first-semester courses. We confirm your exact courses with you on WhatsApp once you sign up.",
    },
  ],
  parent: [
    {
      q: "Who are the tutors?",
      a: "Students who excelled in the same courses at the same university. They know the material, the lecturers' expectations and the common pitfalls.",
    },
    {
      q: "What's the difference between group and private?",
      a: "Group sessions are small classes with coursemates. Private sessions are one-on-one, scheduled around your child's timetable and paced to them.",
    },
    {
      q: "Can I pay for my child directly?",
      a: "Yes. Choose a plan, select “Parent / guardian”, and pay securely on Paystack. The receipt comes to your email.",
    },
    {
      q: "I'd like to ask questions before paying.",
      a: "Choose “Call me first” and leave your details. Someone from A-Star will reach out by phone or WhatsApp.",
    },
  ],
};

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fade}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="text-center">
      {eyebrow && (
        <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-brand-ink">{eyebrow}</p>
      )}
      <h2 className="mt-2.5 text-3xl md:text-4xl font-bold tracking-tight text-fg">{title}</h2>
    </div>
  );
}

function parentShareUrl() {
  // Not window.location: the link is rendered on the server too, and it must
  // match on hydration.
  const origin = process.env.NEXT_PUBLIC_BASE_URL ?? "https://astartutorials.com";
  const group = SEMESTER_PLANS.group;
  const priv = SEMESTER_PLANS.private;
  const text = [
    "Hi! A-Star Tutorials has a Full Semester Plan for 100L students: tutorials for the whole first semester, with strong tutors.",
    "",
    `• Group: ₦${group.price.toLocaleString()} for ${group.sessions} sessions (about ₦${perSessionPrice(group).toLocaleString()} each)`,
    `• Private one-on-one: ₦${priv.price.toLocaleString()} for ${priv.sessions} sessions`,
    "",
    "I think it would really help me this semester. Can you take a look?",
    `${origin}${SEMESTER_PLAN_PARENTS_HREF}`,
  ].join("\n");
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function SendToParentsButton({ source, className = "" }: { source: string; className?: string }) {
  return (
    <a
      href={parentShareUrl()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => posthog.capture("semester_plan_shared_with_parent", { source })}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface-raised px-7 py-4 text-base font-bold text-fg hover:border-line-strong hover:-translate-y-0.5 transition-all ${className}`}
    >
      <MessageCircle size={19} className="text-green-600" /> Send to my parents
    </a>
  );
}

export default function SemesterPlanLanding({ audience }: { audience: Audience }) {
  const [modal, setModal] = useState<{ plan: SemesterPlanId; mode: PlanModalMode } | null>(null);
  const copy = COPY[audience];

  const open = (plan: SemesterPlanId, mode: PlanModalMode, source: string) => {
    posthog.capture("semester_plan_cta_clicked", { plan, mode, source, audience });
    setModal({ plan, mode });
  };

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] font-sans selection:bg-[var(--astar-red)] selection:text-white">
      {modal && (
        <PlanModal
          initialPlan={modal.plan}
          initialMode={modal.mode}
          audience={audience}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 md:pt-36 pb-14 md:pb-20">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fade}>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft border border-brand-soft-border px-4 py-1.5 text-sm font-semibold text-brand-ink">
              <Sparkles size={15} /> {copy.eyebrow} · {SEMESTER_PLAN_TERM}
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-fg leading-[1.05]">
              {copy.title}
            </h1>

            <p className="mt-5 max-w-2xl mx-auto text-lg md:text-xl text-fg-subtle leading-relaxed">
              {copy.lead}
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
              <a
                href="#plans"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--astar-red)] text-white px-8 py-4 text-base font-bold shadow-lg shadow-red-500/20 hover:bg-brand-hover hover:-translate-y-0.5 transition-all"
              >
                See the plans
                <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform" />
              </a>
              {audience === "student" ? (
                <SendToParentsButton source="hero" />
              ) : (
                <button
                  onClick={() => open("group", "enquire", "hero")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface-raised px-7 py-4 text-base font-bold text-fg hover:border-line-strong hover:-translate-y-0.5 transition-all"
                >
                  <PhoneCall size={18} /> Talk to us first
                </button>
              )}
            </div>
            {audience === "student" && (
              <p className="mt-4 text-sm text-fg-faint">
                Parents paying? Send them a page written just for them.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── PLANS ──────────────────────────────────────────── */}
      <section id="plans" className="scroll-mt-24 max-w-5xl mx-auto px-4 sm:px-6 pb-16 md:pb-24">
        <Reveal>
          <SectionHead eyebrow="The Plans" title="One payment. The whole semester." />
        </Reveal>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {SEMESTER_PLAN_IDS.map((id) => {
            const p = SEMESTER_PLANS[id];
            const featured = id === "private";
            const Icon = id === "group" ? Users : User;
            return (
              <Reveal
                key={id}
                className={`relative flex flex-col rounded-3xl p-7 md:p-9 shadow-xl ${
                  featured
                    ? "bg-[var(--astar-navy)] text-white"
                    : "bg-surface-raised border border-line-subtle"
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 right-6 rounded-full bg-[var(--astar-red)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    One-on-one
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Icon size={20} className={featured ? "text-red-300" : "text-brand-ink"} />
                  <h3 className={`text-lg font-bold ${featured ? "text-white" : "text-fg"}`}>{p.name}</h3>
                </div>
                <p className={`mt-1 text-sm ${featured ? "text-on-dark-muted" : "text-fg-subtle"}`}>{p.blurb}</p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className={`text-4xl md:text-5xl font-extrabold tracking-tight ${featured ? "text-white" : "text-fg"}`}>
                    ₦{p.price.toLocaleString()}
                  </span>
                  <span className={featured ? "text-on-dark-muted" : "text-fg-faint"}>/ semester</span>
                </div>
                <p className={`mt-1 text-sm font-semibold ${featured ? "text-red-300" : "text-brand-ink"}`}>
                  {p.sessions} sessions · about ₦{perSessionPrice(p).toLocaleString()} each
                </p>

                <ul className="mt-6 space-y-3 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm md:text-base">
                      <CheckCircle2
                        size={19}
                        className={`mt-0.5 flex-shrink-0 ${featured ? "text-red-300" : "text-brand-ink"}`}
                      />
                      <span className={featured ? "text-white/90" : "text-fg-muted"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-2.5">
                  <button
                    onClick={() => open(id, "pay", `plan-${id}`)}
                    className="w-full rounded-xl bg-[var(--astar-red)] text-white py-3.5 font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-hover transition-all shadow-lg"
                  >
                    Get the {id === "group" ? "Group" : "Private"} Plan <ArrowRight size={17} />
                  </button>
                  <button
                    onClick={() => open(id, "enquire", `plan-${id}`)}
                    className={`w-full rounded-xl py-3 text-sm font-semibold transition-colors ${
                      featured
                        ? "text-white/80 hover:text-white hover:bg-white/5"
                        : "text-fg-subtle hover:text-fg hover:bg-surface-sunken"
                    }`}
                  >
                    Have questions? Request a call
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-fg-faint">
          Just need one session?{" "}
          <Link href="/tutorials" className="font-semibold text-brand-ink underline underline-offset-2">
            Book a single tutorial
          </Link>
        </p>
      </section>

      {/* ── WHY ────────────────────────────────────────────── */}
      <section className="bg-[var(--astar-navy)] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <Reveal>
            <div className="text-center">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-red-300">The Difference</p>
              <h2 className="mt-2.5 text-3xl md:text-4xl font-bold tracking-tight text-white">{copy.why}</h2>
            </div>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {REASONS[audience].map(({ icon: Icon, title, desc }) => (
              <Reveal key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <Icon size={24} className="text-red-300" />
                <h3 className="mt-4 font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm text-on-dark-muted leading-relaxed">{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <Reveal>
          <SectionHead eyebrow="How It Works" title="Four steps to a sorted semester" />
        </Reveal>
        <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.title}>
              <li className="h-full rounded-2xl bg-surface-raised border border-line-subtle p-6">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand-ink font-bold">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-bold text-fg">{s.title}</h3>
                <p className="mt-1.5 text-sm text-fg-subtle leading-relaxed">{s.desc}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead eyebrow="Questions" title="Good to know" />
        </Reveal>
        <div className="mt-8 space-y-3">
          {FAQS[audience].map((f) => (
            <Reveal key={f.q}>
              <details className="group rounded-2xl bg-surface-raised border border-line-subtle px-6 py-4">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold text-fg">
                  {f.q}
                  <span className="text-brand-ink text-xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-fg-subtle leading-relaxed">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CLOSING CTA ────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 md:pb-28">
        <Reveal className="rounded-3xl bg-[var(--astar-red)] px-6 py-12 md:px-12 md:py-14 text-center text-white shadow-xl">
          <CalendarRange size={32} className="mx-auto text-white/90" />
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
            {audience === "student" ? "Make this semester the one that sets you up." : "Set them up for the whole semester."}
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
            <button
              onClick={() => open("group", "pay", "closing")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-[var(--astar-red)] px-8 py-4 text-base font-bold hover:-translate-y-0.5 transition-all"
            >
              Choose a plan <ArrowRight size={19} />
            </button>
            {audience === "student" ? (
              <SendToParentsButton source="closing" className="!border-white/30 !bg-white/10 !text-white" />
            ) : (
              <Link
                href={SEMESTER_PLAN_HREF}
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all"
              >
                See the student page
              </Link>
            )}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
