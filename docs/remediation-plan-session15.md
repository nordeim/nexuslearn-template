# NexusLearn Remediation Plan — Session 15

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; Playwright parity probes + agent-browser sessions with synced
viewports at 1920×1080 + 375×667). The audit re-verified every standing surface from
sessions 1–14 and added TWO fresh-eyes surfaces suggested by the session-14 transcript
(`docs/session_25.md`): the **scroll-reveal ENTRY animation replication** and the
**forced-colors / accessibility rendering sweep**.

**Rule**: `skills/` folder excluded from checking/testing/compilation (re-verified:
tsconfig `exclude`, eslint `ignores`, vitest `include` matches `src/**` + `tests/**`
only, playwright `testDir: ./tests/e2e`, and the session-14 `@source not` set keeps
skills/docs/tests out of the compiled CSS — this session closes the LAST hole in that
set, finding 1).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ ·
**170/171 e2e** — the session-14 CSS-leak spec is RED on the shipped session-14 tree
(finding 1). All standing visual surfaces re-verified GREEN at the session-14
byte-exact state: desktop heights 11/11, mobile heights 11/11, CourseDetail ×9,
class diffs (documented variances only), the space-y sweep (clean ×12), text diffs
(IDENTICAL ×4), the FULL mobile-menu battery on both sites (404px panel, 8 links,
4px pre-CTA gap, route-close, Escape-close, scroll lock, /Home hero state — no
Tailwind v4 display or breakpoint bug), the computed shadow sweep (46 documented
form-variance pairs, `--shadow-sm` pin holds), and the session-13 focus-ring pin
(byte-identical slate-400 slot).

**Session-15 focus**: sessions 1–14 closed every static, content, state, computed-style,
cascade, font and preflight surface — every height measurement byte-exact. The two
remaining gaps this session closes: the **post-gate worklog write re-leaked the CSS
canary through the repo-root `worklog.md`** (the one root file missing from the
`@source not` set — the session-14 entry quoting `.selection:bg-red-200` was written
AFTER the final gate run, so the shipped tree fails its own leak spec), and the
**scroll-reveal ENTRY animation** — the last documented visible behavioral variance
(the live pre-hides 103 elements across 9 routes with inline
`opacity: 0; transform: translate…`, reveals them on scroll with measured per-section
animation families, and leaves `opacity: 1; transform: none` inline forever; the clone
renders everything visible immediately).

---

## A. Findings inventory (live vs clone)

