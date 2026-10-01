# Session 26 — The HTTP verb-matrix + form-control-metadata pass: two fresh-eyes probe families

Continuing from session 25 (`a705c7f` + the pulled session-log doc at
`fce727e` — `docs/session_47.md` holds the prior session's transcript).
Sessions 1–25 closed every static, content, state, computed-style, cascade,
font, preflight, reveal-entry, navigation-transition, deep-link,
pending-state/attribute/tag/token, environment-pollution, element-tag,
console-hygiene, a11y-exposure, interaction-modality, persistence,
security-headers, axe-WCAG, CSP-nonce, performance/canonicalization,
CSSOM-inventory and crawler-file surface — every height byte-exact, the
mobile battery green, 298 tests. This session's mandate: the standard
parity re-audit with the mobile-navigation focus (the Tailwind v4 watch),
then two never-probed fresh-eyes families (the HTTP verb/method matrix
surface + the form-control metadata surface), then the full ship ritual
(screenshots, `.env.example`, docs, gates, SSH-wrapper push).

## Baseline (the shipped session-25 tree)

All gates green on commit `fce727e`: lint ✓ typecheck ✓ 41/41 unit ✓ build ✓
**257/257 e2e ✓** (4.8m, re-verified on the isolated `db/e2e.db`
infrastructure). The environment contract re-verified
(`DATABASE_URL="file:../db/custom.db"` in `.env`, `db/custom.db` +
`db/e2e.db` both at the repo root — the shell's stale absolute export
correctly ignored by the session-19 guard; `.env.example` byte-identical).
skills/ exclusion re-verified (tsconfig, eslint, vitest, playwright, the
`@source not` set). The session-24 CSP contract + the session-23 security
headers verified live on the dev server (per-request nonce + the dev-only
relaxations + the full baseline header set).

## The standing parity re-audit (live vs clone, both signed in)

Every standing surface GREEN at the documented session-25 state: heights
×11 routes ×2 viewports byte-exact (22/22, incl. CourseDetail with per-site
ids — live `699081e752032065b878129d` vs clone `seed-1`); normalized
innerText 11/11 identical; tag drift 0 on shared classes; the class-set
diffs — **byte-identical to the session-25 baseline report** (a scripted
set-comparison against `parity-report-s25.json`: the same 121 desktop diff
lines, every one in the documented variance families); the console surface
clean on the clone dev server (0 errors, 10 routes).

**The FULL mobile-menu battery — the Tailwind v4 watch**: trigger classes
byte-identical (`md:hidden p-2 rounded-lg text-white/80` over the hero); the
open panel **405px on BOTH sites**; the 8 link texts identical; the per-link
GEOMETRY dump byte-identical (y-positions 81/129/177/225/273/321/369/417
with heights 44×7+36); the 4px pre-CTA gap renders on BOTH sites (the
documented session-9 engine variance — v3 margin-top on the live vs v4
margin-block-end on the clone, geometry-verified); toggle + route-change
close collapsed/invisible; scroll lock + ARIA = the documented clone-only
hardening. **No Tailwind v4 display, breakpoint or space-y bug.**

## The two fresh-eyes probe families (the session's audit-surface additions)

1. **The HTTP verb/method matrix surface** — the METHOD dimension of the
   response contract: every prior response-layer probe (sessions 23–25:
   headers, status codes, canonicalization, crawler files) issued GET
   requests; the verb dimension was never probed. The full matrix (POST /
   PUT / DELETE / OPTIONS / HEAD × pages, unknown paths, static public
   files, crawler files, API endpoints, both sites): **the live's platform
   layer 405s EVERY non-GET/HEAD verb on every non-API path** (its uvicorn
   layer checks the method before path resolution — POST `/`, `/Courses`,
   `/login`, unknown paths, `robots.txt`, `sitemap.xml`, `manifest.json`,
   `logo.png` all 405; GET/HEAD serve normally). The clone held THREE
   invisible divergences: (a) App Router pages rendered full HTML with
   **200 for POST/PUT/DELETE** (`/`, `/Courses`, `/login`, `/Pricing` — a
   page-route POST was never legitimate but the router never rejected it);
   (b) **OPTIONS answered 400** on pages; (c) the static file handler
   **crashed with 500** on POST `/logo.png` + `/manifest.json` (its own
   error class — worse than a deliberate 405). The API route handlers were
   already correct (405 wrong-verb from the handlers, 204 auto-OPTIONS
   preflight on `/api/*` — the framework's standard, the first-party
   contract), and the crawler route handlers (`robots.txt`, `sitemap.xml`)
   405 correctly on their own.
2. **The form-control metadata surface** — the autocomplete / inputMode /
   autocapitalize / spellcheck / enterkeyhint family: the password-manager
   + virtual-keyboard contract, the never-swept extension of the session-18
   attribute surface (which covered placeholders/ids/alts only). Sweep
   across every form control on all 9 audited routes, both sites: the live
   ships **NO metadata attributes anywhere** (its login inputs carry only
   type/id; every other control is bare); the clone's login card ships a
   PARTIAL password-manager hardening — signin `email` +
   `current-password` ✓, verify `one-time-code`/`off` + `inputMode`
   `numeric` ✓, but **signup carries NOTHING** (the one view where password
   managers GENERATE new passwords — without `new-password` they
   mis-suggest current credentials and skip strong-password generation).
   Every other form (newsletter, Courses search + selects, AI composer,
   Contact) is reference-faithful bare on both sites. The shipped
   signin/verify hardening was UNPINNED — a future audit could have "fixed"
   it toward the live's bare inputs.

**Dead-end probes documented** (the session's methodology record): the
**session-cookie attribute surface** — the live persists NO session cookie
at all (its Base44 platform auth lives in localStorage — the documented
session-22 architecture variance; there is no Set-Cookie axis to compare;
the clone's `nexus_session` HttpOnly/SameSite=Lax/Path=//7d contract is its
own first-party design, already covered by the session-22 storage pins);
and the **auto-requested well-known files** (`/favicon.ico`,
`/apple-touch-icon.png`, `/site.webmanifest`) — the live 302s the first two
to its platform and serves the SPA HTML fallback for the webmanifest; the
clone 404s all three; neither site's browsers auto-request them (both ship
the `<link rel="icon">` tag — session 5 — which suppresses the default
favicon fetch); platform-fallback artifacts, the documented session-25
family.

## Remediation (TDD)

1. **The proxy method guard (RED → GREEN)** — the verb-matrix gaps: the
   e2e spec block written first (`session-26 parity: the HTTP verb matrix
   surface` — 2 tests: the page-route 405 + Allow contract over
   POST/PUT/DELETE/OPTIONS on `/`, `/Courses`, `/login` with GET/HEAD
   intact; the static-asset + unknown-path + API verb contracts), verified
   RED on the baseline build (POST 200, OPTIONS 400, statics 500, POST
   unknown 404), then the guard added at the TOP of `src/proxy.ts`
   (BEFORE the canonical rewrites — method beats path resolution, the
   live's semantics): any non-GET/HEAD request outside `/api/` returns
   `405` + `Allow: GET, HEAD` + the first-party `{error}` JSON body; the
   matcher extended with `favicon.ico` / `logo.png` / `manifest.json`
   (previously excluded — the static 500 class needs the guard; GETs pass
   through with the CSP header attached, inert on non-document responses);
   `robots.txt` / `sitemap.xml` stay excluded (their route handlers already
   405 correctly); `_next/*` stays excluded (no parity axis, dev-server
   internals). Safety pre-verified: zero non-API fetches in `src/`, zero
   page-route POSTs in the e2e suite — every mutating flow goes through
   `/api/*`. GREEN on the standalone build: the full matrix re-probed
   (pages/statics/unknown 405 + Allow, GET/HEAD 200, unknown GET keeps the
   session-24 404 pin, crawler files + API unchanged), the 405 carries the
   full session-23 security header set, and the dev server hot-reloaded the
   guard with hydration intact (nonced scripts verified).
2. **The form-control metadata hardening (RED → GREEN + pins)** — the e2e
   spec block written first (`session-26 parity: the form-control metadata
   surface` — 2 tests: the login card's full password-manager contract incl.
   the signup values; the GUARD proving every other form stays
   reference-faithful bare), verified RED on the baseline (signup carried
   no autocomplete), then the signup view's inputs completed in
   `src/components/LoginForm.tsx`: `autoComplete="email"` (email) +
   `autoComplete="new-password"` (password + confirmPassword). GREEN; the
   whole contract now pinned (signin/verify/signup + the GUARDs).

## Verification

All standing surfaces re-run post-remediation (both changes are
response-level/metadata-only — zero DOM rendering impact, verified not
assumed): heights 22/22 byte-exact, innerText 11/11 identical, tag drift 0,
class diffs byte-identical to the session-25 baseline, the FULL mobile
battery (geometry IDENTICAL, 405/405 panels), the console clean, the AI
chat end-to-end (a bubble-state-verified completed answer — the session-25
wait lesson applied: the wait keys on bubble state, not literal LLM
phrases). The full e2e: **261/261 GREEN** (257 → 261: +4 session-26 specs,
zero regressions).

## Screenshots

69 files in `docs/screenshots/`: the standard set re-captured on the
remediated dev server + the two session-26 additions
(`signup-hardened--desktop.png` — the signup view with the completed
password-manager contract, DOM-verified at capture time; 
`verb-matrix-s26.txt` — the full verb matrix on BOTH servers (dev + the
standalone production build) as the response-level proof). The AI answer
capture bubble-state-verified.

## `.env.example`

Re-verified: byte-identical to `.env`, covering every user-facing
`process.env` reference (`DATABASE_URL`, `AUTH_SECRET`,
`NEXT_PUBLIC_SITE_URL` — cross-checked against every `process.env.*` usage
in `src/` + `prisma/`). No environment surface changed this session.

## Gates (final)

lint ✓ · typecheck ✓ · 41/41 unit ✓ · build ✓ · 261/261 e2e ✓ (257 → 261:
+4 session-26 specs, zero regressions). The CSS-leak spec re-ran LAST
after every doc write (the session-15 process rule).

## Ship

- Committed to `main` + pushed via the SSH wrapper
  (`docs/ssh_git_wrapper_v3.py`) — remote verified, operator key shredded
  after use.
- Docs aligned: README (badge 302, the session-26 paragraph, the 261
  count), AGENTS.md (gotcha 55 — the verb-matrix + form-metadata surfaces;
  the commands table 261; the proxy line), CLAUDE.md (the 41+261 pyramid +
  the session-26 spec family), PAD ([S26] revision + §7.1 row),
  `nexuslearn-template_SKILL.md` v3.14.0 (the two new probes + surface 18m
  + the project_state), `docs/remediation-plan-session26.md` (with the
  results), this session log, the repo worklog.
