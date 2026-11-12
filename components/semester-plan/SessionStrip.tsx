"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * The semester as one quiet line: a red fill sweeps from the first lecture to
 * the exams when the card scrolls into view. Replaced a 50-square grid that
 * made the plan cards busy (2026-11-12).
 */
const MILESTONES = ["First lecture", "Tests", "Exams"];

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
      <div className={`mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wider ${muted}`}>
        {MILESTONES.map((m) => <span key={m}>{m}</span>)}
      </div>
    </div>
  );
}
