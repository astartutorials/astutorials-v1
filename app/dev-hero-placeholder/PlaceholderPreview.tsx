"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";

type Option = "brand" | "duotone" | "gradient" | "current";

type Palette = { id: string; label: string; bg: string; a: string; b: string; tile: string; dark?: boolean };

/** Colour variations for option 1. a = top-right shape, b = bottom-left shape. */
const PANEL_PALETTES: Palette[] = [
  { id: "blush", label: "Blush", bg: "#F9DCD6", a: "#D93025", b: "#F2B8AE", tile: "#FFFFFF" },
  { id: "cream", label: "Cream", bg: "#F6EFE6", a: "#D93025", b: "#E9DCCB", tile: "#FFFFFF" },
  { id: "navy", label: "Navy", bg: "#0B1120", a: "#D93025", b: "#1B2A4A", tile: "#FFFFFF", dark: true },
  { id: "wine", label: "Wine", bg: "#3A0B10", a: "#D93025", b: "#5A1A20", tile: "#FFFFFF", dark: true },
  { id: "blue", label: "Brand blue", bg: "#E4EBF7", a: "#355EA9", b: "#F2B8AE", tile: "#FFFFFF" },
  { id: "redblue", label: "Red & blue", bg: "#D93025", a: "#355EA9", b: "#B3261E", tile: "#FFFFFF", dark: true },
];

/** Option 1: a brand panel with soft shapes and the A-Star mark. Pure CSS + one small SVG. */
function BrandPanel({ palette }: { palette: Palette }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: palette.bg }}>
      <div aria-hidden className="absolute -top-24 -right-20 h-80 w-80 rounded-full" style={{ background: palette.a }} />
      <div aria-hidden className="absolute -bottom-28 -left-16 h-96 w-96 rounded-full" style={{ background: palette.b }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] shadow-2xl shadow-black/15" style={{ background: palette.tile }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/astar-mark.svg" alt="" className="h-16 w-auto" />
        </div>
      </div>
    </div>
  );
}

/** Colour variations for option 6: the tint, and the fade at the bottom. */
const DUOTONES: { id: string; label: string; tint: string; fade: string }[] = [
  { id: "red", label: "Red", tint: "#D93025", fade: "#3A0B10" },
  { id: "wine", label: "Wine", tint: "#7A1A21", fade: "#2A080C" },
  { id: "navy", label: "Navy", tint: "#1B2A4A", fade: "#0B1120" },
  { id: "blue", label: "Brand blue", tint: "#355EA9", fade: "#0B1120" },
  { id: "blush", label: "Blush", tint: "#F2B8AE", fade: "#7A1A21" },
];

