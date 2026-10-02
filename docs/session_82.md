# Session 39 — Final Log

**The canonical-query-processing + %2F-title-decode-order + AI-loser-invariant pass** — pushed to `main` and verified.

## What ran this session

**Baseline & standing parity (all green):** the full gate re-verified at the documented session-38 state (530 tests) → heights ×9 routes ×2 viewports **byte-exact 18/18** (one transient live CSR stall on desktop /BecomeInstructor re-probed identical: h=2477, 1052ch), innerText 18/18 identical, **mobile battery fully identical — NO Tailwind v4 bug** (trigger byte-identical, panel 375×405 @ y=64, link geometry identical; the single diff is the documented ARIA hardening), console 12/12 clean.

**The headline fresh-eyes find — the canonical QUERY dimension (a REAL functional parity drift, a surface no prior session had probed):** the standing canonical specs always visited query-less URLs, so nothing constrained the query's ride. Probing real routes WITH query strings exposed the reference's pinned algorithm, applied to EVERY canonical — real routes *and* the 404s — and mirrored into og:url + twitter:url:

1. **The exclusion set** (case-insensitive): the `utm_*` prefix plus the EXACT keys `gclid`, `fbclid`, `wbraid`, `msclkid`, `dclid`, `igshid`, `twclid`, `yclid`, `_ga`, `mc_cid`, `mc_eid`, `ref` — with `ref` EXACT, not a prefix (`referrer`/`reference` KEPT, probed; so are `source`, `gclsrc`, `ttclid`, `tiktok_click`, `li_fat_id`, `si`).
2. **The stable alpha-sort** of the kept params (`?z=1&a=2` → `?a=2&z=1`; `?b=2&a=1&a=3` → `?a=1&a=3&b=2` — dupes keep their original order).
3. **URLSearchParams serialization semantics** (`?x=a%20b` → `x=a+b`), with an empty or fully-excluded query dropped.

The clone hardcoded query-less canonicals and passed the 404's raw search through. The fix: the pure seam (`src/lib/canonical-query.ts`) + `routeMetadata`'s `search` param + `pageMetadata()` (the header-reading half in its OWN module — `metadata.ts` must stay free of `next/headers` to stay unit-importable) + all 12 page metadata exports converted to `generateMetadata` (CourseDetail/reset-password's searchParams-canonical extraction removed — the processed raw search carries the id/token, dupes both kept per the live's contract while the RENDERING keeps firstId).

**The second family — the %2F decode-order drift** in the session-38 seam: the live decodes the FULL raw path *before* splitting on `/` — an encoded slash is a real segment boundary (`/enc%2Fslash` → "Slash | NexusLearn", `/a%2F` → "A", `/x%2FmyPage` → "My Page" — 7 probed shapes). The clone split first (`"Enc/slash"`). Fixed in `notFoundTitle` (decode-then-split; the malformed-percent fail-safe preserved — the live's infra 400s `/%zz` before the app, the clone's own 404 + raw-segment title is its documented contract; the live's canonical-decodes-%2F dimension stays in the s38 documented deliberate-variance family).

**The third family — the AI-chat late-rejecting-loser invariant** pinned empirically: a loser rejected after the bound won raises NO `unhandledRejection` (Promise.race's internal handlers consume the late rejection — the standalone server cannot crash on the hung-then-reset socket sequence).

**Two spec-authoring/deliberate-contract updates caught by the runs:** the s17 duplicate-id canonical pin (the live keeps BOTH dupes — the rendering's first-value-wins pin untouched) and the X-suffixed title-shape discipline (the pure-case variants hit the proxy's documented case-rewrite).

**GUARD:** the ENTIRE standing parity battery re-ran after the changes (the metadata conversion touched every page): heights 18/18 byte-exact, innerText identical, the mobile battery identical, console 12/12 clean.

**Deliverables:** 583 tests green (245 unit + 338 e2e, zero regressions) · the proof matrix (`docs/screenshots/api-session-s39.txt` — the %2F titles 16/16 byte-exact vs the live; the canonicals byte-exact on every exclusion/sort/dupe/encoding shape, the two root byte-form cells the same URL) · the screenshot matrix + the new %2F/query captures · all docs aligned (gotcha 68, SKILL v3.27.0, [S39] PAD row, session_81/82 logs).

**Suggested next:** (a) the error-boundary surface (`error.tsx` — unpinned), (b) a Lighthouse-style score budget family, or (c) the deferred logout-everywhere UI (still beyond-reference).
