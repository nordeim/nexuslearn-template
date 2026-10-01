# NexusLearn Remediation Plan — Session 26

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the e2e production standalone server on :3100).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-25 tree, commit `fce727e`
= `a705c7f` + the pulled session-log doc): lint ✓ · typecheck ✓ · 41/41 unit ✓
· build ✓ · **257/257 e2e ✓** (re-verified this session). The environment
contract re-verified (`DATABASE_URL="file:../db/custom.db"` in `.env`,
`db/custom.db` + `db/e2e.db` both at the repo root; `.env.example`
byte-identical); the session-24 CSP nonce + force-dynamic + the session-23
security headers verified live on the dev server.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The HTTP verb/method matrix surface (first inventory — fresh-eyes family 1)**: every prior response-layer probe (sessions 23–25) issued GET requests; the METHOD dimension was never probed. The full verb matrix on both sites (pages, unknown paths, static public files, crawler files, API endpoints): **the live 405s EVERY non-GET/HEAD verb on every non-API path** (its uvicorn platform layer — POST/PUT/DELETE/OPTIONS on `/`, `/Courses`, `/login`, unknown paths, `robots.txt`, `sitemap.xml`, `manifest.json`, `logo.png` all return 405 `application/json`; GET/HEAD serve normally). The clone diverges in three response classes: (a) **page routes render full HTML with 200 for POST/PUT/DELETE** (Next.js App Router pages accept any method — POST `/`, `/Courses`, `/login`, `/Pricing` all 200 the page body) and **OPTIONS returns 400** (the dev server's origin-protection 400 carries to the standalone build); (b) **static public assets 500** on non-GET (POST/OPTIONS `/logo.png` + `/manifest.json` → `500 Internal Server Error` — the static file handler's own crash class, worse than a deliberate 405); (c) **unknown paths 404 for POST** (method never beats path resolution — the live's 405-on-POST-unknown shows its method check runs FIRST). The crawler route handlers (`robots.txt`, `sitemap.xml`) and the API route handlers are already correct (405 wrong-verb from the handlers themselves, 204 auto-OPTIONS on `/api/*` — the framework's standard preflight handling, the clone's own first-party API contract). | MEDIUM (response-layer parity gap + the 500 class) | **FIX — the proxy method guard + PIN** |
| 2 | **The form-control metadata surface (first inventory — fresh-eyes family 2)**: the autocomplete / inputMode / autocapitalize / spellcheck / enterkeyhint attributes — the password-manager + virtual-keyboard metadata family, never swept (the session-18 attribute surface covered placeholders/ids/alts only). Sweep across every form control on all 9 audited routes, both sites: (a) the live ships **NO metadata attributes anywhere** (its login inputs carry only type/id; every other form control is bare); (b) the clone's login card ships a PARTIAL password-manager hardening — signin: `autoComplete="email"` + `autoComplete="current-password"` ✓, verify: `inputMode="numeric"` + `autoComplete="one-time-code"/"off"` ✓, but **signup carries NOTHING** (email + password + confirmPassword inputs all bare — the one view where password managers GENERATE new passwords; without `new-password` they mis-suggest current credentials and skip strong-password generation); (c) every other form (newsletter, Courses search + selects, AI composer, Contact) is reference-faithful bare on both sites (the sweep's SAME verdicts — the session-22 aria-label hardening shows up as the known id-fallback column, already pinned). The shipped signin/verify hardening is UNPINNED — a future audit could "fix" it toward the live's bare inputs. | LOW (hardening completion + pin) | **FIX — complete signup + PIN** |
| 3 | **Every standing surface re-verified at the documented session-25 state**: heights ×11 routes ×2 viewports BYTE-EXACT (22/22, CourseDetail per-site ids: live `699081e752032065b878129d` vs clone `seed-1`); normalized innerText 11/11 identical; tag drift 0 on shared classes; class-set diffs — **byte-identical to the session-25 baseline report** (a scripted set-comparison against `parity-report-s25.json`: the same 121 desktop diff lines, every one in the documented variance families); the FULL mobile battery GREEN — trigger classes byte-identical (`md:hidden p-2 rounded-lg text-white/80`), the open panel **405px on BOTH sites**, the 8 link texts + per-link GEOMETRY byte-identical (y-positions 81/129/177/225/273/321/369/417, heights 44×7+36; the 4px pre-CTA gap present on both via the documented session-9 v3-margin-top vs v4-margin-block-end engine variance), toggle + route-change close collapsed/invisible, scroll lock + ARIA = the documented clone-only hardening — **NO Tailwind v4 display, breakpoint or space-y bug**; the console surface clean on the clone dev server (0 errors, 10 routes). | — | Verified |
| 4 | **The dead-end probes documented** (the session's methodology record): (a) the **session-cookie attribute surface** — the live persists NO session cookie at all (its Base44 platform auth lives in localStorage — 8 platform keys, the documented session-22 architecture variance); there is no Set-Cookie axis to compare, so the cookie-attribute probe closes as an architecture-variance dead end (the clone's `nexus_session` HttpOnly/SameSite=Lax/Path=/​/7d contract is its own first-party design, already covered by the session-22 storage pins); (b) the **auto-requested well-known files** (`/favicon.ico`, `/apple-touch-icon.png`, `/site.webmanifest`) — the live 302s favicon/apple-touch to its platform and serves the SPA HTML fallback (200 `text/html`) for the webmanifest; the clone 404s all three; neither site's browsers auto-request them (both ship the `<link rel="icon">` tag — session 5 — which suppresses the default favicon.ico fetch); platform-fallback artifacts, the documented session-25 family. | — | Documented |

