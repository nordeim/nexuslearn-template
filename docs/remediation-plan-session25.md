# NexusLearn Remediation Plan — Session 25

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the e2e production standalone server on :3100).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-24 tree, commit `fc2b04a`
= `0bf0c04` + the pulled session-log doc): lint ✓ · typecheck ✓ · 41/41 unit ✓
· build ✓ · **255/255 e2e ✓** (re-verified this session). The environment
contract re-verified (`DATABASE_URL="file:../db/custom.db"` in `.env`,
`db/custom.db` + `db/e2e.db` both at the repo root; `.env.example`
byte-identical to `.env`); the session-24 CSP nonce + force-dynamic contract
verified live on the dev server (per-request nonce + the dev-only relaxations).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The CSSOM inventory surface (first inventory — fresh-eyes family 1)**: the complete stylesheet STRUCTURE diff — the FULL custom-property map (every `--var` declaration across every sheet, extending session-18's 6-token per-route probe), the `@media` rule census and the `@keyframes` census — per route, both sites. **Zero rendered drift.** Every delta falls in the documented engine/platform families: (a) **Tailwind v4's `@theme` architecture emits every theme value as a CSS custom property** (`--color-amber-500`, `--animate-pulse`, `--blur-xl`, `--aspect-video`… — 113 clone-only vars; v3 never emitted palette vars — engine architecture, not design drift); (b) the live's v3 sheet carries the `--tw-bg-opacity`/`--tw-border-opacity`/`--tw-border-spacing-*` engine vars v4 dropped (the same v3↔v4 engine family as the rem-based media queries); (c) the live's platform sheet ships the full shadcn component library — `--sidebar-*`, `--chart-*` (31 live-only vars) — UNUSED by the app (no sidebar, no charts render anywhere); (d) **the platform's /login bundle**: the live's /login loads 5 sheets vs the clone's 2 — three platform sheets carrying 786 platform vars (`--agent-avatar-*`, `--accent-1..9`, `--sidebar-*`…), 43 platform keyframes (`sonner-*`, `go*` framer-motion, `sidebar-mount`, `building-hop`, `glyph-*`…) and 29 platform media queries (`width >= 1366px`, `pointer: coarse`, `prefers-reduced-motion`…) — Base44 platform login chrome, not app design (the same accepted family as the platform toast portal; the login card itself is byte-compared); (e) the live ships the shadcn `accordion-down/up` keyframes unused (no accordions render on either site); (f) the raw-token VALUE "drift" is notation, not color: the live declares shadcn bare HSL triplets + a `.dark` block, the clone declares full color values (ADR-004) + the session-18 login zinc block in hex notation (`#ffffff` = `hsl(0 0% 100%)` — the computed token values are already byte-pinned by the session-18 per-route probe + the 26 parity gates). | — (documentation) | **Documented** |
| 2 | **The rem-vs-px media-query corner (the CSSOM probe's one actionable lead — PROVEN INERT)**: Tailwind v4 emits rem-based breakpoints (`@media (min-width: 48rem)`) where v3 emitted px-based (`768px`) — identical at the default 16px root (the session-11 zone sweep), but a page-level root font-size override (`html { font-size: 20px }`, the session-22 text-scaling probe) shifts rem units in LAYOUT while media queries… do not shift: **CSS media queries evaluate `rem` against the INITIAL font size, not the document root's computed size** (the MQ spec's own rule). Probed at 700–1300px × 16px/20px roots on both sites: the nav flip lands at the SAME widths on both sites under text scaling, and the mid-zone body heights are byte-identical (one 1px rounding at 700px/125% — the documented session-22 family). The v4 rem-MQ notation is therefore structurally immune to page-level text scaling — exactly like the live's px MQs. Only browser-default font-size SETTINGS (out of any page's control, identical effect on both sites) can move either. | — (methodology note — extends the session-22 text-scaling surface to the mid-zone viewports) | **Documented** |
| 3 | **The crawler/SEO-file surface (first inventory — fresh-eyes family 2)**: `robots.txt`, `sitemap.xml`, `manifest.json` and the favicon/logo asset — status + content-type + BODY comparison, both sites. **One real gap + a serialization-variance set**: (a) **manifest `scope` MISSING on the clone** — the live's manifest carries 9 fields (`name`, `short_name`, `description`, `icons`, `start_url`, `display`, `theme_color`, `background_color`, `scope`); the clone's carries 8 (no `scope`). Everything else is field-for-field identical (`name`/`short_name`/`description`/`display`/`theme_color`/`background_color` byte-equal) except the documented families: `icons[].src` (the live's Supabase CDN vs the clone's self-hosted `/logo.png` — the session-21 byte-identical-asset hosting variance) and `start_url` (the live's absolute origin vs the clone's relative `/` — the clone's is the portable PWA best-practice form, the deliberate-better family). (b) **robots.txt**: semantically identical (`User-agent: *` / `Allow: /` / the sitemap link) with serialization deltas — field-name casing (live `User-agent`, Next builder `User-Agent` — case-insensitive per RFC 9309), content-type charset (live `text/plain; charset=utf-8`, clone `text/plain`) and a trailing newline (clone). (c) **sitemap.xml**: the SAME 9 URLs in the SAME order with the SAME `changefreq`/`priority` semantics; serialization deltas — indentation (live 4-space pretty-print, Next builder flat), landing priority serialization (live `1.0`, Next builder `1`), landing loc trailing slash (live `origin/`, Next builder `origin`). Every spec-compliant parser reads both identically; the clone's forms are the canonical Next.js builder output (the same keep-the-canonical-form decision as the session-24 canonicalization pins). (d) the live's `<link rel="icon">` declares `type="image/svg+xml"` on a PNG asset (the platform generator's own mislabel); the clone's untyped `/logo.png` link is the correct form (deliberate-better). (e) the live's `/manifest.json` is a 302 to its platform `/api/apps/manifests/…` (infrastructure; the clone serves 200 directly) and the live's `/logo.png` path returns the SPA HTML fallback (documented session 21 — its logo is CDN-hosted). | LOW (one field gap) | **FIX — add `scope` + PIN** |
| 4 | **Every standing surface re-verified at the documented session-24 state**: heights ×11 routes ×2 viewports BYTE-EXACT (22/22, CourseDetail per-site ids: live `699081e752032065b878129d` vs clone `seed-1`); normalized innerText 11/11 identical; tag drift 0 on shared classes; class-set diffs — **byte-identical to the session-24 baseline report** (a scripted set-comparison against `parity-report-s24.json`: 121 lines, every one in the documented variance families); the FULL mobile battery GREEN — trigger classes byte-identical (`md:hidden p-2 rounded-lg text-white/80`), the open panel **405px on BOTH sites**, the 8 link texts + per-link GEOMETRY byte-identical (y-positions 81/129/177/225/273/321/369/417, heights 44×7+36; the 4px pre-CTA gap present on both via the documented session-9 v3-margin-top vs v4-margin-block-end engine variance), toggle + route-change close collapsed/invisible, scroll lock + ARIA = the documented clone-only hardening — **NO Tailwind v4 display/breakpoint/space-y bug**; the console surface clean on the clone dev server (0 errors, 10 routes). | — | Verified |
| 5 | **The test-suite contracts confirmed in place** (the user-facing task list): `vitest.config.ts` (unit layer, `*.test.ts` in `src/**` + `tests/**` only — 41 specs) and `playwright.config.ts` (e2e layer, `testDir: ./tests/e2e`, the production standalone server on :3100 with the isolated `db/e2e.db` — 255 specs) — both green on the shipped tree. This session GROWS the e2e layer (the spec family below) rather than adding new config. | — | Verified |

### Audit-surface note (the session-25 additions — TWO new probe families)

- **the CSSOM inventory surface** (finding 1) — no prior probe enumerated the
  stylesheet STRUCTURE (the complete custom-property map, the media-query
  census, the keyframes census) across every sheet including runtime-injected
  ones; class diffs read `class` attributes only and computed-style gates read
  resolved values — the SHEET-level inventory is the layer between (it caught
  the @theme emission architecture difference, the platform login bundle and
  the unused-library tokens, all documented this session);
- **the crawler/SEO-file surface** (finding 3) — the head-metadata surface
  (sessions 4/5) pinned `<head>` TAGS; the FILE bodies crawlers fetch
  (`robots.txt`, `sitemap.xml`, `manifest.json`) were never body-compared
  (this is the surface that caught the missing manifest `scope`).

---

## B. Remediation (TDD)

### Phase 1 — the manifest `scope` field (RED → GREEN; the one real gap)

- [1a] **RED**: new e2e spec block `session-25 parity: the crawler/SEO-file
  surface` — test (a): `manifest.json` carries the COMPLETE reference field
  set — the 8 session-5-pinned fields PLUS `scope` (the live's ninth field),
  with `start_url` pinned at the portable relative form `"/"` (the
  deliberate-better decision, documented). Run on the baseline tree →
  **fails** (`scope` is undefined).
- [1b] **GREEN**: `public/manifest.json` — add `"scope": "/"` (the relative
  portable form mirroring the live's origin-scoped `scope` in the same
  relative family as the clone's `start_url`). One line; the field set then
  matches the live's 1:1 (modulo the two documented hosting/portability
  variances).
- [1c] **Verify**: the manifest spec GREEN; the full 255-spec e2e suite as
  the regression guard; a manual `curl` body diff of the field sets.

### Phase 2 — the crawler-file response-contract pins (green-by-design guards)

- [2a] Test (b) in the same block: the crawler files' response contract —
  `robots.txt` 200 `text/plain` with the allow-everything + sitemap-link body
  (already body-pinned by session-4; the content-type is the new pin),
  `sitemap.xml` 200 `application/xml` with the 9 canonical routes (the
  session-4 pins; content-type is the new pin), `manifest.json` 200
  `application/json`. These pin the Next.js builder's canonical serialization
  (the deliberate-better family — the live's platform-generator forms are the
  artifact-grade variants: 4-space indentation, `1.0` serialization,
  `User-agent` casing, the svg+xml-on-PNG favicon mislabel) so a future
  audit cannot "fix" them toward the live's forms.
- [2b] The serialization-variance documentation (the plan's §A-3 + the AGENTS
  gotcha + the SKILL surface) — the durable record of WHY the file bodies
  are byte-different but semantically identical.

### Phase 3 — ship

- [3a] `.env.example` re-verified (no environment surface changed; byte-
  identical to `.env`, covering every user-facing `process.env` reference).
- [3b] Screenshots: the standard set re-captured on the remediated dev
  server + the session-25 additions (the crawler-file evidence is textual —
  the captures document the rendered state: the landing, the open mobile
  menu, the manifest-linked login card).
- [3c] Docs alignment: README (the session-25 paragraph + the new test
  counts), AGENTS.md (gotcha 54 — the CSSOM inventory + crawler-file
  surfaces + the MQ-rem methodology note; the commands table), CLAUDE.md
  (the test pyramid + the session-25 spec family), PAD ([S25] revision +
  §7.1 row), `nexuslearn-template_SKILL.md` v3.13.0 (the two new probes +
  surface 18l + the project_state), `docs/remediation-plan-session25.md`
  (this plan, with the results), `docs/session_46.md`, the repo worklog.
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
| Adding `scope: "/"` changes PWA install behavior | `scope` defaults to the parent of `start_url` — with `start_url: "/"` the default scope IS `/`; the explicit field is a no-op semantically (it only aligns the field SET with the live's manifest). No rendering, layout or install-behavior change is possible. |
| The content-type pins are environment-sensitive (dev vs standalone) | The specs assert on the e2e standalone server (:3100, the production build) — the same server every other response-level spec (the session-23/24 header pins) already uses; verified via `curl` on both dev and standalone before finalizing. |
| The serialization-variance set gets "fixed" toward the live's forms by a future session | The pins ARE the documentation (the same pattern as the session-24 canonicalization pins); the AGENTS gotcha + the SKILL surface record the byte-different/semantically-identical analysis. |
| Spec-count drift in docs | README/CLAUDE/AGENTS/PAD/SKILL updated to the new counts in Phase 3c; the worklog records the arithmetic (255 → 257: +2 session-25 specs). |
| The CSSOM report's raw-token "value drift" gets misread as color drift | The plan + the AGENTS gotcha state the analysis explicitly: raw sheet declarations differ in NOTATION (triplets vs full values vs hex; the `.dark` blocks; the scoped zinc block) — the COMPUTED token values are already byte-pinned by the session-18 per-route probe and the 26 parity gates; only computed values render. |

---

## D. Phase results (recorded after execution)

- **[1a]**: RED confirmed — the manifest `scope` spec failed on the baseline
  tree (`scope` undefined; `start_url: "/"` passed — the portable form
  already shipped). The response-contract spec (content-types + bodies)
  passed on the baseline — green-by-design guards, the correct TDD shape.
- **[1b]**: GREEN — `"scope": "/"` added to `public/manifest.json` (one
  line, at the END of the object — mirroring the live's field order where
  `scope` is the ninth/last field). The manifest
  field set now matches the live's 1:1 (9/9; the two documented variances:
  icons src hosting + the relative start_url/scope portability forms).
- **[1c]**: the manifest spec GREEN; manual field-set diff vs the live's
  manifest = 9/9 fields, all values identical modulo the documented
  families; the full e2e suite **257/257 GREEN** (255 → 257: +2 session-25
  specs, zero regressions).
- **[2a]**: the response-contract pins GREEN — robots.txt 200 `text/plain`
  (the allow + sitemap body re-asserted), sitemap.xml 200 `application/xml`
  (the 9-route body re-asserted), manifest.json 200 `application/json`.
- **[2b]**: the variance documentation shipped — gotcha 54 (AGENTS.md), the
  SKILL v3.13.0 surface 18l + the MQ-rem note, the README session-25
  paragraph, this plan's §A.
- **[3a]**: `.env.example` re-verified — byte-identical to `.env`; the
  `process.env.*` cross-check over `src/` + `prisma/` is an exact match; no
  environment surface changed.
- **[3b]**: screenshots captured — 67 files in `docs/screenshots/`: the
  standard set re-captured on the remediated dev server (landing, the
  per-route set, the mobile-menu states, the login card, the AI answer) +
  the session-25 additions (`manifest-scope--desktop.png` — the login card
  whose head links the now-9-field manifest; `crawler-files-s25.txt` — the
  three crawler files' statuses + content-types + the 9-field manifest
  inventory as the response-level proof). The AI answer capture verified
  by DOM probe (a 1903-char completed assistant bubble, no "Thinking..."
  — the s24 wait-pattern lesson re-learned: the LLM's wording varies
  run-to-run, so the wait must key on bubble state, not a literal phrase).
- **[3c]**: all docs aligned — README (badge 296→298, the session-25
  paragraph, the 257 count), AGENTS.md (gotcha 54; the commands table 257),
  CLAUDE.md (the 41+257 pyramid + the session-25 spec family), PAD ([S25]
  revision + §7.1 row), `nexuslearn-template_SKILL.md` v3.13.0 (the two new
  probes + surface 18l + the project_state), this plan, `docs/session_46.md`,
  the repo worklog.
- **[3d]**: gates (final, in order): lint ✓ · typecheck ✓ · 41/41 unit ✓ ·
  build ✓ · 257/257 e2e ✓; the session-14 CSS-leak spec re-ran LAST after
  every doc write — clean.
- **[3e]**: committed to `main` and pushed via the SSH wrapper — remote
  verified, key shredded after use.
