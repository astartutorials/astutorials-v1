'use client';

import { useRef } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react"; 

export default function Testimonials() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340; 
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount 
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const testimonials = [
    {
      name: "Chioma Adeyemi",
      role: "Public Health, 300L",
      quote: "I was struggling with Biochemistry until I joined A-Star. The tutors broke it down so simply. I went from a C to an A in one semester!",
      image: "https://i.pravatar.cc/150?u=chioma" 
    },
    {
      name: "David Okonkwo",
      role: "Accounting, 200L",
      quote: "The exam prep for Accounting was a lifesaver. The past questions review session helped me predict exactly what came out.",
      image: "https://i.pravatar.cc/150?u=david"
    },
    {
      name: "Sarah Johnson",
      role: "Nursing, 400L",
      quote: "The environment is so supportive. It’s not just about books; the mentors actually care about your overall wellbeing.",
      image: "https://i.pravatar.cc/150?u=sarah"
    },
    {
      name: "Emmanuel T.",
      role: "Computer Science, 400L",
      quote: "Understanding data structures became 10x easier with the practical sessions. Highly recommend for any tech student.",
      image: "https://i.pravatar.cc/150?u=emmanuel"
    }
  ];

  return (
    <div className="w-full px-6 py-12 md:py-24 max-w-[1440px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">Student Success Stories</h2>
          <p className="text-gray-500 text-lg font-light">Don't just take our word for it. Hear from students who transformed their grades.</p>
        </div>
        <div className="hidden md:flex gap-4">
          <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:border-[var(--astar-red)] hover:text-[var(--astar-red)] transition-all duration-300 active:scale-95"><ArrowLeft size={20} /></button>
          <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full bg-[var(--astar-red)] text-white flex items-center justify-center hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all duration-300 active:scale-95"><ArrowRight size={20} /></button>
        </div>
      </div>
      <div ref={scrollContainerRef} className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {testimonials.map((testimonial, i) => (
          <div key={i} className="flex-none w-[85vw] md:w-[400px] snap-start">
            <div className="h-full bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex gap-1 text-[var(--astar-red)] mb-6">{[1,2,3,4,5].map((s) => <Star key={s} size={16} fill="currentColor" />)}</div>
              <p className="text-gray-600 italic text-lg leading-relaxed mb-8 min-h-[100px]">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                <div><h4 className="font-bold text-gray-900">{testimonial.name}</h4><p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{testimonial.role}</p></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