### Audit-surface note (the session-26 additions — TWO new probe families)

- **the HTTP verb/method matrix surface** (finding 1) — the sessions-23/24/25
  response-layer probes (headers, status codes, canonicalization, crawler
  files) all issued GET requests; the METHOD dimension of the response
  contract was never probed (this is the surface that caught the page-route
  200-for-POST, the OPTIONS 400 and the static-asset 500 class);
- **the form-control metadata surface** (finding 2) — the session-18 attribute
  sweep covered placeholders/ids/alts; the autocomplete/inputMode family (the
  password-manager + virtual-keyboard contract) is its own never-swept layer
  (this is the surface that caught the unhardened signup view + the unpinned
  signin/verify hardening).

---

## B. Remediation (TDD)

### Phase 1 — the proxy method guard (RED → GREEN; the verb-matrix gap)

- [1a] **RED**: new e2e spec block `session-26 parity: the HTTP verb matrix
  surface` — test (a): POST/PUT/DELETE/OPTIONS on `/`, `/Courses` and
  `/login` return **405** with `Allow: GET, HEAD` and the app's `{error}`
  JSON body; GET and HEAD still return 200 on `/` (the guard must not break
  normal serving). Run on the baseline build → **fails** (POST returns 200
  with the page body; OPTIONS returns 400).
- [1b] **RED** (same block, test b): the static-asset class — POST on
  `/logo.png` and `/manifest.json` returns **405** (the baseline 500s);
  POST on an unknown path returns **405** while GET on the same path keeps
  the session-24 404 pin (method beats path resolution — the live's
  semantics); the API verb contract stays the handlers' own (GET on
  POST-only `/api/auth/login` → 405, OPTIONS on `/api/health` → 204 —
  green-by-design pins of the first-party API contract).
- [1c] **GREEN**: `src/proxy.ts` — the method guard at the TOP of the proxy
  (before the canonical-rewrite logic, so method beats path resolution like
  the live): any non-GET/HEAD request whose path is NOT under `/api/`
  returns `NextResponse.json({ error: "Method not allowed" }, { status:
  405, headers: { Allow: "GET, HEAD" } })`. The matcher gains
  `favicon.ico` / `logo.png` / `manifest.json` (currently excluded — the
  static-asset 500 class needs the guard; `robots.txt` / `sitemap.xml` stay
  excluded — their route handlers already 405 correctly; `_next/*` stays
  excluded — no parity axis, unknown dev-server internals). The CSP/nonce
  pipeline is untouched (the guard returns before the nonce work; a 405
  carries no scripts).
- [1d] **Verify**: the full verb matrix re-probed on the standalone build
  (pages 405 + Allow, statics 405, unknown POST 405 / GET 404, crawler files
  unchanged 405, API unchanged) + the full 257-spec e2e suite as the
  regression guard (the login/enrollment/newsletter/contact flows all use
  `fetch` against `/api/*` — no page-route POSTs anywhere in the suite; the
  session-24 canonicalization + CSP specs re-assert their pins).

### Phase 2 — the form-control metadata hardening (RED → GREEN + pins)

- [2a] **RED**: new e2e spec block `session-26 parity: the form-control
  metadata surface` — test (a): the login card's password-manager contract —
  signin email `autocomplete=email`, signin password
  `autocomplete=current-password`, the verify view's code inputs
  `inputmode=numeric` with `autocomplete=one-time-code` (first) / `off`
  (rest), AND the signup view's three inputs `autocomplete=email` /
  `new-password` / `new-password`. Run on the baseline → **fails** (signup
  carries no autocomplete).
- [2b] **GREEN**: `src/components/LoginForm.tsx` — the signup view's email
  input gains `autoComplete="email"`, the password + confirmPassword inputs
  gain `autoComplete="new-password"` (completing the shipped hardening; the
  signin/verify values are already in place).
- [2c] **GUARD** (same block, test b): every OTHER form control stays
  reference-faithful bare — the newsletter email input, the Courses search
  input, the AI composer textarea and the Contact inputs carry NO
  autocomplete/inputMode attributes (green-by-design: the live ships none
  there either; pins the hardening's SCOPE so a future audit neither strips
  the login values nor spreads them beyond the login card).

