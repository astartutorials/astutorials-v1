import type { NextConfig } from "next";

/**
 * Sent with every response. Deliberately no full Content-Security-Policy yet:
 * PostHog, Paystack, Turnstile and the inline theme script each need allowing,
 * and a wrong policy breaks checkout. frame-ancestors alone is safe, and stops
 * other sites embedding ours (clickjacking on checkout and the admin).
 */
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  // Stamped once per build and inlined into server and client bundles alike,
  // so "was this programme open at build time?" has one answer on both sides
  // of hydration. See lib/build-time.ts.
  env: { NEXT_PUBLIC_BUILD_TIME: String(Date.now()) },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
