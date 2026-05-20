'use client';

import Image from "next/image";

export default function AdminLoginLeft() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-[#0F172A] relative overflow-hidden text-white p-12">
      {/* Dot-grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Subtle gradient vignette */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-transparent to-[#0B1120]/60 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-sm flex flex-col items-center gap-6">
        {/* Logo mark */}
        <div className="w-16 h-16 relative">
          <Image src="/logo.png" alt="A-Star Tutorials" fill className="object-contain" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
            A-Star Admin
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Streamlined management for a smarter educational experience.
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-2 opacity-30">
          <div className="w-8 h-px bg-white" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#D93025]" />
          <div className="w-8 h-px bg-white" />
        </div>

        <p className="text-white/25 text-xs uppercase tracking-widest">
          astartutorials.ng
        </p>
      </div>
    </div>
  );
}
