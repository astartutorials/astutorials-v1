"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Stethoscope,
  CheckCircle2,
  Trophy,
  CalendarDays,
  Users,
  Sparkles,
  Video,
  Clock,
  Gift,
  ArrowRight,
  BadgeCheck,
  Bone,
  Microscope,
  Baby,
  HeartPulse,
  FlaskConical,
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

const PRICE = 60000;
const OLD_PRICE = 100000;
const WEBINAR_URL = "https://bit.ly/PCOW2026";

const COURSES = ["Gross Anatomy", "Histology", "Embryology", "Physiology", "Biochemistry"];

const FEATURES = [
  { icon: BadgeCheck, label: "Daily & Weekly quizzes" },
  { icon: Trophy, label: "Cash prizes for top students" },
  { icon: Users, label: "Community interaction" },
];

const SPEAKERS = [
  {
    name: "Oso Ayomikun",
    credential: "Distinction in Anatomy, Physiology & Biochemistry",
    img: "/preclinicals/oso-ayomikun.jpg",
  },
  {
    name: "Uche Favour",
    credential: "Distinction in Anatomy, Physiology & Biochemistry",
    img: "/preclinicals/uche-favour.jpg",
  },
];

const INTRO_PARAS = [
  "Pre-clinicals separate students who merely survive from those who consistently excel.",
  "For many students, the challenge isn’t a lack of intelligence — it’s the overwhelming volume of new information, unfamiliar medical terminology, and the rapid pace of university lectures.",
  "By the time most students begin understanding one topic, another has already been introduced.",
  "That’s why A-Star Tutorials created the Pre-Clinicals Introductory Programme.",
  "Over four intensive weeks, you’ll develop a solid understanding of the core concepts before resumption — giving you the confidence to learn faster, retain more, and perform better when academic activities begin.",
];

const TUTOR_POINTS = [
  "the concepts students struggle with",
  "the mistakes that cost marks",
  "the smartest study techniques",
  "how to simplify complex medical concepts",
];

const STUDY = [
  {
    icon: Bone,
    name: "Gross Anatomy",
    desc: "Understand the human body’s organisation, terminology, planes, regions and major organ systems.",
  },
  {
    icon: Microscope,
    name: "Histology",
    desc: "Discover the microscopic world of tissues and learn how structure influences function.",
  },
  {
    icon: Baby,
    name: "Embryology",
    desc: "Explore how human life develops from fertilisation to birth, and understand developmental abnormalities.",
  },
  {
    icon: HeartPulse,
    name: "Physiology",
    desc: "Learn how the body’s systems function together to maintain life.",
  },
  {
    icon: FlaskConical,
    name: "Biochemistry",
    desc: "Build a strong understanding of metabolism, biomolecules and the chemistry behind every physiological process.",
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
    desc: "Every lesson ends with carefully designed quizzes that reinforce learning while concepts are still fresh — dramatically improving long-term retention.",
  },
  {
    icon: ClipboardCheck,
    title: "Weekly Assessments",
    desc: "Comprehensive weekly tests measure your understanding and prepare you for university-style exams, with performance reports to track your progress.",
  },
  {
    icon: MessagesSquare,
    title: "Community Learning",
    desc: "Join an ambitious community of future doctors who motivate one another, discuss difficult concepts and celebrate academic victories together.",
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
    title: "Introduction to Pre-Clinical Medicine",
    desc: "Study techniques, medical terminology and foundational concepts.",
  },
  {
    week: "Week Two",
    title: "Core Concepts",
    desc: "Core concepts across Anatomy, Histology, Embryology, Physiology and Biochemistry. Daily quizzes continue.",
  },
  {
    week: "Week Three",
    title: "Deeper Integration",
    desc: "More advanced introductory concepts, greater integration between subjects, and a weekly assessment.",
  },
  {
    week: "Week Four",
    title: "Revision & Rankings",
    desc: "Comprehensive revision, final assessments, performance rankings, prize announcements and preparation for resumption.",
  },
];

const TIMETABLE = [
  { day: "Monday", subject: "Gross Anatomy" },
  { day: "Tuesday", subject: "Histology" },
  { day: "Wednesday", subject: "Embryology" },
  { day: "Thursday", subject: "Physiology" },
  { day: "Friday", subject: "Biochemistry" },
  { day: "Saturday", subject: "Weekly Assessment", accent: true },
  { day: "Sunday", subject: "Revision & Personal Study", accent: true },
];

const BENEFITS = [
  "Four weeks of structured live teaching",
  "Five foundational medical courses",
  "Daily quizzes",
  "Weekly examinations",
  "Distinction-level tutors",
  "Comprehensive learning materials",
  "Academic support",
  "Interactive student community",
  "Cash prizes",
  "Confidence before resumption",
];

