'use client';

import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { usePrograms } from "@/components/shared/programmes";

/**
 * The closed-state treatment for a programme landing page.
 *
 * Past programmes stay linked from the Programmes menu as a track record, which
 * means a visitor can land on a cohort that finished months ago. These two
 * pieces keep that page honest: it says plainly that the programme has ended,
 * and it sends the visitor to whatever is currently running instead of offering
 * a registration that would take their money for a thing that is over.
 */

/** The live programme to send a visitor to, or null when nothing is running. */
function useCurrentProgramme(exceptHref: string) {
  return usePrograms().find((p) => p.open && p.href !== exceptHref) ?? null;
}

export function ProgrammeEndedBanner({
  name,
  ranLabel,
  href,
}: {
  name: string;
  /** When it ran, e.g. "3rd – 30th August 2026". */
  ranLabel: string;
  /** This programme's own href, so it is never offered as the onward link. */
  href: string;
}) {
  const current = useCurrentProgramme(href);

  return (
    <div className="px-4 sm:px-6 pt-24 md:pt-28">
      <div className="mx-auto max-w-5xl rounded-2xl border border-line bg-surface-sunken px-5 py-4 md:px-7 md:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-fg-faint" />
            <div>
              <p className="text-sm font-bold text-fg">This programme has ended</p>
              <p className="mt-0.5 text-sm text-fg-subtle">
                {name} ran {ranLabel}. Registration is closed.
              </p>
            </div>
          </div>

          {current && (
            <Link
              href={current.href}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--astar-red)] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-hover transition-colors"
            >
              See what&apos;s running now
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/** Replaces a register button once the programme has closed. */
export function ProgrammeEndedCta({ href }: { href: string }) {
  const current = useCurrentProgramme(href);

  if (!current) {
    return (
      <div className="inline-flex flex-col items-center gap-2">
        <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-line bg-surface-sunken px-8 py-4 text-base font-bold text-fg-faint">
          Registration closed
        </span>
        <Link href="/tutorials" className="text-sm font-semibold text-brand-ink underline">
          Browse our tutorials instead
        </Link>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <Link
        href={current.href}
        className="group inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-500/20 hover:bg-brand-hover hover:-translate-y-0.5 transition-all"
      >
        See {current.name}
        <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" />
      </Link>
      <span className="text-xs text-fg-faint">This programme has ended</span>
    </div>
  );
}
