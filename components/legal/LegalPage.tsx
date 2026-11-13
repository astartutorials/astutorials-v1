import Link from "next/link";
import type { ReactNode } from "react";

export const LEGAL_UPDATED = "13 November 2026";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund-policy", label: "Refund Policy" },
];

/** The shared frame for the privacy, terms and refund pages. */
export function LegalPage({
  title,
  intro,
  current,
  children,
}: {
  title: string;
  intro: ReactNode;
  current: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--astar-bg)] pt-28 md:pt-32 pb-20">
      <article className="max-w-3xl mx-auto px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-fg-faint">Last updated {LEGAL_UPDATED}</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-fg">{title}</h1>
        <p className="mt-4 text-fg-subtle leading-relaxed">{intro}</p>

        <div className="mt-4">{children}</div>

        <nav aria-label="Other policies" className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-sm">
          {LEGAL_LINKS.filter((l) => l.href !== current).map((l) => (
            <Link key={l.href} href={l.href} className="font-semibold text-brand-ink underline underline-offset-4">
              {l.label}
            </Link>
          ))}
        </nav>
      </article>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-fg">{title}</h2>
      <div className="mt-3 space-y-3 text-fg-muted leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:font-semibold [&_a]:text-brand-ink [&_a]:underline [&_a]:underline-offset-4 [&_strong]:text-fg">
        {children}
      </div>
    </section>
  );
}

/** How to reach A-Star, the same way on every policy. */
export function ContactLines({ email, whatsapp }: { email: string; whatsapp: string }) {
  return (
    <ul>
      <li>Email: <a href={`mailto:${email}`}>{email}</a></li>
      <li>WhatsApp: {whatsapp}</li>
      <li>Address: Babcock University, Ilishan-Remo, Ogun State, Nigeria</li>
    </ul>
  );
}
