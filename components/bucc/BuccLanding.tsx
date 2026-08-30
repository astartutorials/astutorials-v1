"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Video,
  Sparkles,
  CheckCircle2,
  Compass,
  Target,
  Zap,
  BookOpen,
  RefreshCw,
  FileQuestion,
  CalendarClock,
  Users,
  Mic,
  MessagesSquare,
  Flame,
  Gift,
  ShieldCheck,
  Rocket,
  TrendingUp,
  Quote,
  Terminal,
} from "lucide-react";
import posthog from "posthog-js";
import RegisterModal from "./RegisterModal";
import { useBuccOpen } from "@/components/shared/useBuccOpen";
import {
  ProgrammeEndedBanner,
  ProgrammeEndedCta,
} from "@/components/shared/ProgrammeEnded";
import {
  BUCC_EVENT_NAME,
  BUCC_TAGLINE,
  BUCC_DATE_LABEL,
  BUCC_TIME_LABEL,
  BUCC_DURATION_LABEL,
  BUCC_PLATFORM,
} from "@/lib/bucc";

/** The three questions the whole event is built to answer. */
const QUESTIONS = [
  {
    icon: Compass,
    q: "What am I walking into?",
    a: "An honest picture of 200 level from people who just survived it — the courses that humble everyone, the workload nobody warns you about.",
  },
  {
    icon: Target,
    q: "How do I succeed?",
    a: "Not motivation. Actual systems: how top BUCC students structure a week, attack past questions and prepare for exams.",
  },
  {
    icon: Zap,
    q: "How do I actually execute?",
    a: "The part everyone skips. Structure, resources and accountability that turn a good plan into a good CGPA.",
  },
];

const INTRO_PARAS = [
  "Most students walk into 200 level assuming the habits that worked in 100 level will keep working.",
  "They won't.",
  "The volume goes up. The courses get technical. Data structures, discrete maths and the first programming courses that actually punish cramming arrive at the same time.",
  "By the time most students realise their approach has stopped working, the semester is already half gone.",
  "The BUCC Advantage is 90 minutes of the inside information you'd otherwise spend a whole semester learning the hard way.",
];

const RUN_OF_SHOW = [
  {
    time: "0–15",
    title: "The 200-Level Reality Check",
    desc: "Rapid-fire, no speeches. What surprised them. Which course humbled them. What they'd undo if they could.",
    icon: Flame,
  },
  {
    time: "15–30",
    title: "The Scholar's Playbook",
    desc: "Three high-performing students, one specific topic each: how to study, how to manage the workload, how to prepare for Babcock exams.",
    icon: BookOpen,
  },
  {
    time: "30–45",
    title: "BUCC Unfiltered",
    desc: "The honest panel. The mistakes, the misconceptions, the things students pretend to understand — said out loud.",
    icon: Mic,
  },
  {
    time: "45–55",
    title: "The Academic Arsenal",
    desc: "The five systems every 200-level student needs, laid out as something you can set up this week.",
    icon: ShieldCheck,
  },
  {
    time: "55–70",
    title: "Ask the Seniors",
    desc: "Curated live Q&A — your questions, collected at registration, answered by the people who've been there.",
    icon: MessagesSquare,
  },
  {
    time: "70–90",
    title: "The 30-Day Challenge",
    desc: "You leave with a concrete first month, and a way to make sure you actually follow it.",
    icon: Rocket,
  },
];

const ARSENAL = [
  {
    icon: BookOpen,
    title: "A Study System",
    desc: "How and when you study — decided in advance, not negotiated with yourself every night.",
  },
  {
    icon: RefreshCw,
    title: "A Revision System",
    desc: "How you revisit what you've learnt, so week 3 material still exists in your head in week 12.",
  },
  {
    icon: FileQuestion,
    title: "A Question Bank",
    desc: "How to use past questions to find out what you actually need to know — before the exam tells you.",
  },
  {
    icon: CalendarClock,
    title: "A Timetable",
    desc: "Deliberate allocation of your hours. The difference between being busy and being productive.",
  },
  {
    icon: Users,
    title: "An Accountability System",
    desc: "The one most students skip — and the reason good plans quietly die in week two.",
  },
];

const UNFILTERED_QUESTIONS = [
  "What's one thing students pretend they understand when they actually don't?",
  "What's the biggest academic mistake you made?",
  "Have you ever gone into an exam completely unprepared?",
  "What separates an average student from an exceptional one?",
  "What's one thing you would never do again?",
  "If you could restart 200 level, what would you do differently?",
];

