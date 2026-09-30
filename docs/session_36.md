# Session 20 — Element-tag drift pass: the innerText line-sweep + the tag-of-shared-class map

Continuing from session 19 (`cc375bf` + the pulled transcript, remote at
`705eebd`). Sessions 1–19 closed every static, content, state, computed-style,
cascade, font, preflight, reveal-entry, navigation-transition, deep-link,
pending-state/attribute/tag/token and environment-pollution surface — every
height byte-exact, the mobile battery green, 270 tests. This session's
mandate: the standard parity re-audit with a mobile-navigation focus (the
Tailwind v4 watch) and a fresh set of eyes on surfaces no previous audit
family could see, then the full ship ritual (screenshots, `.env.example`,
docs, gates, SSH-wrapper push).

## Baseline (the shipped session-19 tree)

All gates green on commit `705eebd`: lint ✓ typecheck ✓ 39/39 unit ✓ build ✓
231/231 e2e ✓. The database-location contract re-verified under the
still-polluted shell (the harness still injects `DATABASE_URL=file:/home/z/my-project/db/custom.db`):
`db/custom.db` + `db/e2e.db` both at the repo root, no outside-repo database —
the session-19 guard holds. skills/ exclusion re-verified (tsconfig, eslint,
vitest, playwright, the `@source not` set).

## The two fresh-eyes probes (the session's audit-surface additions)

1. **The line-by-line `innerText` comparison** — all 11 routes, `main.innerText`
   compared as newline-split line arrays (not normalized text presence).
   Blank-line signatures expose tag/structure drift: 10/11 identical, exactly
   one diff on /Courses (see finding 1).
2. **The tag-of-shared-class map** — for each class string present on BOTH
   sites (main + nav + footer per route), compare the tag set; a
   one-tag-vs-one-tag mismatch is drift. Exactly two drifts found (the two
   findings below); every other shared class rides the same tag on both
   sites.

## Findings (both the session-18 element-tag blind-spot family, one level deeper)

1. **The /Courses course-count tag**: the live renders
   `<span class="ml-auto text-sm text-gray-500">9 courses</span>` (and
   `<span class="text-sm text-gray-500">` in the filtered state); the clone
   rendered the identical classes on a `<p>`. Classes, computed styles,
   margins and layout all IDENTICAL (the parent flex row blockifies both —
   the live's own span computes `display: block`), but Chrome's `innerText`
   algorithm gives `<p>` elements DOUBLE line breaks, so the clone's
   `main.innerText` carried blank lines the live does not have
   ("Newest / ␊ / 9 courses / ␊ / Beginner" vs the live's consecutive lines).
   Invisible to every class-set diff, height sweep and screenshot for 19
   sessions.

2. **The /AIAssistant composer wrapper tag**: the live wraps the textarea +
   send button in `<div class="flex gap-3">` — ZERO `<form>` elements in the
   live's /AIAssistant main, Enter-to-send driven by a runtime keydown
   listener (verified: a real Enter keypress fired the integration request
   and rendered the answer). The clone wrapped them in
   `<form className="flex gap-3" onSubmit={…}>`, and its send button carried
   `type="submit"` where the live's button has no type attribute. The
   clone's textarea ALREADY carried its own `onKeyDown` Enter handler (with
   `preventDefault()`, so the form's submit path was dead code) — the form
   was pure structural drift.

## Remediation (TDD)

**RED first**: 2 new specs in a `session-20 parity: the element-tag drift
surface` describe block — the /Courses count is a SPAN with the reference
classes in BOTH filter states and `main.innerText` renders "Newest\n9
courses" (never "Newest\n\n9 courses"); the /AIAssistant main contains zero
FORM elements, the composer wrapper is `div.flex.gap-3`, and the send button
carries no `type` attribute. RED verified against the pre-fix production
build: both failed for exactly the pinned reasons (`Received: "P"`; `main
form` count 1).

**GREEN**: `src/components/CourseCatalog.tsx` — the count `<p>` → `<span>`
(both filter states; the flex row blockifies it exactly like the live's own
span). `src/components/AIAssistantChat.tsx` — the composer `<form>` →
`<div>`, the button loses `type="submit"` and gains `onClick={() =>
send(input)}`; the textarea's keydown handler untouched. **GREEN-phase
correction**: one pre-existing spec (the session-2 "search and filters work"
count locator `p.text-sm`) updated to the tag-agnostic
`getByText(/^\d+ courses?/)` — the old locator matched a different paragraph
after the tag change.

## Parity re-audit (live vs clone, both signed in)

Every standing surface GREEN at the byte-exact state: heights ×11 routes ×2
viewports byte-exact (incl. CourseDetail 34246.25 / 38745 and the /login 762
mobile pin, each site on its own course id); the class-set diff sweep — all
78 diff lines fall in the FOUR documented variance families (8 gradient-class
form + 48 mobile-panel mechanism + 2 /Contact select class-order + 20
panel-CTA form: the session-9 deliberate `mt-3` omission, whose CTA BUTTON
class strings are byte-identical — re-verified this session down to the full
string); innerText 11/11 identical (after the fix); tag drift 0 on shared
classes; the FULL mobile-menu battery — trigger classes byte-identical, the
open panel at 405px wrapper / 404px inner byte-exact, 8 links with identical
texts, toggle close + route-change close both working (the live UNMOUNTS the
panel; the clone grid-collapses it to height 0 + opacity 0 — the documented
mechanism variance, verified with a visibility-aware probe), Menu↔X icon
swap, scroll lock + ARIA = the documented clone-only hardening — **no
Tailwind v4 display/breakpoint/space-y bug**; the landmark/roles structure
identical (nav, main, footer + the three comboboxes + the login
`div[role=none]`); the AI chat end-to-end on BOTH sites (the live answered a
real question via its integration endpoint; the clone answered via the SDK,
re-verified through the Enter-key path after the form removal); the
dashboard byte-exact (text + heights).

## Gates (final)

lint ✓ · typecheck ✓ · 39/39 unit ✓ · build ✓ · 233/233 e2e ✓ (231 → 233:
+2 session-20 specs, zero regressions — the two existing Enter-key
behavioral specs green through the form removal). The CSS-leak spec re-ran
LAST after every doc write (the session-15 process rule).

## Ship

- 56 screenshots in `docs/screenshots/` (the standard set re-captured on the
  remediated dev server + the session-20 captures: the /Courses filter card
  with the span count, the /AIAssistant composer div, the mobile-menu states,
  the AI answer — VLM-verified; the AI answer re-captured with a
  wait-for-answer condition after a first fixed-9s run caught the
  "Thinking..." bubble).
- `.env.example` re-verified: byte-identical to `.env`, covering every
  user-facing `process.env` reference (`DATABASE_URL` — enforced by tests,
  `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`). Included in the commit.
- Docs aligned: README (badge 272 + the session-20 paragraph + the e2e
  count), AGENTS.md (gotcha 49 + the commands table), CLAUDE.md (the
  39 + 233 pyramid + the session-20 spec family), PAD ([S20] + §7.1 row +
  the sessions 2-14 row corrected to the authoritative count),
  `nexuslearn-template_SKILL.md` v3.8.0 (the two new probes in the
  description + surface 18g + the project_state),
  `docs/remediation-plan-session20.md` (with the results), this session log,
  the repo worklog.
- Committed to `main` + pushed via the SSH wrapper
  (`docs/ssh_git_wrapper_v3.py`) — remote verified, operator key shredded
  after use.
