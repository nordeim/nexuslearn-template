# Session 24 — The CSP nonce + performance/canonicalization pass: two fresh-eyes probe families

Continuing from session 23 (`da73d0c` + the pulled session-log doc at
`67ba212` — `docs/session_43.md` holds the prior session's transcript).
Sessions 1–23 closed every static, content, state, computed-style, cascade,
font, preflight, reveal-entry, navigation-transition, deep-link,
pending-state/attribute/tag/token, environment-pollution, element-tag,
console-hygiene, a11y-exposure, interaction-modality, persistence,
security-headers and axe-WCAG surface — every height byte-exact, the mobile
battery green, 289 tests. This session's mandate: the standard parity
re-audit with the mobile-navigation focus (the Tailwind v4 watch), then the
session-23 suggested direction (a performance pass) plus the documented
future work (the CSP nonce pattern), then the full ship ritual (screenshots,
`.env.example`, docs, gates, SSH-wrapper push).

## Baseline (the shipped session-23 tree)

All gates green on commit `67ba212`: lint ✓ typecheck ✓ 41/41 unit ✓ build ✓
**248/248 e2e ✓** (re-verified on the isolated `db/e2e.db` infrastructure).
The environment contract re-verified (`DATABASE_URL="file:../db/custom.db"`
in `.env`, `db/custom.db` + `db/e2e.db` both at the repo root; `.env.example`
byte-identical). skills/ exclusion re-verified (tsconfig, eslint, vitest,
playwright, the `@source not` set). The vitest + playwright suites confirmed
in place with their configs validated against the task list.

## The standing parity re-audit (live vs clone, both signed in)

Every standing surface GREEN at the documented session-23 state: heights
×11 routes ×2 viewports byte-exact (22/22, incl. CourseDetail with per-site
ids — live `699081e752032065b878129d` vs clone `seed-1`); normalized
innerText 11/11 identical; tag drift 0 on shared classes; the class-set
diffs — **byte-identical to the session-23 baseline report** (every line in
the documented variance families: the live's platform toast portal, the dvh
page-root hardening, the gradient arbitrary-form pin, the body font-sans
declaration, the mounted-panel family, the selectOrder pair); the console
surface clean on the clone dev server (0 errors).

**The FULL mobile-menu battery — the Tailwind v4 watch**: trigger classes
byte-identical (`md:hidden p-2 rounded-lg text-white/80` over the hero); the
open panel **405px on BOTH sites**; the 8 link texts identical; the
per-link GEOMETRY dump proves the layout byte-identical (y-positions
81/129/177/225/273/321/369/417 with heights 44×7+36); the 4px pre-CTA gap
renders on BOTH sites — carried by the CTA's margin-TOP on the live (v3's
follower-side space-y engine) vs the Contact link's margin-BOTTOM on the
clone (v4's `:where()` engine) — the documented session-9 engine variance.
Toggle close + route-change close verified collapsed/invisible on the clone
(grid-rows-0fr / opacity 0 / height 0) and unmounted on the live. **No
Tailwind v4 display, breakpoint or space-y bug anywhere.**

## The two fresh-eyes probe families (the session's audit-surface additions)

1. **The performance / web-vitals + resource-inventory surface** (the
   session-23 suggested direction) — TTFB/FCP/LCP + the per-bucket resource
   inventory per route on both sites (the live behind Cloudflare; the clone
   as the standalone production build). **The clone is dramatically faster
   on every route and every metric**: TTFB 5–61ms vs 209–575ms; FCP 132–288
   vs 856–1752ms; LCP 544–1292 vs 876–2128ms — the SSR-vs-SPA architecture
   difference, documented (the clone's is the better loading story). The
   1.1MB logo ships as favicon + login logo on BOTH sites as the
   byte-identical asset (md5 `f2d0170f…` — the reference's own design, the
   same parity family as the gray lesson icons; do not compress). The cache
   posture: `/_next/static` chunks immutable (correct — now pinned); the
   `public/` assets' `max-age=0` matches the live's CDN `no-cache`
   revalidate semantics (parity).
2. **The response-status / URL-canonicalization surface** — the live's SPA
   platform returns HTTP 200 for EVERY path (trailing-slash variants render
   directly; unknown routes + `/Login` case variants render the in-app 404
   view, with raw-path title artifacts like "No Such Page | NexusLearn");
   the clone ships the canonical forms — a 308 redirect for trailing
   slashes and REAL 404 statuses. The SEO-correct deliberate-better family,
   now PINNED so a future audit cannot "fix" them backwards.

**Methodology lesson (the spike-before-plan discipline)**: the CSP nonce
pattern was empirically validated on a scratch tree BEFORE the plan was
written — and the spike caught what a plan-only session would have shipped
broken: static-prerendered pages (`/login`, `/AIAssistant`, `/Pricing`,
`/About`, `/Contact`, `/BecomeInstructor` — the `○` build markers) bake
nonce-less HTML at build time where no per-request nonce exists; under
`strict-dynamic` their scripts BLOCK and the pages render UNHYDRATED (the
login form falls back to a native GET submit → `/login?` — the exact
gotcha-32 failure symptom). The validated fix — `export const dynamic =
"force-dynamic"` in the ROOT layout — forces per-request rendering on every
route (incl. `/_not-found`) so the nonce reaches every script.

## Remediation (TDD)

1. **The CSP nonce pattern (RED → GREEN)** — the session-23 documented
   future work (neither site shipped a CSP): three e2e specs written first
   (the header shape — `script-src 'self' 'nonce-…' 'strict-dynamic'` +
   the conservative directive set; the per-request nonce property — two
   requests never share a nonce; the script-nonce + zero-violations
   contract), run RED on the baseline tree, THEN implemented: `src/proxy.ts`
   generates the per-request nonce, exposes it on the request headers (the
   documented pattern — Next.js auto-nonces its bootstrap scripts) and
   ships the policy on the response in all three proxy branches. Directive
   decisions: `style-src 'self' 'unsafe-inline'` (inline style ATTRIBUTES —
   the reveal pre-hide + the Navbar grid animation), `img-src` allowlisting
   images.unsplash.com (the only external image host), `font-src 'self'` (no
   webfonts — session 14), `connect-src 'self'` (zero client-side data
   calls — session 22), `frame-ancestors 'self'` (mirroring XFO SAMEORIGIN),
   dev-only `'unsafe-eval'` + `ws:` (Turbopack HMR), and deliberately NO
   `upgrade-insecure-requests` (the standalone template runs plain HTTP
   locally — the directive upgrades same-origin subresource URLs to https
   and breaks them; HSTS handles the deployment layer). The companion
   `export const dynamic = "force-dynamic"` in the root layout. GREEN on
   dev + standalone.
2. **The canonicalization pins (green-by-design guards)**: three e2e specs —
   the trailing-slash 308 (+ `location` assertion), the unknown-route real
   404, the `/Login` case-variant real 404.
3. **The static-asset cache pin**: one e2e spec — a real `/_next/static`
   chunk (discovered from the rendered HTML) ships
   `cache-control: public, max-age=31536000, immutable` (the config
   regression guard for the performance surface).

## Verification

The full-route battery on the real implementation: **100% nonced scripts +
ZERO CSP violations on all 11 routes (incl. the 404 path)**; the login flow
hydrates + submits + lands on `/`; the catalog search island filters; the
404's client-router Go Home navigates; the dev server ships the relaxed dev
policy with everything working. All five standing surfaces re-run
post-remediation — heights 22/22, innerText 11/11, tag drift 0, class sweep
byte-identical to the session-23 baseline, the mobile battery green, the
console clean. The performance profile re-probed post-change: TTFB 11–56ms
(the force-dynamic cost is negligible). The full e2e: **255/255 GREEN**
(248 → 255: +7 session-24 specs, zero regressions).

## Screenshots

65 files in `docs/screenshots/`: the standard set re-captured on the
remediated dev server + the two session-24 additions
(`login-hydrated-under-csp--desktop` — the previously-static route rendered
fully-hydrated with filled fields, the force-dynamic proof; and the
`aiassistant-answer--desktop` re-capture under the CSP). Key captures
VLM-verified: the completed AI answer (headings + equation + lists, no
"Thinking..." bubble), the login card fully rendered with both fields
filled, the open mobile menu with all 7 links + the gradient CTA.

## `.env.example`

Re-verified: byte-identical to `.env`, covering every user-facing
`process.env` reference (`DATABASE_URL`, `AUTH_SECRET`,
`NEXT_PUBLIC_SITE_URL` — cross-checked against every `process.env.*` usage
in `src/` + `prisma/`). No environment surface changed this session.

## Gates (final)

lint ✓ · typecheck ✓ · 41/41 unit ✓ · build ✓ · 255/255 e2e ✓ (248 → 255:
+7 session-24 specs, zero regressions). The CSS-leak spec re-ran LAST
after every doc write (the session-15 process rule).

## Ship

- Committed to `main` + pushed via the SSH wrapper
  (`docs/ssh_git_wrapper_v3.py`) — remote verified, operator key shredded
  after use.
- Docs aligned: README (badge 296, the session-24 paragraph, the 255
  count), AGENTS.md (gotcha 53 — the CSP nonce pattern requires per-request
  rendering; the commands table; the proxy line), CLAUDE.md (the 41+255
  pyramid + the session-24 spec family), PAD ([S24] revision + §7.1 row),
  `nexuslearn-template_SKILL.md` v3.12.0 (the two new probes + surface 18k
  + the project_state), `docs/remediation-plan-session24.md` (with the
  results), this session log, the repo worklog.
