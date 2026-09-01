import type { PlaybookMotif } from "@/lib/playbooks/types";

/**
 * The decorative field behind a Playbook hero.
 *
 * The three webinars share one landing component, so this is where they stop
 * looking alike: a blueprint grid for Engineering, fluted columns for Law, a
 * trace line for Health Sciences. Purely decorative and `aria-hidden`; every
 * variant is drawn in the page's accent at low opacity and masked so it fades
 * before it reaches the copy.
 */
export default function HeroMotif({ motif }: { motif: PlaybookMotif }) {
  if (motif === "blueprint") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 text-pb-ink opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, #000 35%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, #000 35%, transparent 100%)",
        }}
      />
    );
  }

  if (motif === "columns") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 text-pb-ink opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 7px, currentColor 7px 8px, transparent 8px 48px)",
          maskImage: "linear-gradient(180deg, #000 0%, transparent 78%)",
          WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 78%)",
        }}
      />
    );
  }

  // pulse — a single trace running the width of the hero.
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-1/2 h-40 w-full -translate-y-1/2 text-pb-ink opacity-[0.16]"
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      fill="none"
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
      }}
    >
      <path
        d="M0 80 H300 l24 0 l14 -46 l20 92 l16 -66 l14 20 H700 l26 0 l16 -34 l18 68 l14 -34 H1200"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
