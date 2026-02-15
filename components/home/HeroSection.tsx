import Link from "next/link";
import ScrollReveal from "@/components/shared/ScrollReveal";
import CountUp from "@/components/shared/CountUp";

export default function HeroSection() {
  return (
    <ScrollReveal id="home" className="text-center px-4 w-full max-w-7xl mx-auto">
      <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#23457A] text-[10px] md:text-xs font-bold tracking-wide uppercase shadow-sm">
        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#23457A] animate-pulse"></span>
        Join 6000+ Top Students
      </div>
      <h1 className="max-w-5xl mx-auto text-gray-900 mb-8 font-normal tracking-tighter leading-[1.1] text-4xl md:text-6xl lg:text-7xl">
        Unlock your academic <br className="hidden md:block" />
        <span className="inline md:block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600">
          brilliance with ease.
        </span>
      </h1>
      <p className="max-w-xl md:max-w-2xl mx-auto text-lg md:text-xl text-gray-500 font-light mb-10 leading-relaxed px-4">
        Personalized tutoring designed specifically for Babcock University curriculums. Master complex topics today.
      </p>
      <div className="flex flex-row items-center justify-center gap-3 w-full max-w-md mx-auto mb-20 md:mb-32">
        <Link href="#book" className="btn-primary flex-1 px-4 py-3.5 rounded-full text-sm md:text-base font-medium text-center shadow-xl shadow-red-500/10 whitespace-nowrap">
          Book Now
        </Link>
        <Link href="#contact" className="btn-secondary flex-1 px-4 py-3.5 rounded-full text-sm md:text-base font-medium text-center whitespace-nowrap">
          Contact Us
        </Link>
      </div>
      <div className="w-full max-w-5xl mx-auto mb-24 md:mb-32">
        <p className="text-xs md:text-sm text-gray-400 mb-10 font-medium uppercase tracking-wider">Trusted by students globally</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 items-center justify-center opacity-80">
          {[ { val: '500+', label: 'Active Students' }, { val: '98%', label: 'Pass Rate' }, { val: '50+', label: 'Expert Tutors' }, { val: '24', label: 'Support' } ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                <CountUp value={stat.val} />
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mt-2 font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
