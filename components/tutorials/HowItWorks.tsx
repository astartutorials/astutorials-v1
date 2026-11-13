import type { ReactNode } from "react";
import { Check, CreditCard, Mail, MessageCircle } from "lucide-react";
import Words from "@/components/shared/Words";

/**
 * How booking works, per tab, each step with a small picture of what it looks
 * like. Moved here from the home page preview (PR #69, 2026-11-13) and made to
 * match the real flows:
 *
 *  - group: pick a session, pay, then a confirmation email with the day, time
 *    and venue (after a quick course/level form).
 *  - private: pay ₦6,090, tell us the course and times, matched on WhatsApp.
 *
 * Replaced a generic version on the private tab that had the steps in the
 * wrong order and promised progress tracking A-Star doesn't offer.
 */

function StepCard({ n, title, desc, children }: { n: string; title: string; desc: string; children: ReactNode }) {
  return (
    <div className="reveal flex flex-col rounded-3xl border border-line-subtle bg-surface-raised p-3">
      <div className="h-44 rounded-[1.25rem] bg-surface-sunken p-5 flex items-center justify-center overflow-hidden">
        {children}
      </div>
      <div className="px-4 pt-5 pb-4">
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-brand-soft px-2 text-xs font-bold text-brand-ink">{n}</span>
        <h3 className="mt-3 text-xl font-bold text-fg">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-fg-subtle">{desc}</p>
      </div>
    </div>
  );
}

function PaidCard({ label }: { label: string }) {
  return (
    <div className="w-full max-w-[15rem] rounded-2xl bg-surface-raised p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/15 text-green-700 dark:text-green-400"><Check size={14} strokeWidth={3} /></span>
        <span className="text-sm font-bold text-fg">Payment received</span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-3 text-xs">
        <span className="inline-flex items-center gap-1.5 text-fg-subtle"><CreditCard size={13} /> Paystack</span>
        <span className="font-semibold text-fg">{label}</span>
      </div>
    </div>
  );
}

const COURSES = [
  { code: "GEDS 126", seats: "8 seats left", hot: false },
  { code: "PHY 102", seats: "Only 3 left", hot: true },
  { code: "IFT 212", seats: "12 seats left", hot: false },
];

function GroupSteps() {
  return (
    <>
      <StepCard n="01" title="Pick a session" desc="Each session shows the course, day, time, venue and how many seats are left.">
        <ul className="w-full max-w-[15rem] space-y-2">
          {COURSES.map((c, i) => (
            <li key={c.code} className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${i === 1 ? "bg-surface-raised border border-[var(--astar-red)]/40 shadow-sm" : "bg-surface-raised/70"}`}>
              <span className="font-bold text-fg">{c.code}</span>
              <span className={`text-[11px] font-semibold ${c.hot ? "text-brand-ink" : "text-fg-faint"}`}>{c.seats}</span>
            </li>
          ))}
        </ul>
      </StepCard>
      <StepCard n="02" title="Pay securely" desc="Pay online with Paystack by card, bank transfer or USSD. Your seat is held as soon as it goes through.">
        <PaidCard label="Seat booked" />
      </StepCard>
      <StepCard n="03" title="Show up" desc="Your confirmation email has the day, time and venue. Bring your questions.">
        <div className="w-full max-w-[15rem] rounded-2xl bg-surface-raised p-4 shadow-sm">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-faint"><Mail size={12} /> Booking confirmed</p>
          <p className="mt-2 text-sm font-bold text-fg">PHY 102 group tutorial</p>
          <p className="mt-0.5 text-xs text-fg-subtle">Wednesday · 4:00pm</p>
        </div>
      </StepCard>
    </>
  );
}

function PrivateSteps() {
  return (
    <>
      <StepCard n="01" title="Pay for a session" desc="₦6,090 a session, paid online with Paystack by card, bank transfer or USSD.">
        <PaidCard label="₦6,090" />
      </StepCard>
      <StepCard n="02" title="Tell us what you need" desc="A short form: your course, your level, and the times that suit you.">
        <div className="w-full max-w-[15rem] space-y-2 rounded-2xl bg-surface-raised p-4 shadow-sm text-xs">
          {[["Course", "PHY 102"], ["Level", "100L"], ["Times", "Weekday evenings"]].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-lg border border-line-subtle px-3 py-1.5">
              <span className="text-fg-faint">{k}</span>
              <span className="font-semibold text-fg">{v}</span>
            </div>
          ))}
        </div>
      </StepCard>
      <StepCard n="03" title="Meet your tutor" desc="We match you with a tutor who did well in your course and set up your sessions on WhatsApp.">
        <div className="w-full max-w-[15rem] space-y-2 rounded-2xl bg-[#ECE5DD] dark:bg-[#1f2c33] p-3">
          <p className="ml-auto w-fit max-w-[85%] rounded-xl rounded-tr-sm bg-[#D9FDD3] dark:bg-[#005c4b] px-3 py-1.5 text-xs text-[#111b21] dark:text-white">Hi! I just paid for a private session</p>
          <p className="w-fit max-w-[85%] rounded-xl rounded-tl-sm bg-white dark:bg-[#202c33] px-3 py-1.5 text-xs text-[#111b21] dark:text-white">
            You&apos;re matched! Your tutor got an A in PHY 102.
          </p>
          <p className="flex items-center gap-1 text-[10px] text-[#667781]"><MessageCircle size={11} /> WhatsApp</p>
        </div>
      </StepCard>
    </>
  );
}

export default function HowItWorks({ variant }: { variant: "group" | "private" }) {
  return (
    <section className="max-w-6xl mx-auto px-4">
      <div className="max-w-2xl mb-8 md:mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-ink mb-3">How it works</p>
        <h2 className="reveal-words text-3xl md:text-4xl font-bold tracking-tight text-fg">
          <Words text={variant === "group" ? "From booking to your seat in three steps." : "Three steps to your own tutor."} />
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {variant === "group" ? <GroupSteps /> : <PrivateSteps />}
      </div>
    </section>
  );
}
