import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Compression tier (session 27 — the compression/content-encoding surface).
  // `compress` is default-true in Next.js; restating it explicitly anchors the
  // app's gzip tier (dynamic pages + API JSON + /_next/static chunks, each
  // Vary: Accept-Encoding-guarded — pinned by the session-27 e2e specs) where
  // a future perf-tuning pass would look. What this tier CANNOT carry: brotli
  // and public/-static compression (Node's middleware is gzip-only; the
  // static handler never compresses) — proxy-layer capabilities. The reference
  // app gets them from its Cloudflare edge; a standalone deployment should
  // front this server with Caddy/Nginx/Cloudflare for parity — see
  // docs/DEPLOYMENT.md §8.
  compress: true,
  // Dev-only origin allowlist: Next 16's dev-origin protection blocks the
  // dev CSS/JS chunks when the browser's Origin/Referer host (127.0.0.1)
  // differs from the server's own (localhost) — the page silently renders
  // unhydrated (forms fall back to native GET submits). No effect on the
  // production build. The wildcard covers sandboxed preview proxies
  // (e.g. preview-<session-id>.space-z.ai) that front the dev server.
  allowedDevOrigins: ["127.0.0.1", "*.space-z.ai"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "qtrypzzcjebvfcihiynt.supabase.co" },
    ],
  },
  // Baseline security headers (session 23 — the security-headers hardening).
  // The reference app's platform layer (Cloudflare + Caddy) ships these on
  // every response; a standalone deployment has no such proxy in front, so
  // the app carries the baseline itself (deliberate-better hardening, same
  // family as the ARIA/scroll-lock/Escape additions). Values mirror the
  // platform set: nosniff, strict-origin-when-cross-origin, HSTS
  // max-age=31536000 (inert over plain HTTP — active behind TLS), plus the
  // frame-ancestors guard and a capability deny-list (no camera/mic/geo in
  // this app). A restrictive CSP needs the nonce middleware pattern and is
  // documented as future work (docs/remediation-plan-session23.md).
  async headers() {
    return [
      {
        source: "/(.*)?",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
