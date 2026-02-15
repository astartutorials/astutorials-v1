import Link from "next/link";
import { ArrowRight, Users, TrendingUp, Target, Award } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";

export default function WhoWeAre() {
  return (
    <ScrollReveal id="about" className="w-full px-6 py-12 md:py-24 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">Who We Are</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            A-Star Tutorials is a student-driven academic support system built to help Babcock University students excel. We provide structured tutorials, easy-to-understand guidance, and a supportive learning community.
          </p>
          <Link href="#" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-medium shadow-lg shadow-red-500/20 group">
            Learn More <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link> 
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="group p-8 rounded-2xl bg-[var(--astar-red)] text-white relative overflow-hidden shadow-xl shadow-red-900/10 hover:shadow-2xl hover:shadow-red-900/20 hover:-translate-y-1 transition-all duration-300 cursor-default">
            <Users className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-[-15deg] transition-transform duration-500 group-hover:scale-110" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm"><Users className="w-6 h-6 text-white" /></div>
              <h3 className="text-xl font-bold mb-3">Supportive Community</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-8">A welcoming environment where every student matters.</p>
              <div className="flex items-center text-xs font-bold tracking-widest uppercase">Learn More <ArrowRight className="w-3 h-3 ml-2 transition-transform duration-300 group-hover:translate-x-1" /></div>
            </div>
          </div>
          <div className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6"><TrendingUp className="w-6 h-6 text-[var(--astar-red)]" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Growth Mindset</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">Fostering continuous learning and improvement.</p>
            <div className="flex items-center text-[var(--astar-red)] text-xs font-bold tracking-widest uppercase">Learn More <ArrowRight className="w-3 h-3 ml-2 transition-transform duration-300 group-hover:translate-x-1" /></div>
          </div>
          <div className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6"><Target className="w-6 h-6 text-[var(--astar-red)]" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Student-First</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">Tailored approaches for individual success.</p>
            <div className="flex items-center text-[var(--astar-red)] text-xs font-bold tracking-widest uppercase">Learn More <ArrowRight className="w-3 h-3 ml-2 transition-transform duration-300 group-hover:translate-x-1" /></div>
          </div>
          <div className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6"><Award className="w-6 h-6 text-[var(--astar-red)]" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Academic Discipline</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">Building strong foundations for excellence.</p>
            <div className="flex items-center text-[var(--astar-red)] text-xs font-bold tracking-widest uppercase">Learn More <ArrowRight className="w-3 h-3 ml-2 transition-transform duration-300 group-hover:translate-x-1" /></div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
