'use client';

import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { Underline } from "@/components/shared/fun/RedPen";
import Tilt from "@/components/shared/fun/Tilt";
import NairaCountUp from "@/components/shared/fun/NairaCountUp";
import { AMBASSADOR_HREF, AMBASSADOR_COMMISSIONS } from "@/lib/ambassador";

/**
 * An illustration, not real data: one ambassador's month, to make the numbers
 * feel like something a student could do. Captioned as an illustration below
 * the ticket.
 */
const MONTH = "November";
const MONTH_ROWS = [
  { label: "Group Semester Plan", count: 5, each: AMBASSADOR_COMMISSIONS.group },
  { label: "Private Semester Plan", count: 2, each: AMBASSADOR_COMMISSIONS.private },
];
const MONTH_TOTAL = MONTH_ROWS.reduce((sum, r) => sum + r.count * r.each, 0);
const REFERRALS = MONTH_ROWS.reduce((sum, r) => sum + r.count, 0);
const FRIENDS = [
  { initials: "TA", tone: "bg-amber-200 text-amber-900" },
  { initials: "CN", tone: "bg-emerald-200 text-emerald-900" },
  { initials: "IO", tone: "bg-sky-200 text-sky-900" },
  { initials: "FB", tone: "bg-rose-200 text-rose-900" },
];

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
              Get paid for every{" "}
              <Underline delay={0.5}>
                <span className="text-red-400">referral</span>
              </Underline>
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
            <Tilt rest={-3} max={10} className="mx-auto max-w-sm">
              <div className="rounded-3xl bg-white text-[var(--astar-navy)] shadow-2xl shadow-black/40 overflow-hidden">
                <div className="px-6 pt-6 pb-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Your referral code</p>
                  <p className="mt-2 font-mono text-3xl font-bold tracking-[0.15em]">
                    YOU<span className="text-[var(--astar-red)]">123</span>
                  </p>
                </div>

                {/* Perforation */}
                <div className="relative h-6">
                  <div className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-[var(--astar-navy)]" />
                  <div className="absolute -right-3 top-0 h-6 w-6 rounded-full bg-[var(--astar-navy)]" />
                  <div className="absolute left-5 right-5 top-1/2 border-t-2 border-dashed border-gray-200" />
                </div>

                <div className="px-6 pt-3 pb-6">
                  <div className="flex items-center justify-between">
                    <p className="font-accent text-2xl font-bold tracking-tight text-[var(--astar-red)]">{MONTH}</p>
                    <div className="flex items-center">
                      {FRIENDS.map((f, i) => (
                        <motion.span
                          key={f.initials}
                          initial={{ opacity: 0, scale: 0.4 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.12, type: "spring", stiffness: 300, damping: 15 }}
                          className={`-ml-2 first:ml-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold ${f.tone}`}
                        >
                          {f.initials}
                        </motion.span>
                      ))}
                      <span className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--astar-navy)] text-[10px] font-bold text-white">
                        +{REFERRALS - FRIENDS.length}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{REFERRALS} friends signed up with your code</p>

                  <ul className="mt-4 space-y-2 text-sm">
                    {MONTH_ROWS.map((r, i) => (
                      <motion.li
                        key={r.label}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.9 + i * 0.2 }}
                        className="flex justify-between gap-4"
                      >
                        <span className="text-gray-500">{r.count} × {r.label}</span>
                        <span className="font-semibold">₦{(r.count * r.each).toLocaleString()}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-baseline justify-between border-t border-gray-100 pt-4">
                    <span className="text-sm font-semibold">You earn</span>
                    <NairaCountUp value={MONTH_TOTAL} delay={1.3} className="text-2xl font-extrabold text-[var(--astar-red)] tabular-nums" />
                  </div>
                </div>
              </div>
            </Tilt>
            <p className="mt-4 text-center text-[11px] text-white/40">Illustration of one month&apos;s earnings</p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