| # | Finding | Severity |
|---|---------|----------|
| 1 | **The repo-root `worklog.md` re-leaked the CSS canary (a post-gate doc-write regression).** The session-14 worklog entry (written after the final e2e gate ran) quotes the canary strings `.selection:bg-red-200` / `selection:text-red-900` verbatim; the root `worklog.md` was the ONE root markdown file missing from the session-14 `@source not` set (skills/, docs/, tests/, test-results/, AGENTS.md, CLAUDE.md, README.md, PAD, nexuslearn-template_SKILL.md, scandihaven_SKILL.md were excluded — worklog.md was not). Tailwind v4's automatic source detection re-scans it on every build: the compiled sheet again contains `.selection\:bg-red-200 ::selection` (verified in `.next/static/chunks/*.css`), and the session-14 leak spec (`no ::selection rules and no skills-leaked color utilities in the stylesheets`) FAILS on the shipped tree — 170/171 at baseline. Process lesson: any file written after the final gate run can invalidate the gate; the leak spec must be the LAST gate re-run before commit. | **Medium** |
| 2 | **The scroll-reveal ENTRY animation — the live animates content in, the clone renders it instantly (the last documented visible behavioral variance; remediation-plan-session14.md listed it as accepted).** Measured on the live (Playwright, frame-resolution sampling, `document.fonts`-style probes + fresh contexts): the Base44 runtime ships **framer-motion** (confirmed in `assets/index-D62KTPtG.js`) and pre-hides **103 reveal targets** with inline styles at mount — `/` + `/Home` 40, `/Courses` 12, `/Pricing` 10, `/About` 12, `/Contact` 6, `/BecomeInstructor` 13, `/AIAssistant` 3, `/Dashboard` 5, `/CourseDetail` 2, `/login` 0 — then reveals each element ONCE when it scrolls into view (one-way; never re-hides), leaving inline `opacity: 1; transform: none;` FOREVER (the same mechanism session 14 proved kills the popular card's `scale-105`). The clone renders everything visible immediately. Pre-hide variants (measured exact style strings): `opacity: 0; transform: translateY(20px);` (standard), `translateY(30px)` (the `/` hero blocks), `translateY(10px)` (/Pricing FAQ items), `translateX(-30px)` / `translateX(30px)` (the AI-section header, the Become-an-Instructor image/content pair, the /About Our-Story pair), and `opacity: 0;` alone (the `/` hero stats bar). **Animation families (frame-resolution curve fits):** **A "snappy"** — opacity ~310ms ease-out tween + transform a damped spring (ζ≈0.56, ωn≈27 rad/s: settle ~280ms, 12% overshoot to −2.4px) — category cards, ALL section headers, the newsletter, the AI-section header (X, ~130ms), every other route's hero blocks and card grids (/Courses cards ~255ms, /Dashboard stats ~269ms, /About stats/values ~246–285ms, /BI how-it-works ~285ms, /Contact ~323ms, /CourseDetail ~267ms, /AIAssistant ~285ms); **B "floaty"** — the same ~310ms opacity tween + a slow back-loaded transform ease ~560–730ms, no overshoot — the featured-course, learning-path, AI-feature, testimonial, pricing (/) and /BI why-teach cards; **HERO** (the `/` + `/Home` hero only) — a coupled ~735ms ease-out, y from 30, the five hero blocks staggered ~100–150ms apart on mount; **FAQ** — a slower coupled ~500–610ms from y=10 (/Pricing FAQ items); **X** — transform spring with ~7–10% overshoot, settle 130–300ms (the ±30px sliders). **Stagger:** sibling cards in a grid start ~100ms apart (measured deltas 41–159ms across routes; the section header starts with the first card). **Mount behavior:** elements in the initial viewport animate at mount; `/About` is mount-animated in full (its below-fold values cards reveal at load without any scroll — measured start 655ms, no intersection); every other route's below-fold targets wait for scroll. **Trigger:** IntersectionObserver-like, any-pixel visibility, ~10–36ms intrinsic latency (instant-scroll probes); only elements in the initial viewport reveal at mount — every below-fold target (incl. /About's values cards, verified twice: hidden at 2.6s, revealed on scroll) waits for scroll. The end state is byte-identical everywhere: `opacity: 1; transform: none;`. | **High** |
| 3 | **Forced-colors / accessibility rendering: VERIFIED AT PARITY (no action).** Emulated `forced-colors: active`, `prefers-contrast: more`, `inverted-colors: inverted`, and dark color-scheme on both sites (fresh Playwright contexts): every probe is IDENTICAL (forced-colors: both sites fall to the UA palette — bodyBg white, bodyColor black, transparent nav, black button borders; contrast/inverted/dark: no site rules fire on either side — identical computed colors). Neither site ships a single forced-colors or contrast rule; the rendering is pure UA behavior on both. | **Low** (methodology) |

### Verified matching (no action)

**Standing surfaces re-verified green on the session-15 baseline**: desktop heights
11/11 byte-exact, mobile heights 11/11 byte-exact, CourseDetail ×9 byte-exact, class
diffs on /, /Courses, /login, /Pricing (documented gradient-form + panel-mechanism
variances only), the space-y trap sweep (clean ×12), text diffs (IDENTICAL on /,
/Courses, /login, /Pricing), the FULL mobile-menu battery on both sites (panel 404px
byte-exact, 8 links, the 4px pre-CTA gap, route-change close, Escape close, scroll
lock, the /Home hero-state trigger — **no Tailwind v4 display or breakpoint bug**), the
computed shadow sweep (46 documented oklab/rounded-full form-variance pairs; the
session-12 `--shadow-sm` pin holds), and the session-13 focus-ring cascade pin (the
focused login inputs render the byte-identical slate-400 ring slot on both sites).

