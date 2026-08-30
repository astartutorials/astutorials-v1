'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Trophy, Users } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useBuccClassesOpen } from "@/components/shared/useBuccClassesOpen";
import {
  BUCC_CLASSES_PRICE,
  BUCC_CLASSES_OLD_PRICE,
  BUCC_CLASSES_DATE_RANGE,
  BUCC_CLASSES_COURSES,
} from "@/lib/bucc-classes";

const highlights = [
  { Icon: CalendarDays, label: BUCC_CLASSES_DATE_RANGE },
  { Icon: Users, label: "Tutored by distinction students" },
  { Icon: Trophy, label: "Daily & weekly quizzes, cash prizes" },
];

export default function BuccClassesCTA() {
  if (!useBuccClassesOpen()) return null;

  return (
    <ScrollReveal className="w-full px-6 my-8 max-w-[1440px] mx-auto">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-[#0B1120] text-white">
        {/* Blue-led bloom — the computing flyer leans blue, which also keeps this
            band from reading as a repeat of the red-bloomed Pre-Clinicals one. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-[#355EA9] opacity-25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-24 w-[24rem] h-[24rem] rounded-full bg-[var(--astar-red)] opacity-20 blur-3xl"
        />

        {/* Flyer leads on the left here — the Pre-Clinicals band puts it on the
            right, so the two dark slabs don't mirror each other. */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center p-8 md:p-12 lg:p-16">
          <div className="lg:col-span-5 lg:order-1 lg:pr-8 lg:border-r lg:border-white/10">
            <Link href="/bucc" className="block group">
              <Image
                src="/bucc-classes/flyer.jpg"
                alt="A-Star Tutorials — BUCC 200L Preparatory Online Classes, 7th September – 4th October 2026: SEN 201, MTH 201, COS 201 and IFT 211, tutored by distinction students. Registration ₦60,000."
                width={1080}
                height={1255}
                sizes="(min-width: 1024px) 360px, 100vw"
                className="w-full max-w-xs mx-auto rounded-2xl shadow-lg group-hover:-translate-y-0.5 transition-transform duration-300"
              />
            </Link>
          </div>

          <div className="lg:col-span-7 lg:order-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-red-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--astar-red)]" />
              </span>
              New cohort · Registration open
            </span>

            <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight">
              BUCC 200L <span className="text-brand-on-dark">Preparatory</span> Classes
            </h2>

            <p className="mt-4 text-on-dark-muted text-base md:text-lg leading-relaxed max-w-xl">
              Maximise your break and resume 200 level with confidence. Four weeks of live classes
              on the core School of Computing courses, before the semester starts.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {BUCC_CLASSES_COURSES.map((course) => (
                <li
                  key={course}
                  className="rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-sm text-gray-200"
                >
                  {course}
                </li>
              ))}
            </ul>

            <ul className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {highlights.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-on-dark-muted">
                  <Icon className="w-4 h-4 text-brand-on-dark shrink-0" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-baseline gap-3">
              <span className="text-on-dark-subtle line-through text-lg">
                ₦{BUCC_CLASSES_OLD_PRICE.toLocaleString()}
              </span>
              <span className="text-4xl md:text-5xl font-bold">
                ₦{BUCC_CLASSES_PRICE.toLocaleString()}
              </span>
            </div>
            <p className="mt-2 text-sm text-on-dark-muted">
              One payment. Covers all four courses for the full month.
            </p>

            <Link
              href="/bucc"
              className="mt-7 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[var(--astar-red)] px-8 py-4 font-bold text-white shadow-lg shadow-red-900/40 hover:-translate-y-0.5 hover:shadow-red-900/60 transition-all duration-300"
            >
              Reserve your spot
              <ArrowRight size={18} />
            </Link>

            <p className="mt-4 text-xs text-on-dark-subtle">
              Classes start 7th September. Registration closes when the cohort ends.
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
