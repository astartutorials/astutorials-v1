import { Wallet, Ticket, CalendarCheck, Megaphone, CheckCircle2 } from "lucide-react";
import AmbassadorApplyForm from "./AmbassadorApplyForm";
import {
  AMBASSADOR_PROGRAMME_NAME,
  AMBASSADOR_COMMISSIONS,
  AMBASSADOR_BENEFITS,
  AMBASSADOR_STEPS,
  AMBASSADOR_ROLE,
} from "@/lib/ambassador";

const BENEFIT_ICONS = [Wallet, Ticket, CalendarCheck];

export default function AmbassadorLanding() {
  return (
    <div className="min-h-screen bg-[var(--astar-bg)] font-sans selection:bg-[var(--astar-red)] selection:text-white">
      {/* ── HERO + FORM ─────────────────────────────────────── */}
      <section className="pt-28 md:pt-32 pb-14 md:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1fr_minmax(0,32rem)] gap-10 lg:gap-14 items-start">
          <div className="lg:pt-6">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-fg-faint">
              {AMBASSADOR_PROGRAMME_NAME}
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-brand-ink leading-[1.05]">
              Become an A-Star Ambassador
            </h1>
            <p className="mt-6 max-w-xl text-base md:text-lg text-fg-subtle leading-relaxed">
              Help your coursemates get the support they need to excel, and earn for every student
              you bring to A-Star.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
              {([
                ["Group Semester Plan", AMBASSADOR_COMMISSIONS.group],
                ["Private Semester Plan", AMBASSADOR_COMMISSIONS.private],
              ] as const).map(([label, amount]) => (
                <div key={label} className="rounded-2xl bg-surface-raised border border-line-subtle shadow-sm p-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-brand-ink">₦{amount.toLocaleString()}</p>
                  <p className="mt-1 text-xs sm:text-sm text-fg-muted">per {label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-fg-faint">Paid at the end of every month.</p>

            <div className="mt-8">
              <p className="text-sm font-bold text-fg">As an ambassador, you&apos;ll:</p>
              <ul className="mt-3 space-y-2.5 text-sm md:text-base text-fg-muted">
                {AMBASSADOR_ROLE.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={19} className="mt-0.5 flex-shrink-0 text-brand-ink" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            id="apply"
            className="scroll-mt-28 rounded-2xl bg-surface-raised border border-line-subtle shadow-xl p-6 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-fg">Apply to join</h2>
            <p className="mt-1 mb-6 text-sm text-fg-subtle">Open to Babcock students at every level.</p>
            <AmbassadorApplyForm />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="bg-[var(--astar-navy)] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-16">
          <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight">How it works</h2>
          <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AMBASSADOR_STEPS.map((step, i) => (
              <li key={step.title}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--astar-red)] font-bold">
                  {i + 1}
                </span>
                <p className="mt-4 font-bold text-lg">{step.title}</p>
                <p className="mt-1 text-sm text-white/70 leading-relaxed">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── BENEFITS ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-16">
        <h2 className="text-center text-2xl md:text-3xl font-bold tracking-tight text-fg">What you get</h2>
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {AMBASSADOR_BENEFITS.map(({ title, desc }, i) => {
            const Icon = BENEFIT_ICONS[i] ?? Megaphone;
            return (
              <div key={title} className="rounded-2xl bg-surface-raised border border-line-subtle shadow-sm p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                  <Icon size={20} />
                </div>
                <p className="mt-4 font-bold text-fg">{title}</p>
                <p className="mt-1 text-sm text-fg-muted leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#apply"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] text-white px-8 py-4 text-base font-bold shadow-lg shadow-red-500/20 hover:bg-brand-hover hover:-translate-y-0.5 transition-all"
          >
            Apply Now
          </a>
        </div>
      </section>
    </div>
  );
}
