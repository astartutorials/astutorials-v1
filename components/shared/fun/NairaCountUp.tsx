'use client';

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/** Counts up to a naira amount (with thousands separators) when scrolled into view. */
export default function NairaCountUp({ value, delay = 0, className = "" }: { value: number; delay?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || reduce || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, {
      duration: 1.4,
      delay,
      ease: "easeOut",
      onUpdate: (v) => { node.textContent = `₦${Math.round(v).toLocaleString()}`; },
    });
    return () => controls.stop();
  }, [inView, reduce, value, delay]);

  // Server and first paint show the real figure, so nothing is wrong without JS.
  return <span ref={ref} className={className}>₦{value.toLocaleString()}</span>;
}
