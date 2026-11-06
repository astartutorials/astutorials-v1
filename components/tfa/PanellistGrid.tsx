"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { TfaPanellist } from "@/lib/tfa";

/**
 * Photo, name and role per card; the bio opens in a dialog on tap. Eight long
 * bios would otherwise push the programme a few screens down.
 *
 * A native <dialog> gives focus trapping, Escape to close and a backdrop for
 * free. One dialog is shared, filled with whoever was tapped.
 */
export default function PanellistGrid({ panellists }: { panellists: TfaPanellist[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<TfaPanellist | null>(null);

  function open(p: TfaPanellist) {
    setActive(p);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
        aria-label={active ? `${active.name}'s bio` : "Panellist bio"}
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
