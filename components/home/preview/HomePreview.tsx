"use client";

import { useState } from "react";
import HeroPreview, { HEADLINES, type HeadlineOption, type VisualOption } from "./HeroPreview";
import HowItWorks from "./HowItWorks";
import WaysToLearn from "./WaysToLearn";
import ClosingCTA from "./ClosingCTA";
import Testimonials from "@/components/home/Testimonials";
import StudentIntakeCTA from "@/components/home/StudentIntakeCTA";
import AmbassadorCTA from "@/components/home/AmbassadorCTA";
import BecomeTutor from "@/components/home/BecomeTutor";
import FAQ from "@/components/home/FAQ";

function Toggle<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { id: T; label: string; title?: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="px-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">{label}</span>
      {options.map((o) => (
        <button
          key={o.id}
          title={o.title}
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${value === o.id ? "bg-white text-[var(--astar-navy)]" : "text-white/80 hover:bg-white/10"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The home page in the proposed order, with the taste calls switchable from
 * the bar at the bottom. Sections that stay as they are reuse the real
 * components.
 */
export default function HomePreview() {
  const [headline, setHeadline] = useState<HeadlineOption>("B");
  const [visual, setVisual] = useState<VisualOption>("illustration");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--astar-bg)] font-sans">
      <section className="flex-grow flex flex-col items-center pt-24 md:pt-32 overflow-x-clip">
        <HeroPreview headline={headline} visual={visual} />
        <HowItWorks />
        <WaysToLearn />
        <div className="h-16 md:h-20" />
        <Testimonials />
        <StudentIntakeCTA />
        <AmbassadorCTA />
        <div className="h-10" />
        <BecomeTutor />
        <FAQ />
        <ClosingCTA />
      </section>

      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-3xl bg-[var(--astar-navy)]/95 px-4 py-2.5 shadow-2xl backdrop-blur max-w-[calc(100vw-2rem)]">
        <Toggle
          label="Headline"
          value={headline}
          onChange={setHeadline}
          options={(Object.keys(HEADLINES) as HeadlineOption[]).map((id) => ({
            id, label: id, title: `${HEADLINES[id].lead} ${HEADLINES[id].mark}`,
          }))}
        />
        <Toggle
          label="Hero"
          value={visual}
          onChange={setVisual}
          options={[{ id: "illustration", label: "Illustration" }, { id: "photo", label: "Photo" }]}
        />
      </div>
    </div>
  );
}
