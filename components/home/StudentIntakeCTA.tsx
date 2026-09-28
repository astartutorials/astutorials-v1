'use client';

import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useOpenIntake } from "@/components/shared/useOpenIntake";
import { intakeHref } from "@/lib/intakes";

/**
 * Homepage band for the 100 level intake. Reads the session from the intake
 * registry, so next year's band updates itself when the new intake is added,
 * and the band disappears whenever no 100 level intake is open.
 */
export default function StudentIntakeCTA() {
  const intake = useOpenIntake(100);
  if (!intake) return null;

  return (
    <ScrollReveal className="w-full px-6 my-8 max-w-[1440px] mx-auto">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-line-subtle bg-surface-raised">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 w-[26rem] h-[26rem] rounded-full bg-[var(--astar-red)] opacity-10 blur-3xl"
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-8 p-8 md:p-12 lg:p-16">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-ink">
              <GraduationCap size={14} />
              {intake.session} session · 100 Level
            </span>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-fg">
              Just got into university?
            </h2>
            <p className="mt-4 text-fg-subtle text-base md:text-lg leading-relaxed max-w-xl">
              Register with A-Star as a new 100 level student. We&apos;ll keep you posted on
              tutorials, classes and everything that helps you start strong.
            </p>
          </div>

          <div className="lg:pl-8">
            <Link
              href={intakeHref(100)}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[var(--astar-red)] px-8 py-4 font-bold text-white shadow-lg shadow-red-900/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              Register now
              <ArrowRight size={18} />
            </Link>
            <p className="mt-3 text-xs text-fg-faint text-center sm:text-left">Takes about two minutes.</p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
