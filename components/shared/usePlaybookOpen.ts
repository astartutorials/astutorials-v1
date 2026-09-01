'use client';

import { useSyncExternalStore } from "react";
import { PLAYBOOKS, isPlaybookOpen, type Playbook } from "@/lib/playbooks";

// The registration window never changes mid-session, so there is nothing to
// subscribe to.
const subscribe = () => () => {};

/**
 * Whether a playbook's registration is still open, evaluated against the
 * visitor's clock rather than build time — the pages carrying it are statically
 * rendered, so a server-side answer would be frozen into the HTML until the
 * next deploy.
 *
 * The server snapshot is `true` so the register button is present in the static
 * HTML and hydration matches; a closed window swaps it out on the client.
 */
export function usePlaybookOpen(playbook: Playbook): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isPlaybookOpen(playbook),
    () => true
  );
}


// Cached so useSyncExternalStore's snapshot comparison sees a stable identity
// while the open set is unchanged — a fresh array every call would loop.
let cached: Playbook[] | null = null;
let cachedKey = "";

function openSnapshot(): Playbook[] {
  const next = PLAYBOOKS.filter((p) => isPlaybookOpen(p));
  const key = next.map((p) => p.slug).join("|");
  if (!cached || key !== cachedKey) {
    cached = next;
    cachedKey = key;
  }
  return cached;
}

/**
 * Every playbook still taking registrations, on the visitor's clock. The server
 * snapshot is all of them, for the same hydration reason as above; any that
 * have already run drop out on the client.
 */
export function useOpenPlaybooks(): Playbook[] {
  return useSyncExternalStore(subscribe, openSnapshot, () => PLAYBOOKS);
}