const SENIOR_QUESTIONS = [
  "How many hours should I actually study daily?",
  "How do I balance lectures with personal study?",
  "How early should I start preparing for exams?",
  "How do I handle the courses everyone says are hard?",
  "How do I avoid burning out by week six?",
  "How do I recover if I've already fallen behind?",
];

const CHALLENGE = [
  "Attend lectures consistently",
  "Review every lecture within 24 hours",
  "Study on a schedule, not on impulse",
  "Complete weekly practice questions",
  "Take a weekly quiz",
  "Track your progress honestly",
  "Ask when you don't understand",
  "Never leave preparation until exam week",
];

const BONUSES = [
  "A ready-made 200-level study tracker",
  "A curated past-question pack",
  "A free mock assessment",
  "Early-bird pricing on BUCC Monthly Tutorials",
];

const AUDIENCE = [
  "Students moving into 200 level in the School of Computing",
  "100-level students who want to arrive prepared instead of surprised",
  "Anyone whose 100-level result was fine but not what they wanted",
  "Students who already know what to do and can't get themselves to do it",
  "Students who want a first-class and are willing to work like it",
];

const HOST = { name: "Victory", role: "Host & Moderator" };

const SPEAKERS = [
  { name: "Alvin", role: "Speaker" },
  { name: "Tejiri", role: "Speaker" },
  { name: "Dozie", role: "Speaker" },
  { name: "Fabian", role: "Speaker" },
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
  label = "Reserve My Free Seat",
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
      <h2 className="mt-2.5 text-3xl md:text-4xl font-bold tracking-tight text-fg">{title}</h2>
    </div>
  );
}

