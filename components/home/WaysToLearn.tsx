import Link from "next/link";
import { ArrowRight, BookOpen, CalendarRange, User, Users } from "lucide-react";
import Words from "@/components/shared/Words";
import { SEMESTER_PLANS, SEMESTER_PLAN_HREF } from "@/lib/semester-plan";

const g = SEMESTER_PLANS.group;
const p = SEMESTER_PLANS.private;

function SmallCard({ icon: Icon, title, desc, price, cta, href }: {
  icon: typeof Users; title: string; desc: string; price: string; cta: string; href: string;
}) {
  return (
    <Link href={href} className="reveal group flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6 hover:bg-white/[0.07] transition-colors">
      <Icon size={22} className="text-[#F4A9A3]" />
      <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-white/60">{desc}</p>
      <div className="mt-auto pt-6 flex items-end justify-between gap-3">
        <span className="text-sm font-semibold text-white">{price}</span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F4A9A3]">
          {cta} <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

/**
 * Ways to learn, with prices: the Semester Plan as the large card, then group,
 * private and exam mock sessions. Replaced "Our Academic Services" and "Who We
 * Are" (picked by the user from the home page preview, 2026-11-13).
 */
export default function WaysToLearn() {
  return (
    <section id="services" className="w-full bg-[var(--astar-navy)] py-16 md:py-24 my-10 md:my-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="max-w-2xl mb-10 md:mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#F4A9A3] mb-3">Ways to learn</p>
          <h2 className="reveal-words text-3xl md:text-5xl font-bold tracking-tight text-white">
            <Words text="One session, or the whole semester." />
          </h2>
          <p className="mt-4 text-white/60 text-lg">Clear prices, paid online. Choose what fits your courses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* The main product, large. */}
          <Link
            href={SEMESTER_PLAN_HREF}
            className="reveal group md:col-span-2 lg:row-span-2 flex flex-col rounded-3xl bg-[var(--astar-red)] p-7 md:p-9 text-white shadow-2xl shadow-red-900/30"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-semibold"><CalendarRange size={18} /> Full Semester Plan</span>
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">New · 100L</span>
            </div>
            <h3 className="mt-8 text-3xl md:text-4xl font-bold tracking-tight leading-tight">Your whole first semester, covered.</h3>
            <p className="mt-3 text-white/80 max-w-md">
              {g.sessions} sessions across the semester, with revision built in before tests and exams.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-white/70">Group</p>
                <p className="mt-1 text-2xl font-bold">₦{g.price.toLocaleString()}</p>
                <p className="text-xs text-white/70">or 2 instalments of ₦{g.instalment.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-white/70">Private</p>
                <p className="mt-1 text-2xl font-bold">₦{p.price.toLocaleString()}</p>
                <p className="text-xs text-white/70">or 2 instalments of ₦{p.instalment.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#B3261E]">
                See the plan <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          <SmallCard icon={Users} title="Group tutorials" desc="Small classes with coursemates, focused on one course at a time." price="Priced per session" cta="View schedule" href="/tutorials" />
          <SmallCard icon={User} title="Private 1-on-1" desc="A tutor matched to you, at your pace and around your timetable." price="₦6,090 / session" cta="Find a tutor" href="/tutorials?type=private" />
          <SmallCard icon={BookOpen} title="Exam mock sessions" desc="Timed practice and revision on the topics that come up, before tests and exams." price="Priced per session" cta="Start prep" href="/tutorials" />
          <div className="reveal hidden lg:flex flex-col justify-center rounded-3xl border border-dashed border-white/15 p-6 text-sm text-white/60">
            Not sure which fits?{" "}
            <a href="https://wa.me/2349160465678" className="mt-2 inline-flex items-center gap-1 font-semibold text-white hover:text-[#F4A9A3]">
              Ask us on WhatsApp <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
