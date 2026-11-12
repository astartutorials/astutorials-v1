import type { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

/**
 * Fades a section up as it scrolls into view, in CSS alone (`.reveal` in
 * globals.css, a scroll-driven animation). No JavaScript, so nothing waits on
 * hydration, and browsers without scroll-driven animations simply show the
 * content. Replaced a Framer Motion version that kept every section, the hero
 * included, invisible until JS ran, which held LCP back by seconds (2026-11-12).
 */
export default function ScrollReveal({ children, id, className = "" }: ScrollRevealProps) {
  return (
    <div id={id} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
