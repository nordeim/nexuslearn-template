import type { Metadata, Viewport } from "next";
import "./globals.css";

import { ScrollRestoreNormalizer } from "@/components/ScrollRestoreNormalizer";
import { REFERENCE_DESCRIPTION } from "@/lib/metadata";

/**
 * Session 14 — font parity: the reference (Base44 + Tailwind v3) NEVER loads
 * a webfont. Its runtime injects `body { font-family: Inter, system-ui,
 * -apple-system, sans-serif }` as an inline sheet on every app page (absent
 * on /login, which falls to the engine default) and ships NO @font-face for
 * Inter — `document.fonts` is empty on every route, so the declared stack
 * resolves to the visitor's system font (or a locally-installed Inter).
 * The previous next/font/google bundle rendered real Inter glyphs while the
 * reference rendered the system font — the root cause of the documented
 * "font-metric height bands" (−30 /, −49 /Courses, −29 /About, …).
 * The stack is now declared in globals.css `@theme` (--font-sans), matching
 * the reference's declaration AND rendered font in every environment.
 */

/**
 * Reference head parity (session 5): the live app ships ONE root description
 * on every route plus OpenGraph/Twitter cards, per-route canonicals, the
 * logo.png favicon, a manifest and the apple web-app metas. The canonical
 * origin comes from NEXT_PUBLIC_SITE_URL (fallback: localhost dev origin).
 *
 * Session 6: the root openGraph/twitter objects below are the DEFAULTS for
 * `/` only — every other route swaps in `routeMetadata()` (src/lib/metadata.ts)
 * so og:title / twitter:title mirror the per-route document title and og:url
 * mirrors the per-route canonical (reference behavior).
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NexusLearn",
    template: "%s | NexusLearn",
  },
  description: REFERENCE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NexusLearn",
    description: REFERENCE_DESCRIPTION,
    url: siteUrl,
    type: "website",
    siteName: "NexusLearn",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "NexusLearn" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexusLearn",
    description: REFERENCE_DESCRIPTION,
    images: ["/logo.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "NexusLearn",
  },
  icons: {
    icon: "/logo.png",
  },
  manifest: "/manifest.json",
};

// The reference viewport is the plain `width=device-width, initial-scale=1.0`
// (unlimited pinch zoom). The earlier maximum-scale=5 cap was an a11y
// downgrade vs the reference and is deliberately dropped.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * Per-request rendering on EVERY route (session 24 — the CSP nonce
 * companion). The proxy (src/proxy.ts) generates a per-request CSP nonce
 * that Next.js bakes into its bootstrap scripts — but only on responses
 * RENDERED per-request. Static-prerendered pages bake their HTML at build
 * time where no nonce exists: under the strict-dynamic policy their scripts
 * BLOCK and the pages render unhydrated (the login form falls back to a
 * native GET submit → `/login?` — the gotcha-32 failure symptom,
 * spike-verified before shipping). The root-layout segment config forces
 * dynamic rendering for every route below it, including /_not-found, so the
 * nonce reaches every script. The measured cost is negligible (the
 * already-dynamic routes render at 5–61ms TTFB; the perf profile is
 * documented in docs/remediation-plan-session24.md finding 1).
 */
export const dynamic = "force-dynamic";

/**
 * Session 30 — the router-scroll modality contract: `data-scroll-behavior="smooth"`
 * on <html> is the Next.js-documented declaration (see
 * next/dist/shared/lib/router/utils/disable-smooth-scroll.js) that makes the
 * App Router wrap its OWN scroll operations (the nav reset-to-top, the
 * popstate restore) in a temporary `scroll-behavior: auto` — the wrapper
 * only engages when `html.dataset.scrollBehavior === "smooth"`. Without it
 * the router's scrolls run unsuppressed under the session-13 universal
 * `* { scroll-behavior: smooth }` parity pin: every in-app navigation reset
 * GLIDED (~600ms for 2000px) and the dev console carried the framework's
 * "Detected `scroll-behavior: smooth`…" warning on the first client-side
 * transition. User-facing smooth scrolls (anchor clicks, the Radix Select
 * viewport, scroll-into-view) keep the session-13 pin — the attribute scopes
 * the suppression to the router's programmatic scrolls only.
 * ScrollRestoreNormalizer stays (the popstate window is now double-covered;
 * harmless defense in depth).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        {/* Session 16: instant popstate scroll restoration (the reference's
            browser-native snap) — see src/components/ScrollRestoreNormalizer.tsx */}
        <ScrollRestoreNormalizer />
        {children}
      </body>
    </html>
  );
}
