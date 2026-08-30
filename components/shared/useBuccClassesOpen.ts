'use client';

import { useSyncExternalStore } from "react";
import { isBuccClassesOpen } from "@/lib/bucc-classes";

// The cohort window never changes mid-session, so there is nothing to subscribe to.
const subscribe = () => () => {};

/**
 * Whether the BUCC 200L Preparatory Classes cohort is still open, evaluated
 * against the visitor's clock rather than build time — the pages carrying the
 * promo are statically rendered, so a server-side answer would be frozen into
 * the HTML until the next deploy.
 *
 * The server snapshot is `true` so the band is present in the static HTML and
 * hydration matches; a closed cohort disappears on the client.
 */
export function useBuccClassesOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isBuccClassesOpen(),
    () => true
  );
}
