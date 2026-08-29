'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Clock, Video } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useBuccOpen } from "@/components/shared/useBuccOpen";
import {
  BUCC_TAGLINE,
  BUCC_DATE_LABEL,
  BUCC_TIME_LABEL,
  BUCC_PLATFORM,
  BUCC_DURATION_LABEL,
} from "@/lib/bucc";

const meta = [
  { Icon: CalendarDays, label: BUCC_DATE_LABEL },
  { Icon: Clock, label: BUCC_TIME_LABEL },
  { Icon: Video, label: `${BUCC_PLATFORM} · ${BUCC_DURATION_LABEL}` },
];

export default function BuccCTA() {
  if (!useBuccOpen()) return null;

  return (
    <ScrollReveal className="w-full px-6 my-8 max-w-[1440px] mx-auto">
      {/* Light surface on purpose — the Pre-Clinicals band below is solid navy,
          and two dark slabs back to back read as one heavy block. */}
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-line-subtle bg-surface-raised shadow-sm">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center p-8 md:p-12">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-soft-border bg-brand-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-ink">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-ink opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--astar-red)]" />
              </span>
              Free webinar · Registration open
            </span>

            <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-fg">
              The BUCC <span className="text-brand-ink">Advantage</span>
            </h2>

            <p className="mt-3 text-lg md:text-xl font-semibold text-fg-muted">{BUCC_TAGLINE}</p>

            <p className="mt-4 text-fg-subtle text-base md:text-lg leading-relaxed max-w-xl">
              A 90-minute session for Babcock School of Computing students moving into 200
              level — honest advice from students already doing it well, the study systems
              that actually work, and a live Q&amp;A with the seniors.
            </p>

            <ul className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
              {meta.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm text-fg-muted">
                  <Icon className="w-4 h-4 text-brand-ink shrink-0" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/bucc"
              className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[var(--astar-red)] px-8 py-4 font-bold text-white shadow-lg shadow-red-500/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              Reserve your free seat
              <ArrowRight size={18} />
            </Link>

            <p className="mt-4 text-xs text-fg-faint">
              Free to attend. Registration closes when the session starts.
            </p>
          </div>

          <div className="lg:col-span-5">
            <Link href="/bucc" className="block group">
              <Image
                src="/bucc/flyer.jpg"
                alt="A-Star Tutorials × BUCC — The BUCC Advantage: Your Blueprint for Thriving in 200 Level, 30th August 2026, 7pm on Google Meet"
                width={1080}
                height={1255}
                sizes="(min-width: 1024px) 420px, 100vw"
                className="w-full max-w-sm mx-auto rounded-2xl shadow-lg group-hover:-translate-y-0.5 transition-transform duration-300"
              />
            </Link>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