### Phase 3 — ship

- [3a] `.env.example` re-verified (no environment surface changed; byte-
  identical to `.env`, covering every user-facing `process.env` reference).
- [3b] Screenshots: the standard set re-captured on the remediated dev
  server + the session-26 additions (the verb-matrix evidence is textual —
  a `verb-matrix-s26.txt` capture documents the response classes; the
  rendered captures document the login card incl. the signup view).
- [3c] Docs alignment: README (the session-26 paragraph + the new test
  counts), AGENTS.md (gotcha 55 — the verb-matrix + form-metadata surfaces;
  the commands table), CLAUDE.md (the test pyramid + the session-26 spec
  family), PAD ([S26] revision + §7.1 row), `nexuslearn-template_SKILL.md`
  v3.14.0 (the two new probes + surface 18m + the project_state),
  `docs/remediation-plan-session26.md` (this plan, with the results),
  `docs/session_48.md`, the repo worklog.
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
| The method guard breaks a legitimate non-GET flow (a form POSTing to a page route) | Every mutating flow in the app goes through `/api/*` fetch calls (login/signup/verify/forgot, enrollments, progress, contact, newsletter, AI chat — verified in the route audit + the e2e suite exercises all of them); the login card's fallback native-submit path (the gotcha-32 unhydrated mode) issues a GET (`/login?`) — unaffected. The guard scope is `non-GET/HEAD ∧ ¬/api/*` only. |
| Extending the matcher to logo.png/manifest.json/favicon.ico changes their GET behavior | The proxy passes GETs through `NextResponse.next()` untouched apart from attaching the CSP header — a response-level header on a non-document asset is inert (the same reasoning as the session-24 matcher note); verified on the standalone build post-change (GET 200 + the correct content-types, the session-25 crawler-file pins re-run). |
| Next.js dev-server internals POST to excluded paths we now 405 | The guard deliberately keeps `_next/*`, `api/*`, `robots.txt` and `sitemap.xml` OUT of its scope (dev internals untouched, handler-owned semantics preserved); the dev server was verified post-change (hydration, HMR, the e2e global-setup seeding through the standalone server). |
| The 405 response body diverges from the live's platform JSON | The live's `{"error_type":"HTTPException",...}` body is its uvicorn platform artifact (the same family as its raw-path titles); the clone ships its own first-party `{error}` JSON convention — the deliberate-better family, documented in the spec comments. |
| The signup autocomplete change breaks the signup e2e flow | `autoComplete` is a metadata attribute — zero behavioral impact on Playwright's fill/click flows; the full signup+verify e2e specs re-run in the regression guard. |
| Spec-count drift in docs | README/CLAUDE/AGENTS/PAD/SKILL updated to the new counts in Phase 3c; the worklog records the arithmetic (257 → 261: +4 session-26 specs). |
| The verb pins are environment-sensitive (dev vs standalone) | The specs assert on the e2e standalone server (:3100, the production build) — the same server every other response-level spec (the session-23/24/25 pins) already uses; the dev server's guard behavior verified manually (the OPTIONS-400 dev quirk is replaced by the guard's 405 on BOTH servers). |

---

## D. Phase results (recorded after execution)

- **[1a]**: RED confirmed — the verb-matrix spec failed on the baseline
  build (POST `/` returned 200 with the full page body; OPTIONS returned
  400; the static-asset POSTs returned 500).
- **[1b]**: RED confirmed — the static/unknown/API test failed on the
  baseline (POST `/logo.png` 500; POST unknown-path 404) while the API
  verb-contract pins passed (green-by-design guards — the handlers already
  405/204 correctly).
- **[1c]**: GREEN — the method guard added at the top of `src/proxy.ts`
  (non-GET/HEAD ∧ ¬`/api/*` → 405 + `Allow: GET, HEAD` + the `{error}`
  JSON body); the matcher extended with `favicon.ico`/`logo.png`/
  `manifest.json`. All 4 verb-matrix spec assertions pass.
- **[1d]**: verified — the full verb matrix re-probed on the standalone
  build (pages 405+Allow, statics 405, unknown POST 405 / GET 404, crawler
  files 405 via their handlers, API 405/204) + the full e2e suite green.
- **[2a]**: RED confirmed — the signup autocomplete assertions failed on
  the baseline (the three signup inputs carried no autocomplete).
- **[2b]**: GREEN — signup email `autoComplete="email"`, password +
  confirmPassword `autoComplete="new-password"` (the hardening completed).
- **[2c]**: the GUARD pins green — the other forms' controls carry no
  autocomplete/inputMode (the hardening's scope pinned).
- **[3a–3e]**: recorded in the session log (screenshots captured, docs
  aligned, gates green, committed + pushed via the SSH wrapper).