export default function BuccLanding() {
  const [open, setOpen] = useState(false);
  // The webinar stays linked from Programmes after it runs, so the page has to
  // stop selling a seat once the date has passed.
  const registrationOpen = useBuccOpen();

  const openModal = (source: string) => {
    posthog.capture("bucc_register_clicked", { source });
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] font-sans selection:bg-[var(--astar-red)] selection:text-white">
      {open && <RegisterModal onClose={() => setOpen(false)} />}

      {!registrationOpen && (
        <ProgrammeEndedBanner
          name={BUCC_EVENT_NAME}
          ranLabel={`on ${BUCC_DATE_LABEL}`}
          href="/bucc/advantage"
        />
      )}

      {/* ── HERO ───────────────────────────────────────────── */}
      <section
        className={`relative overflow-hidden pb-16 md:pb-20 ${
          registrationOpen ? 'pt-28 md:pt-36' : 'pt-10 md:pt-14'
        }`}
      >
        {/* faint terminal grid — a nod to the School of Computing */}
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
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-fg-faint">
              A-Star Tutorials presents
            </p>

            <h1 className="mt-4 text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-brand-ink leading-[1.02]">
              The BUCC Advantage
            </h1>

            <p className="mt-5 text-lg md:text-2xl text-fg font-semibold">{BUCC_TAGLINE}</p>

            <p className="mt-4 mx-auto max-w-2xl text-base md:text-lg text-fg-subtle leading-relaxed">
              A 90-minute academic &amp; mentorship experience for BUCC 200-level students —
              featuring the students who are already doing it well.
            </p>

            {/* Event meta */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm md:text-base text-fg-muted">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={17} className="text-brand-ink" /> {BUCC_DATE_LABEL}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock size={17} className="text-brand-ink" /> {BUCC_TIME_LABEL}
              </span>
              <span className="inline-flex items-center gap-2">
                <Video size={17} className="text-brand-ink" /> {BUCC_PLATFORM}
              </span>
            </div>

            <div className="mt-9 flex flex-col items-center gap-4">
              {registrationOpen ? (
                <>
                  <RegisterButton onClick={() => openModal("hero")} />
                  <p className="text-xs text-fg-faint">
                    Free to attend · {BUCC_DURATION_LABEL} · Seats are limited
                  </p>
                </>
              ) : (
                <ProgrammeEndedCta href="/bucc/advantage" />
              )}
            </div>
          </motion.div>
        </div>

        <Terminal
          className="pointer-events-none absolute -right-10 top-24 text-blue-900/5 hidden lg:block"
          size={260}
          strokeWidth={1}
        />
      </section>

      {/* ── THE ONE-LINER ──────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal className="rounded-3xl bg-[var(--astar-navy)] p-8 md:p-12 text-white shadow-2xl text-center">
          <Quote className="mx-auto text-brand-on-dark" size={32} />
          <p className="mt-4 text-2xl md:text-3xl font-bold leading-snug">
            100 level got you into BUCC.
            <br className="hidden sm:block" /> 200 level is where you begin to build your academic
            reputation.
          </p>
        </Reveal>
      </section>

      {/* ── THREE QUESTIONS ────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead
            eyebrow="What This Answers"
            title="Three questions, ninety minutes"
          />
        </Reveal>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {QUESTIONS.map(({ icon: Icon, q, a }) => (
            <Reveal
              key={q}
              className="rounded-2xl bg-surface-raised border border-line-subtle shadow-sm p-7 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                <Icon size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-fg leading-snug">{q}</h3>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed">{a}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── INTRO NARRATIVE ────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead eyebrow="The Big Idea" title="This isn't another academic webinar" />
          <div className="mt-8 space-y-5 text-center text-fg-muted md:text-lg leading-relaxed">
            {INTRO_PARAS.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className="mt-8 text-center text-xl md:text-2xl font-bold text-fg">
            Come for the shortcut. Stay for the system.
          </p>
        </Reveal>
      </section>

      {/* ── RUN OF SHOW ────────────────────────────────────── */}
      <section className="bg-[var(--astar-navy)] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <Reveal>
            <SectionHead
              eyebrow="The Run of Show"
              title="What happens on the night"
              className="[&_h2]:text-white [&_p]:text-red-300"
            />
          </Reveal>
          <div className="mt-12 space-y-4">
            {RUN_OF_SHOW.map(({ time, title, desc, icon: Icon }) => (
              <Reveal
                key={title}
                className="flex flex-col sm:flex-row sm:items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center gap-4 sm:w-40 flex-shrink-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--astar-red)] text-white flex-shrink-0">
                    <Icon size={20} />
                  </div>
                  <span className="font-mono text-sm font-bold text-brand-on-dark whitespace-nowrap">
                    {time} min
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="mt-1.5 text-sm text-on-dark-muted leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-10 text-center text-on-dark-muted">
              No filler. No 20-minute introductions. Every segment is timed.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── THE VOICES ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <Reveal>
          <SectionHead eyebrow="Who You'll Hear From" title="BUCC students who've already done it" />
          <p className="mt-4 text-center text-fg-subtle md:text-lg max-w-2xl mx-auto">
            Not lecturers. Not strangers. Students a year or two ahead of you, who sat the same
            courses and can tell you exactly what worked.
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SPEAKERS.map(({ name, role }) => (
            <Reveal
              key={name}
              className="rounded-2xl border border-line-subtle bg-surface-raised shadow-sm p-6 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--astar-navy)] text-white text-lg font-extrabold">
                {name.charAt(0)}
              </div>
              <p className="mt-3 font-bold text-fg">{name}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-fg-faint">
                {role}
              </p>
            </Reveal>
          ))}
        </div>

        {/* The host sits apart from the speaker grid — she runs the room rather
            than taking a slot in it. */}
        <Reveal className="mt-6 flex items-center justify-center gap-4 rounded-2xl border border-brand-soft-border bg-brand-soft p-5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--astar-red)] text-white text-lg font-extrabold">
            {HOST.name.charAt(0)}
          </div>
          <div className="text-left">
            <p className="font-bold text-fg">{HOST.name}</p>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand-ink">
              {HOST.role}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── BUCC UNFILTERED ────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal className="rounded-3xl bg-gradient-to-br from-[var(--astar-red)] to-red-700 p-8 md:p-12 text-white shadow-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">
            <Mic size={15} /> Segment 3
          </span>
          <h2 className="mt-5 text-2xl md:text-4xl font-bold">BUCC Unfiltered</h2>
          <p className="mt-3 text-red-100 md:text-lg max-w-2xl">
            The honest panel. Real answers to the questions students only ask each other in private.
          </p>
          <ul className="mt-8 grid sm:grid-cols-2 gap-3">
            {UNFILTERED_QUESTIONS.map((q) => (
              <li
                key={q}
                className="rounded-xl bg-white/10 px-5 py-4 text-sm font-medium leading-relaxed"
              >
                &ldquo;{q}&rdquo;
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ── THE ACADEMIC ARSENAL ───────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead
            eyebrow="The Academic Arsenal"
            title="The five things every 200-level student needs"
          />
          <p className="mt-4 text-center text-fg-subtle md:text-lg max-w-2xl mx-auto">
            You leave with the framework, not just the inspiration.
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ARSENAL.map(({ icon: Icon, title, desc }, i) => (
            <Reveal
              key={title}
              className="relative rounded-2xl bg-surface-raised border border-line-subtle shadow-sm p-7"
            >
              <span className="absolute right-6 top-6 text-4xl font-extrabold text-line-subtle select-none">
                {i + 1}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--astar-navy)] text-white">
                <Icon size={22} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-fg">{title}</h3>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed">{desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── ASK THE SENIORS ────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal className="rounded-3xl bg-surface-raised border border-line-subtle shadow-sm p-8 md:p-12">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
              <MessagesSquare size={26} />
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl md:text-3xl font-bold text-fg">
            Ask the Seniors
          </h2>
          <p className="mt-4 text-center text-fg-muted md:text-lg max-w-2xl mx-auto leading-relaxed">
            We collect questions at registration and answer the strongest ones live. Ask yours when
            you sign up — the more specific it is, the more likely it makes the cut.
          </p>
          <ul className="mt-8 grid sm:grid-cols-2 gap-3">
            {SENIOR_QUESTIONS.map((q) => (
              <li key={q} className="flex items-start gap-2.5 text-sm text-fg-muted">
                <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-brand-ink" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ── 30-DAY CHALLENGE ───────────────────────────────── */}
      <section className="bg-[var(--astar-navy)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <Reveal>
            <SectionHead
              eyebrow="Your Takeaway"
              title="The 30-Day 200-Level Challenge"
              className="[&_h2]:text-white [&_p]:text-red-300"
            />
            <p className="mt-6 text-center text-on-dark-muted md:text-lg max-w-2xl mx-auto leading-relaxed">
              You don&apos;t leave with notes you&apos;ll never read. You leave with a commitment for
              your first thirty days — and a way to keep it.
            </p>
            <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {CHALLENGE.map((c) => (
                <li key={c} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0 text-brand-on-dark" />
                  <span className="text-gray-200">{c}</span>
                </li>
              ))}
            </ul>
            <p className="mt-10 text-center text-lg font-bold">
              Knowing what to do is one thing. Having the structure to actually do it is another.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── WEBINAR-ONLY BONUS ─────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <Reveal className="rounded-3xl border border-brand-soft-border bg-brand-soft p-8 md:p-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] px-4 py-1.5 text-sm font-bold text-white">
            <Gift size={15} /> Attendees only
          </span>
          <h2 className="mt-5 text-2xl md:text-3xl font-bold text-fg">
            What you get for showing up
          </h2>
          <p className="mt-3 text-fg-muted md:text-lg max-w-2xl">
            Everyone who attends live walks away with more than the talk.
          </p>
          <ul className="mt-8 grid sm:grid-cols-2 gap-3">
            {BONUSES.map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 rounded-xl bg-surface-raised border border-line-subtle px-5 py-4 shadow-sm"
              >
                <Sparkles size={18} className="mt-0.5 flex-shrink-0 text-brand-ink" />
                <span className="text-fg-muted">{b}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-fg-subtle">
            Released at the end of the session. Not sent to people who only registered.
          </p>
        </Reveal>
      </section>

      {/* ── WHO IT'S FOR ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead eyebrow="Is This You?" title="Who this is for" />
          <div className="mt-8 flex justify-center">
            <TrendingUp className="text-brand-ink" size={40} />
          </div>
          <ul className="mt-8 max-w-2xl mx-auto space-y-3">
            {AUDIENCE.map((a) => (
              <li
                key={a}
                className="flex items-start gap-3 rounded-xl bg-surface-raised border border-line-subtle shadow-sm px-5 py-4"
              >
                <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0 text-brand-ink" />
                <span className="text-fg-muted">{a}</span>
              </li>
            ))}
          </ul>
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
              {registrationOpen ? "Registration is open" : "This webinar has ended"}
            </h2>
            <p className="mt-4 text-fg-muted md:text-lg max-w-2xl mx-auto leading-relaxed">
              {registrationOpen
                ? "Ninety minutes now, or a semester of figuring it out alone. Join the BUCC students who are starting 200 level with a plan."
                : "This edition has run, but the work continues — we build these for every intake."}
            </p>

            <div className="mt-8">
              {registrationOpen ? (
                <RegisterButton onClick={() => openModal("footer")} label="Reserve My Free Seat" />
              ) : (
                <ProgrammeEndedCta href="/bucc/advantage" />
              )}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm">
              {[
                ["Event", BUCC_EVENT_NAME],
                ["Date", BUCC_DATE_LABEL],
                ["Time", BUCC_TIME_LABEL],
                ["Where", BUCC_PLATFORM],
                ["Price", "Free"],
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
