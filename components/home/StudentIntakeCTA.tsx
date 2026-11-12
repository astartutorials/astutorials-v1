'use client';

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, GraduationCap } from "lucide-react";
import Tilt from "@/components/shared/fun/Tilt";
import { RedPenTick } from "@/components/shared/fun/RedPen";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useOpenIntake } from "@/components/shared/useOpenIntake";
import { intakeHref } from "@/lib/intakes";

/**
 * Homepage band for the 100 level intake. Reads the session from the intake
 * registry, so next year's band updates itself when the new intake is added,
 * and the band disappears whenever no 100 level intake is open.
 */
/** A fresher's to-do list. The last item is the one we want ticked. */
// A fresher's progression: settled in, then A-Star (the open box, ticked on
// hover), then matriculation, then where it all leads (user, 2026-11-12).
const BEFORE = [{ item: "Settle in", done: true }];
const AFTER = [
  { item: "Matriculate 🎉", done: false },
  { item: "Thrive academically", done: false },
];

function ToDoItem({ item, done, delay, reduce }: { item: string; done: boolean; delay: number; reduce: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-2 border-fg-faint">
        {done && <RedPenTick delay={delay} className="absolute -top-1.5 left-0 h-5 w-5" />}
      </span>
      <span className="relative">
        {item}
        {done && (
          <motion.span
            aria-hidden
            className="absolute left-0 top-1/2 h-[2px] w-full origin-left bg-fg-faint"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={reduce ? { duration: 0 } : { delay: delay + 0.3, duration: 0.4 }}
          />
        )}
      </span>
    </li>
  );
}

function ToDoCard({ href, ticked }: { href: string; ticked: boolean }) {
  const reduce = useReducedMotion();
  return (
    <Link href={href} aria-label="Register with A-Star" className="block">
      <Tilt rest={2} max={7}>
        <div
          className="relative w-[21rem] max-w-[calc(100vw-5rem)] rounded-2xl bg-[#FFFDF3] dark:bg-[#1d2333] px-7 pt-6 pb-7 shadow-xl shadow-gray-300/40 dark:shadow-black/40 border border-amber-100 dark:border-white/10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(53,94,169,0.12) 31px, rgba(53,94,169,0.12) 32px)",
            backgroundPosition: "0 52px",
          }}
        >
          {/* tape */}
          <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[-3deg] rounded-sm bg-red-200/70 dark:bg-red-400/30" />
          <p className="font-note text-2xl font-bold text-fg">My 100L to-do</p>
          <ul className="mt-2 font-note text-xl leading-8 text-fg-muted">
            {BEFORE.map(({ item, done }, i) => <ToDoItem key={item} item={item} done={done} delay={0.3 + i * 0.35} reduce={!!reduce} />)}
            <li className="flex items-center gap-2 text-fg">
              <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-2 border-[var(--astar-red)]">
                {ticked && <RedPenTick className="absolute -top-1.5 left-0 h-5 w-5" />}
              </span>
              <span className="whitespace-nowrap font-bold">Register with A-Star</span>
              {/* Points straight at the item it's about. */}
              <motion.span
                className="ml-1 whitespace-nowrap text-lg text-[var(--astar-red)]"
                animate={ticked ? { x: 0 } : { x: [0, 4, 0] }}
                transition={reduce || ticked ? { duration: 0 } : { repeat: Infinity, duration: 1.4 }}
              >
                {ticked ? "done!" : "← 2 mins"}
              </motion.span>
            </li>
            {AFTER.map(({ item, done }) => <ToDoItem key={item} item={item} done={done} delay={0} reduce={!!reduce} />)}
          </ul>
        </div>
      </Tilt>
    </Link>
  );
}

export default function StudentIntakeCTA() {
  const intake = useOpenIntake(100);
  const [ticked, setTicked] = useState(false);
  if (!intake) return null;

  return (
    <ScrollReveal className="w-full px-6 my-8 max-w-[1440px] mx-auto">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-line-subtle bg-surface-raised">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 w-[26rem] h-[26rem] rounded-full bg-[var(--astar-red)] opacity-10 blur-3xl"
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-8 p-8 md:p-12 lg:p-16">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-ink">
              <GraduationCap size={14} />
              {intake.session} session · 100 Level
            </span>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-fg">
              Just got into university?
            </h2>
            <p className="mt-4 text-fg-subtle text-base md:text-lg leading-relaxed max-w-xl">
              Register with A-Star as a new 100 level student. We&apos;ll keep you posted on
              tutorials, classes and everything that helps you start strong.
            </p>
          </div>

          <div
            className="flex justify-center lg:order-last"
            onPointerEnter={() => setTicked(true)}
            onPointerLeave={() => setTicked(false)}
          >
            <ToDoCard href={intakeHref(100)} ticked={ticked} />
          </div>

          <div className="lg:pl-8">
            <Link
              href={intakeHref(100)}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[var(--astar-red)] px-8 py-4 font-bold text-white shadow-lg shadow-red-900/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              Register now
              <ArrowRight size={18} />
            </Link>
            <p className="mt-3 text-xs text-fg-faint text-center sm:text-left">Takes about two minutes.</p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
