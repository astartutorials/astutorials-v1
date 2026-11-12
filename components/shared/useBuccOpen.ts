'use client';

import { useSyncExternalStore } from "react";
import { BUILD_TIME } from "@/lib/build-time";
import { isBuccOpen } from "@/lib/bucc";

// The registration window never changes mid-session, so there is nothing to subscribe to.
const subscribe = () => () => {};

/**
 * Whether BUCC Advantage registration is still open, evaluated against the
 * visitor's clock rather than build time — the pages carrying the promo are
 * statically rendered, so a server-side answer would be frozen into the HTML
 * until the next deploy.
 *
 * The server snapshot is the answer at build time (lib/build-time.ts), so
 * a programme that had closed before the build is not in the HTML at all.
 */
export function useBuccOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isBuccOpen(),
    () => isBuccOpen(BUILD_TIME)
  );
}
