'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

/** Also read by the pre-hydration script in app/layout.tsx — keep them in sync. */
export const THEME_STORAGE_KEY = 'astar-theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/* ---------------------------------------------------------------------------
   The theme is not React state — it lives in localStorage, in the OS setting,
   and on <html>. Modelling it as an external store means the server snapshot
   and the hydration snapshot are handled by React itself, so there is no
   setState-in-effect and no hydration mismatch to paper over.

   The snapshot is a single string ("system|dark") so React can compare it by
   value; returning an object here would allocate on every read and loop.
--------------------------------------------------------------------------- */

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(onStoreChange: () => void) {
  if (listeners.size === 0) {
    window.matchMedia(DARK_QUERY).addEventListener('change', emit);
    // Keeps other tabs in step when the preference changes in one of them.
    window.addEventListener('storage', onExternalStorageChange);
  }
  listeners.add(onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0) {
      window.matchMedia(DARK_QUERY).removeEventListener('change', emit);
      window.removeEventListener('storage', onExternalStorageChange);
    }
  };
}

function onExternalStorageChange(event: StorageEvent) {
  if (event.key === THEME_STORAGE_KEY) emit();
}

/**
 * Light is the default: a visitor who has never chosen gets the light theme
 * regardless of their OS setting. 'system' is still a preference they can pick
 * from the toggle — it is just no longer what they start on.
 */
function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // Private mode or blocked storage — fall through to the default.
  }
  return 'light';
}

function getSnapshot(): string {
  const system = window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
  return `${readPreference()}|${system}`;
}

/* The server cannot know either value; React re-reads the client snapshot
   immediately after hydration and re-renders if it differs. */
function getServerSnapshot(): string {
  return 'light|light';
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

type ThemeContextValue = {
  /** What the user chose, including 'system'. */
  theme: ThemePreference;
  /** What is actually painted right now. Never 'system'. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [preference, system] = snapshot.split('|') as [ThemePreference, ResolvedTheme];
  const resolvedTheme: ResolvedTheme = preference === 'system' ? system : preference;

  // The pre-hydration script already set this for the first paint. Re-applying
  // covers the later changes: the OS flipping while 'system' is selected, and
  // another tab writing a new preference.
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Non-fatal: the theme still applies for this page view.
    }

    // Paint the swap with a transition, but only for its duration — see the
    // .theme-transition guard in globals.css for why it is not left on.
    const root = document.documentElement;
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 220);

    emit();
  }, []);

  const value = useMemo(
    () => ({ theme: preference, resolvedTheme, setTheme }),
    [preference, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
