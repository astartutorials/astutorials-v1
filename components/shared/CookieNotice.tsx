"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const KEY = "astar-cookie-notice";
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => { listeners.delete(onChange); };
}

function dismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === "ok";
  } catch {
    // Storage blocked: nothing can be remembered, so don't nag on every page.
    return true;
  }
}

/**
 * A one-time notice that the site uses cookies for analytics, linking to the
 * privacy policy. It is a notice, not a consent gate: analytics load either
 * way. The server renders nothing, so it never flashes for someone who has
 * already dismissed it.
 */
export default function CookieNotice() {
  const hidden = useSyncExternalStore(subscribe, dismissed, () => true);
  if (hidden) return null;

  function dismiss() {
    try { localStorage.setItem(KEY, "ok"); } catch {}
    listeners.forEach((l) => l());
  }

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-50 rounded-2xl border border-line bg-surface-raised p-4 shadow-xl"
    >
      <p className="text-sm text-fg-muted leading-relaxed">
        We use cookies to see how the site is used and make it better.{" "}
        <Link href="/privacy" className="font-semibold text-brand-ink underline underline-offset-4">
          Privacy Policy
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="mt-3 rounded-full bg-[var(--astar-navy)] px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-[var(--astar-navy)] cursor-pointer"
      >
        OK
      </button>
    </div>
  );
}
