# NexusLearn Remediation Plan — Session 27

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the e2e production standalone server on :3100; raw Node HTTP
probes for the response-contract dimensions where browser fetch cannot set
forbidden headers).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-26 tree, commit `ea622b3`
plus the pulled `docs/session_49.md` transcript at `4a7e664`): lint ✓ ·
typecheck ✓ · 41/41 unit ✓ · build ✓ · **261/261 e2e ✓** (re-verified this
session). The environment contract re-verified (`DATABASE_URL="file:../db/custom.db"`
in `.env`, `db/custom.db` + `db/e2e.db` both at the repo root; `.env.example`
byte-identical); the session-24 CSP nonce + force-dynamic + the session-23
security headers + the session-26 proxy method guard all verified live on the
dev + standalone servers.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The compression/content-encoding negotiation surface (first inventory — fresh-eyes family 1)**: the ENCODING dimension of the response contract — every prior response probe (sessions 23–26: headers, status codes, canonicalization, crawler files, verbs) read status/header/body but never the `Accept-Encoding` handshake. Probed via raw Node HTTP (browser fetch cannot set `Accept-Encoding` — a forbidden header) across pages, public statics, `/_next/static` chunks and API routes on both sites: **the live's platform compresses EVERY compressible response with gzip AND brotli** (its SPA-fallback HTML 7019→2455 B br, its platform manifest, its 744 KB JS bundle → gzip 234 KB; `br` preferred over `zstd` when both offered). The clone's standalone server ships a correct **gzip tier** — dynamic pages (`/` 242640→28314 B), API JSON (`/api/health`), and `/_next/static` chunks (CSS 76103→12731 B, JS 34718→8748 B), each correctly paired with `Vary: Accept-Encoding` when compressed — but holds **two platform-layer gaps**: (a) **no brotli anywhere** (Node's built-in `compress` middleware is gzip/deflate-only — the capability the live gets from its Cloudflare edge cannot move into a standalone Node server, unlike the session-23 security headers which the app CAN carry itself); (b) **public/ statics serve identity even when gzip is offered** (`/manifest.json` 610 B raw; `/logo.png` 1.1 MB raw — a PNG payload that deflate cannot shrink anyway). Both gaps are proxy-layer capabilities, not app defects. One quirk documented: gzip on tiny responses GROWS them (`/api/health` 34→54 B — Node's middleware has no minimum-size threshold; harmless, and disabling compression app-wide to avoid it would be worse). The `compress: true` default that powers the whole tier is currently only IMPLICIT in `next.config.ts` (absent = default-true) — one copied perf-tuning snippet away from silently shipping every response uncompressed. | LOW (pins + config guard + deployment documentation) | **PIN the app's tiers + make `compress` explicit + DOCUMENT the proxy-layer gap** |
| 2 | **The conditional-request/cache-revalidation + Range surface (first inventory — fresh-eyes family 2)**: the VALIDATOR dimension of the response contract — the `ETag`/`Last-Modified`/`If-None-Match`/`If-Modified-Since` → 304 handshake and `Range` → 206 partial responses, never probed (sessions 23–26 always issued fresh unconditional requests). Probed on both sites: the clone's static tiers ship the **full production-grade validator contract** — public/ statics AND `/_next/static` chunks carry a weak `ETag` (`W/"1123ac-1a0f57fbd4d"`) + `Last-Modified`, answer **304** to BOTH revalidators, and serve proper **206** partial responses (`bytes 0-99/1123244` with the 100-byte body + `Accept-Ranges: bytes`). The dynamic pages correctly carry **NO validators** (`private, no-cache, no-store, max-age=0, must-revalidate` — the unavoidable companion of the session-24 per-request CSP nonce: a nonced page can never be cache-shared). NONE of this is pinned — a future headers() override or config change could silently strip the validator set (the same regression class the session-24 immutable-cache pin guards). The live's platform artifacts documented for the record: its `/logo.png` PATH serves the SPA HTML fallback (no such static file exists — its true favicon is the byte-identical 1,123,244-byte supabase asset the clone re-hosts at `/logo.png`), its `/manifest.json` 302s to the platform path `/api/apps/manifests/<id>/manifest.json` (browsers follow to the 9-field JSON — the session-25 documented variance), its fallback statics ship LM-only validators + a **206-with-empty-body quirk**, its JS bundle caches 7 days non-immutable (vs the clone's session-24 immutable pin), and its bundle carries LM + 304-on-IMS but no ETag and no Range support (Range → 200 full body). | LOW (pins; the app's contracts are correct) | **PIN the validator + no-validator contracts** |
| 3 | **Every standing surface re-verified at the documented session-26 state**: heights ×11 routes ×2 viewports BYTE-EXACT (22/22, incl. CourseDetail with per-site ids — live `699081e752032065b878129d` vs clone `seed-1`); normalized innerText 11/11 identical; tag drift 0 on shared classes; class-set diffs — **byte-identical to the session-26 baseline report** (a scripted set-comparison against `parity-report-s26.json`: the same 121 desktop diff lines, every one in the documented variance families); the console surface clean on the clone dev server (0 errors, 10 routes). | — | Verified |
| 4 | **The FULL mobile-menu battery — the Tailwind v4 watch — GREEN**: trigger classes byte-identical (`md:hidden p-2 rounded-lg text-white/80` over the hero); the open panel **405px on BOTH sites**; the 8 link texts identical; the per-link GEOMETRY dump byte-identical (y-positions 81/129/177/225/273/321/369/417 with heights 44×7+36); the 4px pre-CTA gap renders on BOTH sites (the documented session-9 engine variance — v3 margin-top on the live vs v4 margin-block-end on the clone, geometry-verified); toggle + route-change close collapsed/invisible; scroll lock + ARIA = the documented clone-only hardening. **No Tailwind v4 display, breakpoint or space-y bug.** | — | Verified |
| 5 | **The favicon/manifest asset chain verified end-to-end (the probe that looked like a finding and wasn't)**: the live's `<link rel="icon">` points at a supabase storage URL (`…/e461cd10b_logo.png`) whose bytes are **byte-identical to the clone's `public/logo.png`** (both 1,123,244 B, 1024×1024 PNG — `cmp` verified); the manifest bodies carry the same 9 fields with the clone's documented portable-form URL values (`start_url`/`scope` `/` vs the live's absolute origin; icons `/logo.png` vs the supabase URLs — the session-25 pinned variances). No asset drift. | — | Verified (documented variances) |

### Audit-surface note (the session-27 additions — TWO new probe families)

- **the compression/content-encoding negotiation surface** (finding 1) — the
  ENCODING dimension of the response contract: which representations the
  server offers per `Accept-Encoding` (identity/gzip/br/zstd) and whether
  compressed responses carry the `Vary: Accept-Encoding` cache guard. This is
  the layer that would catch a silently-disabled `compress`, a missing Vary
  (a CDN cache-poisoning vector), and the platform-vs-app capability split;
- **the conditional-request/cache-revalidation + Range surface** (finding 2) —
  the VALIDATOR dimension: which responses carry `ETag`/`Last-Modified`, how
  `If-None-Match`/`If-Modified-Since` revalidation answers (304 vs full
  re-send), and whether `Range` requests produce correct 206 partial bodies.
  This is the layer that would catch a validator-stripping headers() override
  and an over-caching regression on the nonced pages.

Both families were the standing session-26 "suggested next directions"
(`docs/session_49.md`: "Range/partial-content request behavior on the static
assets, or the compression/content-encoding posture on the standalone server").

---

## B. Remediation (TDD)

Both families verified CLEAN at the app layer (the session-22 precedent:
zero source defects; the surfaces are correct but unpinned). The remediation
is therefore **pins + a config-level guard + deployment documentation** —
every spec below is green-by-design against the baseline, pinning contracts
that were previously only implicit. (RED-phase exemption recorded: there is
no failing-first spec to write when the finding is "correct but unpinned" —
the same session-22 pattern; the specs exist to make FUTURE regressions fail.)

### Phase 1 — the compression pins + the config guard (family 1)

- [1a] **PIN**: new e2e spec block `session-27 parity: the compression/
  content-encoding surface` — test (a): the dynamic gzip tier — `/` and
  `/api/health` requested with `Accept-Encoding: gzip` return
  `Content-Encoding: gzip` AND a `Vary` including `Accept-Encoding` (the
  cache-poisoning guard); the same routes with `Accept-Encoding: identity`
  return no content-encoding.
- [1b] **PIN** (same block, test b): the static tiers — the public/ statics
  (`/logo.png`, `/manifest.json`) serve identity even when gzip is offered
  (pinning the CURRENT app contract — Node's static handler does not
  compress; the platform-layer brotli/static-compression gap is documented in
  DEPLOYMENT.md, not "fixed" by a route-handler rewrite that would strip the
  validator contract), and a real `/_next/static` chunk (discovered from the
  rendered HTML, the session-24 idiom) negotiates gzip.
- [1c] **GUARD (config-level)**: `next.config.ts` gains an explicit
  `compress: true` with a comment (the tier is default-true today; making it
  explicit anchors it where a future perf-tuning pass would look, and points
  at the DEPLOYMENT.md proxy guidance for brotli). Behavior-preserving —
  verified by re-running [1a]/[1b] after the change.
- [1d] **DOCUMENT**: `docs/DEPLOYMENT.md` gains a "Compression & caching
  posture" section (new §8): the app's own tiers (gzip on dynamic + API +
  chunks, correctly Vary'd; identity on public/ statics; the full
  validator/304/206 contract; the immutable chunk cache), the two
  platform-layer gaps (brotli; public/-static compression) with the
  reverse-proxy recommendation (Caddy/Nginx/Cloudflare fronting the
  standalone server — the same reasoning chain as the session-23 security
  headers, except this layer CANNOT move into the app), and the tiny-response
  gzip-overhead quirk.

### Phase 2 — the validator/Range pins (family 2)

- [2a] **PIN**: new e2e spec block `session-27 parity: the cache-revalidation
  + range surface` — test (a): the public/-static validator contract —
  `/logo.png` carries an ETag and Last-Modified; `If-None-Match` with that
  ETag answers **304**; `If-Modified-Since` with that Last-Modified answers
  **304**; `Range: bytes=0-99` answers **206** with `Content-Range:
  bytes 0-99/…`, the 100-byte body, and `Accept-Ranges: bytes`;
  `/manifest.json` spot-checked for ETag + 304.
- [2b] **PIN** (same block, test b): the dynamic-page no-validator contract —
  `/` and `/Courses` carry NO ETag and a `cache-control` including `no-store`
  (the uncacheable companion of the per-request CSP nonce — pinning it so a
  future "performance fix" cannot cache nonced HTML).
- [2c] **PIN** (same block, test c): the `/_next/static` chunk validator
  contract — a discovered chunk carries an ETag, answers 304 to
  `If-None-Match`, and serves 206 to a Range request (completing the
  session-24 immutable-cache pin with the revalidation + partial-response
  axes).

### Phase 3 — ship

- [3a] `.env.example` re-verified (no environment surface changed; byte-
  identical to `.env`, covering every user-facing `process.env` reference).
- [3b] Screenshots: the standard set re-captured on the remediated dev
  server + the session-27 addition (`encoding-validators-s27.txt` — the
  compression matrix + validator/Range handshake on BOTH servers (dev +
  standalone) as the response-level proof, the `verb-matrix-s26.txt`
  pattern).
- [3c] Docs alignment: README (the session-27 paragraph + the new test
  counts), AGENTS.md (gotcha 56 — the encoding + validator surfaces; the
  commands table count), CLAUDE.md (the test pyramid + the session-27 spec
  family), PAD ([S27] revision + §7.1 row), `nexuslearn-template_SKILL.md`
  v3.15.0 (the two new probes + surface 18n + the project_state),
  `docs/remediation-plan-session27.md` (this plan, with the results),
  `docs/session_50.md`, the repo worklog.
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
| The compression pins are environment-sensitive (dev vs standalone) | The specs assert on the e2e standalone server (:3100, the production build) — the same server every other response-level spec (sessions 23–26 pins) uses; the dev server's tier verified manually (dev gzips pages but not `/api/health` — a dev-only artifact documented in the spec comments; the standalone is the pin target). |
| A reverse proxy in front of the app (the documented production posture) makes the brotli/identity pins FAIL (the proxy adds br / compresses statics) | The pins assert the APP's contract on the app's own server; a proxy-fronted deployment is the documented platform layer — the spec comments state this explicitly (the pins guard the standalone posture, and DEPLOYMENT.md §8 explains what a proxy layer adds). Acceptable by design. |
| Playwright's `request` fixture auto-decompresses responses, hiding `content-encoding` | Verified empirically before writing the specs (probe-mechanics-s27.mjs): `response.headers()["content-encoding"]` exposes the ORIGINAL server header on both gzip and identity requests — the assertion reads the transport header, not the decoded body. |
| The 304/206 assertions depend on server-generated validators (ETag values change per build) | The specs read the ETag from a first request and replay it (never hard-coding values); the Last-Modified replay uses the header from the same first response. Build-stable by construction. |
| Making `compress: true` explicit changes behavior | It restates the default (verified: the standalone gzips with the config absent); the full compression spec block re-runs after the change + the full e2e regression guard. |
| Spec-count drift in docs | README/CLAUDE/AGENTS/PAD/SKILL updated to the new counts in Phase 3c; the worklog records the arithmetic (261 → 266: +5 session-27 specs). |
| The DEPLOYMENT.md §8 section drifts from the app's actual tiers | The section is generated from THIS session's probe data (the same numbers the specs pin); the session log records the provenance. |

---

## D. Phase results (recorded after execution)

- **[1a]**: GREEN-by-design — the dynamic gzip tier spec (2 routes × 2
  encodings + the Vary guard) passes on the baseline build: `/` and
  `/api/health` gzip when negotiated (242640→28314 B / 34→54 B) with
  `Vary: …, Accept-Encoding`, identity when asked.
- **[1b]**: GREEN-by-design — the static-tier spec passes on the baseline:
  `/logo.png` + `/manifest.json` serve identity even when gzip is offered
  (the Node static-handler tier), and a discovered `/_next/static` chunk
  negotiates gzip (76103→12731 B on the CSS chunk).
- **[1c]**: GREEN — `compress: true` added explicitly to `next.config.ts`
  with the tier documentation comment; behavior-preserving (the full build +
  the compression spec block re-ran post-change — identical results).
- **[1d]**: DONE — `docs/DEPLOYMENT.md` §8 "Compression & caching posture"
  added (the four app-owned tiers + the two proxy-layer gaps with the
  Caddy/Nginx/Cloudflare recommendation + the tiny-response gzip quirk);
  the stale "25-spec Playwright suite" count in §6 corrected to 266.
- **[2a]**: GREEN-by-design — the public/-static validator spec passes on
  the baseline: `/logo.png` carries `W/"1123ac-…"` + Last-Modified, 304 on
  both revalidators, 206 with `bytes 0-99/1123244` + the exact 100-byte
  body + `Accept-Ranges: bytes`; `/manifest.json` ETag + 304 spot-checked.
- **[2b]**: GREEN-by-design — the dynamic no-validator spec passes on the
  baseline: `/` and `/Courses` carry no ETag/Last-Modified and
  `no-store` cache-control.
- **[2c]**: GREEN-by-design — the chunk validator spec passes on the
  baseline: the discovered chunk carries an ETag, 304s on If-None-Match,
  and 206s the Range request with the correct Content-Range.
- **[3a]**: re-verified — `.env.example` byte-identical to `.env`; the
  `process.env.*` cross-check over `src/` + `prisma/` is an exact match
  (`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `AUTH_SECRET` + the
  framework-managed `NODE_ENV`); no environment surface changed.
- **[3b]**: 70 files in `docs/screenshots/` — the standard set re-captured
  on the remediated dev server + `encoding-validators-s27.txt` (the
  compression matrix + validator/Range handshake on BOTH servers — dev
  :3000 + the standalone :3100; the signup capture DOM-verified at capture
  time; the AI answer bubble-state-verified).
- **[3c]**: docs aligned — README (badge 307, the 266 count, the
  session-27 paragraph), AGENTS.md (gotcha 56 + the commands table 266),
  CLAUDE.md (the 266 pyramid + the session-27 spec family in the E2E
  bullet), PAD ([S27] revision + §7.1 row), `nexuslearn-template_SKILL.md`
  v3.15.0 (the description tail + surface 18n + the project_state),
  this plan (Phase D), `docs/session_50.md`, the repo worklog.
- **[3d–3e]**: recorded in the session log (`docs/session_50.md`) — full
  gate green (266/266 e2e), the CSS-leak spec re-run LAST clean, committed
  to `main` + pushed via the SSH wrapper.
