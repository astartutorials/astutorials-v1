'use client';

import { useSyncExternalStore } from "react";
import { isPreClinicalsOpen } from "@/lib/preclinicals";

// The cohort window never changes mid-session, so there is nothing to subscribe to.
const subscribe = () => () => {};

/**
 * Whether the Pre-Clinicals cohort is still open, evaluated against the
 * visitor's clock rather than build time — the pages carrying the promo are
 * statically rendered, so a server-side answer would be frozen into the HTML
 * until the next deploy.
 *
 * The server snapshot is `true` so the band is present in the static HTML and
 * hydration matches; a closed cohort disappears on the client.
 */
export function usePreClinicalsOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isPreClinicalsOpen(),
    () => true
  );
}
