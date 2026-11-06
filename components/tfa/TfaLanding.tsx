"use client";

import {
  CalendarDays,
  Clock,
  MapPin,
  Mic,
  Star,
  Sparkles,
  Users,
  Music,
  Store,
  BookOpen,
  Award,
  ArrowDown,
} from "lucide-react";
import TfaRegisterForm from "./TfaRegisterForm";
import PanellistGrid from "./PanellistGrid";
import { useTfaOpen } from "@/components/shared/useTfaOpen";
import { ProgrammeEndedBanner, ProgrammeEndedCta } from "@/components/shared/ProgrammeEnded";
import {
  TFA_EVENT_NAME,
  TFA_THEME,
  TFA_DATE_LABEL,
  TFA_TIME_LABEL,
  TFA_VENUE,
  TFA_VENUE_SHORT,
  TFA_KEYNOTE,
  TFA_CONVENER,
  TFA_PANELLISTS,
  TFA_PROGRAMME,
  TFA_HIGHLIGHTS,
} from "@/lib/tfa";

const HIGHLIGHT_ICONS = [Users, Mic, Music, Store, BookOpen, Award];

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("");
}

export default function TfaLanding() {
  const open = useTfaOpen();

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] font-sans selection:bg-[var(--astar-red)] selection:text-white">
      {!open && (
        <ProgrammeEndedBanner name={TFA_EVENT_NAME} ranLabel={`on ${TFA_DATE_LABEL}`} href="/tfa" />
      )}

      {/* ── HERO + FORM ─────────────────────────────────────── */}
      <section className={`${open ? "pt-28 md:pt-32" : "pt-10 md:pt-14"} pb-14 md:pb-16`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1fr_minmax(0,32rem)] gap-10 lg:gap-14 items-start">
          <div className="lg:pt-6">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-fg-faint">
              A-Star Tutorials presents
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-ink leading-[1.05]">
              The Freshers&apos; Advantage 2.0
            </h1>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--astar-navy)] px-4 py-1.5 text-sm font-bold text-white">
              <Sparkles size={15} /> {TFA_THEME}
            </p>
            <p className="mt-6 max-w-xl text-base md:text-lg text-fg-subtle leading-relaxed">
              Your university journey deserves more than a good start. Get the knowledge,
              mindset, connections and study strategies to excel, from people who&apos;ve done it.
            </p>

            <ul className="mt-7 space-y-3 text-sm md:text-base text-fg-muted">
              <li className="flex items-start gap-3">
                <CalendarDays size={19} className="mt-0.5 flex-shrink-0 text-brand-ink" />
                <span className="font-semibold text-fg">{TFA_DATE_LABEL}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={19} className="mt-0.5 flex-shrink-0 text-brand-ink" />
                <span>{TFA_TIME_LABEL}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={19} className="mt-0.5 flex-shrink-0 text-brand-ink" />
                <span>{TFA_VENUE}</span>
              </li>
            </ul>

            <a
              href="#programme"
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-brand-ink hover:underline"
            >
              View programme <ArrowDown size={15} />
            </a>
          </div>

          <div
            id="register"
            className="scroll-mt-28 rounded-2xl bg-surface-raised border border-line-subtle shadow-xl p-6 sm:p-8"
          >
            {open ? (
              <>
                <h2 className="text-2xl font-bold text-fg">Register now</h2>
                <p className="mt-1 mb-6 text-sm text-fg-subtle">
                  Free entry · {TFA_VENUE_SHORT} · Seats are limited
                </p>
                <TfaRegisterForm />
              </>
            ) : (
              <div className="text-center py-6">
                <h2 className="text-2xl font-bold text-fg">Registration has closed</h2>
                <p className="mt-2 mb-6 text-sm text-fg-subtle">
                  {TFA_EVENT_NAME} ran on {TFA_DATE_LABEL}.
                </p>
                <ProgrammeEndedCta href="/tfa" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── WHAT TO EXPECT ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 md:pb-16">
        <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-fg">
          What to expect
        </h2>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {TFA_HIGHLIGHTS.map(({ title, desc }, i) => {
            const Icon = HIGHLIGHT_ICONS[i] ?? Sparkles;
            return (
              <div
                key={title}
                className="rounded-2xl bg-surface-raised border border-line-subtle shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-bold text-fg text-sm sm:text-base">{title}</p>
                  <p className="mt-0.5 text-xs sm:text-sm text-fg-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SPEAKERS ────────────────────────────────────────── */}
      <section className="bg-[var(--astar-navy)] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-16">
          <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight">
            Speakers &amp; Panellists
          </h2>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[var(--astar-red)] p-5 flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-extrabold">
                {initials(TFA_KEYNOTE.name)}
              </div>
              <div>
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-100">
                  <Mic size={13} /> Keynote Speaker
                </p>
                <p className="mt-0.5 font-bold leading-snug">{TFA_KEYNOTE.name}</p>
                <p className="text-sm text-red-100">
                  {TFA_KEYNOTE.role} · {TFA_KEYNOTE.note}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-extrabold">
                {initials(TFA_CONVENER.name)}
              </div>
              <div>
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-300">
                  <Star size={13} /> Convener
                </p>
                <p className="mt-0.5 font-bold leading-snug">{TFA_CONVENER.name}</p>
                <p className="text-sm text-on-dark-muted">{TFA_CONVENER.role}</p>
              </div>
            </div>
          </div>

          <PanellistGrid panellists={TFA_PANELLISTS} />
        </div>
      </section>

      {/* ── PROGRAMME OF EVENTS ─────────────────────────────── */}
      <section id="programme" className="scroll-mt-24 max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-16">
        <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-fg">
          Programme of Events
        </h2>
        <ol className="mt-8 rounded-2xl bg-surface-raised border border-line-subtle shadow-sm divide-y divide-line-subtle overflow-hidden">
          {TFA_PROGRAMME.map((slot) => (
            <li
              key={slot.time}
              className={`flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-6 px-5 py-3 ${
                slot.highlight ? "bg-brand-soft" : ""
              }`}
            >
              <span className="sm:w-44 flex-shrink-0 font-mono text-xs sm:text-sm font-semibold text-fg-faint">
                {slot.time}
              </span>
              <span className={`text-sm md:text-base ${slot.highlight ? "font-bold text-fg" : "text-fg-muted"}`}>
                {slot.title}
              </span>
            </li>
          ))}
        </ol>

        {open && (
          <div className="mt-10 text-center">
            <a
              href="#register"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] text-white px-8 py-4 text-base font-bold shadow-lg shadow-red-500/20 hover:bg-brand-hover hover:-translate-y-0.5 transition-all"
            >
              Register Now
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
