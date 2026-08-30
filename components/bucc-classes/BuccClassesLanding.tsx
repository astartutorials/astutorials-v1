"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code2,
  CheckCircle2,
  Trophy,
  CalendarDays,
  Users,
  Sparkles,
  Gift,
  ArrowRight,
  BadgeCheck,
  Sigma,
  Binary,
  Blocks,
  Network,
  Radio,
  ListChecks,
  ClipboardCheck,
  MessagesSquare,
  Medal,
  TrendingUp,
  Wallet,
  Hourglass,
  Rocket,
  GraduationCap,
  Quote,
} from "lucide-react";
import posthog from "posthog-js";
import RegisterModal from "./RegisterModal";
import { useBuccOpen } from "@/components/shared/useBuccOpen";
import { useBuccClassesOpen } from "@/components/shared/useBuccClassesOpen";
import {
  ProgrammeEndedBanner,
  ProgrammeEndedCta,
} from "@/components/shared/ProgrammeEnded";
import { BUCC_EVENT_NAME, BUCC_DATE_LABEL, BUCC_TIME_LABEL } from "@/lib/bucc";
import {
  BUCC_CLASSES_NAME,
  BUCC_CLASSES_PRICE as PRICE,
  BUCC_CLASSES_OLD_PRICE as OLD_PRICE,
  BUCC_CLASSES_DATE_RANGE as DATE_RANGE,
  BUCC_CLASSES_COURSES as COURSES,
  BUCC_CLASSES_FEATURES,
} from "@/lib/bucc-classes";

const FEATURES = [
  { icon: BadgeCheck, label: BUCC_CLASSES_FEATURES[0] },
  { icon: Trophy, label: BUCC_CLASSES_FEATURES[1] },
  { icon: Users, label: BUCC_CLASSES_FEATURES[2] },
];

const INTRO_PARAS = [
  "200 level is where the School of Computing stops being an introduction.",
  "For most students the problem isn’t ability — it’s that the courses suddenly assume things nobody formally taught them. Programming moves from syntax to structure, mathematics stops being computational and starts being abstract, and software engineering asks you to reason about systems you’ve never built.",
  "By the time the concepts finally click, the semester has already moved on.",
  "That’s why A-Star Tutorials built the BUCC 200L Preparatory Programme.",
  "Over four weeks before resumption, you’ll build a working understanding of the core courses — so lectures become revision instead of first contact.",
];

const TUTOR_POINTS = [
  "the concepts that quietly break people",
  "the mistakes that cost marks in tests",
  "how to actually study a programming course",
  "how to turn abstract maths into something you can use",
];

/**
 * The flyer prints course codes only. The subtitles here name the discipline the
 * prefix belongs to (SEN → Software Engineering, MTH → Mathematics, and so on),
 * not the official course title — those aren't on the flyer, and putting a
 * guessed title in front of students who know better would read as sloppy.
 */
const STUDY = [
  {
    icon: Blocks,
    code: "SEN 201",
    discipline: "Software Engineering",
    desc: "Move from writing code that runs to designing software that holds together — structure, process and the vocabulary the rest of the degree assumes you have.",
  },
  {
    icon: Sigma,
    code: "MTH 201",
    discipline: "Mathematics",
    desc: "The step from computation to abstraction, taught slowly enough to actually follow, with worked problems until the method is yours.",
  },
  {
    icon: Binary,
    code: "COS 201",
    discipline: "Computer Science",
    desc: "The core computing concepts 200 level is built on, taught from first principles rather than assumed knowledge.",
  },
  {
    icon: Network,
    code: "IFT 211",
    discipline: "Information Technology",
    desc: "The systems-and-infrastructure side of computing — the material that looks easy until it’s an exam question.",
  },
];

const DIFFERENTIATORS = [
  {
    icon: Radio,
    title: "Live Interactive Classes",
    desc: "Ask questions in real time and understand concepts instead of memorising slides.",
  },
  {
    icon: ListChecks,
    title: "Daily Quizzes",
    desc: "Every lesson ends with a short quiz while the concept is still fresh — the single cheapest way to make something stick.",
  },
  {
    icon: ClipboardCheck,
    title: "Weekly Assessments",
    desc: "Longer weekly tests in the shape of real university papers, with performance reports so you know where you actually stand.",
  },
  {
    icon: MessagesSquare,
    title: "Community Learning",
    desc: "A cohort of coursemates working through the same material — debugging together, arguing about solutions, and keeping each other honest.",
  },
];

