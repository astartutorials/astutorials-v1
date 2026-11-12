'use client';

import { useSyncExternalStore } from "react";
import { BUILD_TIME } from "@/lib/build-time";
import { isTfaOpen } from "@/lib/tfa";

const subscribe = () => () => {};

/**
 * Whether Freshers' Advantage registration is still open, on the visitor's
 * clock: the pages using it are static, so a build-time answer would freeze
 * into the HTML. The server snapshot is the answer at build time (lib/build-time.ts), so
 * a programme that had closed before the build is not in the HTML at all.
 */
export function useTfaOpen(): boolean {
  return useSyncExternalStore(subscribe, () => isTfaOpen(), () => isTfaOpen(BUILD_TIME));
}
