# NexusLearn Remediation Plan — Session 20

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the e2e production standalone server on :3100).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`, the `@source
not` set in `globals.css`).

**Baseline before remediation** (the shipped session-19 tree, commit `705eebd`):
lint ✓ · typecheck ✓ · 39/39 unit ✓ · build ✓ · 231/231 e2e ✓ — fully green,
matching the documented session-19 end state. The database-location contract
re-verified under the still-polluted shell (`DATABASE_URL=file:/home/z/my-project/db/custom.db`
exported by the harness): `db/custom.db` + `db/e2e.db` both live at the repo
root, no outside-repo database exists — the session-19 guard holds.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The /Courses course-count ELEMENT TAG differs**: the live renders `<span class="ml-auto text-sm text-gray-500">9 courses</span>` (and `<span class="text-sm text-gray-500">` in the filtered state), the clone renders the identical classes on a `<p>` (`src/components/CourseCatalog.tsx:209`). Classes, computed styles, margins and layout are IDENTICAL (the parent `div…p-4 flex flex-wrap items-center gap-4` blockifies both — the live's own SPAN computes `display: block` too), but the tag differs — and Chrome's `innerText` algorithm gives `<p>` elements DOUBLE line breaks, so the clone's /Courses `main.innerText` carries two blank lines around the count that the live does not have ("Newest / 9 courses / Beginner" vs "Newest / ␊ / 9 courses / ␊ / Beginner"). Discovered by the session-20 fresh-eyes surface: the **line-by-line innerText sweep** (all 11 routes compared; 10/11 identical — this was the only text diff, invisible to every class-diff, height and screenshot audit). Same family as the session-18 element-tag surface (tags are invisible to class diffs). | **Medium** | **Planned — Phase 1** |
| 2 | **The /AIAssistant composer wrapper ELEMENT TAG differs**: the live wraps the textarea + send button in `<div class="flex gap-3">` (Enter-to-send handled by a runtime keydown listener — verified: a real Enter keypress fires the integration request and renders the answer; ZERO `<form>` elements exist in the live's /AIAssistant main), the clone wraps them in `<form class="flex gap-3" onSubmit={…}>` (`src/components/AIAssistantChat.tsx:252`). The clone's textarea ALREADY carries its own `onKeyDown` Enter handler (with `preventDefault`, so the form's submit path is dead code in practice) — the form is pure structural drift. The button also carries `type="submit"` where the live's button has NO type attribute. Discovered by the session-20 fresh-eyes surface: the **element-tag drift sweep** (shared-class tag comparison across main+nav+footer, all 11 routes — exactly 2 drifts found, this and finding 1). | **Medium** | **Planned — Phase 1** |
| 3 | **Verified at parity (no action)**: every standing surface — heights ×11 routes ×2 viewports BYTE-EXACT (including /CourseDetail 34246.25 / 38745 and the /login 762 mobile pin, each site on its own course id); the class-set diff sweep — all 78 diff lines fall in the DOCUMENTED variance families (8 gradient-class-form + 48 mobile-panel mechanism + 2 /Contact select class-order + 20 panel-CTA form: the session-9 deliberate `mt-3` omission whose CTA BUTTON class strings are byte-identical — verified this session down to the full string); the FULL mobile-menu battery (trigger classes byte-identical `md:hidden p-2 rounded-lg text-gray-700`, open panel 405px wrapper / 404px inner byte-exact, 8 links with identical texts, toggle close + route-change close both working — the live unmounts the panel, the clone grid-collapses it to height 0 + opacity 0, the documented mechanism variance — Menu↔X icon swap, scroll lock + ARIA = the documented clone-only hardening — **NO Tailwind v4 display/breakpoint/space-y bug**); innerText identical on the other 10 routes; the landmark/roles structure identical (nav,main,footer + 3 comboboxes on /Courses + the login `div[role=none]`); the AI chat end-to-end on BOTH sites (the live answered a real question via its integration endpoint; the clone answered via the SDK — user bubble + full answer); the dashboard byte-exact (text + heights); the tag-drift sweep found NO other shared-class tag differences. | — | Verified |
| 4 | **The vitest + playwright suites re-verified end-to-end** on this tree (39/39 unit, 231/231 e2e including the 10 mobile-nav guards); the db-location contract's pollution guard re-verified under the live polluted shell. | — | Verified |

### Audit-surface note (the session-20 addition)

The two findings were invisible to every PREVIOUS audit surface because:
- class-set diffs compare CLASS STRINGS and dedupe them — a `<p>` and a
  `<span>` carrying the same class string are indistinguishable;
- height/computed-style sweeps pass because flex blockification makes the
  two tags render identically;
- the innerText sweep at LINE level is what exposed finding 1 (the blank-line
  signature of `<p>` vs `<span>`), and the tag-of-shared-class comparison is
  what exposed finding 2. Both probes join the standing audit surface set.

---

## B. Remediation (TDD — RED first, then GREEN)

### Phase 1 — the two element-tag fixes (executed)

- [1a] **RED** `tests/e2e/nexuslearn.spec.ts` — 2 new specs in a
  `session-20 parity: the element-tag drift surface` describe block:
  - the /Courses count element is a `<span>` (not a `<p>`) carrying the
    reference classes (`ml-auto text-sm text-gray-500` unfiltered /
    `text-sm text-gray-500` filtered), and the /Courses `main.innerText`
    carries NO blank line between the sort trigger text and the count
    ("Newest\n9 courses", not "Newest\n\n9 courses");
  - the /AIAssistant main contains ZERO `<form>` elements, the composer
    wrapper is a `<div class="flex gap-3">`, and the send button carries NO
    `type` attribute (the live's form). The existing Enter-to-send specs
    (the "Thinking..." bubble under the delayed route + the aborted-route
    error bubble) are the behavioral guards that must stay green through
    the change — the keydown handler, not the form, drives Enter.
  - RED verified against the pre-fix production build: both fail for exactly
    the pinned reasons (P tag + blank innerText line; FORM wrapper +
    type=submit).
- [1b] **GREEN** `src/components/CourseCatalog.tsx`: `<p className={…}>` →
  `<span className={…}>` at the count (both filter states; the parent flex
  row blockifies the span exactly like the live's own span — computed
  display block, ml-auto effective).
- [1c] **GREEN** `src/components/AIAssistantChat.tsx`: `<form
  className="flex gap-3" onSubmit={…}>…</form>` → `<div
  className="flex gap-3">…</div>`; the button loses `type="submit"` (no type
  attribute — the live's form) and gains `onClick={() => send(input)}`; the
  textarea's existing `onKeyDown` Enter handler is untouched (it already
  `preventDefault()`s, so no double-send).
- [1d] **VERIFY**: the line-by-line innerText sweep → 11/11 routes identical;
  the tag-drift sweep → 0 drifts on shared classes; the mobile battery, the
  height sweep and the class sweep re-run → unchanged (byte-exact); the full
  gate sequence green; the two existing Enter-key behavioral specs green.

### Phase 2 — parity re-verification (executed — see §A.3)

Heights ×11×2 byte-exact · class diffs documented-only · the mobile battery
green · innerText 11/11 · landmarks identical · AI chat functional both
sites · tag drift 0.

### Phase 3 — ship (remaining)

- [3a] `.env.example` re-verified against every `process.env` reference
  (`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`) — no environment
  surface changed this session; byte-identical to `.env`.
- [3b] Screenshots: the standard route set re-captured on the remediated dev
  server (desktop + mobile) → `docs/screenshots/` + the session-20 captures
  (the /Courses filter card with the span count, the /AIAssistant composer).
- [3c] Docs alignment: README (the session-20 paragraph), AGENTS.md (the
  element-tag gotcha extension + the e2e count), CLAUDE.md (the pyramid
  counts + the session-20 spec family), PAD ([S20] revision + the §7.1 row),
  `nexuslearn-template_SKILL.md` (version bump + the new audit surfaces),
  this plan (the results), `docs/session_36.md`, the repo worklog.
- [3d] Full gate in order: `lint → typecheck → test → build → test:e2e`,
  then the session-14 CSS-leak spec re-run LAST (the session-15 process
  rule — every doc write can re-leak the canary).
- [3e] Commit to `main` + SSH-wrapper push (`docs/ssh_git_wrapper_v3.py` via
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`; key in a 0600 file
  OUTSIDE the repo, shredded after use).

