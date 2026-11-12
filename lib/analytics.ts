import type { PostHog } from "posthog-js";

/**
 * PostHog, loaded after the page settles instead of before it is interactive.
 *
 * Components call `analytics.capture / identify / captureException` exactly as
 * they called posthog. Until the library has loaded, calls are queued; the
 * first call also starts the load, so an action taken in the first seconds is
 * still recorded. Otherwise `loadAnalytics()` runs once the page is idle (see
 * instrumentation-client.ts), which pulls in posthog-js and, through it, the
 * session recorder and surveys, none of it competing with first paint
 * (2026-11-12, ~170 KB off the initial load).
 *
 * Trade-off: an error thrown before PostHog loads is not auto-captured.
 */

type Call = (posthog: PostHog) => void;

let instance: PostHog | null = null;
let loading: Promise<PostHog> | null = null;
const queue: Call[] = [];

export function loadAnalytics(): Promise<PostHog> {
  if (!loading) {
    loading = import("posthog-js").then(({ default: posthog }) => {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
        api_host: "/ingest",
        ui_host: "https://us.posthog.com",
        defaults: "2026-01-30",
        capture_exceptions: true,
        debug: process.env.NODE_ENV === "development",
      });
      instance = posthog;
      for (const call of queue.splice(0)) call(posthog);
      return posthog;
    });
  }
  return loading;
}

function run(call: Call) {
  if (typeof window === "undefined") return;
  if (instance) {
    call(instance);
  } else {
    queue.push(call);
    void loadAnalytics();
  }
}

const analytics = {
  capture: (...args: Parameters<PostHog["capture"]>) => run((p) => p.capture(...args)),
  identify: (...args: Parameters<PostHog["identify"]>) => run((p) => p.identify(...args)),
  captureException: (...args: Parameters<PostHog["captureException"]>) => run((p) => p.captureException(...args)),
};

export default analytics;
