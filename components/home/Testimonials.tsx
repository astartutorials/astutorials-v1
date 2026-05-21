"use client";

import { useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";

const testimonials = [
  {
    quote: "GEDS 126 sounds easy until you're staring at a test you haven't prepared for. I booked one session, my tutor went through the likely areas, and I stopped panicking. Scored 88/100.",
    name: "Cynthia Ngwu",
    detail: "100L Accounting · Babcock University",
    badge: "88/100 in GEDS 126",
    initials: "CN",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    quote: "IFT 212 with Dr Eweoya was where I almost lost my GPA. My tutor had done the course and knew the exact topics he tests. We drilled those for two sessions and I passed. Simple.",
    name: "Victor Adeyemi",
    detail: "200L Software Engineering · Babcock University",
    badge: "Passed IFT 212",
    initials: "VA",
    color: "bg-blue-50 text-blue-700",
  },
  {
    quote: "I was running BIO 108 and CHM 108 at the same time. Both had practicals in the same week. I did one session per course and walked into both labs knowing what I was doing.",
    name: "Kingsley Ejiofor",
    detail: "100L Biochemistry · Babcock University",
    badge: "Passed both practicals same week",
    initials: "KE",
    color: "bg-pink-50 text-pink-700",
  },
  {
    quote: "PHY 102 pulled my CGPA down in 100L. I retook it with a tutor from week one. Not week twelve. Finished with an A.",
    name: "Itoro Edidiong",
    detail: "300L Computer Science · Babcock University",
    badge: "PHY 102 — from F to A",
    initials: "IE",
    color: "bg-violet-50 text-violet-700",
  },
  {
    quote: "ELCT 401 with Prof Omotosho broke me in 400L. Signal processing just wasn't clicking from the lectures alone. My tutor sat with me and rebuilt my understanding from scratch. Passed with an A.",
    name: "Femi Makinde",
    detail: "400L Computer Technology · Babcock University",
    badge: "Passed ELCT 401",
    initials: "FM",
    color: "bg-amber-50 text-amber-700",
  },
  {
    quote: "I missed three weeks of CSC 301 due to health issues. By the time I was back, the class had moved on. Four sessions with my A-Star tutor and I learnt Data Structures and Algorithms on time with an A.",
    name: "Oluwakemi Jimoh",
    detail: "300L Computer Science · Babcock University",
    badge: "Caught up, A in DSA",
    initials: "OJ",
    color: "bg-emerald-50 text-emerald-700",
  },
];

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  useEffect(() => {
    const id = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + 320, behavior: "smooth" });
    }, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <ScrollReveal id="stories" className="w-full px-6 py-10 md:py-16 max-w-[1440px] mx-auto">
      <div className="flex items-end justify-between mb-7">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--astar-red)] mb-2 block">
            Student Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Real students. Real results.
          </h2>
        </div>
        <div className="hidden md:flex gap-2 shrink-0">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[var(--astar-red)] hover:text-[var(--astar-red)] transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={15} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 rounded-full bg-[var(--astar-red)] text-white flex items-center justify-center hover:bg-red-700 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-6 px-6 md:mx-0 md:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {testimonials.map((t, i) => (
          <div key={i} className="flex-none w-[88vw] md:w-96 snap-start">
            <div className="h-full bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
              <div>
                <p className="font-serif text-4xl leading-none text-[var(--astar-red)] opacity-15 select-none mb-1">&ldquo;</p>
                <p className="text-gray-600 italic text-sm leading-relaxed">{t.quote}</p>
              </div>
              <div>
                <div className="h-px bg-gray-100 my-4" />
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${t.color}`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{t.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{t.detail}</p>
                  </div>
                </div>
                <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-[var(--astar-red)] border border-red-100">
                  {t.badge}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