---

## C. Risk register

| Risk | Mitigation |
|---|---|
| The `<span>` breaks the count's layout (inline semantics vs the `<p>` block) | The parent is a flex row (`flex flex-wrap items-center gap-4`) — flex items are blockified regardless of tag; the live's own span computes `display: block` in the same position. The height sweep re-run is the proof (no layout change). |
| Removing the `<form>` breaks Enter-to-send | The textarea's `onKeyDown` handler already drives Enter (it fires before any submit and `preventDefault()`s); the two existing Enter-key e2e specs (the Thinking bubble + the aborted-route error) are the behavioral guards. The button gains an explicit `onClick` to replace the lost submit path. |
| Double-send: Enter fires keydown AND a click | `preventDefault()` in the keydown suppresses the legacy submit path; the click only fires on actual pointer interaction. No overlap. |
| The button losing `type="submit"` changes focus/activation semantics | Outside a form, a type-less button defaults to `type="submit"` with NO form to submit — the live's exact structure; the explicit `onClick` restores the action. |
| The innerText blank-line spec is brittle (browser innerText quirks) | The spec pins exactly what the reference renders (measured on the live this session): "Newest" then "9 courses" on consecutive lines. The clone's fixed form renders the same string. |
| Spec-count drift in docs | README/CLAUDE/AGENTS/PAD/SKILL updated to 233 (231 → +2) in Phase 3c; the worklog records the arithmetic. |
| Screenshot drift vs the 54-file session-19 set | Only the /Courses + /AIAssistant captures change content (identical rendering — the tags are layout-neutral); the standard set is re-captured on the remediated dev server. |