const REWARDS = [
  { icon: Trophy, label: "Cash Prizes" },
  { icon: Medal, label: "Public Recognition" },
  { icon: TrendingUp, label: "Leaderboard Rankings" },
];

const WEEKS = [
  {
    week: "Week One",
    title: "Foundations",
    desc: "How to study a computing course, the notation and vocabulary you’ll need, and the groundwork each course builds on.",
  },
  {
    week: "Week Two",
    title: "Core Concepts",
    desc: "Into the substance of SEN 201, MTH 201, COS 201 and IFT 211. Daily quizzes begin in earnest.",
  },
  {
    week: "Week Three",
    title: "Depth & Integration",
    desc: "Harder material, and the connections between courses that make each one easier. First full weekly assessment.",
  },
  {
    week: "Week Four",
    title: "Revision & Rankings",
    desc: "Comprehensive revision, final assessments, leaderboard rankings, prize announcements and a resumption game plan.",
  },
];

const TIMETABLE = [
  { day: "Monday", subject: "SEN 201" },
  { day: "Tuesday", subject: "MTH 201" },
  { day: "Wednesday", subject: "COS 201" },
  { day: "Thursday", subject: "IFT 211" },
  { day: "Friday", subject: "Problem-solving clinic", accent: true },
  { day: "Saturday", subject: "Weekly Assessment", accent: true },
  { day: "Sunday", subject: "Revision & Personal Study", accent: true },
];

const BENEFITS = [
  "Four weeks of structured live teaching",
  "Four core 200-level courses",
  "Daily quizzes",
  "Weekly assessments",
  "Distinction-level tutors",
  "Comprehensive learning materials",
  "Academic support between classes",
  "An active student community",
  "Cash prizes",
  "Confidence before resumption",
];

const ENROL = [
  "Students moving into 200 level in the School of Computing",
  "100-level students who want to resume already ahead",
  "Students who found 100 level harder than expected",
  "Students aiming for a first class and treating it seriously",
  "Anyone who would rather prepare than catch up",
];

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

