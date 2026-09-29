# NexusLearn Remediation Plan — Session 14

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; Playwright parity probes + agent-browser sessions with synced
viewports at 1920×1080 + 375×667). The audit re-verified every standing surface from
sessions 1–13 and added THREE fresh-eyes surfaces suggested by the session-13 transcript
(`docs/session_23.md`): the **print stylesheet comparison**, the **`::selection`/cursor/
caret sweep**, and — following the cursor sweep's lead — the **computed font/line-height
surface** plus a **per-element space-y sibling-gap audit** (the engine-level follow-up to
the session-9 space-y work).

**Rule**: `skills/` folder excluded from checking/testing/compilation (re-verified:
tsconfig `exclude`, eslint `ignores`, vitest `include` matches `src/**` + `tests/**`
only, playwright `testDir: ./tests/e2e` — and this session closes the LAST exclusion
gap: Tailwind's automatic source detection, finding 6).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ ·
155/155 e2e ✓ (session-13 state, remote `e0398ba` via the pulled `docs/session_23.md`,
confirmed green on the pulled clone).

**Session-14 focus**: sessions 1–13 closed static, shell, content, sub-section,
interactive-state, head-metadata, OG-identity, class-verbatim, display-order,
section-design, seed-idempotency, space-y-engine, navbar-chrome, route-state-chrome,
copy + glyph, component-state, computed-shadow, focus-ring, scroll and card-structure
parity. This session's fresh surfaces found the deepest drift family yet: **the
rendered FONT itself differed** (the clone bundled a webfont the reference never loads —
the root cause of the 13-session "font-metric height bands"), plus FIVE more Tailwind v4
engine traps (the cursor preflight drop, the line-height composition flip, the inline
space-y gap loss, the overridden :where() gap, the reveal-killed scale) and the skills/
CSS leak. After the six fixes below, **every height measurement in the project is
byte-exact for the first time**: 11 routes × 2 viewports + all 9 CourseDetail pages.

---

## A. Findings inventory (live vs clone)

| # | Finding | Severity |
|---|---------|----------|
| 1 | **The rendered font differs — the reference ships NO webfont; the clone bundled next/font Inter.** Measured (Playwright, fresh contexts): `document.fonts` is EMPTY on every live route (the Base44 runtime declares `body { font-family: Inter, system-ui, -apple-system, sans-serif }` as an INLINE runtime sheet on 9 of 10 routes — absent on /login, which falls to the v3 default stack — and declares NO @font-face for Inter anywhere; the /login runtime bundle declares only unused Wix Madefor/Dazzed/Azeret faces). The live renders the visitor's SYSTEM font (probe width 546.02 = system-ui, ≠ Inter's 509). The clone loaded real Inter via `next/font/google` (`Inter, "Inter Fallback"`, probe width 509) — different glyphs on every line of the app. This was the ROOT CAUSE of the documented "font-metric height bands" (desktop /−30, /Courses −49, /About −29; mobile /−299, /Courses −121, /Pricing −46, /About −45, /Contact −22, /BI −58, /Dashboard −22, /login −44; CourseDetail 7× +1px, WebDev/UIUX −25px): the system font wraps slightly differently than Inter on text-heavy pages. After the fix, ALL of those bands collapse to 0 — the first byte-exact-everywhere state in the project's history. | **High** |
| 2 | **The v4 button-cursor preflight drop (the SIXTH v4 trap).** Tailwind v4 removed the v3 preflight rule `button, [role="button"] { cursor: pointer }` (v4 buttons revert to the UA-default arrow). Measured: on / ALL 15 clone buttons + 27 svg descendants (42 elements) computed `cursor: default`; the live computed ZERO default-cursor elements (its v3 static sheet AND its runtime sheet both carry the rule). On /login the clone's 4 buttons + 8 descendants computed default vs the live's hand cursor. Interactive-state drift invisible to class diffs (the rule is preflight, not a utility — a FOURTH structural-blind-spot class: preflight deltas with byte-identical classes). | **High** |
| 3 | **The v3↔v4 line-height composition flip on `text-*` + `leading-*` combos (the SEVENTH v4 trap).** The hero H1 (`text-4xl sm:text-5xl md:text-7xl … leading-tight`): v3 emits the responsive `md:text-7xl` inside its media block AFTER the base utilities, so the SIZE utility's own `line-height: 1` re-asserts later and WINS over the plain `leading-tight` (1.25) — the live's H1 line boxes are 72px at 72px font. v4's `--tw-leading` custom-property composition makes `leading-tight` win regardless of order — the clone rendered 90px line boxes (+36px on the H1). Same flip on the hero P (`md:text-xl` + `leading-relaxed`: live 28px [v3's rem-based 1.75rem] vs clone 32.5px [ratio 1.625], +14px) and the CTA H2 (`md:text-5xl` + `leading-tight`: live lh 1 vs clone 1.25). +50px on the hero content column — the root cause of the residual / and /Home +24px after the font fix. Below the variant breakpoints both engines agree (plain leading-* wins in both) — the drift only exists where the responsive size activates. | **High** |
| 4 | **The reference's scroll-reveal system kills the popular-card `scale-105` (the NINTH v4 trap + a session-13 record correction).** The live pre-hides offscreen sections with INLINE `opacity: 0; transform: translateY(20px)` (35 elements on /, 4–6 on /Pricing, /About, /Courses, /BecomeInstructor) and, once each scrolls into view, leaves INLINE `opacity: 1; transform: none` FOREVER. That inline transform beats every stylesheet rule — including the popular pricing card's own `.scale-105` — so BOTH live popular cards (/, /Pricing) render UNSCALED in their resting post-reveal state (498px bounding box; `scale: none`, `transform: none`). The clone (no reveal system) applied v4's standalone `scale: 1.05` — its card rendered 5% larger (523px), and every rect-based measurement inside the card read 1.05× inflated (the 16.8px feature-list gaps vs the live's 16, the 21px icons vs 20). CORRECTION: session-13's "zero offscreen-hidden elements / no visible reveal animation" record was wrong — the reveal system exists and fires on scroll (verified: after scrolling, all 35 elements revealed, `stillHidden: 0`); its inline `transform: none` is what permanently neutralizes the card's scale class. | **High** |
| 5 | **The skills/ folder leaked into the compiled CSS (51% of the stylesheet).** Tailwind v4's automatic source detection scans every non-gitignored file — including `skills/` (283 files with class-like strings). The dev server's compiled sheet carried 2014 CSSOM rules; after excluding skills/, 987 — **1027 rules (51%) were unused utilities generated from skills/ content** (canaries: `.selection:bg-red-200`/`.selection:text-red-900` — the v4-docs demo string inside `skills/gift-evaluator/html_tools.py` — plus `.bg-amber-400`, `.bg-indigo-500`, `.bg-lime-50`, `.bg-teal-600`, all with zero src/ usage). Violates the task's "skills/ excluded from compilation" rule and bloats the production CSS (157KB before). Invisible to every DOM-based surface (leaked utilities match no elements) — found by the ::selection CSSOM sweep. | **Medium** |
| 6 | **The inline-label space-y gap loss (the EIGHTH v4 trap).** v4's space-y engine assigns the gap to every NON-LAST child as `margin-block-end` via `:where()`; v3 assigned it to every FOLLOWER as `margin-top`. When the non-last child is INLINE (the login form's `<label>`s are `display: inline`), a vertical margin is INERT — v4 silently loses the gap. Measured on /login (all widths; desktop masked by the h-screen viewport clamp): the live's label→input gap inside the `space-y-1.5` field groups = 10px (6px margin + line-box slack), the clone's = 4px (slack only); each field group 6px shorter, the email+password block −12px (the whole mobile /login delta). | **Medium** |
| 7 | **The overridden-gap space-y loss (the TENTH v4 trap).** v4's `:where()` gap carrier (ZERO specificity) is replaced by a child's OWN margin utility. The login card's "Back to sign in" button carries `-mb-2` (its own −8px margin): on v3 the gap rides the FOLLOWER's mt (unaffected — the live's signup header gaps [8, 16], reset [16, 24]); on v4 the button WAS the gap carrier and `-mb-2` replaced the 16/24px gap with −8px — the view heading pulled up into the button (clone gaps [−8, 16] / [−8, 24]; the signup header block −16px, the reset −24px). Found by the new per-view sibling-gap audit (the standing height sweep measures the signin view only; the other views are reached by click). The verify view shares the pattern (same source block). | **Medium** |
| 8 | **Audit-methodology findings (documentation)**: (a) print surface — NEITHER site ships a single `@media print` rule (0 = 0 on all 10 routes) and print-emulated layout = screen layout (heights at the documented bands, display histograms at the documented variance level) — cleared, no action; (b) ::selection — NO element on ANY route of either site carries `selection:` classes; the live's 8 `/login` rules are inert runtime-preset utilities (accepted variance), and after finding 5 the clone's 2 leaked rules are gone — both sites render the UA-default selection everywhere; (c) caret-color — the /login micro-delta rgb(9,9,11) vs rgb(10,10,10) is the documented `--ring` token family (the live's own per-page drift; /Contact and /AIAssistant carets byte-identical); (d) cursor specials (non-auto/default/pointer) IDENTICAL on all routes; user-select all-auto on both; (e) the probe artifact lesson — always use per-site CourseDetail ids (the live's `?id=seed-1` renders its not-found state, a 32,648px false delta). | **Low** (methodology) |

### Verified matching (no action)

**Standing surfaces re-verified green on the session-14 baseline (before the fixes)**:
desktop heights (at the then-documented bands), mobile heights (at the then-documented
bands), the CourseDetail like-for-like sweep ×9 (at the then-documented bands), class-set
diffs on /, /Courses, /login, /Pricing (documented gradient-form + panel-mechanism
variances only), the space-y trap sweep (clean on 12 routes), the FULL mobile-menu
battery on both sites (404px panel, 8 links, the 4px pre-CTA gap, route-close, the /Home
hero state — **no Tailwind v4 display or breakpoint bug**), text diffs (IDENTICAL ×4),
the computed shadow sweep (the session-12 `--shadow-sm` pin holds; 46 documented
oklab/rounded-full form-variance lines), and the session-13 focus-ring pin (the focused
login inputs render the byte-identical `rgb(148, 163, 184) 0px 0px 0px 4px` slot).

**New surfaces verified green**: the print comparison (finding 8a), the ::selection /
caret / cursor-specials / user-select sweeps (8b–d), the per-route font probe (the
`Inter, system-ui…` declaration is byte-identical on 9/10 routes after the fix),
the hover-variant scale rules (`hover:scale-105` etc. are different class names —
untouched by the dead-scale pin; the session-12 hover-parity work stands), and the
mobile-menu battery after the fixes (panel 404px byte-exact, trigger classes identical).

### Accepted variances (documented, no action)

The live's /login body font falls to the ENGINE default stack (`ui-sans-serif, …`) — its
runtime auth bundle omits the body-font rule; the clone declares the app-wide
`Inter, system-ui, -apple-system, sans-serif` on every route (the rendered font is
identical in every environment without a locally-installed Inter; with one installed the
clone's /login renders Inter — the app's clear design intent — while the live renders the
system font). The live's 8 inert runtime-preset ::selection rules on /login (no matching
elements). The live's scroll-reveal ENTRY animation (35 elements fade/slide in on first
scroll; the clone renders everything visible immediately — the end states match; the
reveal's inline `transform: none` is what finding 4 replicates). The `--ring` caret
micro-delta (documented family). All previously documented variances (oklab color forms,
`calc(infinity*1px)` rounded-full, the gradient class form, the panel mechanism, the
ARIA/scroll-lock hardening, lucide path-count variants, the empty-slot shadow forms).