---

## D. Phase 3 results (recorded after execution)

- **[1a-1d] TDD**: RED verified — both new specs failed against the pre-fix
  production build for exactly the pinned reasons (`Received: "P"` at the
  tagName assertion; `locator('main form')` resolved to 1). GREEN: the two
  source edits; both specs pass. **GREEN-phase correction**: one
  pre-existing spec (the session-2 "search and filters work" locator
  `p.text-sm` for the count) needed a tag-agnostic update
  (`main getByText(/^\d+ courses?/)` — the old locator matched a different
  paragraph after the tag change). VERIFY: the innerText sweep 11/11
  identical; the tag-drift sweep 0 drifts; heights ×11×2 byte-exact; the
  mobile battery unchanged; the full suite green.
- **[3a] `.env.example`**: re-verified — byte-identical to `.env`, covering
  every `process.env` reference in the codebase (`DATABASE_URL`, guarded by
  `tests/db-url.test.ts`; `AUTH_SECRET`; `NEXT_PUBLIC_SITE_URL`).
- **[3b] Screenshots**: 56 files in `docs/screenshots/` — the standard set
  re-captured on the remediated dev server + the two session-20 captures
  (the /Courses filter-card count on the span, the /AIAssistant composer
  div) + the mobile-menu states + the AI answer (re-captured with a
  wait-for-answer condition after the first fixed-9s run caught the
  "Thinking..." bubble — VLM-verified complete on the re-capture; the
  filter card, composer and mobile-menu captures VLM-verified too).
- **[3c] Docs**: README (badge 272, the session-20 paragraph, the e2e count
  233), AGENTS.md (gotcha 49 — the element-tag drift family + the two
  probes; the commands table), CLAUDE.md (the 39 + 233 pyramid + the
  session-20 spec family), PAD ([S20] revision + the §7.1 row + the
  sessions 2-14 row corrected 165 → 159 so the table sums to the
  authoritative `--list` count), `nexuslearn-template_SKILL.md` v3.8.0 (the
  line-level innerText + tag-of-shared-class surfaces in the description
  + surface 18g + the session-20 project_state), this plan,
  `docs/session_36.md`, the repo worklog.
- **[3d] Gates (final)**: lint ✓ · typecheck ✓ · 39/39 unit ✓ · build ✓ ·
  233/233 e2e ✓ (zero regressions — the two existing Enter-key specs green
  through the form removal) · the CSS-leak spec re-ran LAST after every doc
  write — clean.
- **[3e] Ship**: committed to `main` and pushed via the SSH wrapper — remote
  verified, key shredded after use.
