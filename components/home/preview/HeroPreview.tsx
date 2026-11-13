"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarRange, Check, MessageCircle } from "lucide-react";
import { Underline } from "@/components/shared/fun/RedPen";
import CountUp from "@/components/shared/CountUp";
import { SEMESTER_PLAN_HREF, SEMESTER_PLAN_NAME } from "@/lib/semester-plan";

export type HeadlineOption = "A" | "B" | "C";
export type VisualOption = "illustration" | "photo";

export const HEADLINES: Record<HeadlineOption, { lead: string; mark: string; tail?: string }> = {
  A: { lead: "Learn every course from someone who", mark: "aced it." },
  B: { lead: "Tutors who aced your", mark: "exact courses." },
  C: { lead: "Pass the courses everyone", mark: "warns you about." },
};

function Headline({ option }: { option: HeadlineOption }) {
  const h = HEADLINES[option];
  return (
    <h1 className="text-balance text-fg font-normal tracking-tighter leading-[1.05] text-[2.6rem] md:text-6xl lg:text-[4.25rem]">
      {h.lead}{" "}
      <Underline key={option} delay={0.3} className="whitespace-nowrap text-[var(--astar-red)]">
        {h.mark}
      </Underline>
    </h1>
  );
}

const WEEK = [
  { day: "Mon", course: "GEDS 126", kind: "Group", time: "4:00pm" },
  { day: "Wed", course: "PHY 102", kind: "Private", time: "6:00pm" },
  { day: "Fri", course: "CHM 108", kind: "Exam mock", time: "2:00pm" },
];

function Chip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`absolute flex items-center gap-2.5 rounded-2xl bg-surface-raised px-3.5 py-2.5 shadow-xl shadow-black/10 border border-line-subtle ${className}`}>
      {children}
    </div>
  );
}

/** A student's week on the plan, drawn as a card over warm brand shapes. */
function Illustration() {
  return (
    <div className="relative w-full max-w-lg aspect-square rounded-[2rem] overflow-hidden bg-[#F9DCD6] dark:bg-[#3A0B10]">
      {/* Quiet shapes, Marloden-style: two big arcs in brand tints. */}
      <div aria-hidden className="absolute -top-24 -right-20 h-80 w-80 rounded-full bg-[var(--astar-red)]/85" />
      <div aria-hidden className="absolute -bottom-28 -left-16 h-96 w-96 rounded-full bg-[#F2B8AE] dark:bg-[#5A1A20]" />

      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="w-full max-w-[19rem] rounded-3xl bg-surface-raised shadow-2xl shadow-black/15 border border-line-subtle p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-fg-faint">This week</p>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold text-brand-ink">Semester Plan</span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {WEEK.map((s) => (
              <li key={s.course} className="flex items-center gap-3 rounded-2xl border border-line-subtle px-3 py-2.5">
                <span className="w-9 text-xs font-bold text-fg-faint">{s.day}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-fg">{s.course}</span>
                  <span className="block text-[11px] text-fg-subtle">{s.kind}</span>
                </span>
                <span className="text-xs font-semibold text-fg-muted">{s.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Chip className="top-7 left-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/15 text-green-700 dark:text-green-400">
          <Check size={15} strokeWidth={3} />
        </span>
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-fg-faint">Matched</span>
          <span className="block text-xs font-bold text-fg">Your tutor got an A in PHY 102</span>
        </span>
      </Chip>

      <Chip className="bottom-7 right-6">
        <MessageCircle size={16} className="text-green-600" />
        <span className="text-xs font-semibold text-fg">See you Wednesday at 6!</span>
      </Chip>
    </div>
  );
}

/** The real class photo, with the same two facts floating over it. */
function Photo() {
  return (
    <div className="relative w-full max-w-lg aspect-square">
      <div className="absolute inset-0 rounded-[2rem] overflow-hidden border border-line-subtle shadow-2xl shadow-black/10">
        <Image src="/become-tutor.jpg" alt="An A-Star tutor teaching a class" fill priority sizes="(min-width: 1024px) 512px, 100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      </div>
      <Chip className="top-6 -left-3 md:-left-8">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/15 text-green-700 dark:text-green-400">
          <Check size={15} strokeWidth={3} />
        </span>
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-fg-faint">Your tutor</span>
          <span className="block text-xs font-bold text-fg">Got an A in this course</span>
        </span>
      </Chip>
      <Chip className="bottom-6 -right-3 md:-right-8">
        <CalendarRange size={16} className="text-brand-ink" />
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-fg-faint">Full Semester Plan</span>
          <span className="block text-xs font-bold text-fg">50 sessions · from ₦55,000</span>
        </span>
      </Chip>
    </div>
  );
}

const STATS = [
  { val: "7000+", label: "Active students" },
  { val: "95%", label: "Pass rate" },
  { val: "50+", label: "Expert tutors" },
  { val: "24/7", label: "Support", static: true },
];

export default function HeroPreview({ headline, visual }: { headline: HeadlineOption; visual: VisualOption }) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div className="text-center lg:text-left">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-subtle bg-surface-raised px-3 py-1.5 text-xs font-semibold text-fg-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--astar-red)]" />
            Group &amp; private tutorials at Babcock University
          </p>
          <Headline option={headline} />
          <p className="mt-6 mb-10 text-lg md:text-xl text-fg-subtle font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
            Every tutor is a student who excelled in the same course at Babcock. They know what your lecturers test and where students lose marks.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full max-w-sm sm:max-w-lg mx-auto lg:mx-0">
            <Link href={SEMESTER_PLAN_HREF} className="group btn-primary flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-full text-sm md:text-base font-semibold shadow-xl shadow-red-500/20 whitespace-nowrap hover:-translate-y-0.5 transition-all">
              <CalendarRange size={17} />
              {SEMESTER_PLAN_NAME}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/tutorials" className="flex-1 inline-flex items-center justify-center px-4 py-3.5 rounded-full border border-line bg-surface-raised text-fg text-sm md:text-base font-medium whitespace-nowrap hover:border-[var(--astar-red)] hover:-translate-y-0.5 transition-all">
              Book a Tutorial Session
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          {visual === "illustration" ? <Illustration /> : <Photo />}
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto mb-6 rounded-3xl border border-line-subtle bg-surface-raised/60 px-6 py-8">
        <p className="text-xs text-fg-faint mb-6 font-semibold uppercase tracking-widest text-center">Trusted by Babcock students</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-8">
          {STATS.map((s, i) => (
            <div key={s.label} className={`flex flex-col items-center ${i > 0 ? "md:border-l md:border-line-subtle" : ""}`}>
              <span className="text-3xl md:text-4xl font-bold text-fg tracking-tight">
                {s.static ? s.val : <CountUp value={s.val} />}
              </span>
              <span className="text-xs text-fg-subtle mt-1.5 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

