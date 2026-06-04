import Link from "next/link";
import ScrollReveal from "@/components/shared/ScrollReveal";
import CountUp from "@/components/shared/CountUp";

export default function HeroSection() {
  return (
    <ScrollReveal id="home" className="w-full max-w-7xl mx-auto px-4 md:px-6 relative">
      {/* Doodle background */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          backgroundImage: "url('/doodle-bg.jpg')",
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
          opacity: 0.04,
        }}
      />
      {/* Hero grid: text left, image right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center mb-12 md:mb-16">
        {/* Left: text */}
        <div className="text-center lg:text-left">
          <h1 className="text-gray-900 mb-6 font-normal tracking-tighter leading-[1.1] text-4xl md:text-6xl lg:text-7xl">
            Unlock your academic potential with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--astar-red)] to-red-400">
              A-Star Tutorials.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 font-light mb-10 leading-relaxed">
            Expert-led group and private tutorials to help you master your courses, ace your exams, and reach your full academic potential.
          </p>

          <div className="flex flex-row items-center justify-center lg:justify-start gap-3 w-full max-w-sm mx-auto lg:mx-0">
            <Link
              href="/tutorials"
              className="btn-primary flex-1 px-4 py-3.5 rounded-full text-sm md:text-base font-medium text-center shadow-xl shadow-red-500/10 whitespace-nowrap"
            >
              Book a Tutorial Session
            </Link>
          </div>
        </div>

        {/* Right: hero video */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/60 border border-gray-100">
            <video
              src="/hero.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="w-full max-w-5xl mx-auto mb-10 md:mb-14">
        <p className="text-xs md:text-sm text-gray-400 mb-10 font-medium uppercase tracking-wider text-center">
          Trusted by students globally
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 items-center justify-center opacity-80">
          {[
            { val: "4000+", label: "Active Students" },
            { val: "95%",   label: "Pass Rate" },
            { val: "50+",   label: "Expert Tutors" },
            { val: "24/7",  label: "Support", static: true },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                {stat.static ? stat.val : <CountUp value={stat.val} />}
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mt-2 font-semibold">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
