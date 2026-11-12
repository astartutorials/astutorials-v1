'use client';

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

/**
 * Leans towards the pointer, like picking a card up off the desk. Off for
 * touch screens (nothing to follow) and for people who prefer reduced motion.
 */
export default function Tilt({
  children,
  max = 8,
  className = "",
  rest = 0,
}: {
  children: ReactNode;
  /** Largest lean in degrees. */
  max?: number;
  className?: string;
  /** Resting rotation in degrees, e.g. -2 for a card dropped at an angle. */
  rest?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const spring = { stiffness: 180, damping: 18 };
  const rotateX = useSpring(useTransform(y, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(x, [0, 1], [-max, max]), spring);
  const rotateZ = useSpring(rest, spring);

  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
    rotateZ.set(0);
  }

  function onLeave() {
    x.set(0.5);
    y.set(0.5);
    rotateZ.set(rest);
  }

  return (
    <div style={{ perspective: 900 }} className={className}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        // Same style on server and client; reduced motion just never moves it.
        style={{ rotateX, rotateY, rotate: rotateZ, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
