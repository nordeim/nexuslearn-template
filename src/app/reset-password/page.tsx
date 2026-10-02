import { Suspense } from "react";

import { ResetPasswordGate } from "@/components/ResetPasswordForm";
import { routeMetadata } from "@/lib/metadata";

/**
 * The reference /reset-password route (session 37 — the parity gap: the
 * LIVE ships the password-reset page; the clone 404'd). A page-level
 * generateMetadata reads the searchParams so the canonical/og:url carries
 * the `?token=` query when present — the CourseDetail `?id=` pattern
 * (probed on the live: og:url = .../reset-password?token=<value>), with
 * the plain "NexusLearn" title (the `/` + `/login` convention — no title
 * segment) and the root description.
 *
 * The page shell lives in the client form (the landmark-less
 * `div.min-h-screen` — the live's shape, NOT the /login gradient `<main>`
 * family), which renders the two view states: the "Invalid Reset Link"
 * state (no token / a non-`token` param) and the optimistic "Set new
 * password" form (ANY non-empty token — the live validates at submit).
 *
 * The Suspense boundary is Next 16's requirement for useSearchParams in a
 * client component (the page is dynamic anyway — the metadata reads the
 * searchParams, and the layout's force-dynamic keeps the CSP nonce path).
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<ReturnType<typeof routeMetadata>> {
  const params = await searchParams;
  const token = typeof params.token === "string" && params.token.length > 0 ? params.token : null;
  return routeMetadata({
    canonical: token ? `/reset-password?token=${token}` : "/reset-password",
  });
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordGate />
    </Suspense>
  );
}
