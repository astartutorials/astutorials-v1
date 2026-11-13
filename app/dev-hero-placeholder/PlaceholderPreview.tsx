"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";

type Option = "brand" | "week" | "current";

/** Option 1: warm brand panel with soft shapes and the A-Star mark. Pure CSS + one small SVG. */
function BrandPanel() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F9DCD6] dark:bg-[#3A0B10]">
      <div aria-hidden className="absolute -top-24 -right-20 h-80 w-80 rounded-full bg-[var(--astar-red)]/85" />
      <div aria-hidden className="absolute -bottom-28 -left-16 h-96 w-96 rounded-full bg-[#F2B8AE] dark:bg-[#5A1A20]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-surface-raised shadow-2xl shadow-black/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/astar-mark.svg" alt="" className="h-16 w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/astar-mark-on-dark.svg" alt="" className="hidden h-16 w-auto dark:block" />
        </div>
      </div>
    </div>
  );
}

const WEEK = [
  { day: "Mon", course: "GEDS 126", kind: "Group", time: "4:00pm" },
  { day: "Wed", course: "PHY 102", kind: "Private", time: "6:00pm" },
  { day: "Fri", course: "CHM 108", kind: "Exam mock", time: "2:00pm" },
];

/** Option 2: the "This week" schedule card on the same panel. */
function WeekCard() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F9DCD6] dark:bg-[#3A0B10]">
      <div aria-hidden className="absolute -top-24 -right-20 h-80 w-80 rounded-full bg-[var(--astar-red)]/85" />
      <div aria-hidden className="absolute -bottom-28 -left-16 h-96 w-96 rounded-full bg-[#F2B8AE] dark:bg-[#5A1A20]" />
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="w-full max-w-[19rem] rounded-3xl bg-surface-raised shadow-2xl shadow-black/15 border border-line-subtle p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-fg-faint">This week</p>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold text-brand-ink">Semester Plan</span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {WEEK.map((s) => (
              <li key={s.course} className="flex items-center gap-3 rounded-2xl border border-line-subtle px-3 py-2.5">
                <span className="w-9 text-xs font-bold text-fg-faint">{s.day}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-fg">{s.course}</span>
                  <span className="block text-[11px] text-fg-subtle">{s.kind}</span>
                </span>
                <span className="text-xs font-semibold text-fg-muted">{s.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Today's: a frame of the video. */
function CurrentFrame() {
  return <Image src="/hero/hero-poster.jpg" alt="" fill priority sizes="512px" className="object-cover" />;
}

/** Same behaviour as HeroVideo: video starts 2s in and fades in once it is playing. */
function HeroBox({ placeholder }: { placeholder: ReactNode }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      const v = ref.current;
      if (!v) return;
      v.src = window.matchMedia("(max-width: 640px)").matches ? "/hero/hero-480.mp4" : "/hero/hero-640.mp4";
      v.play().catch(() => {});
    }, 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="relative w-full max-w-lg aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/60 border border-line-subtle">
      {placeholder}
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        onPlaying={() => setPlaying(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

const OPTIONS: { id: Option; label: string }[] = [
  { id: "brand", label: "1 · Brand panel" },
  { id: "week", label: "2 · This week card" },
  { id: "current", label: "Today: video frame" },
];

export default function PlaceholderPreview() {
  const [option, setOption] = useState<Option>("brand");
  const [run, setRun] = useState(0);
  const placeholder = option === "brand" ? <BrandPanel /> : option === "week" ? <WeekCard /> : <CurrentFrame />;

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] pt-28 pb-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-ink mb-3">Hero placeholder preview</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-fg">What shows before the video plays</h1>
          <p className="mt-4 text-fg-subtle">
            The video starts 2 seconds after the page loads, as on the live site, then fades in over the placeholder.
            Pick an option, then press Replay to watch the swap again.
          </p>
          <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-2">
            {OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => { setOption(o.id); setRun((r) => r + 1); }}
                aria-pressed={option === o.id}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold border transition-colors ${option === o.id ? "bg-[var(--astar-navy)] text-white border-[var(--astar-navy)]" : "bg-surface-raised text-fg-muted border-line hover:border-fg-faint"}`}
              >
                {o.label}
              </button>
            ))}
            <button onClick={() => setRun((r) => r + 1)} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-soft">
              <RotateCcw size={15} /> Replay
            </button>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <HeroBox key={`${option}-${run}`} placeholder={placeholder} />
        </div>
      </div>
    </div>
  );
}
