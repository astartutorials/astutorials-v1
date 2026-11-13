"use client";

import { useEffect } from "react";
import analytics from "@/lib/analytics";

/**
 * The last resort: shown when the root layout itself throws, so it replaces
 * the whole document and cannot rely on the site's styles, fonts or navbar.
 * Everything here is inline on purpose.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    analytics.captureException(error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#FDFAF6",
          color: "#0B1120",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: 32, lineHeight: 1.15, margin: 0 }}>Something went wrong.</h1>
          <p style={{ color: "#6B7280", fontSize: 17, lineHeight: 1.6, margin: "16px 0 28px" }}>
            A-Star Tutorials hit a problem loading. Try again in a moment. If you were paying, check your
            email for a receipt before paying again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#D93025",
              color: "#fff",
              border: 0,
              borderRadius: 999,
              padding: "14px 24px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <p style={{ marginTop: 20, fontSize: 14 }}>
            {/* A full page load, not a client transition: the app itself is what failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ color: "#0B1120" }}>Back to home</a>
          </p>
        </div>
      </body>
    </html>
  );
}
