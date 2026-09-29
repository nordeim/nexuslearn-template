# Session 15 — Parity pass: the scroll-reveal ENTRY animation + the post-gate worklog CSS leak

Continuing from session 14 (`6273469` + the pulled `docs/session_25.md`
transcript, remote at `728e351`). Sessions 1–14 closed static, shell,
content, sub-section, interactive-state, head-metadata, OG-identity,
class-verbatim, display-order, section-design, seed-idempotency,
space-y-engine, navbar-chrome, route-state-chrome, copy + glyph,
component-state, computed-shadow, focus-ring, scroll, card-structure,
rendered-font, preflight and engine-cascade parity — every height measurement
byte-exact. This session re-swept every standing surface and added TWO
fresh-eyes audit surfaces (both suggested by the session-14 transcript): the
**scroll-reveal ENTRY animation characterization** and the
**forced-colors/accessibility rendering sweep**.

## Audit (Playwright parity probes + agent-browser, live vs clone, 1920×1080 + 375×667)

3 findings → `docs/remediation-plan-session15.md`. Highlights:

1. **The post-gate worklog CSS leak (Medium — found at baseline).** The
   session-14 worklog entry (written after the final e2e gate ran) quotes the
   `.selection:bg-red-200` canary; the repo-root `worklog.md` was the ONE
   root markdown file missing from the session-14 `@source not` set — the
   shipped session-14 tree failed its own leak spec (**170/171 at the
   session-15 baseline**). Process lesson: any file written after the final
   gate can invalidate the gate.