**New surfaces verified green**: the forced-colors / prefers-contrast /
inverted-colors / dark-scheme emulations (finding 3) and the reveal system's END state
(pinned since session 14 — the popular card unscaled at 498px, the
`.scale-105 { scale: none }` pin).

### Accepted variances (documented, no action)

The live's reveal system is framer-motion (a ~50KB dependency); the clone replicates
the OBSERVABLE behavior (pre-hide state, trigger, per-family curves, stagger, one-way
end state) with a zero-dependency WAAPI controller — the library is an implementation
detail, not a rendered surface. The mount-time latency differs (the live's CSR mount
+ framer attach ≈ 630–1000ms after load; the clone's hydration ≈ 100–300ms — both
"on load", imperceptible). The stagger microstructure jitters 41–159ms on the live
itself (main-thread load); the clone models a constant 100ms. The live's `/` hero
stats bar and the Our-Story pair show micro-divergent stagger patterns (0 vs 61ms) —
the clone's per-parent model approximates them. All previously documented variances
(oklab color forms, `calc(infinity*1px)` rounded-full, the gradient class form, the
panel mechanism, the ARIA/scroll-lock hardening, lucide path-count variants, the
empty-slot shadow forms, the /login engine-default font stack).

---

## B. Remediation plan (execution order — TDD: specs RED first, then GREEN)

### Phase 1 — RED: pin the reference state in specs

- [1a] `tests/e2e/nexuslearn.spec.ts` — new `session-15 parity` describe blocks
  (production build, desktop viewport unless noted):
  - **Block 1 — the reveal pre-hide state (finding 2)**: on `/` after hydration, a
    below-fold category card's style attribute reads exactly
    `opacity: 0; transform: translateY(20px);` and its computed opacity is 0 (RED now:
    no inline style at all); the AI-section header reads `translateX(-30px)`, the
    Become-an-Instructor image `translateX(30px)`, the /Pricing FAQ items
    `translateY(10px)`, the / hero stats bar `opacity: 0;` alone, and the / hero H1
    block family `translateY(30px)` (probed fast, pre-reveal).
  - **Block 2 — the reveal animation + end state**: scroll a category card into view
    → it is NOT instantly visible (opacity < 0.995 at ~120ms) and IS complete
    (opacity ≥ 0.99 + style attribute exactly `opacity: 1; transform: none;`) by
    ~900ms (RED now: instantly 1 with no style change); the reveal is ONE-WAY
    (scroll back to top → still `opacity: 1; transform: none;`).
  - **Block 3 — the sibling stagger**: scrolling the 3 testimonial cards into view
    together reveals them sequentially — the last card's end-state time is ≥ 80ms
    after the first's (RED now: all instant).
  - **Block 4 — the route target inventory**: the data-reveal element counts per
    route match the live's measured inventory — `/` 40, `/Courses` 12, `/Pricing` 10,
    `/About` 12, `/Contact` 6, `/BecomeInstructor` 13, `/AIAssistant` 3, `/Dashboard`
    5, `/CourseDetail` 2, `/login` 0 (RED now: 0 everywhere).
  - **Block 5 — mount behavior**: only in-view targets reveal at mount (the /
    hero blocks complete their animation ~2s after load); /About's below-fold
    values cards stay hidden until scrolled (RED now: no inline styles).
  - **Block 6 — GUARD (the reveal cannot break the pinned parity)**: the popular
    pricing card still measures 498px wide pre- AND post-reveal (inline
    translateY(20px) then transform:none both keep the session-14 unscaled pin); the
    hero H1's session-14 line-height pin still reads 72px post-reveal; the document
    scrollHeight of / is unchanged by the system (7949 desktop — transforms and
    opacity do not affect layout).