/** Option 6: the class photo in a brand duotone, so it reads as artwork, not a paused frame. */
function Duotone({ tint, fade }: { tint: string; fade: string }) {
  return (
    <div className="absolute inset-0 bg-[var(--astar-navy)]">
      <Image src="/become-tutor.jpg" alt="" fill sizes="512px" className="object-cover grayscale contrast-125 opacity-60" />
      <div aria-hidden className="absolute inset-0 mix-blend-multiply" style={{ background: tint }} />
      <div aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(to top, ${fade}cc, transparent 55%)` }} />
      <div className="absolute bottom-6 left-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/astar-wordmark-on-dark.svg" alt="" className="h-7 w-auto" />
      </div>
    </div>
  );
}

/** Colour variations for option 7: background and the two drifting glows. */
const GRADIENTS: { id: string; label: string; bg: string; a: string; b: string; light?: boolean }[] = [
  { id: "redwine", label: "Red & wine on navy", bg: "#0B1120", a: "#D93025", b: "#4E1117" },
  { id: "redblue", label: "Red & blue on navy", bg: "#0B1120", a: "#D93025", b: "#355EA9" },
  { id: "wine", label: "Wine", bg: "#2A080C", a: "#B3261E", b: "#F4A9A3" },
  { id: "sunset", label: "Red & blush", bg: "#B3261E", a: "#F4A9A3", b: "#7A1A21" },
  { id: "light", label: "Light", bg: "#FDFAF6", a: "#F4A9A3", b: "#C9D6EE", light: true },
];

/** Option 7: slow-moving brand glows with the wordmark: alive, but clearly not a video. */
function Gradient({ bg, a, b, light }: { bg: string; a: string; b: string; light?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: bg }}>
      <style>{`@keyframes ph-drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12%,8%) scale(1.15); } }`}</style>
      <div aria-hidden className="absolute -top-1/4 -left-1/4 h-[90%] w-[90%] rounded-full blur-3xl opacity-80" style={{ background: a, animation: "ph-drift 9s ease-in-out infinite" }} />
      <div aria-hidden className="absolute -bottom-1/4 -right-1/4 h-[80%] w-[80%] rounded-full blur-3xl opacity-90" style={{ background: b, animation: "ph-drift 11s ease-in-out infinite reverse" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={light ? "/brand/astar-wordmark.svg" : "/brand/astar-wordmark-on-dark.svg"} alt="" className="h-10 w-auto" />
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

type Variant = { id: string; label: string; render: () => ReactNode };

const OPTIONS: { id: Option; label: string; variants: Variant[] }[] = [
  { id: "brand", label: "1 · Brand panel", variants: PANEL_PALETTES.map((p) => ({ id: p.id, label: p.label, render: () => <BrandPanel palette={p} /> })) },
  { id: "duotone", label: "6 · Duotone photo", variants: DUOTONES.map((d) => ({ id: d.id, label: d.label, render: () => <Duotone tint={d.tint} fade={d.fade} /> })) },
  { id: "gradient", label: "7 · Moving gradient", variants: GRADIENTS.map((g) => ({ id: g.id, label: g.label, render: () => <Gradient {...g} /> })) },
  { id: "current", label: "Today: video frame", variants: [{ id: "frame", label: "Video frame", render: () => <CurrentFrame /> }] },
];

export default function PlaceholderPreview() {
  const [option, setOption] = useState<Option>("brand");
  const [variant, setVariant] = useState<string>(PANEL_PALETTES[0].id);
  const [run, setRun] = useState(0);
  const current = OPTIONS.find((o) => o.id === option)!;
  const active = current.variants.find((v) => v.id === variant) ?? current.variants[0];

  const pill = (on: boolean) =>
    `rounded-full px-4 py-2.5 text-sm font-semibold border transition-colors ${on ? "bg-[var(--astar-navy)] text-white border-[var(--astar-navy)]" : "bg-surface-raised text-fg-muted border-line hover:border-fg-faint"}`;

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] pt-28 pb-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-ink mb-3">Hero placeholder preview</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-fg">What shows before the video plays</h1>
          <p className="mt-4 text-fg-subtle">
            The video starts 2 seconds after the page loads, as on the live site, then fades in over the placeholder.
            Pick a style and a colour, then press Replay to watch the swap again.
          </p>

          <p className="mt-8 mb-2 text-xs font-bold uppercase tracking-widest text-fg-faint">Style</p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
            {OPTIONS.map((o) => (
              <button key={o.id} onClick={() => { setOption(o.id); setVariant(o.variants[0].id); setRun((r) => r + 1); }} aria-pressed={option === o.id} className={pill(option === o.id)}>
                {o.label}
              </button>
            ))}
          </div>

          {current.variants.length > 1 && (
            <>
              <p className="mt-6 mb-2 text-xs font-bold uppercase tracking-widest text-fg-faint">Colour</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {current.variants.map((v) => (
                  <button key={v.id} onClick={() => { setVariant(v.id); setRun((r) => r + 1); }} aria-pressed={active.id === v.id} className={pill(active.id === v.id)}>
                    {v.label}
                  </button>
                ))}
              </div>
            </>
          )}

          <button onClick={() => setRun((r) => r + 1)} className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-soft">
            <RotateCcw size={15} /> Replay
          </button>
        </div>
        <div className="flex justify-center lg:justify-end">
          <HeroBox key={`${option}-${active.id}-${run}`} placeholder={active.render()} />
        </div>
      </div>
    </div>
  );
}
