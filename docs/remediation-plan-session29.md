# NexusLearn Remediation Plan — Session 29

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the e2e production standalone server on :3100 booted with the
exact Playwright webServer env; raw fetch for the SSR-header dimension).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-28 tree, commit `83841b9`
plus the pulled `docs/session_53.md` transcript at `17a294d`): lint ✓ ·
typecheck ✓ · 44/44 unit ✓ · build ✓ · **272/272 e2e ✓** (5.1m, re-verified
this session on the freshly cloned workspace). The environment contract
re-verified (`DATABASE_URL="file:../db/custom.db"` in `.env`, `db/custom.db`
recreated at the repo root by db:push + db:seed; `.env.example` byte-identical).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The locale / number-formatting surface (first inventory — fresh-eyes family 1)**: the LOCALE dimension of the rendered-number contract — what `students.toLocaleString()` produces under a non-en-US visitor. The student counts are the ONLY locale-sensitive rendering on the site (prices use `toFixed(2)` on both sides — verified identical: `$49.99`/`$149.99` under de-DE on both sites — and ratings use `toFixed(1)`: `4.9` identical). There are exactly TWO source sites, both calling the bare form with NO explicit locale: `src/components/CourseCard.tsx:73` (`{course.students.toLocaleString()}`) and `src/app/CourseDetail/page.tsx:149` (`{course.students.toLocaleString()} students`). The live is a **CSR SPA — every count renders in the browser with the BROWSER locale** (measured: de-DE → `12.450` / `6.120` / … on `/Courses`, the landing featured grid AND its own CourseDetail; fr-FR → `12 450` narrow-space). The clone splits by render tier: the **client-rendered /Courses catalog (CourseCatalog is `"use client"`) follows the browser locale correctly** (de-DE → `12.450` ✓), but the **server-rendered surfaces — the landing featured grid (page.tsx → CourseCard) and CourseDetail — bake the NODE RUNTIME's default locale (`en-US`) into the HTML regardless of the visitor**: under a de-DE browser the clone renders `12,450` on `/` and `12,450 students` on CourseDetail while the live renders `12.450` / `12.450 students` — and the clone is even **internally inconsistent** (its own /Courses catalog says `12.450` while its landing says `12,450`). SSR proof at the protocol level: `fetch("/")` with `Accept-Language: de-DE,de;q=0.9` returns HTML containing the raw `12,450` token and NO `12.450` anywhere — the server never reads the visitor's locale. This is a REAL functional drift (not the invisible-metadata family): the rendered TEXT differs from the live for every non-en-US visitor on the landing + CourseDetail. Neither surface was ever documented as a deliberate en-US pin — it is an SSR blind spot: every previous text audit ran under the default en-US context where Node's locale and the browser's agree, so the surfaces LOOKED identical. | MEDIUM (a real rendered-text drift for non-en-US visitors — the session's ONE source fix) | **FIX: derive the SSR locale from the `Accept-Language` request header (the only visitor signal at render time), pass it through to the formatting calls; the client catalog keeps the bare browser-locale call (reference behavior) + PIN with e2e specs under de-DE/fr-FR/default + a source guard** |
| 2 | **The print surface (first inventory — fresh-eyes family 2)**: the PRINT dimension of the rendering contract — `@media print` blocks across every stylesheet (incl. runtime-injected), `media` attributes on `link`/`style` elements, and layout stability under print emulation. Probed on all 10 content routes × both sites: **the live ships ZERO `@media print` blocks and ZERO `media` attributes on every route — and emulated `media: print` changes NOTHING on either site** (scrollHeight + h1 geometry identical before/after on every route of both sites; the clone's sheets are all same-origin-accessible, census complete). This is the **frozen-adaptation family** (the session-22 media-emulation precedent: dark-scheme leaves the light palette untouched, reduced-motion leaves the transitions untouched — the reference ships no adaptation, so the parity contract is frozen). The contract is correct but UNPINNED — a future "print stylesheet" addition would be beyond-reference drift invisible to every text/class/height diff. | LOW (pins only — the contract is correct) | **PIN the frozen print contract** (zero `@media print` blocks + zero media attributes + print emulation leaves geometry untouched) |
| 3 | **The resource-hints / first-load surface (first inventory — fresh-eyes family 3)**: the PRELOAD dimension of the document head — every `link[rel=preload|preconnect|dns-prefetch|modulepreload]`, their `as=` types, and (the guard that matters) whether every `as="image"` preload href EXACTLY matches a rendered `<img>` src (a mismatched preload is a double-fetch or an unknown-asset fetch the live never makes). Probed on all 10 routes × both sites × the dev server AND the production standalone: **the live ships ZERO image preloads on every route** (its head carries only icon/manifest/stylesheet/canonical — the CSR SPA cannot preload data-dependent images in HTML; its /login additionally carries 62 platform `modulepreload`s, the documented Base44 login-kit variance). The clone's **React 19 SSR automatically hoists a `<link rel="preload" as="image">` for every unique img src it renders** — measured: `/` = **12 image preloads = its 12 unique imgs, deterministic every round**; `/Courses` = **10 in the SSR HTML subset with the client Float backfill completing the unique-img set to 16 — the settled count is 10 or 16 nondeterministically across rounds** (the client-component boundary; every href in both states is an exact rendered img src); `/CourseDetail` = 2, `/About` = 1, the image-free routes = 0; `unmatched=0` on EVERY route of EVERY tier (dev + standalone). The standalone also ships exactly ONE `preload:script` (the Next.js bootstrap chunk — first-party). This is the **deliberate-better SSR family** (the session-24 performance-record family: the clone's SSR preloads its LCP images where the live's CSR platform cannot — removing them would require fighting React 19's hoisting and would REGRESS the documented faster-FCP/LCP posture). The contract that needs pinning: **every image preload must match a rendered img src** (the no-double-fetch guard) — so a future drift toward preloading non-rendered assets (or the live's zero posture being "fixed" toward by hand-adding hints) cannot land silently. | LOW (pins + documentation — the behavior is correct and beneficial) | **PIN the image-preload matching contract + the deterministic landing census + the /Courses settled range + DOCUMENT the SSR-hoisting variance** |
| 4 | **Every standing surface re-verified at the documented session-28 state**: the full baseline gate (lint, typecheck, 44/44 unit, build, **272/272 e2e**); **heights ×11 routes ×2 viewports byte-exact 22/22** (one live CSR settle flake on `/Home|mobile` re-verified 15150=15150 with a footer rendered-state wait; the live's CourseDetail probed with ITS OWN WebDev id `699081e752032065b878129d` — `seed-1` is the clone's id, an audit-script pairing rule); **normalized innerText 11/11 identical**; **tag-of-shared-class-string drift 0** (the 5 `[object SVGAnimatedString]` lines are the script-artifact key — svg className is not a string; the documented methodology skips svg); **class-set diff 12 lines — every line in the documented dark-hero gradient-notation family** (v3 `bg-gradient-to-br from-… via-… to-…` tokens vs the clone's single arbitrary-value `bg-[linear-gradient(...)]` form — identical rendering); the **mobile-menu battery** (the user-directed Tailwind v4 watch): trigger classes BYTE-IDENTICAL (`md:hidden p-2 rounded-lg text-white/80`), trigger geometry 40×40 identical, open panel NAV 375×469 IDENTICAL (= the 64px chrome + the 405px panel), per-link geometry BYTE-IDENTICAL (y 81/129/177/225/273/321/369/417, heights 44×7+36), route-change close on both, the clone-only ARIA/scroll-lock/Escape hardening as documented. **No Tailwind v4 display, breakpoint or space-y bug.** Console sweep: **clone 0 errors/warnings** on every route (the live fires 401s from its platform-auth layer — the documented session-22 localStorage-architecture variance). | — | Verified |
| 5 | **The /login platform sheet-count variance (probed, documented)**: the live's /login loads 5 stylesheets (its platform login-UI kit — the documented session-18 zinc-token/session-25 CSSOM-inventory family) vs the clone's 2 (the app's own globals.css + the dev overlay). Inert for the print surface (0 print blocks in all of them) — recorded for the audit trail, no action. | INFO (already-documented platform family) | **No action** |

### Audit-surface note (the session-29 additions — THREE new probe families)

- **the locale / number-formatting surface** (finding 1) — the LOCALE
  dimension of the rendered-number contract: what the locale-sensitive
  formatting calls produce under a non-en-US visitor. This is the layer that
  would catch ANY locale-dependent rendering drift (SSR baking the server's
  runtime locale, a formatting call switching to a locale-sensitive API);
  the blind spot's root cause: every text audit ran under a default en-US
  context where the Node runtime locale and the browser locale AGREE —
  the surfaces only diverge under a de-DE/fr-FR/… visitor, which no
  previous probe ever simulated;
- **the print surface** (finding 2) — the PRINT dimension of the rendering
  contract: the `@media print` census + the emulated-print stability check.
  The frozen-adaptation family's third member (after dark-scheme and
  reduced-motion);
- **the resource-hints / first-load surface** (finding 3) — the PRELOAD
  dimension of the document head: the hint census per route + the
  image-preload/img-src matching guard (the no-double-fetch rule).

Family 1 was the standing session-28 "suggested next directions" territory
(the session-52 transcript's locale/formatting direction); families 2–3 are
the print-stylesheet and Lighthouse/first-load-budget directions.

---

## B. Remediation (TDD)

This session carries **one real source fix** (finding 1: the SSR locale
blind spot) plus pins for the contracts that are correct but unpinned
(findings 2–3).

### Phase 1 — the SSR locale fix + the locale-surface pins (family 1)

- [1a] **RED**: new e2e spec block `session-29 parity: the SSR locale
  surface` — under `test.use({ locale: "de-DE" })`: the landing's featured
  student counts render the GERMAN thousands separator (`12.450`, `4.210`,
  `8.320`, `5.430`, `3.890`, `6.750`) AND `/CourseDetail?id=seed-1` renders
  `12.450 students` AND the /Courses client catalog keeps the browser-locale
  form (`12.450` — the client-component side must NOT regress); under
  `test.use({ locale: "fr-FR" })`: the landing renders the French
  narrow-space form (`12 450`); under the DEFAULT context: `12,450`
  everywhere (the en-US deterministic pin — the existing-expectations
  contract). Runs RED on the baseline (the landing + CourseDetail render
  `12,450` under de-DE).
- [1b] **FIX**: new pure seam `src/lib/number-format.ts` exporting
  `pickLocale(acceptLanguage: string | null | undefined): string` — parses
  the `Accept-Language` header (q-weight ordering, `*`/garbage skipping,
  q=0 exclusion, `de-de`→`de-DE` canonicalization) with the `en-US`
  fallback. The landing page + CourseDetail page (both async server
  components) read `const h = await headers()` →
  `pickLocale(h.get("accept-language"))` and pass a `locale` prop into
  `CourseCard` / the CourseDetail students line; `CourseCard` gains the
  optional prop and calls `course.students.toLocaleString(locale)`
  (`toLocaleString(undefined)` is the bare default-locale call — the client
  catalog path, which passes no prop, keeps the exact browser-locale
  behavior of the live). The pages are already `force-dynamic` (session 24)
  — `headers()` adds no new dynamic constraint. Zero effect on every
  existing expectation: Playwright's default context sends NO
  `Accept-Language` header (verified with an echo server this session —
  Chromium-with-defaults probe) → `pickLocale(null)` → `"en-US"` → the
  same `12,450` output as the current Node-runtime default. [1a] goes
  GREEN.
- [1c] **UNIT**: `tests/number-format.test.ts` — 7 parser specs (null /
  empty / single-tag pass-through / full Chrome header first-wins / q-weight
  ordering / `*`+garbage+q=0 skipping / `DE-de` canonicalization +
  regionless tags) pinning `pickLocale` as a pure function.
- [1d] **GUARD**: `tests/locale-format-source.test.ts` (the img-attributes
  source-guard pattern) — (a) NO bare `.toLocaleString()` call anywhere in
  `src/` (every call must pass an explicit argument — a bare call follows
  the RUNTIME locale, the exact drift class this session closed; doc
  comments reworded to avoid the literal pattern); (b) the wiring guard:
  the landing + CourseDetail pages import `pickLocale` and read `headers()`,
  and `CourseCard`'s count call passes the `locale` variable.

### Phase 2 — the print-surface pins (family 2)

- [2a] **PIN**: e2e spec in the session-29 block — on `/` and `/login`:
  the document's accessible sheets contain ZERO `@media print` blocks,
  ZERO `link[media]`/`style[media]` elements, and
  `page.emulateMedia({ media: "print" })` leaves `scrollHeight` and the h1
  geometry UNCHANGED (the frozen-adaptation contract — the session-22
  media-emulation family's print member; a future print stylesheet is
  beyond-reference drift requiring the documentation gate).

### Phase 3 — the resource-hints pins (family 3)

- [3a] **PIN**: e2e spec in the session-29 block — on `/` and `/Courses`:
  every `link[rel="preload"][as="image"]` href is EXACTLY a rendered
  `<img>` src (the no-double-fetch/no-unknown-asset guard); the `/` census
  is deterministic: exactly 12 image preloads (the 12 unique imgs — 3
  featured covers… the full landing unique-img set); the `/Courses` settled
  census is the range 10–16 (the SSR subset + the racy client Float
  backfill — both states verified all-matching); and the hint census
  carries ZERO `preconnect`/`dns-prefetch` (neither site ships any).
- [3b] **DOCUMENT**: the SSR image-preload hoisting variance (the
  deliberate-better family — the live's CSR platform cannot preload
  data-dependent images in HTML; the clone's React 19 SSR hoists one
  preload per unique rendered img src, every href an exact img src) goes
  into the AGENTS.md gotcha + the plan's record; the live's /login
  modulepreload block is the documented platform-kit family.

### Phase C — docs alignment

- [C1] `AGENTS.md`: gotcha 58 (the locale/number-formatting surface — the
  SSR Accept-Language rule + the client/server render-tier split + the
  bare-call guard) + the commands-table count bump.
- [C2] `CLAUDE.md`: the test pyramid counts + the session-29 spec family.
- [C3] `README.md`: the badge count + the session-29 paragraph.
- [C4] `Project_Architecture_Document.md`: the [S29] revision row.
- [C5] `nexuslearn-template_SKILL.md`: `project_state` v3.17.0.
- [C6] `worklog.md`: the session-29 record. `.env.example` re-verified
  byte-identical (no environment surface changes this session).

### The gate

lint → typecheck → **53 unit** (44 + 7 parser + 2 guard) → build →
**278 e2e** (272 + 3 locale + 1 print + 2 hints) — zero regressions; the
session-14 CSS-leak spec re-runs LAST after every doc write.

---

## C. Pre-execution validation (done BEFORE writing any code)

- **The fix sites**: `src/components/CourseCard.tsx:73` (the card count) +
  `src/app/CourseDetail/page.tsx:149` (the detail count) are the ONLY two
  `toLocaleString` calls in `src/` (repo grep — zero others in components,
  pages, libs); `src/app/page.tsx` (the landing) and the CourseDetail page
  are async server components (both already read request data); the
  root layout is `force-dynamic` (session 24) so `headers()` adds no
  rendering-mode change.
- **The client tier**: `src/components/CourseCatalog.tsx` is `"use client"`
  and renders `<CourseCard course={c} />` with no locale prop —
  `toLocaleString(undefined)` ≡ the bare call ≡ browser locale ≡ the live's
  behavior (verified: de-DE → `12.450` on the clone /Courses TODAY, before
  any fix).
- **No existing expectation breaks**: grep of the e2e suite finds ZERO
  student-count string assertions (the only "students" match is the
  SkillSphere description pin); Playwright's default context sends NO
  `Accept-Language` (echo-server verified) → the parser's `en-US` fallback
  reproduces today's output byte-for-byte under the default context.
- **The spec targets**: the landing's six featured counts (12450, 4210,
  8320, 5430, 3890, 6750 — the featured subsequence), the de-DE forms
  (`12.450`/`4.210`/`8.320`/`5.430`/`3.890`/`6.750`), the fr-FR form
  (`12 450` — narrow no-break space U+202F between the groups), the
  seed-1 CourseDetail count (12450), and the e2e standalone's hint census
  (`/` = 12 deterministic; `/Courses` = 10–16; both verified against the
  standalone booted with the exact webServer env).
- **The vitest config**: `tests/**/*.test.ts` is already in the include
  set — the new `tests/number-format.test.ts` +
  `tests/locale-format-source.test.ts` are picked up with no config change;
  `skills/` stays excluded (no `.test.ts` inside it matches the include
  globs).
