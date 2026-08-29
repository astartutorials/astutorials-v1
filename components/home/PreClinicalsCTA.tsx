'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Trophy, Users } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { usePreClinicalsOpen } from "@/components/shared/usePreClinicalsOpen";
import {
  PRECLINICALS_PRICE,
  PRECLINICALS_OLD_PRICE,
  PRECLINICALS_DATE_RANGE,
  PRECLINICALS_SUBJECTS,
} from "@/lib/preclinicals";

const highlights = [
  { Icon: CalendarDays, label: PRECLINICALS_DATE_RANGE },
  { Icon: Users, label: "Tutored by distinction students" },
  { Icon: Trophy, label: "Daily & weekly quizzes, cash prizes" },
];

export default function PreClinicalsCTA() {
  if (!usePreClinicalsOpen()) return null;

  return (
    <ScrollReveal className="w-full px-6 my-8 max-w-[1440px] mx-auto">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-[#0B1120] text-white">
        {/* Warm red bloom, echoing the brand accent without competing with the
            solid-red Become a Tutor band further down the page. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-[var(--astar-red)] opacity-20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-24 w-[24rem] h-[24rem] rounded-full bg-[#355EA9] opacity-20 blur-3xl"
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center p-8 md:p-12 lg:p-16">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-red-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--astar-red)]" />
              </span>
              Now running · Registration open
            </span>

            <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight">
              Pre-Clinicals{" "}
              <span className="text-brand-on-dark">Introductory</span> Classes
            </h2>

            <p className="mt-4 text-on-dark-muted text-base md:text-lg leading-relaxed max-w-xl">
              Maximise your break and resume pre-clinicals with confidence. Join the
              cohort mid-stream — recordings of every class so far are included.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {PRECLINICALS_SUBJECTS.map((subject) => (
                <li
                  key={subject}
                  className="rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-sm text-gray-200"
                >
                  {subject}
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
          </div>

          <div className="lg:col-span-5 lg:pl-8 lg:border-l lg:border-white/10">
            <Link href="/preclinicals" className="block group">
              <Image
                src="/preclinicals/flyer.jpg"
                alt="A-Star Tutorials — Pre-Clinicals Introductory Online Classes, 3rd–30th August 2026: Gross Anatomy, Histology, Embryology, Physiology and Biochemistry, tutored by distinction students. Registration ₦60,000."
                width={1080}
                height={1255}
                sizes="(min-width: 1024px) 360px, 100vw"
                className="w-full max-w-xs mx-auto mb-8 rounded-2xl shadow-lg group-hover:-translate-y-0.5 transition-transform duration-300"
              />
            </Link>

            <div className="flex items-baseline gap-3">
              <span className="text-on-dark-subtle line-through text-lg">
                ₦{PRECLINICALS_OLD_PRICE.toLocaleString()}
              </span>
              <span className="text-4xl md:text-5xl font-bold">
                ₦{PRECLINICALS_PRICE.toLocaleString()}
              </span>
            </div>
            <p className="mt-2 text-sm text-on-dark-muted">
              One payment. Covers all five courses for the full month.
            </p>

            <Link
              href="/preclinicals"
              className="mt-7 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[var(--astar-red)] px-8 py-4 font-bold text-white shadow-lg shadow-red-900/40 hover:-translate-y-0.5 hover:shadow-red-900/60 transition-all duration-300"
            >
              Reserve your spot
              <ArrowRight size={18} />
            </Link>

            <p className="mt-4 text-xs text-on-dark-subtle">
              Registration closes when the cohort ends on 30th August.
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
