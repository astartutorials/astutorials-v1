"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Mic, Star, Users, X } from "lucide-react";
import type { TfaPanellist, TfaPerson } from "@/lib/tfa";

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("");
}

/**
 * The keynote and convener up top, then the panellists: photo, name and role
 * per card, with the bio in a dialog on tap. Nine long bios would otherwise
 * push the programme a few screens down.
 *
 * A native <dialog> gives focus trapping, Escape to close and a backdrop for
 * free. One dialog is shared, filled with whoever was tapped.
 */
export default function TfaSpeakers({
  keynote,
  convener,
  panellists,
}: {
  keynote: TfaPanellist & { note: string };
  convener: TfaPerson;
  panellists: TfaPanellist[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<TfaPanellist | null>(null);

  function open(p: TfaPanellist) {
    setActive(p);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => open(keynote)}
          className="group text-left rounded-2xl bg-[var(--astar-red)] p-5 flex items-center gap-4 hover:brightness-110 transition"
        >
          <Image
            src={keynote.photo}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 flex-shrink-0 rounded-2xl object-cover ring-2 ring-white/20"
          />
          <span className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-100">
              <Mic size={13} /> Keynote Speaker
            </span>
            <span className="block mt-0.5 font-bold leading-snug">{keynote.name}</span>
            <span className="block text-sm text-red-100">
              {keynote.role} · {keynote.note}
            </span>
            <span className="block mt-1 text-[11px] font-semibold text-white group-hover:underline">
              Read bio
            </span>
          </span>
        </button>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-extrabold">
            {initials(convener.name)}
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-300">
              <Star size={13} /> Convener
            </p>
            <p className="mt-0.5 font-bold leading-snug">{convener.name}</p>
            <p className="text-sm text-on-dark-muted">{convener.role}</p>
          </div>
        </div>
      </div>

      <p className="mt-8 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-300">
        <Users size={13} /> Panellists
      </p>
      <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {panellists.map((p) => (
          <li key={p.name}>
            <button
              type="button"
              onClick={() => open(p)}
              className="group w-full h-full text-left rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3 hover:bg-white/10 hover:border-white/20 transition-colors"
            >
              <Image
                src={p.photo}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-white/10"
              />
              <span className="min-w-0">
                <span className="block font-bold text-sm leading-snug">{p.name}</span>
                <span className="block mt-0.5 text-xs text-on-dark-muted leading-relaxed">{p.role}</span>
                <span className="block mt-1 text-[11px] font-semibold text-red-300 group-hover:underline">
                  Read bio
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setActive(null)}
        // A click on the backdrop lands on the <dialog> itself, not its content.
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
        aria-label={active ? `${active.name}'s bio` : "Speaker bio"}
        className="m-auto w-[calc(100%-2rem)] max-w-lg max-h-[85vh] rounded-2xl bg-surface-raised text-fg p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        {active && (
          <div className="flex max-h-[85vh] flex-col">
            <div className="flex items-center gap-4 border-b border-line-subtle p-5">
              <Image
                src={active.photo}
                alt={active.name}
                width={72}
                height={72}
                className="h-[72px] w-[72px] flex-shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-lg leading-snug text-fg-strong">{active.name}</p>
                <p className="text-sm text-fg-subtle">{active.role}</p>
              </div>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close"
                className="self-start rounded-full p-1.5 text-fg-subtle hover:bg-surface-inset hover:text-fg-strong transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-3 text-sm leading-relaxed text-fg-muted">
              {active.bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
