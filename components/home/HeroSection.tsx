import type { CSSProperties } from "react";
import Link from "next/link";
import CountUp from "@/components/shared/CountUp";
import HeroVideo from "@/components/home/HeroVideo";
import { Underline } from "@/components/shared/fun/RedPen";
import { ArrowRight, CalendarRange } from "lucide-react";
import { SEMESTER_PLAN_HREF, SEMESTER_PLAN_NAME } from "@/lib/semester-plan";
import Words from "@/components/shared/Words";

export default function HeroSection() {
  return (
    <section id="home" className="w-full max-w-7xl mx-auto px-4 md:px-6 relative">
      {/* Hero grid: text left, video right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center mb-12 md:mb-16">
        {/* Left: text */}
        <div className="text-center lg:text-left">
          {/* Words arrive on load, quickly (about half a second in all). */}
          <h1 className="hero-words text-fg mb-6 font-normal tracking-tighter leading-[1.1] text-4xl md:text-6xl lg:text-7xl">
            <Words text="Unlock your academic potential with" />{" "}
            <Underline delay={0.45} className="whitespace-nowrap" style={{ "--i": 5 } as CSSProperties}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--astar-red)] to-red-400">
                A-Star Tutorials.
              </span>
            </Underline>
          </h1>

          <p className="text-lg md:text-xl text-fg-subtle font-light mb-10 leading-relaxed">
            Expert-led group and private tutorials to help you master your courses, ace your exams, and reach your full academic potential.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full max-w-sm sm:max-w-lg mx-auto lg:mx-0">
            {/* Primary: the semester-long plan (Uche, 2026-11-12). */}
            <Link
              href={SEMESTER_PLAN_HREF}
              className="group btn-primary relative flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-full text-sm md:text-base font-semibold shadow-xl shadow-red-500/20 whitespace-nowrap hover:-translate-y-0.5 transition-all"
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-y-0 -left-1/2 w-1/3 bg-white/25 animate-[shine_3.5s_ease-in-out_infinite]" />
              </span>
              <span className="absolute top-0 right-5 -translate-y-1/2 rounded-full bg-[var(--astar-navy)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white dark:bg-white dark:text-[var(--astar-navy)]">
                New · 100L
              </span>
              <CalendarRange size={17} />
              {SEMESTER_PLAN_NAME}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/tutorials"
              className="flex-1 inline-flex items-center justify-center px-4 py-3.5 rounded-full border border-line bg-surface-raised text-fg text-sm md:text-base font-medium whitespace-nowrap hover:border-[var(--astar-red)] hover:-translate-y-0.5 transition-all"
            >
              Book a Tutorial Session
            </Link>
          </div>
        </div>

        {/* Right: hero video */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/60 border border-line-subtle">
            <HeroVideo />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="w-full max-w-5xl mx-auto mb-10 md:mb-14">
        <p className="text-xs md:text-sm text-fg-faint mb-10 font-medium uppercase tracking-wider text-center">
          Trusted by students globally
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 items-center justify-center opacity-80">
          {[
            { val: "7000+", label: "Active Students" },
            { val: "95%",   label: "Pass Rate" },
            { val: "50+",   label: "Expert Tutors" },
            { val: "24/7",  label: "Support", static: true },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-fg tracking-tight">
                {stat.static ? stat.val : <CountUp value={stat.val} />}
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-fg-faint mt-2 font-semibold">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