- [1b] The existing session-14 leak spec stays RED until 2a (it is the finding-1 pin).

### Phase 2 — GREEN (implementation; zero class-string changes — attributes, inline styles and one CSS exclusion line only)

- [2a] **`src/app/globals.css`** — add `@source not "../../worklog.md";` to the
  session-14 exclusion set (closes finding 1; the root markdown set is then fully
  excluded). Re-run the leak spec → GREEN.
- [2b] **`src/components/reveal/RevealController.tsx`** (new client component):
  - On mount: collect `[data-reveal]`, normalize each target's style attribute to the
    exact live pre-hide serialization for its variant (`opacity: 0; transform:
    translateY(20px);` etc. — the SSR markup ships React-serialized
    `opacity:0;transform:translateY(20px)`; the controller re-serializes to the
    live's spaced form pre-paint-equivalent), then reveal via IntersectionObserver
    (threshold 0 — any pixel; matches the measured any-pixel trigger) — except
    below-fold targets (none — every route uses the same IO contract; the /About
    mount-animated reading was a transcription error, corrected during GREEN).
  - The stagger: within each IntersectionObserver batch, a target's delay = its index
    among the data-reveal siblings of its own parent × 100ms (the measured grid
    pattern: header + first card together, then +100ms per card).
  - The animation (WAAPI, zero dependencies): per family — **A** opacity
    [{0},{1}] 310ms ease-out keyframes + transform spring keyframes (ζ=0.561,
    ωn=27.1 rad/s, sampled to ~14 keyframes, linear easing, settle 280ms, overshoot
    to −2.4px); **B** the same opacity tween + the measured slow back-loaded y table
    (~700ms, keyframes at 0/43/64/80/92/100% → 20/19.4/16.7/7.4/2.4/0px); **HERO**
    the measured coupled ~735ms table (y 30→0, opacity tracking); **FAQ** the A
    curves at 610/500ms from y=10; **X** the spring (ζ≈0.55, settle ~250ms, 7–10%
    overshoot) from ±30px with the 310ms opacity tween. All durations/curves baked
    from the live measurements recorded in this plan (§A finding 2).
  - On finish: set `el.style.opacity = "1"` and `el.style.transform = "none"`
    (serializes to exactly `opacity: 1; transform: none;`) and remove the WAAPI
    effects — the one-way inline end state, byte-identical to the live.
  - `prefers-reduced-motion`: neither site ships an override (session-12 verified) —
    the controller does NOT special-case it (parity).
- [2c] **Markup wiring (attributes + SSR inline styles ONLY — no class changes)**:
  `src/app/page.tsx` (40 targets: the 5 hero blocks — wrapper/H1/P/CTA/stats — as
  HERO family, the 7 category cards + every section header + the newsletter as A, the
  6 featured + 3 path + 4 AI-feature + 3 testimonial + 3 pricing cards as B, the
  AI header as X-30, the BI image as X30 + content as X-30), `Courses/page.tsx` (12
  × A), `Pricing/page.tsx` (6 × A + 4 × FAQ), `About/page.tsx` (12 × A), `Contact/page.tsx` (6 × A), `BecomeInstructor/page.tsx`
  (7 × A + 6 × B), `AIAssistant/page.tsx` (3 × A), `Dashboard/page.tsx` (5 × A),
  `CourseDetail/page.tsx` (2 × A). /Home shares the landing component → covered.
  The SSR style props ship the pre-hide server-side (first paint matches the live:
  below-fold content hidden — the live is CSR and never shows it either).
- [2d] **Docs**: AGENTS.md (the reveal-system gotcha + the worklog exclusion +
  the leak-spec-last process rule), CLAUDE.md (pyramid + the reveal controller),
  README.md (badge + testing rows + the reveal feature), PAD ([S15] + §7.1),
  `nexuslearn-template_SKILL.md` (v3.3.0 — the reveal-entry surface + the audit
  methodology), this plan, `docs/session_26.md`, the repo worklog.

### Phase 3 results (executed — recorded after GREEN)

- **RED verified**: 19/21 specs failing against the pre-fix build for exactly
  the pinned reasons (2 GUARDs passed by design pre-implementation: /login 0
  targets + the scrollHeight self-comparison).
- **GREEN corrections (both caught by the verification battery)**:
  (a) the controller initially shipped on only ONE of /CourseDetail's two
  render branches — the main render's 2 targets stayed hidden forever; the
  side-by-side inventory probe found it, the controller now mounts on every
  branch, and a spec pins it (plus the not-found branch's 0 targets — the
  live's not-found state has 0 targets too); (b) the /About "mount-animated"
  reading was a transcription error — the values cards' spec-run rows read
  `start=- done=-` (they wait for scroll like every other below-fold
  target, verified twice); `mountAll` was removed and the spec pins the
  standard whileInView contract.
- **Gates**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · 193/193 e2e ✓
  (171 → 193, zero regressions).
- **Visual re-verification**: every height byte-exact (desktop 11/11, mobile
  11/11, CourseDetail ×9 — the 34 wrappers moved no layout); the
  side-by-side reveal inventory MATCHES on all 9 routes; the clone's curves
  within tolerance (A overshoot −2.2 vs the live's −2.4; B y 728-746 vs
  722-729; op ~300ms both); the catalog re-reveal on search works like the
  live's remount; the class/text/space-y/mobile/shadow/focus surfaces all
  unchanged.

### Phase 3 — VERIFY (gates + live re-audit)

- [3a] Full gate suite: lint → typecheck → 31/31 unit → build → e2e (171 + the new
  session-15 specs, zero regressions — the session-4/5/9/11/12/13/14 specs must all
  stay green through the markup changes).
- [3b] Live-vs-clone re-verification on the dev server: the reveal battery (pre-hide
  state strings, the per-family curves sampled live on both sites, the stagger, the
  one-way end state, the mount behavior on /About, /login clean) + the standing
  surfaces (heights ×11 ×2 viewports — the reveal must not move a single pixel of
  layout; class diffs — data-reveal is an attribute, invisible to the class audit;
  the mobile battery; the shadow sweep; the focus pin).
- [3c] **The leak spec re-run as the LAST gate** after every doc write (the
  finding-1 process rule — including this plan's own canary mentions).
- [3d] Screenshots: the standard set + the reveal close-ups (a mid-reveal frame, the
  post-reveal state) under `docs/screenshots/`.
- [3e] `.env.example` re-verified (the session changes no environment surface).
- [3f] Commit to main + SSH-wrapper push (`docs/ssh_git_wrapper_v3.py`).

---

## C. Risk register

| Risk | Mitigation |
|---|---|
| The reveal system breaks the byte-exact height state | Transforms + opacity never affect layout (scrollHeight); Block 6 GUARD-pins the / scrollHeight at 7949 and the height sweeps re-run in 3b. |
| Pre-hidden SSR content hurts resilience (JS off) | The live is CSR — a JS-off visitor sees NOTHING there; the clone's hidden-but-present SSR DOM is strictly more content. Documented as parity behavior. |
| Mid-animation reads break existing specs (transform-dependent assertions) | The existing transform-dependent specs measure WIDTH (498 popular card — transform-invariant) or wait ≥300ms; the full 171-spec suite in 3a is the guard. |
| The leak spec re-reds after doc writes | Process rule 3c: the leak spec re-runs LAST, after every doc write, before commit. |
| Screenshot stitching triggers mid-reveal captures | The capture script waits for the reveal end state (≥900ms settle) after each scroll before shooting. |
