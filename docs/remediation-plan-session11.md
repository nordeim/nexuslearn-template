# NexusLearn Remediation Plan — Session 11

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; agent-browser sessions `live` + `clone`, synced viewports per
the session-10 rule). The audit re-verified every standing surface (desktop + mobile height
sweeps across 11 routes, per-route unique class-set diffs on the `main`/`nav`/`footer`
subtrees, a like-for-like CourseDetail sweep across all 9 courses with the live course ids,
the full mobile-menu interaction battery on both sites, the space-y trap sweep on 12 routes,
head metadata, course data, error states, keyboard focus) and added THREE fresh-eyes
surfaces: a **breakpoint-zone sweep** (640/767/768/1024/1279/1280 — the md/lg boundaries
where the nav swap and grid columns flip; never audited in sessions 1–10), an **interactive
behavior sweep** (catalog search/filter/sort, About toggle, FAQ structure, login error
state, keyboard tab chain), and a **visible-text content diff** (normalized `innerText`
of `main` — catches copy and glyph drift that height and class audits structurally cannot).

**Rule**: `skills/` folder excluded from checking/testing/compilation (re-verified:
tsconfig `exclude`, eslint `ignores`, vitest `include` matches `src/**` + `tests/**`
only, playwright `testDir: ./tests/e2e`).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ ·
133/133 e2e ✓ (session-10 state, commit `ec18215`, confirmed green on the pulled clone).

**Session-11 focus**: sessions 1–10 closed static, shell, content, sub-section,
interactive-state, head-metadata, OG-identity, class-verbatim, display-order,
section-design, seed-idempotency, space-y-engine, navbar-chrome and route-state-chrome
parity. The remaining drift found by the text-content diff concentrates in **copy and
glyph fidelity** (a learning-path card description and the testimonial quote marks) and
**view-state card ownership** (the login card's 5-view state machine renders its
non-signin views inside the signin chrome; the live app swaps the whole card interior).

---

## A. Findings inventory (live vs clone)