---

## B. Remediation plan (execution order — TDD: specs RED first, then GREEN)

### Phase 1 — RED: pin the reference state in specs

- [1a] `tests/e2e/nexuslearn.spec.ts` — new `session-14 parity` describe blocks
  (production build, desktop viewport unless noted):
  - **Block 1 — the button cursor (finding 2)**: on /login every `button` computes
    `cursor: pointer` and NO element inside a button computes `default` (RED now: 4
    buttons compute `default`); on / every button computes `pointer` (RED now: all 15
    compute `default`); GUARD: the form labels keep `cursor: default` (both sites' only
    default-cursor elements) and the email input keeps `cursor: text`.
  - **Block 2 — the declared font + no webfont (finding 1)**: `document.body` computes
    `Inter, system-ui, -apple-system, sans-serif`; NO `document.fonts` entry carries the
    family `Inter` (RED now: the next/font bundle registers Inter); the html element
    carries NO font-module class (RED now: `inter_…-module__…__variable`).
  - **Block 3 — the line-height composition pins (finding 3)**: the hero H1 computes
    `line-height: 72px` (RED now: 90px); the hero P `28px` (RED now: 32.5px); the CTA
    H2 (`md:text-5xl` + `leading-tight`) `48px` (RED now: 60px).
  - **Block 4 — the dead popular-card scale (finding 4)**: the popular pricing card
    computes `scale: none` (RED now: `1.05`) and its bounding height equals its
    offsetHeight (RED now: 523 vs 498); GUARD: the `hover:scale-105` RULE still exists
    in the compiled CSS (the hover variants stay live).
  - **Block 5 — the skills CSS leak (finding 5)**: the page's stylesheets contain NO
    `::selection` rules (RED now: 2) and NONE of the canary selectors
    `.bg-indigo-500`, `.bg-lime-50`, `.bg-teal-600`, `.bg-amber-400` (RED now: present).
  - **Block 6 — the inline-label gap (finding 6)**: on /login the email field group's
    input wrapper computes `margin-top: 6px` (RED now: 0) and the group height is 74px
    (RED now: 68); the mobile (375px) /login page height is 762 (RED now: 750).
  - **Block 7 — the overridden back-button gap (finding 7)**: on the signup view the
    heading block's first gap is 8px and the block height 382 (RED now: −8/366); on the
    reset view the first gap 16px and height 286 (RED now: −8/262).
