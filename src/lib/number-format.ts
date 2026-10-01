// Locale resolution for the SSR number-formatting surfaces (session 29).
//
// The student counts are the site's only locale-sensitive rendering — the
// live reference (a CSR SPA) formats every count with the BROWSER locale
// (de-DE renders 12.450, fr-FR renders 12\u202f450). The clone's
// server-rendered surfaces cannot read the browser's Intl default — the ONLY
// visitor locale signal that exists at request time is the Accept-Language
// header. pickLocale() parses it into a single BCP 47 tag, falling back to
// en-US (the deterministic default every existing expectation is pinned to:
// Playwright's default context sends NO Accept-Language header at all).
//
// The resolved tag feeds the locale-sensitive count formatting calls as an
// EXPLICIT argument on every tier — server components (the landing featured
// grid, CourseDetail) AND the /Courses catalog's client boundary, whose SSR
// pass must agree with the browser's hydration render or React throws
// "Hydration failed" and regenerates the whole tree.

const TAG_RE = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{1,8})*$/;

/**
 * Parse an Accept-Language header into the single best BCP 47 locale tag.
 *
 * Rules (RFC 3282 as browsers implement it):
 * - q-weight ordering: the highest quality wins; equal weights keep
 *   first-listed order (the browser lists its preferred locale first);
 * - `q=0` means "explicitly unacceptable" and is skipped;
 * - `*` and malformed tokens are skipped;
 * - the winner is canonicalized (language lowercase, region uppercase —
 *   `de-de` -> `de-DE`) and returned; regionless tags pass through as-is;
 * - null/undefined/empty or nothing parseable -> "en-US".
 */
export function pickLocale(acceptLanguage: string | null | undefined): string {
  const FALLBACK = "en-US";
  if (!acceptLanguage) return FALLBACK;

  const entries = acceptLanguage
    .split(",")
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(";");
      let q = 1;
      for (const param of params) {
        const [key, value] = param.trim().split("=");
        if (key === "q") {
          const parsed = Number.parseFloat(value ?? "");
          q = Number.isFinite(parsed) ? parsed : 0;
        }
      }
      return { tag: (rawTag ?? "").trim(), q };
    })
    .filter(({ tag, q }) => q > 0 && tag !== "*" && TAG_RE.test(tag))
    .sort((a, b) => b.q - a.q);

  const best = entries[0]?.tag;
  if (!best) return FALLBACK;

  return best
    .split("-")
    .map((segment, index) => (index === 0 ? segment.toLowerCase() : segment.toUpperCase()))
    .join("-");
}
