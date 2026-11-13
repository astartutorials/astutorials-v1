"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import TutorMatch from "@/components/tutorials/TutorMatch";

type Option = "brand" | "week" | "matched" | "codes" | "quote" | "duotone" | "gradient" | "current";

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

function WarmShapes() {
  return (
    <>
      <div aria-hidden className="absolute inset-0 bg-[#F9DCD6] dark:bg-[#3A0B10]" />
      <div aria-hidden className="absolute -top-24 -right-20 h-80 w-80 rounded-full bg-[var(--astar-red)]/85" />
      <div aria-hidden className="absolute -bottom-28 -left-16 h-96 w-96 rounded-full bg-[#F2B8AE] dark:bg-[#5A1A20]" />
    </>
  );
}

/** Option 3: the MATCHED tutor card from the private tutorials page. */
function Matched() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <WarmShapes />
      <div className="absolute inset-0 flex items-center justify-center pb-8">
        <TutorMatch />
      </div>
    </div>
  );
}

const CODES = ["GEDS 126", "PHY 102", "IFT 212", "CHM 108", null, "BIO 108", "GST 111", "COS 201", "CHM 101"];

/** Option 4: a wall of real Babcock course codes on navy, the mark in the middle. */
function CourseCodes() {
  return (
    <div className="absolute inset-0 bg-[var(--astar-navy)] p-8 flex items-center justify-center">
      <div className="grid w-full max-w-sm grid-cols-3 gap-3">
        {CODES.map((c, i) =>
          c ? (
            <div key={c} className={`flex aspect-square items-center justify-center rounded-2xl border text-center font-mono text-sm font-bold ${i === 1 ? "border-[var(--astar-red)] bg-[var(--astar-red)] text-white" : "border-white/10 bg-white/[0.04] text-white/70"}`}>
              {c}
            </div>
          ) : (
            <div key="mark" className="flex aspect-square items-center justify-center rounded-2xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/astar-mark.svg" alt="" className="h-10 w-auto" />
            </div>
          )
        )}
      </div>
    </div>
  );
}

/** Option 5: one real testimonial, with its result badge. */
function Quote() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <WarmShapes />
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <figure className="w-full max-w-[20rem] rounded-3xl bg-surface-raised p-6 shadow-2xl shadow-black/15 border border-line-subtle">
          <span aria-hidden className="block text-4xl leading-none font-bold text-[var(--astar-red)]">&ldquo;</span>
          <blockquote className="mt-1 text-[15px] leading-relaxed text-fg">
            PHY 102 pulled my CGPA down in 100L. I retook it with a tutor from week one. Not week twelve. Finished with an A.
          </blockquote>
          <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-line-subtle pt-4">
            <span>
              <span className="block text-sm font-bold text-fg">Itoro Edidiong</span>
              <span className="block text-[11px] text-fg-subtle">300L Computer Science</span>
            </span>
            <span className="rounded-lg border-2 border-[var(--astar-red)] px-2 py-0.5 text-[11px] font-bold text-brand-ink">F to A</span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

/** Option 6: the class photo in a brand-red duotone, so it reads as artwork, not a paused frame. */
function Duotone() {
  return (
    <div className="absolute inset-0 bg-[var(--astar-navy)]">
      <Image src="/become-tutor.jpg" alt="" fill sizes="512px" className="object-cover grayscale contrast-125 opacity-60" />
      <div aria-hidden className="absolute inset-0 bg-[var(--astar-red)] mix-blend-multiply" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#3A0B10]/80 via-transparent to-transparent" />
      <div className="absolute bottom-6 left-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/astar-wordmark-on-dark.svg" alt="" className="h-7 w-auto" />
      </div>
    </div>
  );
}

/** Option 7: a slow-moving brand gradient with the wordmark: alive, but clearly not a video. */
function Gradient() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--astar-navy)]">
      <style>{`@keyframes ph-drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12%,8%) scale(1.15); } }`}</style>
      <div aria-hidden className="absolute -top-1/4 -left-1/4 h-[90%] w-[90%] rounded-full bg-[var(--astar-red)] blur-3xl opacity-80" style={{ animation: "ph-drift 9s ease-in-out infinite" }} />
      <div aria-hidden className="absolute -bottom-1/4 -right-1/4 h-[80%] w-[80%] rounded-full bg-[#4E1117] blur-3xl" style={{ animation: "ph-drift 11s ease-in-out infinite reverse" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/astar-wordmark-on-dark.svg" alt="" className="h-10 w-auto" />
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

const OPTIONS: { id: Option; label: string; render: () => ReactNode }[] = [
  { id: "brand", label: "1 · Brand panel", render: () => <BrandPanel /> },
  { id: "week", label: "2 · This week card", render: () => <WeekCard /> },
  { id: "matched", label: "3 · Matched card", render: () => <Matched /> },
  { id: "codes", label: "4 · Course codes", render: () => <CourseCodes /> },
  { id: "quote", label: "5 · Student quote", render: () => <Quote /> },
  { id: "duotone", label: "6 · Red duotone photo", render: () => <Duotone /> },
  { id: "gradient", label: "7 · Moving gradient", render: () => <Gradient /> },
  { id: "current", label: "Today: video frame", render: () => <CurrentFrame /> },
];

export default function PlaceholderPreview() {
  const [option, setOption] = useState<Option>("brand");
  const [run, setRun] = useState(0);
  const placeholder = OPTIONS.find((o) => o.id === option)!.render();

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
