'use client';

import { useSyncExternalStore } from "react";
import { INTAKES, openIntakeFor, type Intake } from "@/lib/intakes";

// The intake window never changes mid-session, so there is nothing to subscribe to.
const subscribe = () => () => {};

/** The newest intake for a level, open or not — the stable pre-hydration answer. */
function latestIntakeFor(level: number): Intake | undefined {
  return INTAKES
    .filter((i) => i.level === level)
    .sort((a, b) => b.opensAt.getTime() - a.opensAt.getTime())[0];
}

/**
 * The intake taking registrations for a level, evaluated against the visitor's
 * clock rather than build time — the pages using it are statically rendered, so
 * a server-side answer would be frozen into the HTML until the next deploy.
 *
 * The server snapshot assumes the newest intake is open so the form and the
 * homepage band are in the static HTML; a closed intake disappears on the client.
 * Both snapshots return entries of INTAKES itself, so the reference is stable.
 */
export function useOpenIntake(level: number): Intake | undefined {
  return useSyncExternalStore(
    subscribe,
    () => openIntakeFor(level),
    () => latestIntakeFor(level)
  );
}
