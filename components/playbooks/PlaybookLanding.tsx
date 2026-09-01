"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Video,
  CheckCircle2,
  MessagesSquare,
  Mic,
  Quote,
  Rocket,
  Users,
  ListChecks,
  MoveRight,
  CircleHelp,
} from "lucide-react";
import posthog from "posthog-js";
import RegisterModal from "./RegisterModal";
import HeroMotif from "./HeroMotif";
import { usePlaybookOpen } from "@/components/shared/usePlaybookOpen";
import {
  ProgrammeEndedBanner,
  ProgrammeEndedCta,
} from "@/components/shared/ProgrammeEnded";
import { playbookHref, type Playbook } from "@/lib/playbooks";

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fade}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({
  eyebrow,
  title,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      {eyebrow && (
        <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-pb-ink">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2.5 text-3xl md:text-4xl font-bold tracking-tight text-fg">{title}</h2>
    </div>
  );
}

function RegisterButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-full bg-pb-fill text-white px-8 py-4 text-base font-bold shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all"
    >
      Reserve My Free Seat
      <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

/**
 * The landing page for every Playbook webinar.
 *
 * All three read from a config in lib/playbooks — see the note at the top of
 * lib/playbooks/types.ts for why this is one component rather than three pages.
 * The only thing that branches on the playbook is the hero motif; everything
 * else differs through the accent variables and the config's copy.
 */
export default function PlaybookLanding({ playbook }: { playbook: Playbook }) {
  const [open, setOpen] = useState(false);
  // Playbooks stay linked from Programmes after they run, so the page has to
  // stop selling a seat once the date has passed.
  const registrationOpen = usePlaybookOpen(playbook);
  const href = playbookHref(playbook.slug);

  const openModal = (source: string) => {
    posthog.capture("playbook_register_clicked", { playbook: playbook.slug, source });
    setOpen(true);
  };

  return (
    <div
      data-playbook={playbook.accent}
      className="min-h-screen bg-[var(--astar-bg)] font-sans selection:bg-pb-fill selection:text-white"
    >
      {open && <RegisterModal playbook={playbook} onClose={() => setOpen(false)} />}

      {!registrationOpen && (
        <ProgrammeEndedBanner
          name={playbook.name}
          ranLabel={`on ${playbook.dateLabel}`}
          href={href}
        />
      )}

      {/* ── HERO ───────────────────────────────────────────── */}
      <section
        className={`relative overflow-hidden pb-16 md:pb-20 ${
          registrationOpen ? "pt-28 md:pt-36" : "pt-10 md:pt-14"
        }`}
      >
        <HeroMotif motif={playbook.motif} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fade}>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-fg-faint">
              A-Star Tutorials presents
            </p>

            <h1 className="mt-4 text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-pb-ink leading-[1.02]">
              {playbook.name}
            </h1>

            <p className="mt-5 text-lg md:text-2xl text-fg font-semibold">{playbook.tagline}</p>

            <p className="mt-4 mx-auto max-w-2xl text-base md:text-lg text-fg-subtle leading-relaxed">
              {playbook.forWho}. Ninety minutes with students who are already succeeding — and the
              systems they used to get there.
            </p>

            {/* Event meta */}
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm md:text-base text-fg-muted">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={17} className="text-pb-ink" /> {playbook.dateLabel}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock size={17} className="text-pb-ink" /> {playbook.timeLabel}
              </span>
              <span className="inline-flex items-center gap-2">
                <Video size={17} className="text-pb-ink" /> {playbook.platform}
              </span>
            </div>

            <div className="mt-9 flex flex-col items-center gap-4">
              {registrationOpen ? (
                <>
                  <RegisterButton onClick={() => openModal("hero")} />
                  <p className="text-xs text-fg-faint">
                    Free to attend · {playbook.durationLabel} · Seats are limited
                  </p>
                </>
              ) : (
                <ProgrammeEndedCta href={href} />
              )}
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-fg-faint">
              {playbook.promise}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── THE ONE-LINER ──────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal className="rounded-3xl bg-[var(--astar-navy)] p-8 md:p-12 text-white shadow-2xl text-center">
          <Quote className="mx-auto text-pb-on-dark" size={32} />
          <p className="mt-4 text-2xl md:text-3xl font-bold leading-snug">{playbook.bigLine}</p>
        </Reveal>
      </section>

      {/* ── THREE QUESTIONS ────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead eyebrow="What This Answers" title="Three questions, ninety minutes" />
        </Reveal>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {playbook.questions.map(({ q, a }, i) => (
            <Reveal
              key={q}
              className="rounded-2xl bg-surface-raised border border-line-subtle shadow-sm p-7 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pb-soft text-pb-ink text-lg font-extrabold">
                {i + 1}
              </div>
              <h3 className="mt-4 text-lg font-bold text-fg leading-snug">{q}</h3>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed">{a}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── THE BIG IDEA ───────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead eyebrow="The Big Idea" title="Not another motivational webinar" />
          <div className="mt-8 space-y-5 text-center text-fg-muted md:text-lg leading-relaxed">
            {playbook.bigIdeaParas.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className="mt-8 text-center text-xl md:text-2xl font-bold text-fg">
            {playbook.closingLine}
          </p>
        </Reveal>
      </section>

      {/* ── RUN OF SHOW ────────────────────────────────────── */}
      <section className="bg-[var(--astar-navy)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <Reveal>
            <SectionHead
              eyebrow="The Run of Show"
              title="Ninety minutes, four segments"
              className="[&_h2]:text-white [&_p]:text-pb-on-dark"
            />
          </Reveal>
          <div className="mt-12 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
            {playbook.segments.map(({ time, title, purpose }) => (
              <Reveal
                key={title}
                className="flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <span className="font-mono text-sm font-bold text-pb-on-dark whitespace-nowrap sm:w-24">
                  {time} min
                </span>
                <div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-on-dark-muted leading-relaxed">{purpose}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-8 text-center text-on-dark-muted">
              No filler. No twenty-minute biographies. Every segment is timed.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── THE PLAYBOOK ITSELF ────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <Reveal>
          <SectionHead eyebrow="The Playbook" title="Three topics, twenty minutes each" />
          <p className="mt-4 text-center text-fg-subtle md:text-lg max-w-2xl mx-auto">
            Every speaker contributes to every topic. You aren&apos;t hearing the same advice three
            times — you&apos;re hearing different routes to the same result.
          </p>
        </Reveal>

        <div className="mt-12 space-y-6">
          {playbook.topics.map((topic, i) => (
            <Reveal
              key={topic.title}
              className="relative overflow-hidden rounded-3xl border border-line-subtle bg-surface-raised shadow-sm"
            >
              {/* The accent spine: the only thing tying the three topic cards
                  into one segment rather than three unrelated blocks. */}
              <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-pb-fill" />

              <div className="p-7 pl-9 md:p-10 md:pl-12">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pb-soft text-sm font-extrabold text-pb-ink">
                    {i + 1}
                  </span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-fg-faint">
                    {topic.time} min
                  </span>
                </div>

                <h3 className="mt-4 text-2xl md:text-3xl font-bold text-fg leading-snug">
                  {topic.title}
                </h3>

                {/* The moderator's opening question, verbatim — it sets the tone
                    of the segment better than any summary of it would. */}
                <blockquote className="mt-5 border-l-2 border-pb-soft-border pl-5 text-fg-muted md:text-lg italic leading-relaxed">
                  &ldquo;{topic.prompt}&rdquo;
                </blockquote>

                <div className="mt-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-fg-faint">
                    What gets covered
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {topic.covers.map((c) => (
                      <li
                        key={c}
                        className="rounded-full border border-line bg-surface-sunken px-3.5 py-1.5 text-xs font-medium text-fg-muted"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-7 flex items-start gap-3 rounded-2xl bg-pb-soft border border-pb-soft-border px-5 py-4 text-sm md:text-base font-semibold text-fg">
                  <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-pb-ink" />
                  <span>{topic.takeaway}</span>
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── THE FEATURE BLOCK ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal>
          <SectionHead eyebrow={playbook.feature.eyebrow} title={playbook.feature.title} />
          <p className="mt-4 text-center text-fg-subtle md:text-lg max-w-2xl mx-auto leading-relaxed">
            {playbook.feature.blurb}
          </p>
        </Reveal>

        {playbook.feature.layout === "grid" ? (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {playbook.feature.items.map(({ label, note }, i) => (
              <Reveal
                key={label}
                className="relative rounded-2xl bg-surface-raised border border-line-subtle shadow-sm p-7"
              >
                <span className="absolute right-6 top-5 text-4xl font-extrabold text-line-subtle select-none">
                  {i + 1}
                </span>
                <ListChecks size={22} className="text-pb-ink" />
                <h3 className="mt-4 text-lg font-bold text-fg">{label}</h3>
                <p className="mt-2 text-sm text-fg-muted leading-relaxed">{note}</p>
              </Reveal>
            ))}
          </div>
        ) : (
          /* `shift` — the 100 → 200 level change, read left to right. */
          <div className="mt-10 space-y-3">
            {playbook.feature.items.map(({ label, note }) => (
              <Reveal
                key={label}
                className="grid grid-cols-1 items-center gap-3 rounded-2xl border border-line-subtle bg-surface-raised p-5 shadow-sm sm:grid-cols-[1fr_auto_1fr] sm:gap-5 sm:p-6"
              >
                <p className="text-sm text-fg-faint line-through decoration-line-strong">{label}</p>
                <MoveRight size={18} className="hidden shrink-0 text-pb-ink sm:block" />
                <p className="text-sm font-semibold text-fg sm:text-base">{note}</p>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ── Q&A ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal className="rounded-3xl bg-surface-raised border border-line-subtle shadow-sm p-8 md:p-12">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pb-soft text-pb-ink">
              <MessagesSquare size={26} />
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl md:text-3xl font-bold text-fg">
            The Q&amp;A is curated, not improvised
          </h2>
          <p className="mt-4 text-center text-fg-muted md:text-lg max-w-2xl mx-auto leading-relaxed">
            We collect questions at registration and put the strongest ones to the speaker best
            placed to answer them. Ask yours when you sign up — the more specific it is, the more
            likely it makes the cut.
          </p>
          <ul className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {playbook.qaQuestions.map((q) => (
              <li key={q} className="flex items-start gap-2.5 text-sm text-fg-muted">
                <CircleHelp size={18} className="mt-0.5 flex-shrink-0 text-pb-ink" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ── THE MODERATOR'S RULE ───────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <Reveal className="rounded-3xl bg-pb-fill p-8 md:p-12 text-white shadow-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">
            <Mic size={15} /> The Moderator&apos;s Rule
          </span>
          <h2 className="mt-5 text-2xl md:text-3xl font-bold">No vague answers survive this room</h2>
          <p className="mt-3 max-w-2xl text-white/80 md:text-lg leading-relaxed">
            The moderator&apos;s job is not to keep time. It is to stop generic advice before it
            reaches you. Every answer gets pushed until it is something you could actually do on
            Monday.
          </p>

          <div className="mt-8 space-y-3">
            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                A speaker says
              </p>
              <p className="mt-1.5 text-lg font-medium">&ldquo;{playbook.moderatorRule.vague}&rdquo;</p>
            </div>
            <div className="rounded-2xl bg-white px-5 py-4 text-[color:var(--astar-navy)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-fg-faint">
                The moderator asks
              </p>
              <p className="mt-1.5 text-lg font-semibold">
                &ldquo;{playbook.moderatorRule.followUp}&rdquo;
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── WHO YOU'LL HEAR FROM ───────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        {/* Named speakers once they are confirmed; the panel design as a
            stand-in before that. Never a grid of "TBA" tiles — an unfilled seat
            is honest as a single note, not as three placeholder people. */}
        {playbook.speakers.length > 0 ? (
          <>
            <Reveal>
              <SectionHead eyebrow="Who You'll Hear From" title="Students who are already doing it" />
              <p className="mt-4 text-center text-fg-subtle md:text-lg max-w-2xl mx-auto">
                Not lecturers. Students a year or two ahead of you, sitting the same papers, picked
                so no two of them give you the same answer.
              </p>
            </Reveal>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {playbook.speakers.map(({ name, discipline, role }) => (
                <Reveal
                  key={name}
                  className="flex flex-col rounded-2xl border border-line-subtle bg-surface-raised shadow-sm p-6 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--astar-navy)] text-white text-lg font-extrabold">
                    {name.charAt(0)}
                  </div>
                  <p className="mt-3 font-bold text-fg leading-snug">{name}</p>
                  {discipline && (
                    <p className="mt-1 text-xs font-semibold text-pb-ink">{discipline}</p>
                  )}
                  <p className="mt-1 text-[11px] leading-relaxed text-fg-faint">
                    {role ?? "Speaker"}
                  </p>
                </Reveal>
              ))}

              {playbook.moreSpeakersToCome && (
                <Reveal className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface-sunken p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-line-strong text-fg-faint">
                    <Users size={20} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-fg-muted">One more to come</p>
                  <p className="mt-1 text-[11px] text-fg-faint">Announced before the session</p>
                </Reveal>
              )}
            </div>

            {/* The panel design, kept as one line rather than four cards — it
                explains the line-up above instead of standing in for it. */}
            <Reveal>
              <p className="mt-7 text-center text-sm text-fg-subtle max-w-2xl mx-auto leading-relaxed">
                <span className="font-semibold text-fg-muted">How the panel is built:</span>{" "}
                {playbook.speakerStrategy.map((sp) => sp.label.replace(/^The /, "")).join(" · ")} —
                different routes to the same result.
              </p>
            </Reveal>
          </>
        ) : (
          <>
            <Reveal>
              <SectionHead eyebrow="Who You'll Hear From" title="Strengths, not biographies" />
              <p className="mt-4 text-center text-fg-subtle md:text-lg max-w-2xl mx-auto">
                The panel is picked so no two speakers give you the same answer. Names are announced
                in the run-up — what matters is the perspective each one brings.
              </p>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {playbook.speakerStrategy.map(({ label, desc }) => (
                <Reveal
                  key={label}
                  className="rounded-2xl border border-line-subtle bg-surface-raised shadow-sm p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--astar-navy)] text-white">
                    <Users size={19} />
                  </div>
                  <p className="mt-4 font-bold text-fg">{label}</p>
                  <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{desc}</p>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── THE A-STAR ADVANTAGE ───────────────────────────── */}
      <section className="bg-[var(--astar-navy)] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <Reveal>
            <SectionHead
              eyebrow="Knowing → Doing"
              title={playbook.advantage.name}
              className="[&_h2]:text-white [&_p]:text-pb-on-dark"
            />
            <p className="mt-6 text-center text-on-dark-muted md:text-lg max-w-2xl mx-auto leading-relaxed">
              {playbook.advantage.intro}
            </p>
            <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {playbook.advantage.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={19} className="mt-0.5 flex-shrink-0 text-pb-on-dark" />
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-10 text-center text-lg md:text-xl font-bold max-w-3xl mx-auto leading-snug">
              {playbook.advantage.positioning}
            </p>

            <div className="mt-8 flex justify-center">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white">
                <CalendarDays size={16} className="text-pb-on-dark" />
                Tutorials begin {playbook.advantage.startsOn}
              </span>
            </div>

            <p className="mt-5 text-center text-sm text-on-dark-subtle">
              Pricing, the registration deadline and the attendee-only bonus are announced live in
              the final segment.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── WHO IT'S FOR ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <Reveal>
          <SectionHead eyebrow="Is This You?" title="Who this is for" />
          <ul className="mt-10 max-w-2xl mx-auto space-y-3">
            {playbook.audience.map((a) => (
              <li
                key={a}
                className="flex items-start gap-3 rounded-xl bg-surface-raised border border-line-subtle shadow-sm px-5 py-4"
              >
                <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0 text-pb-ink" />
                <span className="text-fg-muted">{a}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 md:pb-28 text-center">
          <Reveal>
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pb-fill text-white">
                <Rocket size={26} />
              </div>
            </div>
            <h2 className="mt-6 text-3xl md:text-4xl font-bold text-fg">
              {registrationOpen ? "Registration is open" : "This webinar has ended"}
            </h2>
            <p className="mt-4 text-fg-muted md:text-lg max-w-2xl mx-auto leading-relaxed">
              {registrationOpen
                ? "Ninety minutes now, or a semester of working it out alone."
                : "This edition has run, but the work continues — we build these for every intake."}
            </p>

            <div className="mt-8">
              {registrationOpen ? (
                <RegisterButton onClick={() => openModal("footer")} />
              ) : (
                <ProgrammeEndedCta href={href} />
              )}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm">
              {[
                ["Event", playbook.name],
                ["Date", playbook.dateLabel],
                ["Time", playbook.timeLabel],
                ["Where", playbook.platform],
                ["Price", "Free"],
              ].map(([label, value]) => (
                <span
                  key={label}
                  className="rounded-full border border-line bg-surface-raised px-4 py-2 text-fg-muted shadow-sm"
                >
                  <span className="font-semibold text-fg">{label}:</span> {value}
                </span>
              ))}
            </div>

            <p className="mt-10 text-lg font-bold text-pb-ink">A-Star Tutorials</p>
            <p className="text-fg-subtle">Unlock your academic potential.</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
