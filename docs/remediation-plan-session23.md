# NexusLearn Remediation Plan — Session 23

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the e2e production standalone server on :3100).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-22 tree, commit `6516a99`
= `6253106` + the pulled session-log doc): lint ✓ · typecheck ✓ · 41/41 unit ✓
· build ✓ · **244/244 e2e ✓** (re-verified this session on the isolated
`db/e2e.db` infrastructure). The environment contract re-verified (the harness
injects an absolute `DATABASE_URL` in the workspace `.env` — the repo guard
holds: `db/custom.db` + `db/e2e.db` both at the repo root). `.env.example`
byte-identical to `.env`. `DATABASE_URL="file:../db/custom.db"` correct in
`.env`; the `db/` folder at the repo root (recreated via `db:push` + `db:seed`).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The security-headers surface (first inventory — the session's main find)**: the live's platform layer (Cloudflare + Caddy, verified via `curl -I`) ships `strict-transport-security: max-age=31536000`, `referrer-policy: strict-origin-when-cross-origin` and `x-content-type-options: nosniff` on every response; the clone (bare Next.js dev/standalone) ships NONE of them — no HSTS, no referrer policy, no MIME-sniffing guard, no frame-ancestors guard. Session 19 documented the header delta as "CDN/proxy infrastructure" — correct as a parity observation, but a production-grade template should ship the baseline set IN the app (they apply wherever the standalone server runs without a hardening proxy; the live's own platform considers them standard). | Medium (hardening gap, not a parity defect) | **FIX — deliberate-better + PIN** |
| 2 | **The axe-core WCAG surface (first inventory — the sixth a11y probe family, the session-22 suggested direction)**: scanned all 10 routes + CourseDetail on both sites. (a) **color-contrast**: IDENTICAL node counts on every route — the reference's own design (371 gray lesson-row icons + the line-through `$149.99` + one gray caption on CourseDetail; 1 node on the marketing routes; 0 on /login) — parity, the reference design is the contract. (b) **link-name (4 nodes: the footer social links) + button-name (1 node: the icon-only AI send button) fire on the LIVE, ZERO on the clone** — the clone's aria-label hardening (the documented session-21/22 family) now QUANTIFIED by axe as exactly the WCAG violations the clone fixes. (c) **heading-order**: identical on the shared routes (/Courses, /Contact, /AIAssistant — the reference's own heading structure). | — | **PIN** (the axe parity contract) |
| 3 | **Every standing surface re-verified at the documented session-22 state**: heights ×11 routes ×2 viewports BYTE-EXACT (22/22); normalized innerText 11/11 identical; tag drift 0 on shared classes; class-set diffs — every line in the documented variance families (the live's platform toast portal, the dvh page-root hardening, the gradient arbitrary-form pin, the body font-sans declaration, the mounted-panel family, the selectOrder pair); the FULL mobile battery GREEN — trigger classes byte-identical (`md:hidden p-2 rounded-lg text-white/80`), the open panel 405px wrapper / 404px inner on BOTH, the 8 link texts + y-positions IDENTICAL (81/129/177/225/273/321/369/417 — the 4px pre-CTA gap present on both, carried by the v3 margin-top engine on the live vs the v4 margin-block-end engine on the clone — the documented session-9 engine variance), toggle close + route-change close both verified collapsed/invisible, scroll lock + ARIA = the documented clone-only hardening — **NO Tailwind v4 display/breakpoint/space-y bug**; the console surface clean on the clone dev server (0 errors across 10 routes). | — | Verified |
| 4 | **The live's progressive CourseDetail render resurfaces under axe (methodology)**: the first live scan (1000ms settle) reported 0 color-contrast nodes on CourseDetail vs the clone's 373 — the documented session-21 settle-wait race (the live's curriculum renders progressively after `networkidle`); at 2500ms both sites report the IDENTICAL 373 nodes with identical class histograms. The settle-wait rule now extends to the axe surface. | — | Verified (methodology note) |
| 5 | **The test-suite contracts confirmed in place** (the user-facing task list): `vitest.config.ts` (unit layer, `*.test.ts` in `src/**` + `tests/**` only) and `playwright.config.ts` (e2e layer, `testDir: ./tests/e2e`, the production standalone server on :3100 with the isolated `db/e2e.db`) — 41 unit + 244 e2e green on the shipped tree. This session GROWS the e2e layer (the two new spec families below) rather than adding new config. | — | Verified |

### Audit-surface note (the session-23 additions — TWO new probe families)

- **the HTTP security-headers surface** (finding 1) — no prior probe compared
  the SECURITY header set (session 19 compared response headers as
  infrastructure and correctly identified the source; this session re-frames
  the delta as an actionable hardening gap for a standalone template);
- **the axe-core WCAG surface** (finding 2) — no prior probe ran an automated
  WCAG rules engine (the session-21 a11y-tree snapshot showed STRUCTURE, the
  session-22 Tab-walk showed ORDER + NAMES; axe adds the RULE-LEVEL verdict:
  link-name, button-name, color-contrast, heading-order with node counts,
  diffable live-vs-clone).

---

## B. Remediation (TDD)

### Phase 1 — the security-headers hardening (RED → GREEN)

- [1a] **RED**: new e2e spec block `session-23 parity: the security-headers
  hardening` — `context.request` the landing route on the e2e server and
  assert the four baseline headers: `x-content-type-options: nosniff`,
  `referrer-policy: strict-origin-when-cross-origin` (the live's platform
  value), `x-frame-options: SAMEORIGIN`, `strict-transport-security:
  max-age=31536000` (the live's platform value; inert over plain HTTP, active
  behind TLS). Run → **fails** (no headers shipped).
- [1b] **GREEN**: implement `headers()` in `next.config.ts` — `source:
  "/(.*)??"` with the four headers + `permissions-policy:
  camera=(), microphone=(), geolocation=()` (the app uses none of these
  capabilities). Conservative by design: NO CSP this session (a restrictive
  CSP with Next.js inline chunks needs the nonce middleware pattern —
  documented in the risk register as future work). Run → **passes**.
- [1c] Re-verify the dev server + the standalone build both ship the headers
  (`curl -I`), and that no standing surface moved (the headers are
  response-level — zero DOM impact; the height/text/mobile sweeps re-run as
  the regression guard).

### Phase 2 — the axe-core WCAG parity pins (green-by-design guards)

- [2a] New e2e spec block `session-23 parity: the axe-core WCAG surface`:
  - **the accessible-name guard**: on the audited route set (/, /Courses,
    /Pricing, /About, /Contact, /BecomeInstructor, /AIAssistant, /Dashboard,
    /login) the axe scan reports ZERO `link-name` and ZERO `button-name`
    violations — pinning the aria-label hardening family the live lacks (its
    footer social links + AI send button fire these rules);
  - **the reference-design rule-set contract**: on every audited route the
    violation rule IDs are a SUBSET of `{color-contrast, heading-order}` —
    the reference's own design rules (the gray lesson icons, the line-through
    price, the reference heading structure); any NEW rule (aria-*, landmark,
    name-role-value, region…) fails the spec;
  - **the /login zero-violation pin**: the login route scans fully CLEAN
    (0 violations — it has no reveal targets, no gray-on-gray utilities).
- [2b] `@axe-core/playwright` becomes a committed devDependency (installed
  via `bun add -d`, never a manual package.json edit). The CSS-leak contract
  re-verified: `node_modules/` is not a Tailwind source root (automatic
  source detection ignores it) and `tests/` is already in the `@source not`
  set — the new spec's quoted class strings cannot re-leak.

### Phase 3 — ship

- [3a] `.env.example` re-verified (no environment surface changed; byte-
  identical to `.env`, covering every user-facing `process.env` reference).
- [3b] Screenshots: the standard set re-captured on the remediated dev
  server + the session-23 captures (the security headers in `curl -I` form
  are not screenshot-able — the captures document the axe-parity surfaces:
  the footer social row + the AI composer, both aria-labeled).
- [3c] Docs alignment: README (the session-23 paragraph + the new test
  counts), AGENTS.md (gotcha 52 — the security-headers + axe-WCAG surfaces;
  the commands table), CLAUDE.md (the test pyramid + the session-23 spec
  family), PAD ([S23] revision + §7.1 row),
  `nexuslearn-template_SKILL.md` v3.11.0 (the two new probes + the
  project_state), `docs/remediation-plan-session23.md` (this plan, with the
  results), `docs/session_42.md`, the repo worklog.
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
| A security header breaks a runtime path (CSP-style breakage) | The shipped set is the conservative baseline — nosniff/referrer-policy/XFO/HSTS/permissions-policy have no functional surface in this app (no framing, no camera/mic/geo, plain HTTP locally). NO CSP this session (the nonce pattern is documented as future work). |
| HSTS pins a localhost HTTPS preview into https-only | The dev/e2e servers are plain HTTP (HSTS is ignored by browsers over HTTP); the header only activates behind TLS in real deployments — the same value the live's own platform ships. |
| The axe pins are flaky (reveal pre-hide / progressive render) | The pins assert STRUCTURAL rules only (link-name/button-name = aria-labels, DOM-structure stable) + the /login zero-violation pin (no reveal targets on /login — session 15). The color-contrast COUNTS are documented in the plan but deliberately not count-pinned beyond /login (the reveal state makes counts timing-sensitive — the session-23 methodology note). |
| axe adds e2e runtime | ~9 analyze() runs ≈ 15–25s on the 4.3m suite — acceptable; the spec lives in ONE test with a route loop, not one test per route (keeps the reporter linear). |
| `@axe-core/playwright` leaks into the Tailwind CSS source set | `node_modules/` is not scanned by automatic source detection; the spec quotes only class strings already quoted by the existing suite — and `tests/` is in the `@source not` set. The CSS-leak spec re-runs LAST regardless. |
| The headers change breaks an existing e2e spec | The e2e suite asserts DOM behavior, never response headers; the full 244-spec suite re-runs in the final gate as the regression guard. |
| Spec-count drift in docs | README/CLAUDE/AGENTS/PAD/SKILL updated to the new counts in Phase 3c; the worklog records the arithmetic (244 → 248 with the two session-23 spec blocks: 1 security-headers test + 3 axe-WCAG tests). |

---

## D. Phase results (recorded after execution)

- **[1a]**: RED confirmed — the security-headers e2e spec failed on the
  baseline tree with the `x-content-type-options` assertion (no headers
  shipped; the failure was observed before the implementation was written).
- **[1b]**: GREEN — `headers()` implemented in `next.config.ts` (the four
  baseline headers + the permissions-policy deny-list); the spec passes; the
  dev server AND the standalone build verified shipping all five headers via
  `curl -I` / the e2e `request.get`.
- **[1c]**: no standing surface moved — heights ×11 routes ×2 viewports
  byte-exact (22/22), innerText 11/11 identical, tag drift 0, class diffs
  unchanged (all lines in the documented variance families), the FULL mobile
  battery green (405/405 panels, identical link positions, the 4px pre-CTA
  gap on both), the console clean (0 errors across 10 routes) — the headers
  are response-level with zero DOM impact, verified rather than assumed.
- **[2a]**: the axe pins green — 0 link-name + 0 button-name violations on
  the 9-route audited set; the rule-set subset contract holds on every route
  (only color-contrast + heading-order — the reference's own design rules);
  /login scans fully clean (0 violations).
- **[2b]**: `@axe-core/playwright@4.13.0` committed as a devDependency
  (installed via `bun add -d`); the CSS-leak canary re-verified clean after
  the addition (node_modules is not a Tailwind source root; tests/ is in
  the `@source not` set).
- **[3b]**: screenshots captured — the standard set re-captured on the
  remediated dev server (58 files) + the AI answer re-captured with the
  wait-for-answer condition (a first fixed-condition run caught the
  "Thinking..." bubble — the wait now waits for the ANSWER text, not a
  pattern the question itself matches) + the two session-23 additions
  (footer-social-arialabels--desktop, aiassistant-composer-arialabels--
  desktop) — 64 files total, the key captures VLM-verified (the footer with
  its four social buttons, the open mobile menu with all 8 links, the AI
  answer with a completed reply, the composer with its placeholder + gradient
  send).
- **[3c]**: all docs aligned — README (badge 285→289, the session-23
  paragraph, the 248 count), AGENTS.md (gotcha 52 + the commands table),
  CLAUDE.md (the 41+248 pyramid + the session-23 spec family), PAD ([S23]
  revision + §7.1 row), `nexuslearn-template_SKILL.md` v3.11.0 (the two new
  probes in the description + surface 18j + the project_state), this plan,
  `docs/session_42.md`, the repo worklog.
- **[3d]**: gates (final, in order): lint ✓ · typecheck ✓ · 41/41 unit ✓ ·
  build ✓ · 248/248 e2e ✓ (244 → 248: +4 session-23 specs — 1
  security-headers + 3 axe-WCAG, zero regressions); the session-14 CSS-leak
  spec re-ran LAST after every doc write — clean.
- **[3e]**: committed to `main` and pushed via the SSH wrapper — remote
  verified, key shredded after use.
