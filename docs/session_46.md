# Session 25 — The CSSOM inventory + crawler/SEO-file pass: two fresh-eyes probe families

Continuing from session 24 (`0bf0c04` + the pulled session-log doc at
`fc2b04a` — `docs/session_45.md` holds the prior session's transcript).
Sessions 1–24 closed every static, content, state, computed-style, cascade,
font, preflight, reveal-entry, navigation-transition, deep-link,
pending-state/attribute/tag/token, environment-pollution, element-tag,
console-hygiene, a11y-exposure, interaction-modality, persistence,
security-headers, axe-WCAG, CSP-nonce and performance/canonicalization
surface — every height byte-exact, the mobile battery green, 296 tests. This
session's mandate: the standard parity re-audit with the mobile-navigation
focus (the Tailwind v4 watch), then two never-probed fresh-eyes families
(the CSSOM inventory surface + the crawler/SEO-file surface), then the full
ship ritual (screenshots, `.env.example`, docs, gates, SSH-wrapper push).

## Baseline (the shipped session-24 tree)

All gates green on commit `fc2b04a`: lint ✓ typecheck ✓ 41/41 unit ✓ build ✓
**255/255 e2e ✓** (re-verified on the isolated `db/e2e.db` infrastructure).
The environment contract re-verified (`DATABASE_URL="file:../db/custom.db"`
in `.env`, `db/custom.db` + `db/e2e.db` both at the repo root — the shell's
stale absolute export correctly ignored by the session-19 guard; `.env.example`
byte-identical). skills/ exclusion re-verified (tsconfig, eslint, vitest,
playwright, the `@source not` set). The session-24 CSP contract verified live
on the dev server (per-request nonce + the dev-only `'unsafe-eval'` + `ws:`
relaxations + the session-23 baseline headers).

## The standing parity re-audit (live vs clone, both signed in)

Every standing surface GREEN at the documented session-24 state: heights
×11 routes ×2 viewports byte-exact (22/22, incl. CourseDetail with per-site
ids — live `699081e752032065b878129d` vs clone `seed-1`); normalized
innerText 11/11 identical; tag drift 0 on shared classes; the class-set
diffs — **byte-identical to the session-24 baseline report** (a scripted
set-comparison against `parity-report-s24.json`: 121 lines, every one in
the documented variance families); the console surface clean on the clone
dev server (0 errors, 10 routes).

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

1. **The CSSOM inventory surface** — the complete stylesheet STRUCTURE diff:
   the FULL custom-property map (extending the session-18 six-token
   per-route probe to every declared `--var`), the `@media` rule census and
   the `@keyframes` census, across every stylesheet (static + runtime
   injected), per route, both sites. **Zero rendered drift.** Every delta
   is engine architecture or platform chrome: (a) v4's `@theme` emits EVERY
   theme value as a CSS custom property (`--color-amber-500`,
   `--animate-pulse`, `--blur-xl`… — 113 clone-only vars; v3 never emitted
   palette vars); (b) the live's v3 sheet carries the `--tw-bg-opacity`/
   `--tw-border-opacity`/`--tw-border-spacing-*` engine vars v4 dropped;
   (c) the live's platform sheet ships the full shadcn component library
   UNUSED (`--sidebar-*`, `--chart-*` + the `accordion-down/up` keyframes —
   no sidebars, charts or accordions render anywhere); (d) the live's
   /login loads **three platform sheets** (786 platform vars
   `--agent-avatar-*`/`--accent-1..9`, 43 platform keyframes `sonner-*`/
   `go*`/`sidebar-mount`, 29 platform media queries — the Base44 login UI
   kit, not app design; the login card itself is byte-compared); (e) the
   raw-token "value drift" is NOTATION, not color — the live declares bare
   HSL triplets + a `.dark` block, the clone full values (ADR-004) + the
   session-18 zinc block in hex (`#ffffff` = `hsl(0 0% 100%)`; only
   COMPUTED values render, and those are byte-pinned).
2. **The crawler/SEO-file surface** — the FILE bodies crawlers fetch
   (`robots.txt`, `sitemap.xml`, `manifest.json` + the favicon/logo asset):
   status + content-type + BODY comparison, both sites. The sessions-4/5
   specs pinned the `<head>` TAGS; the files themselves were never
   body-compared. **One real gap**: the manifest's `scope` field MISSING
   (the live's ninth field — `name`/`short_name`/`description`/`icons`/
   `start_url`/`display`/`theme_color`/`background_color`/`scope`).
   Everything else is field-for-field identical modulo the documented
   families (icons src — the session-21 byte-identical-asset CDN-vs-local
   hosting variance; start_url/scope — the live's origin-absolute forms vs
   the clone's portable relative ones, the deliberate-better family). The
   remaining deltas are engine serialization: robots `User-agent` vs the
   Next builder's `User-Agent` (case-insensitive per RFC 9309), the
   sitemap's flat `1` vs the live's `1.0` priority serialization +
   4-space-vs-flat indentation + the landing-loc trailing slash,
   `text/plain` vs `text/plain; charset=utf-8` — semantically identical to
   every spec-compliant parser; the clone's forms are the canonical Next.js
   builder output (the session-24 keep-the-canonical-form decision).
   Also documented: the live's `<link rel="icon">` declares
   `type="image/svg+xml"` on a PNG asset (the platform generator's own
   mislabel), its `/manifest.json` is a platform 302, and its `/logo.png`
   path returns the SPA HTML fallback (its logo is CDN-hosted — session 21).

**Methodology find (the media-query rem rule)**: the CSSOM census surfaced
v4's rem-based breakpoints (`min-width: 48rem`) vs the live's px-based
(`768px`) — identical at the default root (the session-11 zone sweep), but a
genuine divergence candidate under text scaling. Probed at 700–1300px ×
16/20px roots on both sites: **the nav flip lands at the SAME widths and
the mid-zone body heights are byte-identical** — because CSS media queries
evaluate `rem` against the INITIAL font size, not the document root's
computed size: a page-level `html { font-size: 20px }` override shifts
layout rems but never breakpoint rems. v4's rem-MQ notation is structurally
immune to page-level text scaling, exactly like the live's px MQs (one 1px
rounding at 700px/125% — the documented session-22 family). This extends
the session-22 text-scaling surface to the mid-zone viewports and closes
the lead as inert.

## Remediation (TDD)

1. **The manifest `scope` field (RED → GREEN)** — the one real gap: the
   e2e spec written first (manifest.json carries the complete 9-field
   reference set incl. `scope`, with `start_url`/`scope` pinned at the
   portable relative forms `"/"`), run RED on the baseline tree
   (`scope` undefined; `start_url: "/"` passed — already shipped), THEN
   `"scope": "/"` added to `public/manifest.json` (one line, at the end —
   the live's field order). GREEN; the manual field-set diff vs the live's
   manifest = 9/9 fields with 6 byte-identical values + the 3 documented
   variances.
2. **The crawler-file response-contract pins (green-by-design guards)**:
   one e2e spec — robots.txt 200 `text/plain` (the allow + sitemap body),
   sitemap.xml 200 `application/xml` (the 9-route weekly body), manifest.json
   200 `application/json` — pinning the Next.js builder's canonical
   serialization against "fixes" toward the live platform generator's
   artifact forms.

## Verification

All standing surfaces re-run post-remediation (the manifest change is a
static JSON file — zero DOM impact, verified not assumed: the heights spot
sweep + the mobile panel at 405px). The full e2e: **257/257 GREEN**
(255 → 257: +2 session-25 specs, zero regressions). The AI chat re-verified
end-to-end with a DOM-probe-verified capture (a 1903-char completed answer
bubble, no "Thinking..." — the wait-pattern lesson: the LLM's wording
varies run-to-run, so waits must key on bubble state, not a literal phrase;
the s24 capture script's literal-phrase wait silently passed on a failed
wait via its `.catch`).

## Screenshots

67 files in `docs/screenshots/`: the standard set re-captured on the
remediated dev server + the two session-25 additions
(`manifest-scope--desktop.png` — the login card whose head links the
now-9-field manifest; `crawler-files-s25.txt` — the three crawler files'
statuses + content-types + the 9-field manifest inventory as the
response-level proof). The AI answer capture DOM-verified (the completed
bubble, not the transient state).

## `.env.example`

Re-verified: byte-identical to `.env`, covering every user-facing
`process.env` reference (`DATABASE_URL`, `AUTH_SECRET`,
`NEXT_PUBLIC_SITE_URL` — cross-checked against every `process.env.*` usage
in `src/` + `prisma/`). No environment surface changed this session.

## Gates (final)

lint ✓ · typecheck ✓ · 41/41 unit ✓ · build ✓ · 257/257 e2e ✓ (255 → 257:
+2 session-25 specs, zero regressions). The CSS-leak spec re-ran LAST
after every doc write (the session-15 process rule).

## Ship

- Committed to `main` + pushed via the SSH wrapper
  (`docs/ssh_git_wrapper_v3.py`) — remote verified, operator key shredded
  after use.
- Docs aligned: README (badge 298, the session-25 paragraph, the 257
  count), AGENTS.md (gotcha 54 — the CSSOM inventory + crawler-file
  surfaces + the media-query rem rule; the commands table 257), CLAUDE.md
  (the 41+257 pyramid + the session-25 spec family), PAD ([S25] revision +
  §7.1 row), `nexuslearn-template_SKILL.md` v3.13.0 (the two new probes +
  surface 18l + the project_state), `docs/remediation-plan-session25.md`
  (with the results), this session log, the repo worklog.
