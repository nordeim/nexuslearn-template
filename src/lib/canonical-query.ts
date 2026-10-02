/**
 * The canonical query-processing seam (session 39 — fresh-eyes family B: a
 * REAL functional parity drift found by probing real routes with query
 * strings, a dimension no prior session pinned).
 *
 * The live processes the query of EVERY canonical — real routes AND the 404 —
 * through ONE pinned algorithm, mirrored into og:url + twitter:url:
 *
 *  1. The tracking-param exclusion set (CASE-INSENSITIVE): the `utm_*`
 *     PREFIX (utm_source, utm_id, UTM_source, … all dropped) + the EXACT
 *     keys gclid, fbclid, wbraid, msclkid, dclid, igshid, twclid, yclid,
 *     _ga, mc_cid, mc_eid, ref. `ref` is EXACT, NOT a prefix — referrer
 *     and reference are KEPT (probed). source, gclsrc, ttclid,
 *     tiktok_click, li_fat_id, si are KEPT (probed).
 *  2. The kept params are ALPHABETICALLY SORTED by key — STABLE, so
 *     duplicate keys keep their original order (?b=2&a=1&a=3 ->
 *     ?a=1&a=3&b=2, probed).
 *  3. Serialization follows URLSearchParams semantics (?x=a%20b -> x=a+b —
 *     the form encoding; ?x=%C3%A9 stays percent-encoded, probed).
 *  4. An empty query (or one where everything is excluded) is dropped.
 *
 * The comparison is code-unit based (no localeCompare — ICU variance across
 * environments would make the sort nondeterministic); V8's sort is stable.
 */

/** The exact-match exclusion set (compared on the LOWERCASED key). */
const CANONICAL_EXCLUDED_PARAMS: ReadonlySet<string> = new Set([
  "gclid",
  "fbclid",
  "wbraid",
  "msclkid",
  "dclid",
  "igshid",
  "twclid",
  "yclid",
  "_ga",
  "mc_cid",
  "mc_eid",
  "ref",
]);

/** True when the (case-insensitive) key is a tracking param the live drops. */
export function isExcludedCanonicalParam(key: string): boolean {
  const k = key.toLowerCase();
  return k.startsWith("utm_") || CANONICAL_EXCLUDED_PARAMS.has(k);
}

/**
 * The pinned algorithm: "?x=1&utm_source=a" -> "?x=1" (sorted, filtered,
 * re-serialized); "" | "?" | fully-excluded -> "".
 */
export function processCanonicalQuery(rawSearch: string): string {
  const qs = rawSearch.startsWith("?") ? rawSearch.slice(1) : rawSearch;
  if (!qs) return "";

  const kept = [...new URLSearchParams(qs).entries()].filter(
    ([key]) => !isExcludedCanonicalParam(key)
  );
  if (kept.length === 0) return "";

  kept.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  const out = new URLSearchParams();
  for (const [key, value] of kept) out.append(key, value);
  return `?${out.toString()}`;
}
