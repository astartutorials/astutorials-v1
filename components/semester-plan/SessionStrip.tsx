"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * One square per session, filling in left to right when the card scrolls into
 * view: 50 sessions you can see, instead of a number you have to imagine.
 */
export default function SessionStrip({ sessions, onDark = false }: { sessions: number; onDark?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="mt-4" aria-label={`${sessions} sessions across the semester`}>
      <motion.div
        className="grid grid-cols-[repeat(25,minmax(0,1fr))] gap-[3px]"
        initial="empty"
        whileInView="full"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ staggerChildren: reduce ? 0 : 0.025 }}
      >
        {Array.from({ length: sessions }, (_, i) => (
          <motion.span
            key={i}
            variants={{
              empty: { scale: 0.4, opacity: 0.25 },
              full: { scale: 1, opacity: 1 },
            }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 20 }}
            className={`h-3 rounded-[2px] ${
              i === sessions - 1 ? "bg-[var(--astar-red)]" : onDark ? "bg-white/70" : "bg-[var(--astar-navy)]/80 dark:bg-white/70"
            }`}
          />
        ))}
      </motion.div>
      <div className={`mt-1.5 flex justify-between text-[10px] font-semibold uppercase tracking-wider ${onDark ? "text-on-dark-muted" : "text-fg-faint"}`}>
        <span>First lecture</span>
        <span className="font-hand text-sm normal-case tracking-normal text-[var(--astar-red)]">last exam ✓</span>
      </div>
    </div>
  );
}
