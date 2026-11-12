import { loadAnalytics } from "@/lib/analytics";

// Start PostHog once the page has loaded and the browser is idle, so neither
// the library nor its session recorder and surveys compete with first paint.
// Anything tracked before then queues and triggers the load itself
// (lib/analytics.ts).
function whenSettled() {
  const start = () => void loadAnalytics();
  if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 4000 });
  else setTimeout(start, 1500);
}

if (document.readyState === "complete") whenSettled();
else window.addEventListener("load", whenSettled, { once: true });
