"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Underline } from "@/components/shared/fun/RedPen";
import { EXCUSES, type Excuse } from "./excuses";

function Title({ excuse }: { excuse: Excuse }) {
  const at = excuse.title.indexOf(excuse.mark);
  if (at < 0) return <>{excuse.title}</>;
  return (
    <>
      {excuse.title.slice(0, at)}
      {/* Keyed so the underline sweeps in again for each new excuse. */}
      <Underline key={excuse.id} delay={0.25} className="whitespace-nowrap">{excuse.mark}</Underline>
      {excuse.title.slice(at + excuse.mark.length)}
    </>
  );
}

// Picked once per page load in the browser. The server has no pick (null), so
// hydration matches, then the client renders its random excuse.
const clientPick = typeof window === "undefined" ? 0 : Math.floor(Math.random() * EXCUSES.length);
const noSubscribe = () => () => {};

/**
 * The 404 page. The content stays hidden until the browser has picked an
 * excuse, so the swap from the server's render never shows. `initial` pins an
 * excuse (used by previews).
 */
export default function NotFound({ initial }: { initial?: number }) {
  const picked = useSyncExternalStore<number | null>(noSubscribe, () => clientPick, () => null);
  const base = initial ?? picked;
  const [step, setStep] = useState(0);

  const index = base === null ? null : (base + step) % EXCUSES.length;
  const excuse = EXCUSES[index ?? 0];

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-5 pt-32 pb-20">
      <div
        className={`w-full max-w-2xl text-center transition-opacity duration-300 ${index === null ? "opacity-0" : "opacity-100"}`}
        aria-live="polite"
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised px-3 py-1 text-xs font-semibold text-fg-muted">
          <span className="font-bold text-[var(--astar-red)]">404</span>
          <span aria-hidden className="h-3 w-px bg-line" />
          {excuse.tag}
        </p>

        <h1 className="mt-6 text-4xl md:text-6xl font-normal tracking-tighter leading-[1.1] text-fg">
          <Title excuse={excuse} />
        </h1>

        <p className="mt-6 text-lg text-fg-subtle font-light leading-relaxed max-w-xl mx-auto">
          {excuse.body}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-sm sm:max-w-none mx-auto">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--astar-red)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-brand-hover transition-colors"
          >
            Back to home
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/tutorials"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface-raised px-6 py-3.5 text-sm font-semibold text-fg hover:border-[var(--astar-red)] transition-colors"
          >
            Find a tutorial
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setStep((s) => s + 1)}
          className="mt-8 inline-flex items-center gap-1.5 text-xs font-medium text-fg-faint hover:text-fg transition-colors"
        >
          <RefreshCw size={12} />
          Try another excuse
        </button>
      </div>
    </section>
  );
}
