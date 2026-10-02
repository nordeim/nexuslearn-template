import { Suspense } from "react";

import type { Metadata, Viewport } from "next";

import { ResetPasswordGate } from "@/components/ResetPasswordForm";
import { pageMetadata } from "@/lib/page-metadata";

/**
 * The reference /reset-password route (session 37 — the parity gap: the
 * LIVE ships the password-reset page; the clone 404'd). The canonical/og:url
 * carries the `?token=` query when present — the CourseDetail `?id=` pattern
 * (probed on the live: og:url = .../reset-password?token=<value>), with
 * the plain "NexusLearn" title (the `/` + `/login` convention — no title
 * segment) and the root description.
 *
 * Session 39: the token no longer needs explicit extraction — the raw
 * search (the proxy-injected x-nexus-raw-search header, read by pageMetadata)
 * carries the token through the pinned canonical processing (kept, sorted:
 * ?token=abc&utm_source=z -> ?token=abc — probed on the live).
 *
 * The page shell lives in the client form (the landmark-less
 * `div.min-h-screen` — the live's shape, NOT the /login gradient `<main>`
 * family), which renders the two view states: the "Invalid Reset Link"
 * state (no token / a non-`token` param) and the optimistic "Set new
 * password" form (ANY non-empty token — the live validates at submit).
 *
 * The Suspense boundary is Next 16's requirement for useSearchParams in a
 * client component (the page is dynamic anyway — the metadata reads the
 * request, and the layout's force-dynamic keeps the CSP nonce path).
 */
export async function generateMetadata(): Promise<Metadata> {
  // Session 41 — the auth-shell head family (fresh-eyes family A: the live's
  // /reset-password — like /login — is served by the platform's auth shell,
  // whose head carries the family the app routes never see).
  return pageMetadata({ canonical: "/reset-password", authShell: true });
}

// Session 41 — the live's auth-shell viewport family (identical to
// /login's): viewport-fit=cover + theme-color #000000.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordGate />
    </Suspense>
  );
}
