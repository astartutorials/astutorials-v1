'use client';

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Red-pen marks, the way a tutor marks a script: a loose circle, a wobbly
 * underline, a tick. They draw themselves in when scrolled into view, once.
 * Purely decorative (aria-hidden); the text they mark stays plain text.
 */

const RED = "var(--astar-red)";

/**
 * The rendered markup must not depend on the reduced-motion setting: the
 * server can't know it, and a mismatch leaves the mark stuck undrawn. So the
 * props stay the same and only the timing changes: instant when reduced.
 */
function useDraw(delay: number) {
  const reduce = useReducedMotion();
  return {
    initial: { pathLength: 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true, margin: "-60px" },
    transition: reduce ? { duration: 0 } : { duration: 0.9, delay, ease: [0.65, 0, 0.35, 1] as const },
  };
}

export function RedPenCircle({ children, delay = 0.3, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const draw = useDraw(delay);
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <svg
        aria-hidden
        className="pointer-events-none absolute -inset-x-[8%] -inset-y-[22%] h-[144%] w-[116%] overflow-visible"
        viewBox="0 0 200 80"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M108 6 C 52 2, 8 14, 6 40 C 4 66, 60 76, 112 74 C 162 72, 196 60, 194 36 C 192 12, 140 4, 84 10"
          fill="none"
          stroke={RED}
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          {...draw}
        />
      </svg>
    </span>
  );
}

export function RedPenUnderline({ children, delay = 0.3, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const draw = useDraw(delay);
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <svg
        aria-hidden
        className="pointer-events-none absolute left-0 -bottom-[0.18em] h-[0.4em] w-full overflow-visible"
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M3 13 C 40 6, 80 16, 120 9 S 180 7, 197 11"
          fill="none"
          stroke={RED}
          strokeWidth="3.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          {...draw}
        />
      </svg>
    </span>
  );
}

export function RedPenTick({ delay = 0, className = "h-5 w-5" }: { delay?: number; className?: string }) {
  const draw = useDraw(delay);
  return (
    <svg aria-hidden className={`overflow-visible ${className}`} viewBox="0 0 24 24">
      <motion.path
        d="M3 13 L9 19 L21 4"
        fill="none"
        stroke={RED}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw}
      />
    </svg>
  );
}