const ENROL = [
  "Newly promoted 200-Level Medicine & Surgery students",
  "Students preparing for Pre-Clinicals",
  "Students who want a competitive academic advantage",
  "Students determined to graduate with distinction",
  "Students who believe preparation creates opportunity",
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

export default function PreClinicalsLanding() {
  const [open, setOpen] = useState(false);

  const openModal = (source: string) => {
    posthog.capture("preclinicals_register_clicked", { source });
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] font-sans selection:bg-[var(--astar-red)] selection:text-white">
      {open && <RegisterModal onClose={() => setOpen(false)} />}

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-20">
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
              <CalendarDays size={15} /> 3rd – 30th August 2026
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-ink leading-[1.05]">
              Resume Pre-Clinicals
              <br className="hidden sm:block" /> Ahead of Everyone Else
            </h1>

            <p className="mt-5 text-lg md:text-2xl text-fg font-semibold">
              Build the Foundation. Gain the Confidence. Stay Ahead.
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
              <RegisterButton onClick={() => openModal("hero")} />
              <p className="text-xs text-fg-faint">Limited slots · Secure payment via Paystack</p>
            </div>
          </motion.div>
        </div>

        {/* decorative stethoscope */}
        <Stethoscope
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
              Learn in a supportive community, stay accountable with regular quizzes, and win cash
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
              title="The biggest transition in Medicine"
              className="[&_h2]:text-white [&_p]:text-red-300"
            />
            <div className="mt-8 max-w-3xl mx-auto space-y-5 text-center text-on-dark-muted md:text-lg leading-relaxed">
              <p>
                The gap between 100 Level and Pre-Clinicals is one of the biggest academic
                transitions in Medicine. Students suddenly encounter subjects they’ve never studied
                before:
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
              Many spend the first semester simply trying to understand what lecturers are talking
              about. Our goal is simple: reduce that learning curve before school resumes. Instead of
              struggling to understand basic concepts during lectures, you’ll already possess the
              foundation upon which deeper learning can be built.
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
              Every tutor in this programme has excelled academically in these same courses, and
              understands:
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
              Rather than learning through trial and error, you’ll learn from students who have
              already achieved distinction.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── FREE ORIENTATION WEBINAR ───────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal className="rounded-3xl bg-[var(--astar-navy)] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] px-4 py-1.5 text-sm font-bold">
              <Gift size={15} /> Free Orientation Webinar
            </span>
            <h2 className="mt-5 text-2xl md:text-3xl font-bold">
              Pre-Clinicals Orientation Webinar{" "}
              <span className="text-on-dark-muted font-semibold">(5th Edition)</span>
            </h2>
            <p className="mt-2 text-on-dark-muted md:text-lg">
              Theme: Simple Strategies for Excelling in Pre-Clinicals MB Exams
            </p>

            {/* Speakers */}
            <div className="mt-4">
              <p className="inline-block rounded-full bg-[var(--astar-red)] px-6 py-1.5 text-lg font-bold">
                Speakers
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SPEAKERS.map((s) => (
                <div key={s.name} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-lg">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--astar-red)]">
                    <Image
                      src={s.img}
                      alt={s.name}
                      fill
                      sizes="64px"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-[var(--astar-navy)] leading-tight">
                      {s.name}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-[var(--astar-red)] leading-snug">
                      {s.credential}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Meta row */}
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm md:text-base">
              <span className="inline-flex items-center gap-2 text-gray-200">
                <Video size={18} className="text-brand-on-dark" /> Google Meet
              </span>
              <span className="inline-flex items-center gap-2 text-gray-200">
                <Clock size={18} className="text-brand-on-dark" /> 3:00 pm
              </span>
              <span className="inline-flex items-center gap-2 text-gray-200">
                <CalendarDays size={18} className="text-brand-on-dark" /> Saturday, 1st August
                2026
              </span>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <a
                href={WEBINAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => posthog.capture("preclinicals_webinar_clicked")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-[var(--astar-navy)] px-7 py-3.5 font-bold hover:bg-gray-100 transition-all"
              >
                Register for the Webinar <ArrowRight size={18} />
              </a>
              <p className="inline-flex items-center gap-2 text-sm text-on-dark-muted">
                <Gift size={16} className="text-brand-on-dark" /> Stand a chance to win a
                ₦10,000 Eduhub &amp; A-Star Tutorials voucher.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── WHAT YOU'LL STUDY ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead eyebrow="Curriculum" title="What you’ll study" />
        </Reveal>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STUDY.map(({ icon: Icon, name, desc }) => (
            <Reveal
              key={name}
              className="rounded-2xl bg-surface-raised border border-line-subtle shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                <Icon size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-fg">{name}</h3>
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
              <h3 className="mt-1 text-lg font-bold text-fg leading-tight">
                {title}
              </h3>
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
                  className={`text-sm font-medium ${
                    accent ? "text-brand-ink" : "text-fg-muted"
                  }`}
                >
                  {subject}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-fg-faint">
            A detailed timetable will be provided after registration.
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
            <p className="mt-2 text-2xl font-extrabold text-fg">
              3rd – 30th August 2026
            </p>
            <p className="mt-2 text-fg-muted leading-relaxed">
              Four intensive weeks · Completely online · Attend from anywhere.
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
              One decision. Four weeks. A foundation that could shape your entire pre-clinical
              journey.
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
              Every year, students resume hoping they’ll “figure things out.” Some do. Many struggle.
              A few spend months trying to recover academically.
            </p>
          </div>
          <p className="mt-6 text-center text-xl md:text-2xl font-bold text-brand-ink">
            Preparation is always cheaper than recovery.
          </p>
          <p className="mt-6 max-w-2xl mx-auto text-center text-fg-muted md:text-lg leading-relaxed">
            Don’t wait for lectures to begin before taking your academics seriously. Start building
            your advantage today.
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
              Ready to begin?
            </h2>
            <p className="mt-4 text-fg-muted md:text-lg max-w-2xl mx-auto leading-relaxed">
              The best medical students don’t wait until resumption to prepare — they begin before
              everyone else. Join hundreds of ambitious students choosing to resume pre-clinicals
              with confidence, clarity and a competitive edge.
            </p>

            <div className="mt-8">
              <RegisterButton onClick={() => openModal("footer")} label="Register Today" />
            </div>

            {/* summary chips */}
            <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm">
              {[
                ["Programme", "Pre-Clinicals Introductory Classes"],
                ["Duration", "3rd – 30th August 2026"],
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
