import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Dev-only origin allowlist: Next 16's dev-origin protection blocks the
  // dev CSS/JS chunks when the browser's Origin/Referer host (127.0.0.1)
  // differs from the server's own (localhost) — the page silently renders
  // unhydrated (forms fall back to native GET submits). No effect on the
  // production build.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "qtrypzzcjebvfcihiynt.supabase.co" },
    ],
  },
};

export default nextConfig;
