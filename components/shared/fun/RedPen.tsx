'use client';

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * A clean underline: one solid, rounded bar in A-Star red that sweeps in from
 * the left the first time it scrolls into view. Replaced hand-drawn SVG marks,
 * which broke into pieces across letters and read as messy (2026-11-12).
 *
 * Markup is identical on server and client; reduced motion only changes timing.
 */
export function Underline({ children, delay = 0.3, className = "", style }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  // Watch the words, not the bar: a bar scaled to zero width has no area, and
  // the browser never reports it as visible.
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <span ref={ref} style={style} className={`relative inline-block ${className}`}>
      {children}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 -bottom-[0.06em] h-[0.08em] min-h-[3px] origin-left rounded-full bg-[var(--astar-red)]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: inView ? 1 : 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.7, delay, ease: [0.65, 0, 0.35, 1] }}
      />
    </span>
  );
}

/** A tick, drawn in. Used on checklists. */
export function RedPenTick({ delay = 0, className = "h-5 w-5" }: { delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg aria-hidden className={`overflow-visible ${className}`} viewBox="0 0 24 24">
      <motion.path
        d="M4 13 L9.5 18.5 L20 6"
        fill="none"
        stroke="var(--astar-red)"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={reduce ? { duration: 0 } : { duration: 0.5, delay, ease: "easeOut" }}
      />
    </svg>
  );
}
