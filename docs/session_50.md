# Session 27 — The compression + cache-revalidation/Range pass: two fresh-eyes probe families

Continuing from session 26 (`ea622b3` + the pulled session-log doc at
`4a7e664` — `docs/session_49.md` holds the prior session's transcript).
Sessions 1–26 closed every static, content, state, computed-style, cascade,
font, preflight, reveal-entry, navigation-transition, deep-link,
pending-state/attribute/tag/token, environment-pollution, element-tag,
console-hygiene, a11y-exposure, interaction-modality, persistence,
security-headers, axe-WCAG, CSP-nonce, performance/canonicalization,
CSSOM-inventory, crawler-file, verb-matrix and form-metadata surface — every
height byte-exact, the mobile battery green, 302 tests. This session's
mandate: the standard parity re-audit with the mobile-navigation focus (the
Tailwind v4 watch), then two never-probed fresh-eyes families (the
compression/content-encoding surface + the cache-revalidation/Range surface —
both the session-26 transcript's suggested next directions), then the full
ship ritual (screenshots, `.env.example`, docs, gates, SSH-wrapper push).

## Baseline (the shipped session-26 tree)

All gates green on commit `4a7e664`: lint ✓ typecheck ✓ 41/41 unit ✓ build ✓
**261/261 e2e ✓** (4.9m, re-verified on the isolated `db/e2e.db`
infrastructure). The environment contract re-verified
(`DATABASE_URL="file:../db/custom.db"` in `.env`, `db/custom.db` +
`db/e2e.db` both at the repo root — the shell's stale absolute export
correctly ignored by the session-19 guard; `.env.example` byte-identical).
skills/ exclusion re-verified (tsconfig, eslint, vitest, playwright, the
`@source not` set). The session-26 proxy method guard + the session-24 CSP
contract + the session-23 security headers verified live on the dev +
standalone servers.

## The standing parity re-audit (live vs clone, both signed in)

Every standing surface GREEN at the documented session-26 state: heights
×11 routes ×2 viewports byte-exact (22/22, incl. CourseDetail with per-site
ids — live `699081e752032065b878129d` vs clone `seed-1`); normalized
innerText 11/11 identical; tag drift 0 on shared classes; the class-set
diffs — **byte-identical to the session-26 baseline report** (a scripted
set-comparison against `parity-report-s26.json`: the same 121 desktop diff
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

1. **The compression/content-encoding surface** — the ENCODING dimension of
   the response contract, invisible to every in-browser probe (browser
   fetch CANNOT set `Accept-Encoding` — a forbidden header; the probe runs
   on raw Node HTTP). The live's platform (Cloudflare edge) compresses
   EVERY compressible response with gzip AND brotli (its SPA-fallback HTML
   7019→2455 B br, its platform manifest, its 744 KB JS bundle → gzip
   234 KB; br preferred over zstd when both offered). The clone's
   standalone server ships a correct **gzip tier** — dynamic pages
   (242640→28314 B), API JSON, and `/_next/static` chunks (CSS 76103→12731
   B, JS 34718→8748 B), each correctly paired with `Vary: Accept-Encoding`
   when compressed (the cache-poisoning guard — verified present on every
   compressed response, including the API routes) — but holds two
   **proxy-layer gaps**: no brotli anywhere (Node's compress middleware is
   gzip/deflate-only — the capability the live gets from its edge CANNOT
   move into a standalone Node server, unlike the session-23 security
   headers which the app carries itself) and public/ statics serving
   identity even when gzip is offered (`/manifest.json` 610 B raw;
   `/logo.png` 1.1 MB raw — a PNG payload deflate cannot shrink anyway).
   One quirk documented: gzip grows tiny responses (`/api/health` 34→54 B —
   no minimum-size threshold; harmless). The `compress: true` default
   powering the tier was only IMPLICIT in `next.config.ts`.
2. **The cache-revalidation + Range surface** — the VALIDATOR dimension:
   the `ETag`/`Last-Modified`/`If-None-Match`/`If-Modified-Since` → 304
   handshake and `Range` → 206 partial responses (sessions 23–26 always
   issued fresh unconditional requests). The clone's static tiers ship the
   **full production-grade validator contract** — public/ statics AND
   `/_next/static` chunks carry a weak `ETag` (`W/"1123ac-1a0f57fbd4d"`) +
   `Last-Modified`, answer **304** to BOTH revalidators, and serve proper
   **206** partial responses (`bytes 0-99/1123244` with the exact 100-byte
   body + `Accept-Ranges: bytes`). The dynamic pages correctly carry **NO
   validators** (`private, no-cache, no-store, max-age=0, must-revalidate`
   — the unavoidable companion of the session-24 per-request CSP nonce: a
   nonced page can never be cache-shared). NONE of it was pinned.

**The probe that looked like a finding and wasn't** (the methodology
record): the live's `/logo.png` PATH serves the SPA HTML fallback (7.5 KB
HTML, gzip+br) — there is NO static logo.png on the live. Its TRUE favicon
is the supabase asset `…/e461cd10b_logo.png` — **byte-identical to the
clone's `public/logo.png`** (both 1,123,244 B, 1024×1024 PNG, `cmp`-verified:
the clone correctly re-hosts it), and its `/manifest.json` 302s to the
platform path `/api/apps/manifests/<id>/manifest.json` (browsers follow to
the 9-field JSON; the session-25 documented variance family). The live's
platform artifacts recorded: its fallback statics ship LM-only validators +
a **206-with-empty-body quirk** + no accept-ranges, and its JS bundle
caches 7 days non-immutable (vs the clone's session-24 immutable pin).

## Remediation (TDD)

Both families verified CLEAN at the app layer — the session-22 precedent
(zero source defects; the surfaces are correct but were unpinned). The
remediation is pins + a config-level guard + deployment documentation.
Every spec below is green-by-design against the baseline, pinning contracts
that were previously only implicit (the RED-phase exemption recorded in the
plan: there is no failing-first spec to write when the finding is "correct
but unpinned" — the same session-22 pattern).

1. **The compression pins (5 specs in 2 blocks, GREEN on the baseline)** —
   the e2e spec blocks `session-27 parity: the compression/content-encoding
   surface` (the dynamic gzip tier incl. the Vary guard on `/` +
   `/api/health`; the static tiers — public/ identity + the chunk gzip) and
   `session-27 parity: the cache-revalidation + range surface` (the
   public/-static validator contract: ETag + LM + 304 both + 206 with the
   exact body + Accept-Ranges + the manifest spot-check; the dynamic-page
   no-validator/no-store companion on `/` + `/Courses`; the chunk validator
   contract completing the session-24 immutable-cache pin). Verified on the
   baseline build, re-verified after the config change.
2. **The config guard** — `compress: true` added EXPLICITLY to
   `next.config.ts` with the tier documentation comment (default-true
   restated so a future perf-tuning snippet cannot silently ship every
   response uncompressed; behavior-preserving — the compression spec block
   + the full build re-ran post-change, identical results).
3. **The deployment documentation** — `docs/DEPLOYMENT.md` §8 "Compression
   & caching posture": the four app-owned tiers, the two proxy-layer gaps
   with the Caddy/Nginx/Cloudflare reverse-proxy recommendation (the
   session-23 reasoning chain applied to the one layer that genuinely
   cannot move into the app), and the tiny-response gzip quirk. The stale
   "25-spec Playwright suite" count in §6 corrected to 266.

## Verification

All standing surfaces re-run post-remediation (the changes are
response-level/config/docs only — zero DOM rendering impact, verified not
assumed): heights spot-sweep byte-exact (4/4: `/`, `/Courses`, `/Dashboard`,
`/login`), the FULL mobile battery re-run GREEN (panel **405/405**, link
geometry byte-identical, trigger byte-identical), the console clean (0
errors, 5-route sweep). The full e2e: **266/266 GREEN** (261 → 266: +5
session-27 specs, zero regressions).

## Screenshots

70 files in `docs/screenshots/`: the standard set re-captured on the
remediated dev server + the session-27 addition
(`encoding-validators-s27.txt` — the compression matrix + the
validator/Range handshake on BOTH servers (dev + the standalone production
build) as the response-level proof, the `verb-matrix-s26.txt` pattern). The
signup capture DOM-verified at capture time; the AI answer capture
bubble-state-verified.

## `.env.example`

Re-verified: byte-identical to `.env`, covering every user-facing
`process.env` reference (`DATABASE_URL`, `AUTH_SECRET`,
`NEXT_PUBLIC_SITE_URL` — cross-checked against every `process.env.*` usage
in `src/` + `prisma/`; `NODE_ENV` is framework-managed). No environment
surface changed this session.

## Gates (final)

lint ✓ · typecheck ✓ · 41/41 unit ✓ · build ✓ · 266/266 e2e ✓ (261 → 266:
+5 session-27 specs, zero regressions). The CSS-leak spec re-ran LAST
after every doc write (the session-15 process rule).

## Ship

- Committed to `main` + pushed via the SSH wrapper
  (`docs/ssh_git_wrapper_v3.py`) — remote verified, operator key shredded
  after use.
- Docs aligned: README (badge 307, the session-27 paragraph, the 266
  count), AGENTS.md (gotcha 56 — the compression + validator/Range
  surfaces; the commands table 266), CLAUDE.md (the 41+266 pyramid + the
  session-27 spec family), PAD ([S27] revision + §7.1 row),
  `nexuslearn-template_SKILL.md` v3.15.0 (the two new probes + surface 18n
  + the project_state), `docs/remediation-plan-session27.md` (with the
  results), this session log, the repo worklog.
