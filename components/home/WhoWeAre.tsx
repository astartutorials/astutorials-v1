import { Users, TrendingUp, Target, Award } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";

export default function WhoWeAre() {
  return (
    <ScrollReveal id="about" className="w-full px-6 py-10 md:py-16 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">Who We Are</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            A-Star Tutorials is a student-driven academic support system built to help tertiary institution students excel. We provide structured tutorials, easy-to-understand guidance, and a supportive learning community.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="group p-8 rounded-2xl bg-[var(--astar-red)] text-white relative overflow-hidden shadow-xl shadow-red-900/10 hover:shadow-2xl hover:shadow-red-900/20 hover:-translate-y-1 transition-all duration-300 cursor-default">
            <Users className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-[-15deg] transition-transform duration-500 group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm"><Users className="w-6 h-6 text-white" /></div>
              <h3 className="text-xl font-bold mb-3">Supportive Community</h3>
              <p className="text-white/80 text-sm leading-relaxed">A welcoming environment where every student matters.</p>
            </div>
          </div>
          <div className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6"><TrendingUp className="w-6 h-6 text-[var(--astar-red)]" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Growth Mindset</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Fostering continuous learning and improvement.</p>
          </div>
          <div className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6"><Target className="w-6 h-6 text-[var(--astar-red)]" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Student-First Approach</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Tailored approaches for individual success.</p>
          </div>
          <div className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6"><Award className="w-6 h-6 text-[var(--astar-red)]" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Academic Discipline</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Building strong foundations for excellence.</p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
