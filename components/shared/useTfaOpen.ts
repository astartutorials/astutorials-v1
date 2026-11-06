'use client';

import { useSyncExternalStore } from "react";
import { isTfaOpen } from "@/lib/tfa";

const subscribe = () => () => {};

/**
 * Whether Freshers' Advantage registration is still open, on the visitor's
 * clock: the pages using it are static, so a build-time answer would freeze
 * into the HTML. Server snapshot is "open" so hydration matches.
 */
export function useTfaOpen(): boolean {
  return useSyncExternalStore(subscribe, () => isTfaOpen(), () => true);
}
