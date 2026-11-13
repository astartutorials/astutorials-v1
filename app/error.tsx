"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import analytics from "@/lib/analytics";

/**
 * Shown when a page throws while rendering. It sits inside the root layout,
 * so the navbar and footer stay; `reset` re-renders the failed page.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    analytics.captureException(error, { digest: error.digest });
  }, [error]);

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-5 pt-32 pb-20 bg-[var(--astar-bg)]">
      <div className="w-full max-w-xl text-center">
        <p className="inline-flex items-center rounded-full border border-line bg-surface-raised px-3 py-1 text-xs font-semibold text-fg-muted">
          Something went wrong
        </p>
        <h1 className="mt-6 text-4xl md:text-5xl font-normal tracking-tighter leading-[1.1] text-fg">
          That one&apos;s on us.
        </h1>
        <p className="mt-5 text-lg text-fg-subtle font-light leading-relaxed">
          This page hit a problem while loading. Try again, and if it keeps happening, message us on WhatsApp.
          If you were paying, check your email for a receipt before paying again.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-sm sm:max-w-none mx-auto">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--astar-red)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-brand-hover transition-colors cursor-pointer"
          >
            <RotateCw size={16} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-line bg-surface-raised px-6 py-3.5 text-sm font-semibold text-fg hover:border-[var(--astar-red)] transition-colors"
          >
            Back to home
          </Link>
        </div>
        {error.digest && <p className="mt-8 text-xs text-fg-faint">Reference: {error.digest}</p>}
      </div>
    </section>
  );
}
