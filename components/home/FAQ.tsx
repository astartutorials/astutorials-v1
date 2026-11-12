"use client"
import { useState } from "react";
import { ChevronDown, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { HOME_FAQS, type Faq } from "@/lib/faq";

export const WHATSAPP_URL =
  "https://api.whatsapp.com/send/?phone=2349160465678&text=Hello, I have a question about A-Star Tutorials.&type=phone_number&app_absent=0";


export function Accordion({ items }: { items: Faq[] }) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      {items.map((faq, index) => (
        <div
          key={index}
          className="bg-surface-raised border border-line-subtle rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md"
        >
          <button
            onClick={() => setActive(active === index ? null : index)}
            aria-expanded={active === index}
            className="w-full flex items-center justify-between gap-4 p-6 text-left"
          >
            <span className="font-bold text-fg text-lg">{faq.question}</span>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              active === index ? "bg-[var(--astar-red)] text-white rotate-180" : "bg-surface-sunken text-fg-faint"
            }`}>
              <ChevronDown size={18} />
            </div>
          </button>
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            active === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}>
            <p className="px-6 pb-6 text-fg-subtle leading-relaxed">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The common questions, with a WhatsApp chat beside them for whatever the list
 * doesn't answer. Replaced a tiled stock doodle background (2026-11-12).
 */
export default function FAQ() {
  return (
    <ScrollReveal id="faq" className="w-full max-w-6xl mx-auto px-6 py-16 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-fg">Got questions?</h2>
          <p className="mt-4 text-fg-subtle leading-relaxed">
            Start with the common ones. If yours isn&apos;t here, ask us on WhatsApp. A real person replies.
          </p>

          <div className="mt-8 rounded-3xl bg-[#ECE5DD] dark:bg-[#0b141a] p-5 shadow-inner space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-[#D9FDD3] dark:bg-[#005c4b] px-4 py-2.5 text-sm text-[#111b21] dark:text-white shadow-sm"
            >
              Hi! Which courses do you have tutorials for?
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2 }}
              className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-[#D9FDD3] dark:bg-[#005c4b] px-4 py-2.5 text-sm text-[#111b21] dark:text-white shadow-sm"
            >
              And can my parents pay for me?
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 2 }}
              className="inline-flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white dark:bg-[#202c33] px-4 py-3 shadow-sm" aria-label="A-Star is typing">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </motion.div>
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-bold text-white shadow-lg shadow-green-900/10 hover:-translate-y-0.5 transition-all"
          >
            <MessageCircle size={18} /> Ask us on WhatsApp <ArrowRight size={16} />
          </a>
        </div>

        <div className="lg:col-span-7">
          <Accordion items={HOME_FAQS} />
          <Link href="/faq" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-ink hover:underline">
            See all questions <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}
