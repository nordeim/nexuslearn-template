# NexusLearn Remediation Plan — Session 39

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667, both sites signed in as the demo user; the dev server on
:3000; the evidence scripts under `/home/z/my-project/scripts/s39-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-38 tree, commits
`4b2e9ef`/`3591d65`): lint ✓ · typecheck ✓ · 202/202 unit ✓ · build ✓ ·
**328/328 e2e ✓** (6.8m, zero flakes) — 530 total, matching the documented
session-38 end state exactly. The environment contract re-verified
(`DATABASE_URL="file:../db/custom.db"`, `.env` byte-identical to
`.env.example`, `db/custom.db` + `db/e2e.db` at the repo root). The standing
parity surfaces ALL re-verified: heights ×9 routes ×2 viewports **byte-exact
18/18** (one transient live CSR stall on desktop /BecomeInstructor re-probed
identical: h=2477, 1052ch), the **mobile battery fully identical — NO Tailwind
v4 bug** (trigger `md:hidden p-2 rounded-lg text-white/80` byte-identical,
panel 375×405 @ y=64, link geometry byte-identical y 81–417), console sweep
**12/12 clean**.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The encoded-slash (%2F) 404-title drift (fresh-eyes family A — a REAL functional parity drift in the newest session-38 code)**: the LIVE derives the 404 title by decoding the FULL raw path FIRST and THEN splitting on `/` — the last non-empty DECODED segment is the title source. The CLONE's seam (`notFoundTitle`) splits the RAW path first and decodes only the last RAW segment. They agree on every shape EXCEPT a segment containing an encoded slash `%2F`. Probed on the live (7 shapes, all confirmed): `/enc%2Fslash` → **"Slash \| NexusLearn"** (clone renders "Enc/slash \| NexusLearn"); `/a%2F` → **"A"** (clone "A/"); `/a%2Fb%2Fc` → **"C"**; `/%2F` → plain **"NexusLearn"** (decode → `/` → no non-empty segment); `/enc%2F` → **"Enc"**; `/x%2FmyPage` → **"My Page"** (the decoded segment's camel humps still split); `/Courses%2Fdeeper%2Fmissing` → **"Missing"**. The live's canonical for these shapes decodes `%2F` to a real slash (`…/enc/slash`) — that dimension stays in the **documented deliberate-variance family** (the s38 decision: the clone's Next metadata API re-encodes by construction — a valid canonical URL; the live's decoded artifact is artifact-grade). The clone's `///` (plain "NexusLearn" + root canonical) and `/a//double` ("Double") already match. The live's infra **400s malformed percent sequences** (`/%zz` → a platform-level 400 Bad Request, the request never reaches the app) — the clone's fail-safe (raw-segment title + its own 404) is its own documented contract; no change. | **HIGH** (functional parity) | fix below |
| 2 | **The canonical QUERY-PROCESSING contract (fresh-eyes family B — a REAL functional parity drift, found by probing real routes with query strings — a dimension no prior session pinned)**: the LIVE processes the query string of EVERY canonical (real routes AND the 404) through a pinned algorithm, and mirrors the result into og:url + twitter:url: **(a) the tracking-param exclusion set** (case-insensitive): the `utm_*` PREFIX (`utm_source`, `utm_id`, `utm_medium`, `UTM_source` all dropped) + the EXACT keys `gclid`/`GCLID`, `fbclid`, `wbraid`, `msclkid`, `dclid`, `igshid`, `twclid`, `yclid`, `_ga`, `mc_cid`, `mc_eid`, `ref`/`REF`/`Ref` — while `ref` is EXACT, NOT a prefix (`referrer`, `reference` KEPT — probed), and `source`, `gclsrc`, `ttclid`, `tiktok_click`, `li_fat_id`, `si` are KEPT; **(b) the kept params are ALPHABETICALLY SORTED by key** (stable: `?b=2&a=1&a=3` → `?a=1&a=3&b=2` — dupes preserved in original order; `?z=1&a=2` → `?a=2&z=1`); **(c) serialization follows URLSearchParams semantics** (`?x=a%20b` → `x=a+b` — the form-encoding `+` for spaces; `?x=%C3%A9` stays `%C3%A9`); **(d) an EMPTY query (`?`) is dropped**; **(e) the hash fragment never reaches the server** (search only). Probed on real routes: `/?x=1` → `…?x=1`, `/Courses?x=1` → `…/Courses?x=1`, `/login?x=1` → `…/login?x=1`, `/Pricing?utm_source=test` → `…/Pricing` (utm dropped), `/CourseDetail?id=<real>&extra=2` → `…/CourseDetail?extra=2&id=<real>` (sorted!), `/Home?x=1` → `…?x=1` (the ROOT canonical + query — the /Home→root rule), `/reset-password?token=abc&utm_source=z` → `?token=abc`, `/reset-password?z=1&token=abc` → `?token=abc&z=1`, `?token=` (empty value) KEPT. And on the 404: `/no-such-page-xyz?utm_source=a&y=2` → `?y=2`; `/no-such-page-xyz?z=1&a=2` → `?a=2&z=1`. THE CLONE: real routes hardcode query-LESS canonicals (`routeMetadata({canonical})` — a `?x=1` visit renders the bare `/Courses` canonical, dropping params the live keeps; CourseDetail keeps ONLY the id; reset-password only the token), and the 404 passes the RAW search through (keeping `utm_source` the live drops). The s38 e2e pin (`?x=1` on the 404) passed only because a single non-excluded param survives the processing UNCHANGED. | **HIGH** (functional parity) | fix below |
| 3 | **The AI-chat loser late-rejection hardening pin (fresh-eyes family C — the session-38 code's remaining unpinned behavior)**: `withTimeout` races the completion against the bound; when the bound wins, the LOSING promise keeps running (the SDK accepts no signal — documented). The losing promise's later REJECTION is consumed by `Promise.race`'s internal handlers (race attaches handlers to every input at creation — the settled race no-ops), so NO `unhandledRejection` should fire — but this is ANALYSIS, not a PIN. A hung-then-reset socket is the common real-world sequence (the 60s bound fires, the socket dies at 90s and rejects) — an unhandled rejection would take down the standalone server process (Node ≥15 default: throw). A unit spec pins the invariant empirically. | LOW (hardening pin) | spec below |
| 4 | **The AI-chat `withTimeout` design re-audit (family C companion — verified sound, no fix)**: the timer is cleared in `finally` on the WIN path ✓; `ZAI.create()` sits INSIDE the raced IIFE (both the config read and the completion are bounded) ✓; the route's catch maps the typed error to the existing 502 family ✓ (pinned by the s38 specs). | — (verified) | none |
| 5 | **The og:image hosting dimension re-checked (NOT a new finding)**: the live's 404 + real-route og:image/twitter:image = the supabase-hosted logo (`…/e461cd10b_logo.png?width=1200&height=630&resize=contain`); the clone ships the byte-identical local `/logo.png` (md5-verified s27) — the documented CDN-vs-local platform variance (s21 finding 4: ACCEPT — document; the e2e pins the local form). | — (documented) | none |
| 6 | **Documentation staleness**: the counts across AGENTS.md / CLAUDE.md / README / PAD §7 shift with the new specs (202 unit + 328 e2e → new totals); AGENTS.md gains the gotcha (the canonical query-processing + the %2F title derivation); the SKILL bumps to v3.27.0. | MEDIUM (doc hygiene) | Phase 7 |

### Audit-surface note (the session-39 additions — THREE new probe families)

- **the encoded-slash 404-title surface** (finding 1) — the %2F dimension of
  the raw-path derivation: the decode-order contract (decode-then-split vs
  split-then-decode), probed via rendered-DOM title extraction across 7 shapes
  plus the malformed-percent (infra-400) and double-slash edges.
- **the canonical query-processing surface** (finding 2) — the QUERY dimension
  of every canonical/og:url/twitter:url (a dimension no prior session probed —
  the standing pins always visited query-less URLs): the exclusion set (23
  probed keys), the stable alpha-sort, the URLSearchParams serialization
  semantics, the empty-query drop, the hash exclusion, the /Home→root+query and
  CourseDetail/repeat-param shapes, the 404's shared algorithm.
- **the loser-rejection availability surface** (finding 3) — the
  unhandledRejection invariant of the race bound, pinned empirically.

### The plan-time design validation (done BEFORE this plan was finalized)

- **`next/headers` must NOT enter `src/lib/metadata.ts`**: tests/metadata.test.ts
  imports `routeMetadata` directly in vitest (no Next runtime) — a top-level
  `next/headers` import would break the unit import. The header-reading
  helper (`pageMetadata`) goes in its OWN file (`src/lib/page-metadata.ts`),
  keeping metadata.ts pure (the s38 seam discipline).
- **The proxy already injects `x-nexus-raw-search`** (the s38 wiring) — the
  pages read the SAME header the layout already reads. No proxy change.
- **Every route is already ƒ dynamic** (the s24 force-dynamic companion —
  build table verified) — the per-page `generateMetadata` + `headers()` adds
  NO new dynamism; the TTFB budget re-runs in the GUARD phase.
- **gotcha 18 holds for the conversion**: each page's `generateMetadata`
  returns the SAME `routeMetadata()` payload (the query appended to the
  canonical) — the layout's derived family still surfaces ONLY on 404s.
- **The /Home re-export trap (the s38 lesson)**: `export { default } from
  "../page"` transfers the component but NOT metadata exports — /Home gets its
  own `generateMetadata` (canonical `/`, the live's /Home?x=1 → `…?x=1`
  root+query contract).
- **CourseDetail/reset-password SIMPLIFY**: their canonicals stop building
  from `searchParams` (the id/token extraction) — the processed RAW search
  carries the id/token naturally (kept, sorted, dupes preserved: `?id=x&id=real`
  → `?id=x&id=real`, matching the live's dupe behavior; the RENDERING's
  firstId/searchParams logic is untouched — the s17 pin).
- **All standing pins stay green by construction** (verified shape-by-shape):
  query-less visits → processed `""` → bare canonicals (the s5/s6/s38 pins);
  `?id=seed-1` → single-param processing is identity (the s6 CourseDetail pin);
  `?token=anything-at-all` → kept (the s37 reset pin); the 404 `?x=1` pin →
  `x` survives (the s38 pin); the s38 guard spec's `new URL(c).pathname`
  assertions → pathnames unchanged.

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — the canonical-query seam (finding 2, the pure layer)

**Design**: `src/lib/canonical-query.ts` (pure — no Next.js imports):

- `CANONICAL_EXCLUDED_PARAMS` — the frozen exact-key set: `gclid`, `fbclid`,
  `wbraid`, `msclkid`, `dclid`, `igshid`, `twclid`, `yclid`, `_ga`, `mc_cid`,
  `mc_eid`, `ref`.
- `isExcludedCanonicalParam(key)` — lowercase the key; `utm_*` prefix OR
  exact-set member.
- `processCanonicalQuery(rawSearch)` — strip the leading `?`; empty → `""`;
  parse via `URLSearchParams` (the probed serialization semantics), filter the
  exclusion set, stable-sort by key (code-unit `<`/`>` — deterministic, no
  locale), rebuild via `URLSearchParams.append` and `.toString()` (the
  form-encoding: `%20` → `+`), return `"?" + qs` or `""` when everything is
  dropped.

**RED unit** (`tests/canonical-query.test.ts`): the exclusion battery (every
dropped key incl. the case variants `GCLID`/`UTM_source`/`Ref`; every kept key
`referrer`/`reference`/`source`/`gclsrc`/`ttclid`/`x`/`id`/`token`/`si`), the
sort (`?z=1&a=2` → `?a=2&z=1`; `?b=2&a=1&c=3` → `?a=1&b=2&c=3`), the dupes
(`?b=2&a=1&a=3` → `?a=1&a=3&b=2`), the empty (`""`/`?` → `""`), the
all-dropped (`?utm_source=a` → `""`), the encoding (`?x=a%20b` → `?x=a+b`;
`?x=%C3%A9` → `?x=%C3%A9`), the leading-`?` tolerance.

### Phase 2 — the not-found seam updates (findings 1 + 2's 404 member)

**Design** (`src/lib/not-found-metadata.ts`):

- `notFoundTitle(rawPath)`: decode the FULL raw path FIRST (try/catch — the
  malformed-sequence fail-safe falls back to the RAW path), THEN split on `/`
  and take the last non-empty segment, then `startCaseSegment`. Every pinned
  s38 shape produces identical output (verified shape-by-shape: decode is a
  no-op on plain ASCII paths; the space shapes decode inside the single
  segment and split inside startCaseSegment) — only the %2F family changes,
  to the live's contract.
- `notFoundCanonical(rawPath, rawSearch)`: the trailing-slash strip + ENCODED
  path stay (the documented deliberate variance); the search now routes
  through `processCanonicalQuery` (the raw pass-through replaced).

**RED unit** (`tests/not-found-metadata.test.ts` additions): the %2F title
battery (all 7 probed shapes), the 404 canonical's processed query
(`?utm_source=a&y=2` → `?y=2`; `?z=1&a=2` → `?a=2&z=1`; the `?x=1` identity;
`?` → `""`; `?utm_source=a` → `""`), the malformed-percent fail-safe re-pinned
(`/%zz` → raw-segment title).

### Phase 3 — the real-route canonicals (finding 2's real-route member)

**Design**:

- `src/lib/metadata.ts` — `routeMetadata({ title, canonical, search })`: the
  optional `search` (the RAW search string) appends
  `processCanonicalQuery(search)` to the canonical; `og.url` and
  `twitterUrlFor(canonical)` build from the query-bearing form. metadata.ts
  imports the pure seam (no next/headers — the unit-test import stays safe).
- `src/lib/page-metadata.ts` (NEW — the header-reading half):
  `pageMetadata(opts)` → reads `x-nexus-raw-search` via `headers()` and
  delegates to `routeMetadata({ ...opts, search })`. Each page's export
  becomes `export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ ... }); }`.
- **The 11 conversions** (the metadata export swap; the page bodies are
  untouched): `/` (canonical `/`), `/Home` (canonical `/` — the root rule),
  `/Courses`, `/Pricing`, `/About`, `/Contact`, `/BecomeInstructor` (title
  "Become Instructor"), `/AIAssistant`, `/Dashboard`, `/login` (no title — the
  absolute guard), and the two existing generateMetadata pages SIMPLIFY
  (`/CourseDetail` drops the searchParams id-canonical →
  `pageMetadata({ title: "Course Detail", canonical: "/CourseDetail" })`;
  `/reset-password` drops the token-canonical → `pageMetadata({ canonical:
  "/reset-password" })`).

**RED unit** (`tests/metadata.test.ts` additions + `tests/page-metadata-source.test.ts`):
routeMetadata's query-bearing outputs (canonical/og:url/twitter:url carry
`?x=1`; the utm drop; the sort; `/` + `?x=1` → `/?x=1`); no-search → bare
(the standing identity). Source pins: page-metadata.ts reads
`x-nexus-raw-search`; every page file declares `export async function
generateMetadata` calling pageMetadata with the right canonical; CourseDetail
+ reset-password no longer reference searchParams in their metadata.

