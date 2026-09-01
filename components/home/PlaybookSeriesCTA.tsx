'use client';

import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useOpenPlaybooks } from "@/components/shared/usePlaybookOpen";
import { playbookHref } from "@/lib/playbooks";

/**
 * One homepage band for all three Playbook webinars.
 *
 * Deliberately not three bands. The homepage already carries a promo slab per
 * running cohort; three more — for events that share a name, a format and a
 * duration — would read as one long wall of the same offer. Presenting them as
 * a series is both truer and shorter, and it retires cleanly: each card
 * disappears as its date passes, and the whole band goes with the last one.
 */
export default function PlaybookSeriesCTA() {
  const playbooks = useOpenPlaybooks();
  if (playbooks.length === 0) return null;

  return (
    <ScrollReveal className="w-full px-6 my-8 max-w-[1440px] mx-auto">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-[var(--astar-navy)] shadow-sm">
        <div className="relative px-8 py-12 md:px-12 md:py-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Free webinar series · Registration open
            </span>

            <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-white">
              The Playbook Series
            </h2>

            <p className="mt-4 text-on-dark-muted text-base md:text-lg leading-relaxed">
              Ninety minutes per discipline, with students who are already succeeding in it. Three
              topics, a curated Q&amp;A, and the systems behind the advice — not the advice on its
              own.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {playbooks.map((p) => (
              <Link
                key={p.slug}
                href={playbookHref(p.slug)}
                data-playbook={p.accent}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                {/* The accent is the only thing separating the three cards, and
                    it is the same accent each landing page wears. */}
                <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-pb-fill" />

                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-pb-on-dark">
                  {p.shortName}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white leading-snug">{p.name}</h3>
                <p className="mt-2 text-sm text-on-dark-subtle leading-relaxed">{p.promise}</p>

                <ul className="mt-5 space-y-2 text-sm text-on-dark-muted">
                  <li className="flex items-center gap-2.5">
                    <CalendarDays className="h-4 w-4 shrink-0 text-pb-on-dark" />
                    {p.dateLabel}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 shrink-0 text-pb-on-dark" />
                    {p.timeLabel} · {p.durationLabel}
                  </li>
                </ul>

                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white">
                  Reserve a free seat
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-8 text-xs text-on-dark-subtle">
            Free to attend. Each registration closes when that session starts.
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}
