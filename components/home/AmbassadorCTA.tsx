'use client';

import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { AMBASSADOR_HREF, AMBASSADOR_COMMISSIONS } from "@/lib/ambassador";

/**
 * A worked example, not real data: it shows how a month adds up, and is
 * labelled as an example on the card.
 */
const EXAMPLE = [
  { label: "Group Semester Plan", count: 4, each: AMBASSADOR_COMMISSIONS.group },
  { label: "Private Semester Plan", count: 1, each: AMBASSADOR_COMMISSIONS.private },
];
const EXAMPLE_TOTAL = EXAMPLE.reduce((sum, r) => sum + r.count * r.each, 0);

/** Homepage band for the A-Star Ambassadors programme (/ambassador). */
export default function AmbassadorCTA() {
  return (
    <ScrollReveal className="w-full px-6 my-8 max-w-[1440px] mx-auto">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-[var(--astar-navy)] text-white shadow-xl">
        <div aria-hidden className="pointer-events-none absolute -left-24 -bottom-32 h-80 w-80 rounded-full bg-[var(--astar-red)] opacity-20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-1/3 -top-24 h-56 w-56 rounded-full bg-blue-500 opacity-10 blur-3xl" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-8 md:p-12 lg:p-16">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-red-200">
              <Megaphone size={14} />
              A-Star Ambassadors · Applications open
            </span>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight">
              Get paid for every <span className="text-red-400">referral</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-on-dark-muted leading-relaxed max-w-xl">
              Earn ₦{AMBASSADOR_COMMISSIONS.group.toLocaleString()} to ₦{AMBASSADOR_COMMISSIONS.private.toLocaleString()} for
              every student who joins A-Star&apos;s Semester Plan with your code. Paid monthly.
            </p>

            <Link
              href={AMBASSADOR_HREF}
              className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[var(--astar-red)] px-8 py-4 font-bold text-white shadow-lg shadow-red-500/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              Become an ambassador
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* The referral "ticket": what an ambassador actually gets. */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <div className="rounded-3xl bg-white text-[var(--astar-navy)] shadow-2xl overflow-hidden">
                <div className="px-6 pt-6 pb-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Your referral code</p>
                  <p className="mt-2 font-mono text-3xl font-bold tracking-[0.15em]">
                    YOU<span className="text-[var(--astar-red)]">482</span>
                  </p>
                </div>

                {/* Perforation */}
                <div className="relative h-6">
                  <div className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-[var(--astar-navy)]" />
                  <div className="absolute -right-3 top-0 h-6 w-6 rounded-full bg-[var(--astar-navy)]" />
                  <div className="absolute left-5 right-5 top-1/2 border-t-2 border-dashed border-gray-200" />
                </div>

                <div className="px-6 pt-4 pb-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Example month</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {EXAMPLE.map((r) => (
                      <li key={r.label} className="flex justify-between gap-4">
                        <span className="text-gray-500">{r.count} × {r.label}</span>
                        <span className="font-semibold">₦{(r.count * r.each).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-baseline justify-between border-t border-gray-100 pt-4">
                    <span className="text-sm font-semibold">You earn</span>
                    <span className="text-2xl font-extrabold text-[var(--astar-red)]">₦{EXAMPLE_TOTAL.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