### Phase 4 — the AI-chat hardening spec (finding 3)

**RED unit** (`tests/ai-chat-timeout.test.ts` addition): a never-resolving
loser raced past the bound, then rejected LATE → the typed timeout error
still the only observable failure; the `unhandledRejection` listener captures
NOTHING (the race's attached handlers consume the late rejection). Process
listener attached/detached around the spec.

### Phase 5 — the e2e block (findings 1–2, the integration pins)

Inserted BEFORE the s33 burst spec (stays LAST — the house rule):

1. **The %2F title battery**: `/enc%2Fslash` → "Slash | NexusLearn";
   `/a%2F` → "A | NexusLearn"; `/x%2FmyPage` → "My Page | NexusLearn";
   `/Courses%2Fdeeper%2Fmissing` → "Missing | NexusLearn"; `/a%2Fb%2Fc` →
   "C | NexusLearn" (the rendered-DOM title).
2. **The canonical query-processing battery on real routes**: `/Courses?x=1`
   → canonical + og:url + twitter:url search `?x=1`;
   `/Courses?utm_source=a&x=1` → `?x=1` only; `/Courses?z=1&a=2` → `?a=2&z=1`;
   `/login?x=1` → `?x=1`; `/?x=1` → pathname `/` + `?x=1`; `/Home?x=1` →
   pathname `/` + `?x=1` (the root rule); `/CourseDetail?id=seed-1&extra=2` →
   `?extra=2&id=seed-1` (sorted).
3. **The 404 processed canonical**: `/no-such-page-xyz?utm_source=a&y=2` →
   `?y=2`; `/no-such-page-xyz?z=1&a=2` → `?a=2&z=1` (canonical + og:url +
   twitter:url).
4. **The no-query guards**: the standing canonical pins re-asserted
   (query-less visits render bare canonicals — the s38 guard re-run).

### Phase 6 — the GUARD phase

- Full gate re-run: lint → typecheck → test → build → test:e2e (the expected
  counts: 202 → ~230 unit, 328 → ~336 e2e).
- The standing parity surfaces re-verified AFTER the changes: heights/innerText
  ×9 routes ×2 viewports byte-exact + the mobile battery re-run + the console
  sweep (the metadata conversion touches every page — the parity re-run is
  the proof it changed nothing visible).
- The CSS-leak spec re-runs LAST (the gotcha-41 rule).

### Phase 7 — docs alignment (finding 6) + the proof matrix + screenshots

AGENTS.md (gotcha 68 — the canonical query-processing contract + the %2F
decode-order rule; the commands-table counts; Where-things-live), CLAUDE.md
(the pyramid counts + the seam descriptions), README (badge + the
session-39 paragraph), PAD ([S39] revision row + §6/§7 updates), SKILL v3.27.0
+ project_state, `.env`/`.env.example` (NO new knobs), the session logs +
the worklog entry. The proof matrix
(`docs/screenshots/api-session-s39.txt`): the %2F title matrix (clone vs
live), the canonical processing matrix (both sites, the exclusion/sort/dupe
shapes), the no-query guards, the AI hardening proof. The screenshot matrix
recaptured per the house viewport-capture convention.

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-38 tree re-verified — 530).
2. [x] Standing parity audit green (heights/innerText/mobile/console — the one
   diff re-probed identical: a transient live CSR stall).