function RegisterButton({
  onClick,
  label = "Register Now",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] text-white px-8 py-4 text-base font-bold shadow-lg shadow-red-500/20 hover:bg-brand-hover hover:-translate-y-0.5 transition-all"
    >
      {label}
      <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

function SectionHead({
  eyebrow,
  title,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      {eyebrow && (
        <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-brand-ink">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2.5 text-3xl md:text-4xl font-bold tracking-tight text-fg">
        {title}
      </h2>
    </div>
  );
}

export default function BuccClassesLanding() {
  const [open, setOpen] = useState(false);
  // The cohort stays linked from Programmes after it finishes, so the page has
  // to stop selling a spot once it has ended.
  const registrationOpen = useBuccClassesOpen();
  // The free webinar feeds this cohort; the cross-link retires itself when it ends.
  const advantageOpen = useBuccOpen();

  const openModal = (source: string) => {
    posthog.capture("bucc_classes_register_clicked", { source });
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] font-sans selection:bg-[var(--astar-red)] selection:text-white">
      {open && <RegisterModal onClose={() => setOpen(false)} />}

      {!registrationOpen && (
        <ProgrammeEndedBanner
          name={BUCC_CLASSES_NAME}
          ranLabel={DATE_RANGE}
          href="/bucc"
        />
      )}

      {/* ── HERO ───────────────────────────────────────────── */}
      <section
        className={`relative overflow-hidden pb-16 md:pb-20 ${
          registrationOpen ? 'pt-28 md:pt-36' : 'pt-10 md:pt-14'
        }`}
      >
        {/* graph-paper grid, like the flyer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(53,94,169,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(53,94,169,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fade}>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-900/5 border border-blue-900/10 px-4 py-1.5 text-sm font-semibold text-accent-ink">
              <CalendarDays size={15} /> {DATE_RANGE}
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-ink leading-[1.05]">
              Resume 200 Level
              <br className="hidden sm:block" /> Ahead of Everyone Else
            </h1>

            <p className="mt-5 text-lg md:text-2xl text-fg font-semibold">
              Maximise your break. Resume with confidence.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-base md:text-lg text-fg-subtle">
              <Sparkles size={17} className="text-brand-ink" /> Get tutored by distinction
              students!
            </p>

            {/* Pricing + CTA */}
            <div className="mt-9 flex flex-col items-center gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-fg-faint line-through text-xl">
                  ₦{OLD_PRICE.toLocaleString()}
                </span>
                <span className="text-4xl md:text-5xl font-extrabold text-fg">
                  ₦{PRICE.toLocaleString()}
                </span>
                <span className="text-fg-subtle text-lg">only</span>
              </div>
              {registrationOpen ? (
                <>
                  <RegisterButton onClick={() => openModal("hero")} />
                  <p className="text-xs text-fg-faint">
                    Limited slots · Secure payment via Paystack
                  </p>
                </>
              ) : (
                <ProgrammeEndedCta href="/bucc" />
              )}
            </div>
          </motion.div>
        </div>

        {/* decorative glyph */}
        <Code2
          className="pointer-events-none absolute -right-10 top-24 text-blue-900/5 hidden lg:block"
          size={260}
          strokeWidth={1}
        />
      </section>

      {/* ── COURSES + FEATURING ────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Courses card */}
          <Reveal className="rounded-3xl bg-blue-900 p-8 md:p-10 text-white shadow-xl">
            <h2 className="text-yellow-300 font-bold tracking-wide text-lg uppercase">Courses</h2>
            <ul className="mt-6 space-y-4">
              {COURSES.map((c) => (
                <li key={c} className="flex items-center gap-3 text-lg md:text-xl font-medium">
                  <CheckCircle2 size={22} className="text-yellow-300 flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Featuring card */}
          <Reveal className="rounded-3xl bg-[var(--astar-red)] p-8 md:p-10 text-white shadow-xl">
            <h2 className="text-yellow-300 font-bold tracking-wide text-lg uppercase">Featuring</h2>
            <ul className="mt-6 space-y-5">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-lg md:text-xl font-medium">
                  <Icon size={22} className="text-yellow-300 flex-shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-red-100/90 leading-relaxed">
              Learn alongside your coursemates, stay accountable with regular quizzes, and win cash
              prizes for topping the leaderboard.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── INTRO NARRATIVE ────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead eyebrow="The Advantage" title="Don’t resume hoping to catch up" />
          <div className="mt-8 space-y-5 text-center text-fg-muted md:text-lg leading-relaxed">
            {INTRO_PARAS.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className="mt-8 text-center text-xl md:text-2xl font-bold text-fg">
            Resume already prepared.
          </p>
        </Reveal>
      </section>

      {/* ── WHY THIS PROGRAMME EXISTS ──────────────────────── */}
      <section className="bg-[var(--astar-navy)] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <Reveal>
            <SectionHead
              eyebrow="Why It Exists"
              title="The jump nobody warns you about"
              className="[&_h2]:text-white [&_p]:text-red-300"
            />
            <div className="mt-8 max-w-3xl mx-auto space-y-5 text-center text-on-dark-muted md:text-lg leading-relaxed">
              <p>
                100 level got you into the School of Computing. 200 level is where your academic
                reputation is actually built — and it opens with four courses that assume a
                foundation most students are still missing:
              </p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              {COURSES.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-8 max-w-3xl mx-auto text-center text-on-dark-muted md:text-lg leading-relaxed">
              Many students spend the first semester working out what the lecturer is even talking
              about. Our goal is simple: flatten that learning curve before school resumes. Instead
              of decoding basics during lectures, you’ll already have the foundation the rest of the
              semester is built on.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── LEARN FROM TUTORS ──────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <Reveal>
          <SectionHead eyebrow="Your Tutors" title="Learn from students who’ve already done it" />
          <div className="mt-8 rounded-3xl bg-surface-raised border border-line-subtle shadow-sm p-8 md:p-10">
            <Quote className="text-brand-ink" size={32} />
            <p className="mt-3 text-xl md:text-2xl font-bold text-fg leading-snug">
              Anyone can teach. Not everyone can teach from experience.
            </p>
            <p className="mt-5 text-fg-muted md:text-lg leading-relaxed">
              Every tutor on this programme has taken these exact courses and come out with a
              distinction. They know:
            </p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-3">
              {TUTOR_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-fg-muted">
                  <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0 text-brand-ink" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-fg-muted md:text-lg leading-relaxed">
              Rather than learning by trial and error, you’ll learn from people who were sitting
              where you are one year ago.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── FREE WEBINAR CROSS-LINK ────────────────────────── */}
      {advantageOpen && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
          <Reveal className="rounded-3xl bg-[var(--astar-navy)] p-8 md:p-12 text-white shadow-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] px-4 py-1.5 text-sm font-bold">
              <Gift size={15} /> Free Webinar
            </span>
            <h2 className="mt-5 text-2xl md:text-3xl font-bold">{BUCC_EVENT_NAME}</h2>
            <p className="mt-2 text-on-dark-muted md:text-lg">
              Not ready to commit yet? Start with the free 90-minute session — honest advice from
              seniors already doing 200 level well, and a live Q&amp;A.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm md:text-base text-gray-200">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={18} className="text-brand-on-dark" /> {BUCC_DATE_LABEL}
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles size={18} className="text-brand-on-dark" /> {BUCC_TIME_LABEL}
              </span>
            </div>
            <Link
              href="/bucc/advantage"
              onClick={() => posthog.capture("bucc_classes_webinar_clicked")}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white text-[var(--astar-navy)] px-7 py-3.5 font-bold hover:bg-gray-100 transition-all"
            >
              Reserve a free seat <ArrowRight size={18} />
            </Link>
          </Reveal>
        </section>
      )}

      {/* ── WHAT YOU'LL STUDY ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead eyebrow="Curriculum" title="What you’ll study" />
        </Reveal>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {STUDY.map(({ icon: Icon, code, discipline, desc }) => (
            <Reveal
              key={code}
              className="rounded-2xl bg-surface-raised border border-line-subtle shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                <Icon size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-fg">{code}</h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink">
                {discipline}
              </p>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed">{desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── WHAT MAKES IT DIFFERENT ────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead
            eyebrow="The Difference"
            title="We don’t just teach — we build learning systems"
          />
          <p className="mt-4 text-center text-fg-subtle md:text-lg max-w-2xl mx-auto">
            Every feature is designed to improve retention, consistency and performance.
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {DIFFERENTIATORS.map(({ icon: Icon, title, desc }) => (
            <Reveal
              key={title}
              className="rounded-2xl bg-surface-raised border border-line-subtle shadow-sm p-7 flex gap-4"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--astar-navy)] text-white">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-fg">{title}</h3>
                <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── REWARDS ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal className="rounded-3xl bg-gradient-to-br from-[var(--astar-red)] to-red-700 p-8 md:p-12 text-white shadow-xl text-center">
          <SectionHead
            eyebrow="Rewards for Excellence"
            title="Hard work deserves recognition"
            className="[&_h2]:text-white [&_p]:text-yellow-200"
          />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {REWARDS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                  <Icon size={30} className="text-yellow-300" />
                </div>
                <p className="text-lg font-bold">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-red-100/90">Healthy competition produces better performance.</p>
        </Reveal>
      </section>

      {/* ── FOUR-WEEK JOURNEY ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead eyebrow="The Roadmap" title="Your four-week journey" />
        </Reveal>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WEEKS.map(({ week, title, desc }, i) => (
            <Reveal
              key={week}
              className="relative rounded-2xl bg-surface-raised border border-line-subtle shadow-sm p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--astar-red)] text-white font-bold">
                {i + 1}
              </span>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-brand-ink">
                {week}
              </p>
              <h3 className="mt-1 text-lg font-bold text-fg leading-tight">{title}</h3>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed">{desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── WEEKLY STRUCTURE ───────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead eyebrow="Weekly Rhythm" title="Weekly learning structure" />
          <div className="mt-10 overflow-hidden rounded-2xl border border-line-subtle bg-surface-raised shadow-sm divide-y divide-line-subtle">
            {TIMETABLE.map(({ day, subject, accent }) => (
              <div
                key={day}
                className={`flex items-center justify-between px-6 py-4 ${
                  accent ? "bg-brand-soft" : ""
                }`}
              >
                <span className="font-semibold text-fg">{day}</span>
                <span
                  className={`text-sm font-medium ${accent ? "text-brand-ink" : "text-fg-muted"}`}
                >
                  {subject}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-fg-faint">
            Indicative structure — a detailed timetable will be provided after registration.
          </p>
        </Reveal>
      </section>

      {/* ── BENEFITS ───────────────────────────────────────── */}
      <section className="bg-[var(--astar-navy)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <Reveal>
            <SectionHead
              eyebrow="Everything Included"
              title="What you get when you join"
              className="[&_h2]:text-white [&_p]:text-red-300"
            />
            <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0 text-brand-on-dark" />
                  <span className="text-gray-200">{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── WHO SHOULD ENROL ───────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <Reveal>
          <SectionHead eyebrow="Is This You?" title="Who should enrol" />
          <div className="mt-8 flex justify-center">
            <GraduationCap className="text-brand-ink" size={40} />
          </div>
          <ul className="mt-8 max-w-2xl mx-auto space-y-3">
            {ENROL.map((e) => (
              <li
                key={e}
                className="flex items-start gap-3 rounded-xl bg-surface-raised border border-line-subtle shadow-sm px-5 py-4"
              >
                <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0 text-brand-ink" />
                <span className="text-fg-muted">{e}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ── PROGRAMME DETAILS ──────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead eyebrow="Programme Details" title="Duration & investment" />
        </Reveal>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Reveal className="rounded-3xl bg-surface-raised border border-line-subtle shadow-sm p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-accent-ink">
              <CalendarDays size={24} />
            </div>
            <h3 className="mt-4 text-sm font-bold uppercase tracking-wider text-fg-faint">
              Duration
            </h3>
            <p className="mt-2 text-2xl font-extrabold text-fg">{DATE_RANGE}</p>
            <p className="mt-2 text-fg-muted leading-relaxed">
              Four weeks · Completely online · Attend from anywhere.
            </p>
          </Reveal>

          <Reveal className="rounded-3xl bg-surface-raised border border-line-subtle shadow-sm p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
              <Wallet size={24} />
            </div>
            <h3 className="mt-4 text-sm font-bold uppercase tracking-wider text-fg-faint">
              Investment
            </h3>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-lg text-fg-faint line-through">
                ₦{OLD_PRICE.toLocaleString()}
              </span>
              <span className="text-3xl font-extrabold text-brand-ink">
                ₦{PRICE.toLocaleString()}
              </span>
            </p>
            <p className="mt-2 text-fg-muted leading-relaxed">
              One payment. Four weeks. All four courses, quizzes and materials included.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── THE COST OF WAITING ────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal className="rounded-3xl border border-brand-soft-border bg-brand-soft p-8 md:p-12">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--astar-red)] text-white">
              <Hourglass size={26} />
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl md:text-3xl font-bold text-fg">
            The cost of waiting
          </h2>
          <div className="mt-6 max-w-2xl mx-auto space-y-4 text-center text-fg-muted md:text-lg leading-relaxed">
            <p>
              Every session, students resume telling themselves they’ll “catch up later.” Some
              manage it. Many don’t. A carry-over in a 200-level core course follows you for years.
            </p>
          </div>
          <p className="mt-6 text-center text-xl md:text-2xl font-bold text-brand-ink">
            Preparation is always cheaper than recovery.
          </p>
          <p className="mt-6 max-w-2xl mx-auto text-center text-fg-muted md:text-lg leading-relaxed">
            You have a break either way. The only question is what you do with it.
          </p>
        </Reveal>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 md:pb-28 pt-4 text-center">
          <Reveal>
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--astar-red)] text-white">
                <Rocket size={26} />
              </div>
            </div>
            <h2 className="mt-6 text-3xl md:text-4xl font-bold text-fg">
              {registrationOpen ? "Ready to begin?" : "This cohort has finished"}
            </h2>
            <p className="mt-4 text-fg-muted md:text-lg max-w-2xl mx-auto leading-relaxed">
              The students who finish 200 level well don’t start in September — they start now. Join
              the cohort choosing to resume with the material already familiar, the habits already
              built, and the confidence that comes with both.
            </p>

            <div className="mt-8">
              {registrationOpen ? (
                <RegisterButton onClick={() => openModal("footer")} label="Register Today" />
              ) : (
                <ProgrammeEndedCta href="/bucc" />
              )}
            </div>

            {/* summary chips */}
            <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm">
              {[
                ["Programme", "BUCC 200L Preparatory Classes"],
                ["Duration", DATE_RANGE],
                ["Investment", `₦${PRICE.toLocaleString()}`],
                ["Mode", "Online"],
              ].map(([label, value]) => (
                <span
                  key={label}
                  className="rounded-full border border-line bg-surface-raised px-4 py-2 text-fg-muted shadow-sm"
                >
                  <span className="font-semibold text-fg">{label}:</span> {value}
                </span>
              ))}
            </div>

            <p className="mt-10 text-lg font-bold text-brand-ink">A-Star Tutorials</p>
            <p className="text-fg-subtle">Unlock your academic potential.</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
