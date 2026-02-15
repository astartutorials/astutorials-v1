import Link from "next/link";
import { Check } from "lucide-react";

export default function BecomeTutor() {
  return (
    <div className="w-full bg-[#355EA9] text-white py-20 px-6">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div>
          <span className="text-sm font-bold tracking-widest text-blue-200 uppercase mb-4 block">Careers</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Become a Tutor at <br /> A-Star Tutorials
          </h2>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed max-w-lg">
            Are you a high-performing student with a passion for teaching? Join our team of expert tutors and make a difference while earning.
          </p>
          
          <ul className="space-y-4 mb-10">
            {[
              "Flexible schedule around your classes",
              "Competitive compensation",
              "Leadership & mentorship experience"
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-200">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-white/90 font-medium">{item}</span>
              </li>
            ))}
          </ul>

          <Link 
            href="#"
            className="bg-white text-blue-900 px-8 py-3.5 rounded-full font-bold shadow-lg shadow-blue-900/50 hover:bg-blue-50 hover:-translate-y-1 transition-all duration-300 inline-block"
          >
            Apply Now
          </Link>
        </div>

        {/* Right Image */}
        <div className="relative">
          <div className="aspect-square bg-teal-600/20 rounded-[2rem] overflow-hidden backdrop-blur-sm border border-white/10 relative">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#4ade80]/20 to-transparent pointer-events-none" />
            <img 
              src="https://img.freepik.com/free-vector/teacher-standing-near-blackboard-holding-stick-isolated-flat-vector-illustration-cartoon-woman-character-near-chalkboard-school-learning-concept_74855-13272.jpg" 
              alt="Tutor Teaching" 
              className="w-full h-full object-cover mix-blend-overlay opacity-80"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-blue-900/90 to-transparent">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 inline-flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-blue-900 font-bold">A+</div>
                <div>
                  <p className="text-xs text-blue-200 font-medium uppercase">Tutor Rating</p>
                  <p className="font-bold text-white">Top 1% Performers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
