# Session 18 — Parity pass: the error/empty-state + element-tag/attribute + data-mutation surfaces

Continuing from session 17 (`ae7fa3f` + the pulled `docs/session_31.md`
transcript, remote at `0c629b2`). Sessions 1–17 closed static, shell,
content, sub-section, interactive-state, head-metadata, OG-identity,
class-verbatim, display-order, section-design, seed-idempotency,
space-y-engine, navbar-chrome, route-state-chrome, copy + glyph,
component-state, computed-shadow, focus-ring, scroll, card-structure,
rendered-font, preflight, engine-cascade, reveal-entry,
navigation-transition and deep-link parity — every height byte-exact, the
reveal inventory matching, back/forward restoration instant. This session
re-swept every standing surface and added the THREE fresh-eyes surfaces
suggested by the session-17 transcript — the **error/empty-state sweep
(API failure modes)**, the **keyboard-navigation/element-tag pass** and
the **data-mutation deep-dive (enrollment/progress)** — plus the
**form-control attribute surface** and the **per-route token map**
discovered while probing the failure UX.

## Audit (Playwright parity probes + agent-browser, live vs clone, 1920×1080 + the dev server, real form submits with network monitoring)

7 findings → `docs/remediation-plan-session18.md`. Highlights:

1. **The /Contact message textarea PLACEHOLDER drifted (High).** The live
   renders `placeholder="Tell us how we can help..."`, the clone "How can
   you help you?"-family copy ("How can we help you?") — visible in every
   empty-form render, yet invisible to every previous audit surface:
   placeholders are ATTRIBUTES (innerText diffs read rendered text nodes
   only; class diffs read `class` only). The name/email placeholders
   matched; only the message drifted. The same sweep found the form ids
   (`name`/`email`/`message` vs the clone's `contact-*` prefixes), the
   CourseDetail instructor portrait's `alt=""` (decorative — the name is
   in the adjacent paragraph; the clone's `alt={name}` double-read), and
   the type-less search input (the session-6 `type="text"` note was
   stale).
2. **The AI chat LOADING bubble differed (High).** The live renders a
   spinning `lucide-loader-circle` + "Thinking..." text in a
   `px-5 py-3 flex items-center gap-2 text-gray-400` bubble; the clone
   shipped three `animate-bounce` dots in a `px-4 py-3` bubble. The
   bubble only exists while the request is pending — a TRANSIENT state
   every settled-DOM audit (class diffs, text diffs, post-networkidle
   screenshots) structurally cannot see (the session-11 per-view lesson
   generalized to pending states).
3. **The /Pricing card CTAs were double-focusable `<Link><button>` nests
   where the live ships single inert `<button>`s (High).** The live's
   three CTAs fire NO navigation (verified with a real Playwright click +
   network monitoring — analytics only); the clone's anchors made each
   CTA two tab stops and navigated to /login. Element TAGS are invisible
   to class diffs — a `<button>` styled exactly like an `<a>` passes
   every class-set diff. (The `<Link><button>` nest on the landing and
   other routes is reference-matched — only /Pricing diverges.)
4. **The newsletter + contact PENDING labels (Medium).** The live's
   buttons replace their ENTIRE content with the literal `...` /
   `Sending...` — three ASCII periods (charCodes 46,46,46, byte-verified;
   NOT the U+2026 ellipsis glyph), no icon — while disabled in flight.
   The clone kept the full labels (and its "Sending…" used the ellipsis
   glyph + kept the icon).
5. **The live's /login route alone carries the shadcn ZINC token theme
   (Medium).** The Base44 runtime injects PER-PAGE token sheets — 10 of
   11 routes read the NEUTRAL theme (byte-equal to the clone's `:root`),
   but /login reads ZINC: its card buttons' focus rings render
   `rgb(9,9,11)` (zinc-950) vs the clone's `rgb(10,10,10)` — the same
   1–3 sRGB-unit family as the ADR-005 palette pin. The login inputs are
   unaffected (the session-13 slate-400 cascade pin) and all login text
   carries explicit slate classes (byte-verified identical).
6. **The live's "Enroll Now" is INERT (verified).** A real click fires
   only `analytics/track/batch` + `log-user-in-app` — no enrollment, no
   UI change, no persistence after reload. The live's dashboard ships the
   EMPTY state (VLM-verified against `docs/nexuslearn-template-dashboard.png`:
   0/0/0/0% + "No courses yet"). The clone keeps its functional
   enrollment (the README's core promise) — deliberate-better.
7. **The live's FAILURE UX is a permanently-stuck pending state.** An
   aborted chat leaves "Thinking..." forever (+12s); an aborted subscribe
   leaves "..." forever (+15s, unretryable); the contact endpoint NEVER
   COMPLETES — "Sending..." on every real submit (+15s). The clone's
   explicit error message + retryable buttons stay — deliberate-better,
   spec-pinned (the session-16 precedent).

**Verified at parity (no action)**: the login wrong-credentials error
("Invalid email or password" both), the native HTML5 validation on both
forms (identical messages, no custom UI on either), the newsletter
SUCCESS state ("You're subscribed! Welcome aboard." form swap), the
contact success panel (the live never reaches one), the select
dropdowns' rendered token values, the tab order on every route (12 stops
each, identical), and the element-tag + href surface on every other
route (only the documented per-site-id CourseDetail hrefs differ).

**Standing surfaces re-verified green at the byte-exact state**: desktop
+ mobile heights ×11 routes (mobile /Home matched directly this run),
class diffs (documented variances only), the space-y sweep (clean ×10),
text diffs IDENTICAL ×5, the FULL mobile-menu battery (404px panel, 8
links, 4px pre-CTA gap, route-close, the documented hardening — **no
Tailwind v4 display or breakpoint bug**), the computed shadow sweep (all
56 diff lines in the three documented form families), the session-13
focus-ring pin (the slate-400 slot byte-identical) and the session-15
reveal inventory (COUNT-MATCH ×10).

## Remediation (TDD)

17 new e2e specs (the session-18 blocks) written RED first — 11 verified
failing against the pre-fix production build for exactly the pinned
reasons; 6 green-by-design guards (the unchanged placeholders, the
newsletter idle+success, the neutral-ring GUARD, the hero alt, the two
deliberate-better failure pins) → GREEN:

- **`src/components/ContactForm.tsx`**: the message placeholder →
  "Tell us how we can help..."; the form ids → the bare reference names
  (`name`/`email`/`message` + the label[for] wiring); the pending label →
  the literal "Sending..." (ASCII dots, the whole content replaced, no
  icon).
- **`src/components/AIAssistantChat.tsx`**: the loading bubble → the
  reference structure (the `px-5 py-3 flex items-center gap-2
  text-gray-400` bubble + the `LoaderCircle` `h-4 w-4 animate-spin` +
  "Thinking...").
- **`src/app/Pricing/page.tsx`**: the three `<Link href="/login">`
  wrappers removed — bare inert buttons with byte-identical classes.
- **`src/components/NewsletterForm.tsx`**: the pending label → the
  literal "..." (ASCII dots, whole content replaced, no icon).
- **`src/app/login/page.tsx` + `src/app/globals.css`**: the
  `data-login-theme` marker on the login page's `<main>` + the scoped
  `body:has(main[data-login-theme])` zinc token block (media-wrapped to
  light scheme; the full measured sheet, `--ring: #09090b` et al.).
- **`src/app/CourseDetail/page.tsx`**: the instructor portrait →
  `alt=""` (the reference's decorative choice; the name renders once in
  the adjacent paragraph).
- **`src/components/CourseCatalog.tsx`**: the `type="text"` removed (the
  live's input is attribute-less) + the stale session-6 comment
  corrected (the session-6 spec updated likewise).
- **`tests/e2e/nexuslearn.spec.ts`**: the session-13 Sign-in GUARD
  refined to `#09090b` (the zinc block; its intent — never slate-400 —
  unchanged).

## Gates (final)

lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **231/231 e2e ✓** (214 →
231, zero regressions). Visual re-verification: every fixed surface
byte-identical against the live (the placeholder + ids, the CTA tags,
the type-less input, the alt, the ring slot `rgb(9, 9, 11) 0px 0px 0px
4px` on both sites, the chat bubble's text + class string + spinner, the
"..." and "Sending..." pending states); every standing surface re-swept
green (heights ×11 ×2 byte-exact, class/text/space-y/mobile/shadow/
focus/reveal unchanged).

## Ship

- 52 screenshots in `docs/screenshots/` (the standard 47-set re-captured
  + the FIVE new session-18 captures: the Thinking bubble, the "..."
  pending, the contact placeholder, the "Sending..." pending, the zinc
  ring close-up — the transient states frozen under delayed routes,
  VLM-verified).
- Docs aligned: README (badge 262 + the session-18 row), AGENTS (gotchas
  46–47 — the three settled-DOM blind-spot families + the per-route
  token theme + the inert reference flows), CLAUDE (pyramid 31+231), PAD
  ([S18] + §7.1), `nexuslearn-template_SKILL.md` v3.6.0 (Appendix A
  surfaces 18b–18e: the transient pending-state probes, the
  form-control attribute sweep, the element-tag sweep, the per-route
  token-theme map), `docs/remediation-plan-session18.md` (with the Phase
  3 results + the RED-phase corrections), this session log
  (`docs/session_32.md`), the repo worklog. `.env.example` re-verified
  (no environment surface changed). The leak spec re-ran LAST, after
  every doc write (the session-15 process rule).
