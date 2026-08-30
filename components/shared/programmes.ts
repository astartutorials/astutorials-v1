'use client';

import { useSyncExternalStore } from "react";
import { isBuccClassesOpen, BUCC_CLASSES_END_DATE, BUCC_CLASSES_DATE_RANGE } from "@/lib/bucc-classes";
import { isPreClinicalsOpen, PRECLINICALS_END_DATE, PRECLINICALS_DATE_RANGE } from "@/lib/preclinicals";
import { isBuccOpen, BUCC_CLOSES_AT, BUCC_DATE_LABEL } from "@/lib/bucc";

export type Programme = {
  key: string;
  name: string;
  href: string;
  /** Shown while registration is open — the pitch. */
  blurb: string;
  /** Shown once it has ended — the record of what ran, and when. */
  pastBlurb: string;
  /** Badge while open. Past programmes all share one neutral "Past" badge. */
  tag: string;
  endsAt: Date;
  open: boolean;
};

/**
 * Every programme A-Star has run, open or closed.
 *
 * A programme that has ended is deliberately *not* dropped — the Programmes
 * menu lists past cohorts as a track record, so a visitor can see the
 * programmes we've already delivered rather than an empty menu between
 * cohorts. Only the homepage promo bands retire themselves on close.
 *
 * Adding a programme: append an entry here and it appears in the nav, in the
 * right group, automatically.
 */
function buildProgrammes(now: Date): Programme[] {
  const all: Programme[] = [
    {
      key: "bucc-classes",
      name: "BUCC 200L Prep Classes",
      href: "/bucc",
      blurb: "Four weeks before resumption · ₦60,000",
      pastBlurb: BUCC_CLASSES_DATE_RANGE,
      tag: "New",
      endsAt: BUCC_CLASSES_END_DATE,
      open: isBuccClassesOpen(now),
    },
    {
      key: "preclinicals",
      name: "Pre-Clinicals Classes",
      href: "/preclinicals",
      blurb: "Anatomy, Physiology, Biochemistry & more",
      pastBlurb: PRECLINICALS_DATE_RANGE,
      tag: "Now running",
      endsAt: PRECLINICALS_END_DATE,
      open: isPreClinicalsOpen(now),
    },
    {
      key: "bucc-advantage",
      name: "The BUCC Advantage",
      href: "/bucc/advantage",
      blurb: "Free 90-minute webinar for 200 level",
      pastBlurb: `Free webinar · ${BUCC_DATE_LABEL}`,
      tag: "Free",
      endsAt: BUCC_CLOSES_AT,
      open: isBuccOpen(now),
    },
  ];

  // Open programmes keep their editorial order (newest push first); past ones
  // fall below, most recently finished first, so the track record reads as a
  // reverse-chronological history.
  const open = all.filter((p) => p.open);
  const past = all
    .filter((p) => !p.open)
    .sort((a, b) => b.endsAt.getTime() - a.endsAt.getTime());

  return [...open, ...past];
}

// The windows never change mid-session, so there is nothing to subscribe to.
const subscribe = () => () => {};

// Recomputed per call, but the array identity only matters to useSyncExternalStore's
// snapshot comparison — so cache it and rebuild only when the open/closed set changes.
let cached: Programme[] | null = null;
let cachedKey = "";

function snapshot(): Programme[] {
  const next = buildProgrammes(new Date());
  const key = next.map((p) => `${p.key}:${p.open}`).join("|");
  if (!cached || key !== cachedKey) {
    cached = next;
    cachedKey = key;
  }
  return cached;
}

/**
 * The static-HTML snapshot. Every programme is treated as open at build time so
 * the server and first client render agree; anything already closed flips to
 * past on hydration.
 */
const serverSnapshot = buildProgrammes(new Date(0));

/**
 * All programmes, ordered open-first then past. Evaluated against the visitor's
 * clock rather than build time — the pages carrying this are statically
 * rendered, so a server-side answer would be frozen into the HTML until the
 * next deploy.
 */
export function usePrograms(): Programme[] {
  return useSyncExternalStore(subscribe, snapshot, () => serverSnapshot);
}