| # | Finding | Severity |
|---|---------|----------|
| 1 | **The Digital Marketing Pro learning-path card description drifted.** The landing's third learning-path card (and `/Home`'s — same component) renders the pre-session-3 clone copy: "Learn modern marketing from SEO and content strategy to paid ads and marketing automation." The live app renders: "Learn SEO, paid ads, social media strategy, and analytics to drive real business growth." Root cause: `src/app/page.tsx:87` (`LEARNING_PATHS[2].description`). Both strings are single-line descriptions that wrap to the same card height at every audited viewport, so no height sweep or class diff could catch it. Found by the new normalized-text diff (`/` ratio 0.9813, line 124 of 214). | **Medium** |
| 2 | **The testimonial quotes render typographic quotes; the live app renders ASCII quotes.** All three testimonial paragraphs on the clone start with U+201C (`“`) and end with U+201D (`”`) — measured `charCodeAt(0)` 8220/8221 on the clone vs 34/34 (`"` straight ASCII) on the live app. Root cause: `src/app/page.tsx:540` wraps the quote as `&ldquo;{t.quote}&rdquo;`. The live markup uses plain `"` characters. Invisible to class diffs and (nearly) to height sweeps; found by the text-content diff (lines 167/170/173). | **Low** |
| 3 | **The login card's non-signin views render inside the static signin chrome.** The live login card is a 5-view state machine that owns the WHOLE card interior: on reset / reset-sent / signup / verify the logo ring, the `h1` "Welcome to NexusLearn", the "Sign in to continue" subtitle, the Google button and the OR divider are ALL absent — the card body is `div.w-full > div.space-y-4(.sm:space-y-6) > [Back button + h2 block + form]`. The clone statically renders the signin chrome in `src/app/login/page.tsx` around `<LoginForm/>`, so every non-signin view shows the logo + h1 + Google + OR above the view content (confirmed by per-view class-set diffs: the clone-only token sets on reset/signup/reset-sent/verify are exactly the chrome classes; measured live innerText per view). Sub-findings: **(3b)** the non-signin views also need the `div.w-full` wrapper (the live renders them as the direct child of the `flex flex-col items-center text-center space-y-6 sm:space-y-8` interior — the clone's current `div.w-full > div.space-y-3` wrapper belongs to the signin chrome); **(3c)** the live reset-view email input is the `text-base` variant (`… px-3 py-2 text-base ring-offset-background … placeholder:text-slate-400` — no `text-sm sm:text-base` tail; the signup inputs DO carry `text-sm sm:text-base`, and the clone's COMPACT_INPUT_CLS already matches those) — the reset view needs its own input class string. Found by per-view innerText + class-set diffs of all 5 login views (only the signin view was ever class-diffed before). | **High** |

### Verified matching (no action)

**Mobile navigation menu — full battery on BOTH sites at 375×667 (the standing Tailwind
v4 watchpoint — NO display-mismatch bug, NO space-y resurrection, NO breakpoint bug):**
trigger bare strings in both nav states (hero `md:hidden p-2 rounded-lg text-white/80`,
white-nav `text-gray-700`); the open panel measures the reference 404px inner on both
sites; the CTA renders the reference 4px pre-CTA gap (clone `block` + 4px
margin-block-end = live `block mt-3` under the v3 engine); 8 panel links; desktop row
`display:none` at 375px; route-change close on both; the `/Home` hero-state trigger
(session-10 fix) confirmed on arrival. **NEW breakpoint-zone sweep (640/767/768/1024/
1279/1280 on the landing): the trigger↔desktop-row flip happens at exactly 768px on both
sites, the category grid flips sm 3→lg 4 columns and the featured grid 1→md 2→lg 3
columns identically, and the panel opens identically at 767px (404px, opacity 1) — no
Tailwind v4 breakpoint drift anywhere in the zone.** Grid layouts at boundary viewports
on /Pricing, /CourseDetail and /Dashboard: identical. **Interactive sweep:** catalog
search "python" → the same 3 courses in the same order; sort "Price: Low to High" → the
identical 9-course order; category filter "Programming" → the same 2 courses; the
CourseDetail "About This Course" toggle flips to "Show Less" identically; the /Pricing
FAQ is a static stack (h3 questions, no accordion) on both; the wrong-password error
("Invalid email or password", stays on /login) identical; the keyboard tab chain
(logo → Home → Courses) with identical computed outlines. Desktop heights: byte-exact
on /AIAssistant, /Pricing, /Contact, /BecomeInstructor, /Dashboard, /login, 404;
documented font bands on / (−30), /Home (−30), /Courses (−49), /About (−29). Mobile
heights: ALL exactly at the documented session-8 bands. CourseDetail like-for-like on
all 9 courses with the live ids: 7× +1px, WebDev/UIUX −25px (documented bands). Class-set
diffs (main + nav + footer subtrees on 10 routes): only the documented variances (the
gradient class form, the panel mechanism classes, the login/reset trigger order n/a).
Space-y trap sweep: clean on all 12 routes. Head metadata (titles, og:title, canonicals
— origin aside) and the root description: identical on /, /Courses, /CourseDetail. All
9 catalog prices identical. Signed-in dashboards both render the zeroed state ("Welcome
back, sepnetflix2023", 0/0/0/0%). AI chat returns real answers on the clone. **Text
content: IDENTICAL on /Courses, /Dashboard, /login (signin view), /About, /Contact,
/BecomeInstructor, /Pricing, /AIAssistant, the footer, the 404, and CourseDetail for
WebDev (789 lines), UI/UX (448) and DigitalMarketing (408).**

### Accepted variances (documented, no action)

The font-metric wrap bands (live resolves system "Inter" with no @font-face); the hero
gradient class form (clone's sRGB arbitrary form — computed-identical); the clone's
a11y hardening (ARIA wiring, scroll lock, Escape, `main` landmark on the 404,
`min-h-dvh` page roots, alt text); live's scroll-reveal wrappers + classless per-card
wrapper divs; real enrollment vs live's dead Enroll button; working Python course
image; clone's dev-only Next.js dev-tools overlay; lucide path-count variants (identical
glyphs); the live logo served from supabase storage vs the clone's `/logo.png`.

### Audit methodology addition (recorded for future sessions)

**The visible-text content diff is now a standing audit surface.** Height sweeps absorb
single-line copy changes (same layout), class-set diffs never see text content, and
computed-style gates never see glyph choice (U+201C vs U+0022 renders at identical
metrics in most stacks). The normalized `innerText` diff (collapse whitespace, split
lines, SequenceMatcher) over `main` (+ footer + the login card's per-view interiors)
found every content-level drift instantly. Also: **per-view state diffs** — a stateful
component's views (login's 5, the mobile panel's open state, the navbar's 2 states)
must each be diffed against the live equivalent; a default-state-only diff missed the
login chrome persistence for six sessions.

---

## B. Remediation plan (execution order — TDD: specs RED first, then GREEN)

### Phase 1 — RED: pin the reference state in specs

- [1a] `tests/e2e/nexuslearn.spec.ts` — new `session-11 parity` describe block
  (landing, desktop viewport):
  - **The Digital Marketing Pro path card carries the live description**: the
    learning-path section's third card description is exactly "Learn SEO, paid ads,
    social media strategy, and analytics to drive real business growth." (RED now: the
    clone renders the pre-session-3 copy).
  - **Testimonial quotes render ASCII double quotes**: each testimonial paragraph
    starts with `"` (U+0022) and ends with `"` — assert `charCodeAt(0) === 34` and
    `charCodeAt(len-1) === 34` (RED now: 8220/8221).
- [1b] Same describe block (login, desktop viewport):
  - **The reset view replaces the card interior**: click "Forgot password?" → the h1
    "Welcome to NexusLearn", the Google button and the OR divider are all ABSENT; the
    card's only heading is the h2 "Reset your password"; the Back button is present
    (RED now: h1 + Google + divider all present).
  - **The reset email input is the text-base variant**: `classList` contains
    `text-base` and does NOT contain `sm:text-base` (RED now: `text-sm sm:text-base`).
  - **The reset-sent view replaces the card interior**: submit the reset form → the h1
    and Google button absent, h2 "Check your email" present (RED now: chrome present).
  - **The signup view replaces the card interior**: click "Need an account? Sign up" →
    h1/Google/divider absent, h2 "Create your account" present (RED now).
  - **The verify view replaces the card interior**: complete a signup (fresh random
    email, session-5 pattern) → h1/Google/divider absent, h2 "Verify your email"
    present (RED now).
- [1c] Verify RED: run the 7 new specs against the current build — expect ALL 7 to
  fail for exactly the pinned reasons (the 2 landing copy/glyph specs + the 5 login
  interior specs).

### Phase 2 — GREEN: the three fixes

- [2a] `src/app/page.tsx:87` — swap `LEARNING_PATHS[2].description` to the live string:
  "Learn SEO, paid ads, social media strategy, and analytics to drive real business
  growth."
- [2b] `src/app/page.tsx:540` — the testimonial paragraph renders `"{t.quote}"`
  (literal ASCII double quotes) instead of `&ldquo;{t.quote}&rdquo;`.
- [2c] The login card-interior ownership refactor:
  - `src/app/login/page.tsx` — the card keeps ONLY the shell (gradient bar, padding,
    the `flex flex-col items-center text-center space-y-6 sm:space-y-8` interior
    wrapper) and renders `<LoginForm/>` as its single child; the logo block, the h1
    block, the Google button and the OR divider move into the LoginForm's signin
    branch. The mobile-only spacer under the card stays in page.tsx (it is outside
    the card on the live app too).
  - `src/components/LoginForm.tsx`:
    - the **signin** view returns the full chrome as a fragment — the logo block
      (`div.relative.group` with the ring + glow + `/logo.png` img), the h1 block
      (`div.space-y-2.sm:space-y-3` with "Welcome to NexusLearn" + "Sign in to
      continue"), and `div.w-full > div.space-y-3 > [Google button, OR divider,
      the existing sign-in form]` — byte-identical to today's signin DOM (the
      session-5 shell specs must stay green untouched);
    - the **reset / reset-sent / signup / verify** views wrap their existing content
      in `div.w-full` (their `div.space-y-4…` becomes the direct card interior, per
      the live dumps);
    - add `RESET_INPUT_CLS` — the live reset-view email input string (`text-base`
      after `py-2`, no `text-sm sm:text-base` tail) — and use it in the reset view
      (COMPACT_INPUT_CLS stays for signup, which the live confirms).
  - No behavioral changes: the same fetch flows, the same view transitions, the same
    ARIA/error handling. The Google button remains a dead template button (documented
    variance).
- [2d] GATES: `lint → typecheck → test → build → test:e2e` (expect 133 → 140).
  - Spec maintenance risk: the session-5 "login card shell" specs assert the logo,
    the divider and the Google button on the SIGNIN view — they keep passing because
    the chrome now renders from the signin branch (verify each).

### Phase 3 — Verification

- [3a] Full gate green (140/140).
- [3b] agent-browser re-verification vs live (BOTH sessions at matching viewports):
  - the landing text diff is IDENTICAL on `/` and `/Home`;
  - the login per-view class-set diffs are IDENTICAL on all 5 views (the signin view's
    IDENTICAL result must be preserved);
  - the login card interior HTML per view matches the live dumps (structure walk);
  - the /login height stays byte-exact (1080) on the signin view; the non-signin view
    heights compared live vs clone;
  - the mobile menu battery re-run green (regression — the refactor touches no nav
    code, but the battery is the standing watchpoint);
  - the /Courses + / regression class diffs unchanged.

### Phase 4 — Screenshots & docs

- [4a] Fresh dev-server screenshots → `docs/screenshots/` (the standard route set —
  desktop + mobile + the open mobile menu) PLUS the new session-11 captures: the
  login reset view, the signup view and the verify view (the fixed card interiors).
- [4b] Docs: README (badge 171, testing rows + the session-11 description), AGENTS.md
  (gotcha 13 rewrite — the 5-view state machine owns the whole card interior; the
  testimonial ASCII quotes + the path-card copy in the landing gotchas; 140 specs),
  CLAUDE.md (pyramid 31+140, the parity behaviors list), PAD ([S11] revision + §7.1
  distribution + §10), `nexuslearn-template_SKILL.md` v2.9.0 (the text-content audit
  surface + the per-view state diff pattern + the 11-session description + test
  inventory), `.env.example` re-verify, this plan, `docs/session_18.md` session log,
  `worklog.md`.

### Phase 5 — Ship

- [5a] Final full gate; single commit on `main`; SSH-wrapper push (with `--remote`
  pointed at this repo); operator key shredded.

---

## C. Extracted reference data (verbatim live strings)

**Live Digital Marketing Pro path card description**:
`Learn SEO, paid ads, social media strategy, and analytics to drive real business growth.`

**Live testimonial paragraph** (first chars): `"` U+0022 … `"` U+0022
(clone currently: U+201C `“` … U+201D `”` via `&ldquo;`/`&rdquo;`).

**Live login card interior — signin view**:
`div.p-8 > div.flex.flex-col.items-center.text-center.space-y-6.sm:space-y-8 >
[div.relative.group (logo ring + glow), div.space-y-2.sm:space-y-3 (h1 + subtitle),
div.w-full > div.space-y-3 > [Google button, OR divider, form.space-y-4.sm:space-y-5]]`
(byte-identical to the clone's current DOM — the chrome simply moves into the
LoginForm's signin branch).

**Live login card interior — non-signin views** (reset / reset-sent / signup / verify):
`div.p-8 > div.flex-col… > div.w-full > div.space-y-4(.sm:space-y-6) > view content`
— NO logo, NO h1, NO subtitle, NO Google button, NO OR divider.

**Live reset-view email input classes** (the `text-base` variant):
`flex w-full border px-3 py-2 text-base ring-offset-background file:border-0
file:bg-transparent file:text-sm file:font-medium file:text-foreground
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm
pl-10 h-10 sm:h-11 bg-slate-50/50 border-slate-200 focus:border-slate-400
focus:ring-slate-400 rounded-xl placeholder:text-slate-400`

**Live signup-view email input classes** (confirms the existing COMPACT_INPUT_CLS):
same string with `text-sm sm:text-base` (no `text-base` after `py-2`).

**Live verify-view code-input classes**: identical to the clone's CODE_INPUT_CLS.
