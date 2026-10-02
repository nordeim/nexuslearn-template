import type { Metadata } from "next";
import { headers } from "next/headers";

import { routeMetadata } from "./metadata";

/**
 * The header-reading half of the per-route metadata (session 39 — fresh-eyes
 * family B's wiring). The live carries the PROCESSED query on every real
 * route's canonical/og:url/twitter:url (probed: /Courses?x=1 ->
 * .../Courses?x=1; /CourseDetail?id=X&extra=2 -> .../CourseDetail?extra=2&id=X),
 * so every page's metadata must know the request's search — which only
 * generateMetadata (not the static `metadata` export) can read.
 *
 * The search comes from the PROXY-INJECTED `x-nexus-raw-search` request
 * header (the s38 wiring — the same header the root layout's 404 derivation
 * reads), and the processing lives in the pure seam
 * (src/lib/canonical-query.ts: tracking params dropped, kept params
 * alpha-sorted, URLSearchParams serialization).
 *
 * WHY this lives in its own module (not src/lib/metadata.ts):
 * tests/metadata.test.ts imports `routeMetadata` directly under vitest — a
 * top-level `next/headers` import in metadata.ts would break that unit
 * import. The pure half stays pure; this half is server-only.
 *
 * Usage — each page:
 *   export async function generateMetadata(): Promise<Metadata> {
 *     return pageMetadata({ title: "Courses", canonical: "/Courses" });
 *   }
 */
export async function pageMetadata({
  title,
  canonical,
}: {
  /** Title segment — omitted on the no-title renders (reference behavior). */
  title?: string;
  /** Route canonical (path only — the query is derived from the request). */
  canonical: string;
}): Promise<Metadata> {
  const h = await headers();
  const search = h.get("x-nexus-raw-search") ?? "";
  return routeMetadata({ title, canonical, search });
}
