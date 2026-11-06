"use client";

import { useSyncExternalStore } from "react";
import { CalendarDays, Clock, MapPin, Mic, Users, Star, Sparkles } from "lucide-react";
import TfaRegisterForm from "./TfaRegisterForm";
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
  isTfaOpen,
} from "@/lib/tfa";

// Evaluated on the visitor's clock: the page is static, so a build-time answer
// would freeze into the HTML. Server snapshot is "open" so hydration matches.
const subscribe = () => () => {};
function useTfaOpen() {
  return useSyncExternalStore(subscribe, () => isTfaOpen(), () => true);
}

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
      <section className={`relative ${open ? "pt-28 md:pt-32" : "pt-10 md:pt-14"} pb-16 md:pb-20`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1fr_minmax(0,32rem)] gap-10 lg:gap-14 items-start">
          <div className="lg:pt-6">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-fg-faint">
              A-Star Tutorials presents
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-ink leading-[1.05]">
              The Freshers&apos; Advantage 2.0
            </h1>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--astar-navy)] px-4 py-1.5 text-sm font-bold text-white">
              <Sparkles size={15} /> Theme: {TFA_THEME}
            </p>
            <p className="mt-6 max-w-xl text-base md:text-lg text-fg-subtle leading-relaxed">
              A free, in-person event for Babcock freshers. Hear from a Babcock-trained doctor and
              entrepreneur, get real talk from the student leaders who run campus, and start the
              semester knowing what it takes.
            </p>

            <ul className="mt-8 space-y-3 text-sm md:text-base text-fg-muted">
              <li className="flex items-start gap-3">
                <CalendarDays size={19} className="mt-0.5 flex-shrink-0 text-brand-ink" />
                <span className="font-semibold text-fg">{TFA_DATE_LABEL}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={19} className="mt-0.5 flex-shrink-0 text-brand-ink" />
                <span>{TFA_TIME_LABEL} · arrival from 10:00 AM</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={19} className="mt-0.5 flex-shrink-0 text-brand-ink" />
                <span>{TFA_VENUE}</span>
              </li>
            </ul>
          </div>

          <div
            id="register"
            className="scroll-mt-28 rounded-2xl bg-surface-raised border border-line-subtle shadow-xl p-6 sm:p-8"
          >
            {open ? (
              <>
                <h2 className="text-2xl font-bold text-fg">Register to attend</h2>
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

      {/* ── SPEAKERS ────────────────────────────────────────── */}
      <section className="bg-[var(--astar-navy)] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <p className="text-center text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-red-300">
            Who you&apos;ll hear from
          </p>
          <h2 className="mt-2.5 text-center text-3xl md:text-4xl font-bold tracking-tight">
            Speakers &amp; Panellists
          </h2>

          <div className="mt-10 grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-[var(--astar-red)] p-6 md:p-7 flex items-center gap-5">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-extrabold">
                {initials(TFA_KEYNOTE.name)}
              </div>
              <div>
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-100">
                  <Mic size={13} /> Keynote Speaker
                </p>
                <p className="mt-1 text-lg font-bold leading-snug">{TFA_KEYNOTE.name}</p>
                <p className="text-sm text-red-100">{TFA_KEYNOTE.role}</p>
                <p className="text-xs text-red-200">{TFA_KEYNOTE.note}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-7 flex items-center gap-5">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-extrabold">
                {initials(TFA_CONVENER.name)}
              </div>
              <div>
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-300">
                  <Star size={13} /> Convener
                </p>
                <p className="mt-1 text-lg font-bold leading-snug">{TFA_CONVENER.name}</p>
                <p className="text-sm text-on-dark-muted">{TFA_CONVENER.role}</p>
              </div>
            </div>
          </div>

          <p className="mt-12 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-red-300">
            <Users size={16} /> Panellists
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TFA_PANELLISTS.map((p) => (
              <div key={p.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 font-extrabold">
                  {initials(p.name)}
                </div>
                <p className="mt-3 font-bold leading-snug">{p.name}</p>
                <p className="mt-0.5 text-xs text-on-dark-muted leading-relaxed">{p.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMME OF EVENTS ─────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <p className="text-center text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-brand-ink">
          On the day
        </p>
        <h2 className="mt-2.5 text-center text-3xl md:text-4xl font-bold tracking-tight text-fg">
          Programme of Events
        </h2>
        <ol className="mt-10 rounded-2xl bg-surface-raised border border-line-subtle shadow-sm divide-y divide-line-subtle overflow-hidden">
          {TFA_PROGRAMME.map((slot) => (
            <li
              key={slot.time}
              className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 px-5 py-3.5 ${
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
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 md:pb-28 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-fg">
          {open ? "Equipped for success starts here" : "This event has ended"}
        </h2>
        <p className="mt-4 text-fg-muted md:text-lg max-w-2xl mx-auto leading-relaxed">
          {open
            ? "Bring a friend from your class. Entry is free, but seats are limited, so register now."
            : "Thank you to everyone who came. See what's running now."}
        </p>
        <div className="mt-8">
          {open ? (
            <a
              href="#register"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] text-white px-8 py-4 text-base font-bold shadow-lg shadow-red-500/20 hover:bg-brand-hover hover:-translate-y-0.5 transition-all"
            >
              Register for Free
            </a>
          ) : (
            <ProgrammeEndedCta href="/tfa" />
          )}
        </div>
        <p className="mt-10 text-lg font-bold text-brand-ink">A-Star Tutorials</p>
        <p className="text-fg-subtle">Unlock your academic potential.</p>
      </section>
    </div>
  );
}
