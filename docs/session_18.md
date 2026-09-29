# Session 11 — Parity pass: copy + glyph fidelity + the login card-interior ownership

Continuing from session 10 (`638ca5b` + the pulled `docs/session_17.md`
transcript, remote at `ec18215`). Sessions 1–10 closed static, shell,
content, sub-section, interactive-state, head-metadata, OG-identity,
class-verbatim, display-order, section-design, seed-idempotency,
space-y-engine, navbar-chrome and route-state-chrome parity; this session
re-swept every surface with fresh eyes — again with particular attention
to the **mobile navigation menu** (the standing Tailwind v4 watchpoint) —
and added THREE new audit surfaces: a **breakpoint-zone sweep** (the md/lg
boundary zone previous audits never visited), an **interactive behavior
sweep** (catalog search/filter/sort, toggles, error states, keyboard
focus), and a **visible-text content diff** (normalized `innerText` per
route — the surface that found this session's drift: copy and glyphs are
invisible to height and class audits by construction).

## Audit (agent-browser, live vs clone, 1920×1080 + 375×667 + the zone)

3 findings → `docs/remediation-plan-session11.md`. Highlights:

1. **The Digital Marketing Pro learning-path card description (Medium).**
   The landing's third path card (and `/Home`'s — same component) shipped
   the pre-session-3 clone copy ("Learn modern marketing from SEO and
   content strategy…") while the live app renders "Learn SEO, paid ads,
   social media strategy, and analytics to drive real business growth."
   Both strings wrap to the same card height at every audited viewport —
   no height sweep or class diff can see a one-line copy swap. Found by
   the new text-content diff (`/` ratio 0.9813, line 124 of 214).
2. **The testimonial quote glyphs (Low).** The clone wrapped all three
   testimonial quotes in `&ldquo;`/`&rdquo;` entities (U+201C/U+201D);
   the live app renders plain ASCII `"` (U+0022) — measured
   `charCodeAt(0)` 8220 vs 34 on both sites. Typographic vs ASCII quotes
   render at identical metrics, so computed-style gates are structurally
   blind to the difference.
3. **The login card chrome persists across all 5 views (High).** The live
   login card is a state machine that owns the WHOLE card interior: on
   reset / reset-sent / signup / verify the logo ring, the "Welcome to
   NexusLearn" h1, the subtitle, the Google button and the OR divider are
   ALL absent — each view IS the card body (`div.w-full > div.space-y-4…`).
   The clone statically rendered the signin chrome in `login/page.tsx`
   around `<LoginForm/>`, so every non-signin view showed the full signin
   chrome above its content (per-view class-set diffs: the clone-only
   token sets on all four views were exactly the chrome classes). The
   reset view's email input is also its own variant — the live DOM carries
   `text-base` after `py-2` (like the sign-in inputs), not the
   `text-sm sm:text-base` tail the signup inputs carry. Found by per-view
   text + class diffs of all 5 login views (only the default view was ever
   diffed before — the session-5 specs assert view CONTENT, never the
   ABSENCE of the chrome).

**Breakpoint-zone sweep (NEW surface — all green):** 640/767/768/1024/
1279/1280 on the landing — the trigger↔desktop-row flip happens at exactly
768px on both sites, the category grid flips 3→4 columns at lg and the
featured grid 1→2→3 at md/lg identically, the panel opens identically at
767px (404px, opacity 1), and the /Pricing, /CourseDetail, /Dashboard
grids match at every boundary. **No Tailwind v4 breakpoint bug.**

**Re-verified green (no action):** the mobile navigation menu on BOTH
sites — the full battery (bare trigger strings in both nav states, icon
swap, 8 panel links, desktop row `display:none`, route-change close, the
404px inner panel, the 4px pre-CTA gap, both My Dashboard buttons on the
shadcn base trio; the `/Home` hero-state trigger confirmed on arrival —
the session-10 fix). The space-y trap sweep clean on 12 routes. Desktop
heights byte-exact or at documented bands everywhere; mobile heights ALL
at the documented bands. CourseDetail like-for-like on all 9 courses
(documented bands). Class-set diffs (main + nav + footer on 10 routes):
only the documented variances. Head metadata, all 9 prices, the zeroed
dashboards, AI chat, the footer, the 404. **Interactive sweep:** catalog
search "python" → the same 3 courses; sort "Price: Low to High" → the
identical order; category filter → the same results; the About toggle, the
FAQ structure, the wrong-password error, the keyboard tab chain — all
identical. **Text content: IDENTICAL** on /Courses, /Dashboard, /login
(signin view), /About, /Contact, /BecomeInstructor, /Pricing,
/AIAssistant, the footer, the 404, and CourseDetail for WebDev (789
lines), UI/UX (448) and DigitalMarketing (408).

## Remediation (TDD)

- **RED first**: 8 new e2e specs (the `session-11 parity` blocks — the
  path-card description + the ASCII quotes + the five login-interior
  specs: reset / reset-sent / signup / verify each replace the card
  interior, the reset input's `text-base` variant, and the chrome
  restored on the round trip) — all 8 verified failing against the
  pre-fix build for exactly the pinned reasons (one locator bug fixed
  during RED: "Structured Learning Paths" also appears inside a
  testimonial quote — the section filter now matches on the heading).
- **GREEN**: `src/app/page.tsx` — the live path-card description + the
  ASCII `"` quote marks (replacing the `&ldquo;`/`&rdquo;` entities);
  `src/app/login/page.tsx` — now the thin card shell (gradient bar +
  padding + the centered flex column); `src/components/LoginForm.tsx` —
  the signin branch owns the chrome (logo ring + h1 + Google + OR,
  byte-identical to the previous DOM), the four non-signin views wrap
  their content in `div.w-full`, and the reset email input uses the new
  `RESET_INPUT_CLS` (`text-base` variant).
- Gates: **141/141 e2e** (133 → 141, +8; the session-5 login specs all
  stayed green through the refactor), 31/31 unit. Visual re-verification
  on the dev server: the landing text diff IDENTICAL on `/` and `/Home`;
  the login per-view class-set diffs IDENTICAL on all 5 views; the login
  view heights byte-exact (1080 across signin/reset/signup on both
  sites); the reset-view structure matches the live dump; the `/`,`
  /Courses` class diffs and the mobile battery unchanged (regression
  green).

## Gates (final)

lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **141/141 e2e ✓** (133 → 141).

## Ship

- 26 fresh dev-server screenshots in `docs/screenshots/` (12 desktop
  routes, the landing close-ups, all four non-signin login views incl.
  the new `login-reset-sent--desktop.png` + `login-reset--mobile.png`,
  6 mobile captures incl. both open-menu captures).
- Docs aligned: README (badge 172, testing rows + the session-11
  description), AGENTS (gotcha 13 rewritten — the state machine owns the
  whole card interior; NEW gotcha 29 — text content as its own audit
  surface; 141 specs), CLAUDE (pyramid 31+141, the login bullet), PAD
  ([S11] revision + §7.1 distribution 12+129 + checklist counts), the
  SKILL doc v2.9.0 (the text-content audit surface + the per-view state
  diff + the breakpoint-zone sweep in Appendix A + the 11-session
  description + test inventory), `docs/remediation-plan-session11.md`,
  this session log (`docs/session_18.md`). `.env.example` re-verified
  (DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL cover all code
  references; no new vars — the session changed no environment surface).
