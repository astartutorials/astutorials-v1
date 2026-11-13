import type { NextConfig } from "next";

/**
 * Sent with every response. The enforced CSP carries frame-ancestors only,
 * which stops other sites embedding ours (clickjacking on checkout and the
 * admin); the full policy is report-only for now (CSP below).
 */
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/**
 * The full Content-Security-Policy, in REPORT-ONLY mode: browsers block
 * nothing, they just report what this policy would have blocked to PostHog
 * (the CSP violations view). Once a few weeks of reports show nothing
 * legitimate tripping it, rename the header to Content-Security-Policy.
 *
 * Every origin is here for a reason:
 * - 'unsafe-inline' scripts: Next.js hydration data and the theme script in
 *   app/layout.tsx. Nonces would force every page to render per request.
 * - challenges.cloudflare.com: Turnstile on the public forms (script + frame).
 * - *.supabase.co: the browser client on /tutorials, /careers and admin auth.
 * - vitals.vercel-insights.com: Vercel Speed Insights.
 * - PostHog needs nothing extra: it loads and sends through /ingest (self),
 *   and its session recorder runs in a blob: worker.
 * - Paystack is a full-page redirect, not an embed, so it needs nothing.
 */
const POSTHOG_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const CSP_REPORT_URL = POSTHOG_TOKEN
  ? `https://us.i.posthog.com/report/?token=${POSTHOG_TOKEN}&v=1`
  : null;

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  "media-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://vitals.vercel-insights.com",
  "frame-src https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(CSP_REPORT_URL ? [`report-uri ${CSP_REPORT_URL}`, "report-to csp"] : []),
].join("; ");

// Production only: the dev server needs eval for hot reload and would flood
// the reports.
const CSP_HEADERS =
  process.env.NODE_ENV === "production"
    ? [
        { key: "Content-Security-Policy-Report-Only", value: CSP },
        ...(CSP_REPORT_URL ? [{ key: "Reporting-Endpoints", value: `csp="${CSP_REPORT_URL}"` }] : []),
      ]
    : [];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: [...SECURITY_HEADERS, ...CSP_HEADERS] }];
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
