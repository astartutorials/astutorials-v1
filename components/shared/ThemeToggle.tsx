'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '@/components/shared/ThemeProvider';

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

/**
 * `icon` is a single button that cycles light → dark → system, for the desktop
 * nav where the row is already tight. `segmented` shows all three at once, for
 * the mobile menu where there is room to make 'system' discoverable.
 */
export default function ThemeToggle({
  variant = 'icon',
}: {
  variant?: 'icon' | 'segmented';
}) {
  // ThemeProvider reads the theme through useSyncExternalStore, so the server
  // and hydration snapshots already agree — no mounted flag needed here.
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div
        role="radiogroup"
        aria-label="Colour theme"
        className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface-sunken p-1"
      >
        {OPTIONS.map(({ value, label, Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(value)}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-surface-raised text-fg shadow-sm'
                  : 'text-fg-subtle hover:text-fg'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  const current = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[2];
  const next = OPTIONS[(OPTIONS.indexOf(current) + 1) % OPTIONS.length];
  // 'system' shows what it currently resolves to, so the icon never contradicts
  // the page the visitor is looking at.
  const Icon =
    theme === 'system' ? (resolvedTheme === 'dark' ? Moon : Sun) : current.Icon;

  return (
    <button
      type="button"
      onClick={() => setTheme(next.value)}
      title={`Theme: ${current.label}. Switch to ${next.label}.`}
      aria-label={`Theme: ${current.label}. Switch to ${next.label}.`}
      className="relative w-9 h-9 flex items-center justify-center rounded-full text-fg-muted hover:text-fg hover:bg-surface-inset transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      {theme === 'system' && (
        <span
          aria-hidden="true"
          className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-brand-ink ring-2 ring-[var(--surface)]"
        />
      )}
    </button>
  );
}
