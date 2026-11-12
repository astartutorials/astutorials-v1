"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * The semester as one quiet line: a red fill sweeps from the first lecture to
 * the exams when the card scrolls into view. Replaced a 50-square grid that
 * made the plan cards busy (2026-11-12).
 */
const MILESTONES = ["First lecture", "Midsemesters", "Exams"];

export default function SessionStrip({ sessions, onDark = false }: { sessions: number; onDark?: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const muted = onDark ? "text-on-dark-muted" : "text-fg-faint";
  return (
    <div ref={ref} className="mt-5" aria-label={`${sessions} sessions from the first lecture to the exams`}>
      <div className={`relative h-[3px] rounded-full ${onDark ? "bg-white/15" : "bg-surface-inset"}`}>
        <motion.div
          className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-[var(--astar-red)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: inView ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 1.4, ease: "easeInOut", delay: 0.2 }}
        />
        {MILESTONES.map((m, i) => (
          <span
            key={m}
            aria-hidden
            className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-[var(--astar-red)] ${onDark ? "bg-[var(--astar-navy)]" : "bg-surface-raised"}`}
            style={{ left: `calc(${(i / (MILESTONES.length - 1)) * 100}% - ${i === 0 ? 0 : i === MILESTONES.length - 1 ? 10 : 5}px)` }}
          />
        ))}
      </div>
      {/* Each label sits under its own dot: the ends align to the edges, the
          middle one is centred on the midpoint (justify-between drifted it
          off-centre because the end labels differ in width). */}
      <div className={`relative mt-2 h-3 text-[10px] font-semibold uppercase tracking-wider ${muted}`}>
        <span className="absolute left-0">{MILESTONES[0]}</span>
        <span className="absolute left-1/2 -translate-x-1/2">{MILESTONES[1]}</span>
        <span className="absolute right-0">{MILESTONES[2]}</span>
      </div>
    </div>
  );
}
