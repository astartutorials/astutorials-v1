import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
