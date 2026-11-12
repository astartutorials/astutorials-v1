import type { Metadata } from "next";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Accordion, WHATSAPP_URL } from "@/components/home/FAQ";
import { FAQ_GROUPS, ALL_FAQS } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | A-Star Tutorials",
  description:
    "Answers about booking group and private tutorials, the Full Semester Plan, paying as a parent, discounts, and earning as an A-Star Ambassador.",
  alternates: { canonical: "/faq" },
};

/** Lets search engines show the answers directly in results. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ALL_FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[var(--astar-bg)] pt-28 md:pt-32 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-fg">Frequently Asked Questions</h1>
        <p className="mt-4 text-fg-subtle">
          Everything students and parents usually ask us. Can&apos;t find yours? Ask us on WhatsApp.
        </p>

        {FAQ_GROUPS.map((g) => (
          <section key={g.title} className="mt-12">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-fg-faint">{g.title}</h2>
            <Accordion items={g.items} />
          </section>
        ))}

        <div className="mt-14 rounded-3xl bg-[var(--astar-navy)] p-8 text-white text-center">
          <p className="text-xl font-bold">Still have a question?</p>
          <p className="mt-2 text-sm text-on-dark-muted">A real person replies on WhatsApp.</p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-bold text-white hover:-translate-y-0.5 transition-all"
          >
            <MessageCircle size={18} /> Ask us on WhatsApp <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
