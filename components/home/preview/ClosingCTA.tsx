import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SEMESTER_PLAN_HREF } from "@/lib/semester-plan";

/** The last thing before the footer: one clear next step. */
export default function ClosingCTA() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-6 pb-20">
      <div className="reveal relative overflow-hidden rounded-[2.5rem] bg-[var(--astar-red)] px-6 py-16 md:py-20 text-center text-white">
        <div aria-hidden className="absolute -bottom-40 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-[50%] bg-[#B3261E]" />
        <div className="relative">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Start the semester<br className="hidden sm:block" /> ahead, not behind.
          </h2>
          <p className="mt-5 text-white/85 text-lg">Group or private, one session or the whole semester.</p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={SEMESTER_PLAN_HREF} className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#B3261E] shadow-xl shadow-black/15">
              Get the Semester Plan
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--astar-red)] text-white"><ArrowRight size={14} /></span>
            </Link>
            <Link href="/tutorials" className="inline-flex items-center rounded-full border border-white/40 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10">
              Book one session
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
