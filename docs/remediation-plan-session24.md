# NexusLearn Remediation Plan — Session 24

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the e2e production standalone server on :3100; a secondary
standalone instance on :3200 for the response-surface probes).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-23 tree, commit `67ba212`
= `da73d0c` + the pulled session-log doc): lint ✓ · typecheck ✓ · 41/41 unit ✓
· build ✓ · **248/248 e2e ✓** (re-verified this session on the isolated
`db/e2e.db` infrastructure). The environment contract re-verified
(`DATABASE_URL="file:../db/custom.db"` in `.env`, `db/custom.db` + `db/e2e.db`
both at the repo root; `.env.example` byte-identical to `.env`).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The performance / web-vitals + resource-inventory surface (first inventory — the session-23 suggested direction)**: measured TTFB / FCP / LCP + the full resource inventory (script/css/img/font counts and transfer weights) per route on both sites (the live behind Cloudflare; the clone as the standalone production build). **The clone is dramatically faster on every route and every metric**: TTFB 5–61ms vs the live's 209–575ms; FCP 132–288ms vs 856–1752ms; LCP 544–1292ms vs 876–2128ms; the marketing routes weigh ~310KB over ~30 requests vs the live's ~252KB over 7 (the live's SPA shell defers route payloads; the clone's SSR ships the full document — the profile difference is architectural, the clone's being the better loading story). **The 1.1MB logo ships as favicon + login logo on BOTH sites** (the byte-identical asset, md5 `f2d0170f…`; the live's Supabase CDN `no-cache` vs the clone's `/logo.png` `max-age=0` + ETag revalidation — semantically the same revalidate posture): the reference's own design (the same parity family as the gray lesson icons — the asset is pinned byte-identical by the session-21 inventory; compressing it would be an undocumented variance). **The static-asset cache surface**: `/_next/static/*` chunks ship `Cache-Control: public, max-age=31536000, immutable` (correct — the Next.js default, worth pinning against config regressions); `public/` assets ship `max-age=0` (matches the live's revalidate posture — parity, no action). No blocking-resource pathologies; zero client-side data calls on load (the session-22 pin holds). | — (documentation + one PIN) | **PIN** (the immutable static-cache guard) |
| 2 | **The response-status / URL-canonicalization surface (first inventory)**: (a) **trailing slashes** — the live renders `/Courses/` directly (HTTP 200, the slash preserved in the URL); the clone 308-redirects to the canonical `/Courses` (the Next.js `trailingSlash: false` default). The end state is IDENTICAL (the catalog renders on both); the clone's form is the canonical-URL behavior (one URL per resource — the SEO-correct form, the same deliberate-better family as the session-17 canonical titles). (b) **unknown routes** — the live returns HTTP 200 with its in-app 404 view (the SPA fallback; `/NoSuchPage` renders the 404 view with a raw-path title artifact "No Such Page \| NexusLearn"); the clone returns a REAL HTTP 404 with the byte-compared 404 page (session 10) — the SEO-correct form, deliberate-better. (c) **`/Login` case variants** — the live 200 + in-app 404 view; the clone a real 404 (the session-17 exact-match rule, now verified at the STATUS level). None of the three were ever status-level probed or pinned — a future audit could "fix" them toward the live's 200-for-everything posture. | — (deliberate-better, unpinned) | **PIN** (the canonicalization guards) |
| 3 | **No CSP on either site — the documented session-23 future work** (probed: neither the live's platform layer nor the clone ships a `Content-Security-Policy`). The session-23 risk register documented the nonce middleware pattern as future work: the baseline security headers (nosniff/referrer-policy/XFO/HSTS/permissions-policy) protect the transport and framing layers, but nothing constrains SCRIPT execution — the strongest XSS mitigation layer is missing. A nonce-based CSP (script execution restricted to per-request nonced scripts + strict-dynamic propagation) closes it the same deliberate-better way the session-23 baseline did. **Empirically validated this session before planning the implementation** (a spike on a scratch tree, since reverted): the nonce pattern requires per-request rendering — static-prerendered pages (`/login`, `/AIAssistant`, `/Pricing`, `/About`, `/Contact`, `/BecomeInstructor` — the `○` build markers) bake their HTML at build time where no per-request nonce exists; under `strict-dynamic` their scripts BLOCK and the pages render UNHYDRATED (the login form falls back to a native GET submit → `/login?` — the exact gotcha-32 failure symptom). The fix (validated): `export const dynamic = "force-dynamic"` in the root layout — every route (incl. `/_not-found`) renders per-request; the spike verified 100% nonced scripts + ZERO CSP violations on all 11 routes + the login flow + client islands hydrating + the 404 mobile menu working. TTFB cost measured negligible (the already-dynamic routes render in 5–61ms). | Medium (hardening gap, not a parity defect) | **FIX — deliberate-better + PIN** |
| 4 | **Every standing surface re-verified at the documented session-23 state**: heights ×11 routes ×2 viewports BYTE-EXACT (22/22, CourseDetail per-site ids: live `699081e752032065b878129d` vs clone `seed-1`); normalized innerText 11/11 identical; tag drift 0 on shared classes; class-set diffs — byte-identical to the session-23 baseline report (every line in the documented variance families: the live's platform toast portal, the dvh page-root hardening, the gradient arbitrary-form pin, the body font-sans declaration, the mounted-panel family, the selectOrder pair); the FULL mobile battery GREEN — trigger classes byte-identical (`md:hidden p-2 rounded-lg text-white/80`), the open panel **405px on BOTH sites**, the 8 link texts + per-link GEOMETRY identical (y-positions 81/129/177/225/273/321/369/417, heights 44×7+36 — the 4px pre-CTA gap present on both, carried by the v3 margin-top engine on the live vs the v4 margin-block-end engine on the clone, the documented session-9 engine variance), toggle + route-change close collapsed/invisible, scroll lock + ARIA = the documented clone-only hardening — **NO Tailwind v4 display/breakpoint/space-y bug**; the console surface clean on the clone dev server (0 errors). | — | Verified |
| 5 | **The test-suite contracts confirmed in place** (the user-facing task list): `vitest.config.ts` (unit layer, `*.test.ts` in `src/**` + `tests/**` only — 41 specs) and `playwright.config.ts` (e2e layer, `testDir: ./tests/e2e`, the production standalone server on :3100 with the isolated `db/e2e.db` — 248 specs) — both green on the shipped tree. This session GROWS the e2e layer (the spec families below) rather than adding new config. | — | Verified |

### Audit-surface note (the session-24 additions — TWO new probe families)

- **the performance / web-vitals + resource-inventory surface** (findings 1) —
  no prior probe measured paint timings, transfer weights or the cache posture
  (the session-19 header comparison covered identity/infra headers; this
  session adds the loading-budget frame: TTFB/FCP/LCP + resource buckets +
  Cache-Control on the static asset classes);
- **the response-status / URL-canonicalization surface** (finding 2) — no
  prior probe compared HTTP STATUS CODES per route family (the session-17
  case-sensitivity pass compared RENDERED content; the trailing-slash
  behavior, the unknown-route status and the /login-variant status were never
  probed — all three are now measured and fall in the deliberate-better
  canonicalization family).

---

## B. Remediation (TDD)

### Phase 1 — the CSP nonce pattern (RED → GREEN; the session-23 documented future work)

- [1a] **RED**: new e2e spec block `session-24 parity: the CSP nonce hardening`
  — three tests: (a) every HTML response ships a `Content-Security-Policy`
  header carrying a per-request `nonce-` script directive + `strict-dynamic`
  (assert on `/` and `/login` — the latter being the static-prerendered page
  that motivated the dynamic-rendering fix); (b) the nonce is PER-REQUEST
  (two requests produce different nonce values — the anti-replay property);
  (c) the page's own bootstrap scripts carry the nonce (parse the rendered
  HTML: every `<script src>` element carries a `nonce` attribute). Run on the
  baseline tree → **fails** (no CSP shipped).
- [1b] **GREEN (implementation — the empirically validated recipe)**:
  - `src/proxy.ts`: generate a per-request nonce
    (`crypto.randomUUID()` → base64), build the policy —
    `default-src 'self'; script-src 'self' 'nonce-<X>' 'strict-dynamic'`
    (+ `'unsafe-eval'` dev-only — Turbopack HMR), `style-src 'self'
    'unsafe-inline'` (inline style ATTRIBUTES — the reveal system's SSR
    pre-hide + the Navbar grid animation; a nonce-only style-src would block
    them), `img-src 'self' data: blob: https://images.unsplash.com` (the only
    external image host in `src/` + the seed), `font-src 'self'` (no webfonts
    — session 14), `connect-src 'self'` (+ `ws:` dev-only — HMR), `object-src
    'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'`
    (matching the shipped XFO SAMEORIGIN). **Deliberately NO
    `upgrade-insecure-requests`** — the standalone template runs plain HTTP
    locally (the directive upgrades same-origin subresource URLs to https and
    would break them; HSTS — already shipped — handles the deployment-layer
    upgrade). Set the nonce + CSP on the REQUEST headers (the documented
    pattern — Next.js reads them to auto-nonce its scripts) AND on the
    response, in BOTH proxy branches (the canonical fast-path, the
    case-variant rewrite, the default next()).
  - `src/app/layout.tsx`: `export const dynamic = "force-dynamic"` — the
    root-layout segment config forces every route (incl. `/_not-found`) to
    render per-request so the nonce reaches every bootstrap script. Without
    it the six static-prerendered pages bake nonce-less HTML at build time
    and block under `strict-dynamic` (the spike-verified `/login?`
    unhydrated-form failure). Build cost measured negligible (TTFB 5–61ms on
    the already-dynamic routes; the perf probe documents the profile).
  - Keep the proxy matcher's static-asset exclusions (no CSP needed on
    non-document responses; the API exclusion stays — a CSP on JSON responses
    protects nothing).
- [1c] **Verify (the spike's full-route battery, re-run on the real
  implementation)**: every route (incl. a 404 path) renders 100% nonced
  scripts with ZERO CSP console violations; the login flow hydrates +
  submits + lands on `/`; the catalog search island filters; the dev server
  (with the relaxed dev directives) renders hydrated on every audit route;
  the full 248-spec e2e suite as the regression guard.

### Phase 2 — the canonicalization + static-cache pins (green-by-design guards)

- [2a] New e2e spec block `session-24 parity: the URL-canonicalization surface`
  — three tests: (a) `/Courses/` (trailing slash) returns **308** with
  `location: /Courses` (the canonical-URL form — the live renders the slash
  variant 200; the clone's redirect is the SEO-correct deliberate-better
  behavior, pinned so a future audit cannot "fix" it toward the live);
  (b) an unknown route (`/__nonexistent_page__`) returns a REAL **404**
  status (the live returns 200 with its in-app 404 view — the SPA fallback;
  the clone's real 404 + the byte-compared 404 page is deliberate-better);
  (c) `/Login` (the case variant) returns **404** (the session-17 exact-match
  rule, now verified + pinned at the STATUS level).
- [2b] New e2e spec block `session-24 parity: the static-asset cache surface`
  — one test: a `/_next/static/*` chunk response ships
  `cache-control: public, max-age=31536000, immutable` (the immutable
  content-hash cache — the Next.js default, pinned against future config
  regressions; the session-24 performance probe's baseline).

### Phase 3 — ship

- [3a] `.env.example` re-verified (no environment surface changed; byte-
  identical to `.env`, covering every user-facing `process.env` reference).
- [3b] Screenshots: the standard set re-captured on the remediated dev
  server + the session-24 addition (the CSP header in rendered form is not
  screenshot-able — the captures document the performance-surface state: the
  landing + catalog + login renders under the hardened CSP, byte-identical
  to the session-23 captures).
- [3c] Docs alignment: README (the session-24 paragraph + the new test
  counts), AGENTS.md (gotcha 53 — the CSP nonce + canonicalization +
  performance surfaces; the commands table), CLAUDE.md (the test pyramid +
  the session-24 spec family), PAD ([S24] revision + §7.1 row),
  `nexuslearn-template_SKILL.md` v3.12.0 (the two new probes + the CSP
  recipe + the project_state), `docs/remediation-plan-session24.md` (this
  plan, with the results), `docs/session_44.md`, the repo worklog.
- [3d] Full gate in order: `lint → typecheck → test → build → test:e2e`,
  then the session-14 CSS-leak spec re-run LAST (the session-15 process
  rule — every doc write can re-leak the canary).
- [3e] Commit to `main` + SSH-wrapper push (`docs/ssh_git_wrapper_v3.py` via
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`; key in a 0600 file
  OUTSIDE the repo, shredded after use). No new branches — main only.

---

## C. Risk register

| Risk | Mitigation |
|---|---|
| The CSP blocks a script path and pages render unhydrated | The implementation follows the spike-validated recipe exactly (request-header nonce + root-layout force-dynamic); the full-route verification battery (100% nonced scripts + zero violations + the login flow + client islands + the 404 mobile menu) runs on the real implementation before the gates; the 248-spec e2e suite is the regression guard (the login state machine, the catalog filters, the AI chat and the mobile battery are all hydration-dependent). |
| `force-dynamic` regresses performance (losing the static prerender) | Measured in the session-24 probe: the already-dynamic routes TTFB at 5–61ms on the standalone build; the static→dynamic delta is a per-request render of tiny pages (~10–20ms); the probe re-runs post-remediation to document the new profile. The trade is the documented cost of the per-request nonce (the alternative — a weak `script-src 'self' 'unsafe-inline'` CSP — ships near-zero XSS protection). |
| The dev server breaks under the CSP (HMR/websockets) | Dev-only relaxations baked into the policy builder (`'unsafe-eval'` + `ws:` when `NODE_ENV !== "production"`); the dev-server verification re-runs the standing parity probes (heights/innerText/mobile) — any unhydrated page fails them immediately (the gotcha-32 precedent). |
| A future route/feature needs a new external source (image host, API) | The policy builder is a single commented function in `src/proxy.ts` — the directive list is the documented extension point; the e2e CSP spec pins the header's shape (nonce + strict-dynamic), not the full directive list, so extending sources does not break the spec. |
| `strict-dynamic` makes `'self'` inert — a same-origin script without a nonce silently blocks | That is the design (per-request nonces are the only script trust root); the full-route battery verifies every shipped script carries a nonce; any NEW inline script added later must read the nonce from `headers()` (documented in the proxy comment — the official pattern). |
| The 308/404 canonicalization pins conflict with a future routing change | The pins ARE the documentation (the deliberate-better family — the same pattern as the session-16/17 managed-behavior pins); changing them requires a documented decision, not a silent drift. |
| The static-cache pin is environment-sensitive (dev ships `max-age=0`) | The spec asserts on the e2e standalone server (:3100, the production build) where the immutable cache ships — the same server every other response-level spec (the session-23 headers) already uses. |
| Spec-count drift in docs | README/CLAUDE/AGENTS/PAD/SKILL updated to the new counts in Phase 3c; the worklog records the arithmetic (248 → 255: +3 CSP +3 canonicalization +1 static-cache = 7 new specs). |

---

## D. Phase results (recorded after execution)

- **[1a]**: RED confirmed — the three CSP specs failed on the baseline tree
  (the `content-security-policy` header assertion: no CSP shipped; the
  per-request-nonce and script-nonce specs failed for the same reason). The
  four pin specs (canonicalization 308/404/404 + the static-cache immutable)
  passed on the baseline — green-by-design guards pinning existing behavior,
  the correct TDD shape for this session.
- **[1b]**: GREEN — `src/proxy.ts` now generates the per-request nonce,
  exposes it on the request headers (the documented pattern: `x-nonce` + the
  CSP header — Next.js auto-nonces its bootstrap scripts) and ships the
  policy on the response in all three proxy branches (canonical fast-path,
  case-variant rewrite, default next()); the directive set exactly as
  planned (incl. the dev-only `'unsafe-eval'` + `ws:` relaxations and the
  deliberately-missing `upgrade-insecure-requests`). The companion
  `export const dynamic = "force-dynamic"` shipped in `src/app/layout.tsx`
  with the full rationale comment. The build shows every page route (incl.
  `/_not-found`) as `ƒ (Dynamic)`; only `robots.txt` + `sitemap.xml` remain
  static (no scripts — harmless).
- **[1c]**: the full-route battery re-run on the real implementation —
  **100% nonced scripts + ZERO CSP violations on all 11 routes (incl. the
  404 path)**; the login flow hydrates + submits + lands on `/` with zero
  console errors; the catalog search island filters (9 → 3 cards on
  "python"); the 404's client-router Go Home button navigates home; the dev
  server ships the relaxed dev policy (`'unsafe-eval'` + `ws:` present) with
  the login flow working end-to-end. The full e2e suite: **255/255 GREEN**
  (248 → 255: +7 session-24 specs, zero regressions).
- **[2a]**: the three canonicalization pins GREEN — `/Courses/` 308s to
  `/Courses` (`location` asserted), `__nonexistent_page__` returns a real
  404, `/Login` returns a real 404.
- **[2b]**: the static-cache pin GREEN — a real `/_next/static` chunk
  (discovered from the rendered HTML) ships
  `cache-control: public, max-age=31536000, immutable`.
- **[3a]**: `.env.example` re-verified — byte-identical to `.env`; the
  cross-check of every `process.env.*` reference in `src/` + `prisma/`
  against the declared keys is an exact match (DATABASE_URL,
  NEXT_PUBLIC_SITE_URL, AUTH_SECRET + the framework-provided NODE_ENV); no
  environment surface changed this session.
- **[3b]**: screenshots captured — 65 files in `docs/screenshots/`: the
  standard set re-captured on the remediated dev server + the two session-24
  additions (`login-hydrated-under-csp--desktop` — the previously-static
  route rendered fully-hydrated with filled fields, the force-dynamic
  proof; `aiassistant-answer--desktop` — the completed AI answer
  re-captured under the CSP). VLM-verified: the AI answer shows a COMPLETED
  reply (headings + equation + lists, no "Thinking..." bubble), the login
  card fully rendered with both fields filled, the open mobile menu with
  all 7 links + the gradient My Dashboard CTA. The security + CSP headers
  verified via `curl -I` (the response-level surface — the session-23
  screenshot-script URL quirk noted again; the header text proof saved).
- **[3c]**: all docs aligned — README (badge 289→296, the session-24
  paragraph, the 255 count), AGENTS.md (gotcha 53 — the CSP nonce pattern
  requires per-request rendering + the canonicalization/performance/cache
  notes; the commands table 255; the proxy line in "Where things live"),
  CLAUDE.md (the 41+255 pyramid + the session-24 spec family + the test
  commands), PAD ([S24] revision + §7.1 row),
  `nexuslearn-template_SKILL.md` v3.12.0 (the two new probes in the
  description + surface 18k + the project_state), this plan,
  `docs/session_44.md`, the repo worklog.
- **[3d]**: gates (final, in order): lint ✓ · typecheck ✓ · 41/41 unit ✓ ·
  build ✓ · 255/255 e2e ✓; the session-14 CSS-leak spec re-ran LAST after
  every doc write — clean.
- **[3e]**: committed to `main` and pushed via the SSH wrapper — remote
  verified, key shredded after use.