2. **The scroll-reveal ENTRY animation (High — the last documented visible
   behavioral variance).** The live (framer-motion, confirmed in
   `assets/index-D62KTPtG.js`) pre-hides **103 reveal targets** across 9
   routes with inline `opacity: 0; transform: translate…` at mount — `/` 40,
   `/Courses` 12, `/Pricing` 10, `/About` 12, `/Contact` 6,
   `/BecomeInstructor` 13, `/AIAssistant` 3, `/Dashboard` 5, `/CourseDetail`
   2, `/login` 0. **34 of them are classless motion-wrapper divs the clone
   had been missing for 14 sessions** (invisible to class-set diffs: the
   hero badge, the 7 category + 6 featured + 9 catalog card wrappers, the
   AI/BI section badges, the newsletter title, the /Contact info cards, the
   /BI hero CTA, the /Dashboard heading, the /CourseDetail badge + price
   card). Frame-resolution curve fits: family A "snappy" (op ~310ms
   ease-out + transform spring ζ=0.561, ωn=27.1 — settle ~280ms, 12%
   overshoot to −2.4px), B "floaty" (op ~310ms + slow back-loaded transform
   ~728ms, no overshoot), HERO (the `/` hero's 5 blocks — coupled
   ~735-770ms from y=30, staggered ~100ms), FAQ (slower coupled
   ~500-610ms from y=10), X (±30px springs, 7-12% overshoot). Sibling cards
   stagger ~100ms (header + first card together); only in-view targets
   reveal at mount; newly-mounted catalog cards re-reveal on search/filter
   (verified by driving the live's search); the end state is inline
   `opacity: 1; transform: none;` forever.
3. **Forced-colors / prefers-contrast / inverted / dark-scheme emulations:
   IDENTICAL on every probe** (neither site ships a single forced-colors or
   contrast rule — the rendering is pure UA behavior on both). Cleared, no
   action.

**Standing surfaces re-verified green at the byte-exact state**: desktop +
mobile heights ×11 routes, CourseDetail ×9, class diffs (documented variances
only), the space-y sweep ×12, text diffs IDENTICAL ×4, the FULL mobile-menu
battery on both sites (404px panel, 8 links, 4px pre-CTA gap, route-close,
Escape-close, scroll lock, /Home hero state — no Tailwind v4 display or
breakpoint bug), the computed shadow sweep (46 documented form-variance
pairs), the session-13 focus-ring pin.

## Remediation (TDD)

- **RED first**: 22 new e2e specs (the session-15 parity blocks: the pre-hide
  style strings ×6 variants, the gradual-animation + one-way end state, the
  sibling stagger, the per-route target inventory ×11 routes, the mount
  behavior, the controller-on-every-render-branch rule, and 3 GUARDs — the
  popular card unscaled pre+post reveal, the scrollHeight-identical check,
  the session-14 line-height pin through the reveal) — **19/21 verified
  failing** against the pre-fix build for exactly the pinned reasons (the 2
  passes were the trivially-true pre-implementation guards: /login 0 targets
  + the scrollHeight self-comparison).
- **GREEN**: `globals.css` gains `@source not "../../worklog.md"` (finding 1
  — the leak spec turns green); `src/components/reveal/RevealController.tsx`
  (NEW — the zero-dependency WAAPI controller: the exact live pre-hide
  serialization, per-family keyframe tables baked from the measured curves,
  per-parent sibling stagger ×100ms, any-pixel IntersectionObserver, a
  MutationObserver for catalog remounts, the one-way inline end state); the
  9 route files wired (data-reveal attributes + SSR pre-hide style props +
  the 34 classless wrappers for structural parity); `RevealController`
  mounted per page (per-page instances so client-side navigation re-arms).
  Zero class-string changes on existing elements — attributes, inline styles
  and classless wrappers only.
- **Two GREEN-phase corrections** (both caught by the verification battery):
  (a) the controller initially shipped on only ONE of /CourseDetail's two
  render branches (the main render's 2 targets stayed hidden forever — the
  side-by-side inventory probe found it; a spec now pins
  controller-on-every-branch + the not-found branch's 0 targets); (b) the
  /About "mount-animated" reading was a transcription error (the values
  cards' spec-run rows read `start=- done=-` — they wait for scroll like
  every other below-fold target; `mountAll` was removed and the spec now
  pins the standard whileInView contract).
- Gates: **193/193 e2e** (171 → 193, +22, zero regressions — every
  session-4/5/9/11/12/13/14 spec stayed green through the 34-wrapper DOM
  changes), 31/31 unit, lint ✓, typecheck ✓, build ✓.
- Visual re-verification: **every height still byte-exact** (desktop 11/11,
  mobile 11/11, CourseDetail ×9 — the 34 wrappers moved no layout); the
  side-by-side reveal inventory MATCHES on all 9 routes (target counts +
  pre-hide style distributions at the same sample time); the clone's curves
  within tolerance of the live's (A: overshoot −2.2 vs −2.4; B: y 728-746 vs
  722-729; op ~300ms both); the clone's catalog re-reveals filtered cards
  like the live's remount; the class diffs / text diffs / space-y sweep /
  mobile battery / shadow sweep / focus pin all unchanged.

## Gates (final)

lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **193/193 e2e ✓** (171 → 193).

## Ship

- 28 fresh dev-server screenshots in `docs/screenshots/` (the standard 12
  desktop routes captured through an incremental reveal sweep + the NEW
  reveal close-ups — the pre-hide first-paint state, the mid-reveal frame,
  the post-reveal end state — + the standing close-ups + 5 login views + 6
  mobile + both open-menu states).
- Docs aligned: README (badge 224), AGENTS (gotchas 40–41 — the reveal
  replication + the leak-spec-last process rule), CLAUDE (pyramid 31+193),
  PAD ([S15] + §7.1), `nexuslearn-template_SKILL.md` v3.3.0 (§4.4e the
  reveal replication + Appendix A surface 16 + the reveal-sweep capture
  discipline), `docs/remediation-plan-session15.md` (with the GREEN-phase
  corrections), this session log (`docs/session_26.md`). `.env.example`
  re-verified (the session changed no environment surface). The leak spec
  re-ran LAST, after every doc write (the new process rule).
