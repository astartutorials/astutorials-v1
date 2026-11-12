"use client";

import { motion, useReducedMotion } from "framer-motion";
import { RedPenTick } from "@/components/shared/fun/RedPen";

/**
 * What "we match you with a tutor" looks like: a small stack of tutor cards
 * that fans out on hover, with a MATCHED stamp on the top one. No real tutors
 * are shown: the cards behind are other courses and times in the pool, and the
 * top card describes the match, not a person.
 */
const MATCH_POINTS = ["Excelled in your course", "Fits your timetable", "Online or in person"];

/** Other tutors in the pool, peeking out behind your match. Courses, not people. */
// A deck: each card peeks above the one in front, showing its top line. On
// hover the deck fans out sideways.
const CANDIDATES = [
  { course: "GST 111", when: "Evenings", position: "-translate-y-14 scale-[0.88] group-hover:translate-x-24 group-hover:-translate-y-6 group-hover:rotate-6" },
  { course: "CHM 101", when: "Weekends", position: "-translate-y-7 scale-[0.94] group-hover:-translate-x-24 group-hover:-translate-y-3 group-hover:-rotate-6" },
] as const;

export default function TutorMatch() {
  const reduce = useReducedMotion();
  return (
    <div className="group relative mx-auto mt-14 h-64 w-72" aria-label="We match you with a tutor who excelled in your course and fits your timetable">
      {/* the other candidates: other tutors in the pool, each for a different course and time */}
      {CANDIDATES.map((c) => (
        <div
          key={c.course}
          aria-hidden
          className={`absolute inset-0 rounded-3xl border border-line-subtle bg-surface-raised shadow-md transition-transform duration-500 ${c.position}`}
        >
          <div className="flex items-center justify-between px-5 pt-2">
            <span className="font-mono text-[11px] font-bold text-fg-subtle">{c.course}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-faint">{c.when}</span>
          </div>
        </div>
      ))}

      {/* your match */}
      <div className="absolute inset-0 rounded-3xl border border-line-subtle bg-surface-raised p-6 text-left shadow-xl transition-transform duration-500 group-hover:-translate-y-2">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--astar-navy)] font-accent text-base font-bold text-white">
            A+
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-fg-faint">Your tutor</p>
            <p className="font-bold text-fg">Matched to you</p>
          </div>
        </div>
        <ul className="mt-5 space-y-2.5 text-sm text-fg-muted">
          {MATCH_POINTS.map((point, i) => (
            <li key={point} className="flex items-center gap-2.5">
              <RedPenTick delay={0.3 + i * 0.3} className="h-4 w-4 shrink-0" />
              {point}
            </li>
          ))}
        </ul>

        <motion.span
          aria-hidden
          initial={{ opacity: 0, scale: 2.2, rotate: -25 }}
          whileInView={{ opacity: 1, scale: 1, rotate: -12 }}
          viewport={{ once: true }}
          transition={reduce ? { duration: 0 } : { delay: 1.3, type: "spring", stiffness: 260, damping: 14 }}
          className="absolute bottom-5 right-5 rounded-lg border-[3px] border-[var(--astar-red)] px-3 py-1 font-mono text-sm font-black tracking-[0.2em] text-[var(--astar-red)] mix-blend-multiply dark:mix-blend-normal"
        >
          MATCHED
        </motion.span>
      </div>
    </div>
  );
}
