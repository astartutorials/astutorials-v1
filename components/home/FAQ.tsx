"use client"
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";

export default function FAQ() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I register for a tutorial?",
      answer: "Registration is simple. Click on the 'Start Learning' button at the top of the page, select your department and course code, and choose a tutor that fits your schedule."
    },
    {
      question: "Are the tutors qualified?",
      answer: "Yes, absolutely. All our tutors are high-performing senior students who have achieved an 'A' grade in the specific courses they teach and have passed our vetting process."
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer: "We offer a 'First Session Guarantee'. If you are not satisfied after your first tutorial session, we will either pair you with a different tutor or provide a full refund."
    },
    {
      question: "Do you offer online tutorials?",
      answer: "Yes, we offer hybrid learning options. You can choose between physical meetups on campus or virtual sessions via Zoom/Google Meet depending on your preference."
    }
  ];

  return (
    <ScrollReveal id="faq" className="w-full max-w-3xl mx-auto px-6 py-24 mb-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-500">
          Common questions about our tutorials and enrollment process.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <button 
              onClick={() => toggleFaq(index)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                ${activeFaqIndex === index ? 'bg-[var(--astar-red)] text-white rotate-180' : 'bg-gray-50 text-gray-400'}
              `}>
                <ChevronDown size={18} />
              </div>
            </button>
            
            <div className={`
              overflow-hidden transition-all duration-500 ease-in-out
              ${activeFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
            `}>
              <p className="px-6 pb-6 text-gray-500 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