- [1b] Verify RED (DONE): the fixes were stashed and the 16 specs ran against
  the pre-fix session-13 build — **14/16 failed for exactly the pinned
  reasons** (the cursor specs received `default` on every button; the font
  specs received `Inter, "Inter Fallback"` + the `inter_…-module` html class
  + registered Inter faces; the line-height specs received 90px/32.5px/60px;
  the scale specs received `1.05` + a 523px box; the leak spec received the
  4 canary selectors; the label-gap spec received mt 0 + a font-metric
  note — see below; the back-button specs received gaps [−8, 16]/[−8, 24])
  and 2 passed by design (the label/input cursor GUARDs). Two spec-side
  fixes during GREEN: (a) the label-gap group-height assertion (74px, an
  agent-browser-Chromium font-metric value) became a browser-independent
  structural read — the LIVE measures 78 in Playwright's Chromium and 74 in
  agent-browser's (the input wrapper height differs per browser build), so
  the spec pins the margin (`mt: 6px`) + the structural relationship and
  leaves the absolute page number to the mobile-height spec (762, verified
  browser-stable); (b) the leak spec's own canary strings re-leaked the
  utilities through tests/ — the `@source not` set was extended to docs/,
  tests/, test-results/ and the root agent markdown files (app source only:
  2014 → 933 CSSOM rules on dev, 157KB → 82KB production CSS).

