"use client"
import { useState } from "react";
import { ChevronDown, MessageCircle, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";

const WHATSAPP_URL =
  "https://api.whatsapp.com/send/?phone=2349160465678&text=Hello, I have a question about A-Star Tutorials.&type=phone_number&app_absent=0";

const faqs = [
  {
    question: "How do I register for a tutorial?",
    answer: "Registration is simple. Click on the 'Book a Tutorial Session' button at the top of the page, select your course code, and choose a tutor that fits your schedule."
  },
  {
    question: "Are the tutors qualified?",
    answer: "Yes, absolutely. All our tutors are high-performing students who have achieved an 'A' grade in the specific courses they teach and have passed our thorough vetting process."
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer: "We offer a 'First Session Guarantee'. If you are not satisfied after your first tutorial session, we will either pair you with a different tutor or provide a full refund."
  },
  {
    question: "Do you offer online tutorials?",
    answer: "Yes, we offer flexible learning options. You can choose between physical meetups or virtual sessions via Zoom/Google Meet depending on your preference."
  }
];

function Accordion() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
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
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#D9FDD3] dark:bg-[#005c4b] px-4 py-2.5 text-sm text-[#111b21] dark:text-white shadow-sm">
              Hi! Which courses do you have tutorials for?
            </div>
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#D9FDD3] dark:bg-[#005c4b] px-4 py-2.5 text-sm text-[#111b21] dark:text-white shadow-sm">
              And can my parents pay for me?
            </div>
            <div className="inline-flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white dark:bg-[#202c33] px-4 py-3 shadow-sm" aria-label="A-Star is typing">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
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
          <Accordion />
        </div>
      </div>
    </ScrollReveal>
  );
}