3. [x] Fresh-eyes probes: family A (the %2F title drift — 7 shapes pinned)
   CONFIRMED, family B (the canonical query-processing contract — 23+ probed
   shapes across real routes AND 404s) CONFIRMED, family C (the loser-rejection
   invariant) ANALYZED (the pin is the fix).
4. [ ] RED: the unit batteries (the canonical-query seam + the not-found
   additions + the metadata additions + the page-metadata source pins + the
   ai-chat hardening spec) + the e2e block → verified failing.
5. [ ] GREEN: `src/lib/canonical-query.ts`; the not-found seam updates; the
   routeMetadata search param; `src/lib/page-metadata.ts`; the 11 page
   conversions.
6. [ ] GUARD: the full gate re-run + the standing parity surfaces + the
   mobile battery re-run (the metadata conversion touches every page — the
   proof it changed nothing visible).
7. [ ] The proof matrix + screenshots + docs + commit + push (the SSH
   wrapper, main only).

### Risk notes (validated against the codebase pre-execution)

- **The metadata conversion touches every page** — it is the highest-count
  (not highest-radius) edit of the session. Each conversion is mechanical
  (the export swap) and source-pinned; the page BODIES are untouched (the
  rendering logic — searchParams, firstId, the Suspense gates — is outside
  the change). The GUARD phase re-runs the ENTIRE standing battery.
- **The `next/headers` import boundary**: page-metadata.ts is the ONLY new
  server-context import; metadata.ts stays pure (the unit import safety —
  validated above).
- **The sort determinism**: the code-unit comparison (no `localeCompare` —
  ICU variance across environments); the stable sort preserves the probed
  dupe order.
- **The URLSearchParams serialization**: `.append` + `.toString()` reproduce
  the probed `+`-encoding exactly (the identity round-trip: parse decodes,
  toString re-encodes form-style).
- **The %2F title change is additive**: every s38-pinned title shape produces
  byte-identical output under decode-then-split (verified shape-by-shape —
  the decode is a no-op on plain-ASCII paths, and the space shapes split
  identically inside startCaseSegment); the s38 e2e title battery re-runs in
  the suite as the regression guard.
- **The og:url/twitter:url mirrors**: they build from the query-bearing
  canonical in ONE place each (routeMetadata + the layout derivation) — the
  s38 other-map mechanism is untouched.
