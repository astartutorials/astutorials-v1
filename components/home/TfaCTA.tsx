'use client';

import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin, Mic, Users, Music } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useTfaOpen } from "@/components/shared/useTfaOpen";
import { TFA_THEME, TFA_DATE_LABEL, TFA_TIME_LABEL, TFA_VENUE_SHORT, TFA_KEYNOTE, TFA_PANELLISTS } from "@/lib/tfa";

const meta = [
  { Icon: CalendarDays, label: TFA_DATE_LABEL },
  { Icon: Clock, label: TFA_TIME_LABEL },
  { Icon: MapPin, label: TFA_VENUE_SHORT },
];

const highlights = [
  { Icon: Mic, label: `Keynote by ${TFA_KEYNOTE.name}` },
  { Icon: Users, label: `${TFA_PANELLISTS.length} student leaders across two panels` },
  { Icon: Music, label: "A magician, a dance group and more" },
];

/** Homepage band for The Freshers' Advantage; retires itself when registration closes. */
export default function TfaCTA() {
  if (!useTfaOpen()) return null;

  return (
    <ScrollReveal className="w-full px-6 my-8 max-w-[1440px] mx-auto">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-[var(--astar-navy)] text-white shadow-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--astar-red)] opacity-25 blur-3xl"
        />
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center p-8 md:p-12">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-red-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--astar-red)]" />
              </span>
              Free event for freshers · Registration open
            </span>

            <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight">
              The Freshers&apos; Advantage <span className="text-red-400">2.0</span>
            </h2>
            <p className="mt-3 text-lg md:text-xl font-semibold text-on-dark-muted">{TFA_THEME}</p>

            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {meta.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm text-gray-200">
                  <Icon className="w-4 h-4 text-red-300 shrink-0" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/tfa"
              className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[var(--astar-red)] px-8 py-4 font-bold text-white shadow-lg shadow-red-500/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              Register for free
              <ArrowRight size={18} />
            </Link>
          </div>

          <ul className="lg:col-span-5 space-y-3">
            {highlights.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--astar-red)]">
                  <Icon size={18} />
                </div>
                <span className="text-sm md:text-base font-medium">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ScrollReveal>
  );
}