### Phase 2 — GREEN: the six fixes (all mechanism-validated on the dev server)

- [2a] `src/app/globals.css` `@theme` — `--font-sans: Inter, system-ui, -apple-system,
  sans-serif;` (the reference's declared stack; replaces the next/font variable).
- [2b] `src/app/layout.tsx` — remove the `next/font/google` Inter import, the `inter`
  const and the `inter.variable` html className (no webfont loads; the html element
  matches the reference's classless state).
- [2c] `src/app/globals.css` `@layer base` — restore the exact v3 preflight rule
  `button, [role="button"] { cursor: pointer; }` (utilities still win for any
  element-level `cursor-*` class).
- [2d] `src/app/globals.css` — the four UNLAYERED media-scoped line-height pins
  (`.sm\:text-5xl.leading-tight`, `.md\:text-5xl.leading-tight`,
  `.md\:text-7xl.leading-tight` → `line-height: 1`;
  `.md\:text-xl.leading-relaxed` → `line-height: 1.75rem`).
- [2e] `src/app/globals.css` — the UNLAYERED `.scale-105 { scale: none; }` pin
  (the plain utility only; hover/group-hover/active variants are different classes).
- [2f] `src/app/globals.css` — the UNLAYERED `@source not "../../skills";` (stops the
  51% CSS leak; 2014 → 987 rules on the dev server).
- [2g] `src/app/globals.css` — the two UNLAYERED space-y engine-repair pins:
  `.space-y-1\.5 > label + * { margin-block-start: calc(var(--spacing) * 1.5); }` and
  `.space-y-4 > .\-mb-2 + *` (+ the sm:space-y-6 @media twin) restoring v3's
  follower-side gap for the inline-label and back-button patterns.
- [2h] GATES (DONE): `lint → typecheck → test → build → test:e2e` —
  **171/171 e2e** (155 → 171, +16; zero regressions), 31/31 unit, lint ✓,
  typecheck ✓.

### Phase 3 — Verification (ALL DONE)

- [3a] Full gate green: 171/171 e2e, 31/31 unit, lint ✓, typecheck ✓, build ✓.
    The final height state after ALL fixes: **every measurement byte-exact**
    (11 routes × 2 viewports + the CourseDetail ×9 sweep — the first fully
    byte-exact state in the project's history); the sibling-gap audit 20/20
    route×viewport combos at parity; the per-view login gap audit 4/4 views
    at parity; the cursor histograms zero-default on both sites; the font
    probe (declared stack + no webfont + system-width render) green; the
    popular card scale none + 498px on both sites; the leak canaries absent;
    the regression battery (class diffs, text diffs, the shadow sweep, the
    focus-ring pin, the mobile-menu battery) all green.
- [3b] Playwright re-verification vs live (synced viewports):
  - the FULL height sweeps: 11 routes × 2 viewports — expect ALL BYTE-EXACT
    (the first time in the project's history);
  - the CourseDetail ×9 sweep — expect ALL BYTE-EXACT;
  - the sibling-gap audit (10 routes × 2 viewports) + the per-view login gap audit —
    all parity;
  - the cursor histograms (/, /login) — zero default-cursor elements on both sites;
  - the font probe (body stack + empty Inter font set + the system-width render);
  - the popular-card probe (scale none + 498px box on both sites);
  - the CSS leak canaries (no ::selection, no leaked color utilities);
  - the regression battery: class diffs, text diffs, the shadow sweep, the focus-ring
    pin, the mobile-menu battery.

### Phase 4 — Screenshots & docs

- [4a] Fresh dev-server screenshots → `docs/screenshots/` (the standard route set:
  12 desktop routes + login views + 5 mobile + both open-menu states, captured at
  the new byte-exact rendering).
- [4b] Docs: README (badge + the session-14 description), AGENTS.md (NEW gotchas:
  the five new v4 traps — cursor preflight, line-height composition, inline space-y,
  :where() gap override, the reveal-killed scale — + the font-parity principle + the
  skills @source exclusion), CLAUDE.md (pyramid), PAD ([S14] + §7.1 + the corrected
  scroll-reveal record), `nexuslearn-template_SKILL.md` v3.2.0 (the trap catalog §4.4
  extension + the new audit surfaces in Appendix A),
  `docs/remediation-plan-session14.md` (this plan), `docs/session_24.md`, the repo
  `worklog.md`. `.env.example` re-verify (no env surface change).

### Phase 5 — Ship

- [5a] Final full gate; single commit on `main`; SSH-wrapper push (with `--remote`
  pointed at this repo); operator key shredded.

---

## C. Extracted reference data (verbatim live values)

**Live font state** (all 10 routes): `document.fonts` EMPTY (no @font-face anywhere);
body computes `Inter, system-ui, -apple-system, sans-serif` on 9/10 routes (the runtime
inline sheet's `body` rule) and the v3 default stack `ui-sans-serif, system-ui, …` on
/login (the auth bundle omits the rule); html computes the v3 default stack; the
rendered font = system-ui (probe "NexusLearn Hamburgefonstiv 123" at 32px = 546.02 =
system width; Inter would be 509).

**Live cursor state**: the v3 static sheet AND the runtime sheet both ship
`button, [role="button"] { cursor: pointer; }`; on / ZERO elements compute
`cursor: default`; on /login only the 2 form labels compute default.

**Live line-height winners** (the variant-order composition): hero H1
(`md:text-7xl` + `leading-tight`) → `line-height: 1` (72px at 72px font); hero P
(`md:text-xl` + `leading-relaxed`) → `line-height: 1.75rem` (28px at 20px font); CTA H2
(`md:text-5xl` + `leading-tight`) → `line-height: 1` (48px). v3 rule positions: base
`.text-xl` @522, `.leading-relaxed` @532 — media blocks `.sm\:text-5xl` @936-ish,
`.md\:text-xl` @939 (the variant blocks emit AFTER every base utility).

**Live popular-card state** (post-reveal resting state): inline
`style="opacity: 1; transform: none;"`; computed `scale: none`, `transform: none`;
bounding height 498 (= offsetHeight; the `.scale-105` class present but dead); the
feature-list gaps 16px, the check icons 20×20.

**Live scroll-reveal system**: 35 pre-hidden elements on / (inline
`opacity: 0; transform: translateY(20px)`), 4 on /Pricing, 4 on /About, 3 on /Courses,
6 on /BecomeInstructor, 0 on /Contact; all reveal on scroll (leaving inline
`opacity: 1; transform: none`).

**Live login-view sibling gaps** (the space-y engine): signin — at parity pre-fix;
signup `space-y-4` header [button(-mb-2), h2, form] gaps [8, 16], block H 382; reset
`space-y-4 sm:space-y-6` header [button(-mb-2), div.text-center, form] gaps [16, 24],
block H 286; reset-sent — at parity (the button is not first).

**Live /login mobile page height**: 762 (375×667).

**Clone fix targets**: body `Inter, system-ui, -apple-system, sans-serif`; zero Inter
`document.fonts` entries; every button `cursor: pointer`; H1 lh 72px / P lh 28px /
H2 lh 48px; popular card `scale: none` + 498px; no `::selection` rules; no
`.bg-indigo-500`/`.bg-lime-50`/`.bg-teal-600`/`.bg-amber-400` selectors; email-group
input wrapper mt 6px, group H 74; signup header gaps [8,16] H 382; reset [16,24] H 286;
mobile /login 762.
