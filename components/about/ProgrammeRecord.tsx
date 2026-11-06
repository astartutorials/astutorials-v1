'use client';

import Link from "next/link";
import { usePrograms } from "@/components/shared/programmes";

/**
 * The programmes A-Star has run, read from the same registry as the nav's
 * Programmes menu, so this list never needs editing by hand.
 */
export default function ProgrammeRecord() {
  const programmes = usePrograms();
  if (programmes.length === 0) return null;

  return (
    <section className="max-w-[1100px] mx-auto px-6 mt-16 md:mt-20">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-fg-strong">Beyond weekly tutorials</h2>
      <p className="mt-3 text-fg-muted max-w-2xl">
        We also run prep classes, webinars and events around the moments that trip students up:
        starting university, moving into 200 level, the jump into clinicals.
      </p>
      <ul className="mt-8 divide-y divide-line-subtle border-y border-line-subtle">
        {programmes.map((p) => (
          <li key={p.key}>
            <Link
              href={p.href}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-4 group"
            >
              <span className="font-semibold text-fg-strong group-hover:text-brand-ink transition-colors">
                {p.name}
              </span>
              <span className="text-sm text-fg-subtle">
                {p.open ? p.blurb : p.pastBlurb}
                <span
                  className={`ml-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    p.open ? "bg-brand-soft text-brand-ink" : "bg-surface-inset text-fg-subtle"
                  }`}
                >
                  {p.open ? p.tag : "Past"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
