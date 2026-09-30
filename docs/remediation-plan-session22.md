# NexusLearn Remediation Plan — Session 22

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the e2e production standalone server on :3100).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`, the `@source
not` set in `globals.css`).

**Baseline before remediation** (the shipped session-21 tree, commit `e8d1a1e`
= `8681fcf` + the pulled `docs/session_39.md` transcript): lint ✓ ·
typecheck ✓ · 41/41 unit ✓ — matching the documented session-21 end state
(build + 236/236 e2e re-verified in the final gate). The environment contract
re-verified under the still-polluted shell (the harness injects
`DATABASE_URL=file:/home/z/my-project/db/custom.db`): `db/custom.db` +
`db/e2e.db` both at the repo root, no outside-repo database — the session-19
guard holds. `.env.example` byte-identical to `.env`.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The form-control accessible-name hardening family (undocumented variance — the session's main find)**: the clone carries aria-labels the live lacks — the /Courses search input `aria-label="Search courses"` (live: placeholder-named "Search courses, topics, or instructors…"), the three filter selects `Filter by category` / `Filter by level` / `Sort courses` (live: VALUE-named "All Categories" / "All Levels" / "Newest" — a name that mutates with the filter state), and the AI textarea `Ask a question` (live: placeholder-named "Ask a question…"). The newsletter input's aria-label mirrors its placeholder exactly (names MATCH — no user-visible variance) and the AI send button's `Send message` is the already-documented icon-only family. The clone's form is the WCAG-robust one (placeholder names VANISH on input; select value-names MUTATE with state) — the same deliberate-better family as the mobile-trigger ARIA + footer-social aria-labels, but it was never documented as a variance because no prior surface extracted accessible names. | — | **ACCEPT — document + PIN** |
| 2 | **Escape-to-close on the mobile menu (clone-only hardening — live verified NOT to close)**: with the panel open, the live keeps it open on Escape; the clone closes it (aria-expanded false, grid fully collapses to 0/opacity 0, scroll lock released — geometry-verified at esc+1150ms). Already pinned by the existing e2e spec (`mobile-navigation.spec.ts:58`); the LIVE-DIFFERING side was never documented in the variance families. | — | **ACCEPT — document** |
| 3 | **The `nextjs-portal` element in the dev Tab order (dev-only framework chrome — verified ABSENT in the production standalone build)**: on `bun run dev`, Tab past the last login focusable lands on the Next.js DevTools portal before body; the live lands on body directly. Production Tab walk: Google → email → password → Sign in → Forgot → Need an account → body — matches the live exactly. Same accepted family as the `<next-route-announcer>` (framework infra). | — | **ACCEPT — document** |
| 4 | **The collapsed mobile panel is NOT keyboard-tabbable (verified empirically — previously an assumption)**: at 375px with the panel closed, the real Tab walk on BOTH sites goes trigger → first body link (Browse Courses), skipping every panel link — the grid-collapse + overflow-hidden + opacity-0 combination removes them from Chrome's Tab order. The CTA link's `tabIndex={open ? 0 : -1}` is belt-and-braces. NO invisible-focus bug exists. Focus-after-close lands on the trigger on BOTH sites (parity). | — | Verified — **PIN** (the invisible-focus guard) |
| 5 | **The keyboard Tab order is IDENTICAL on every probed surface**: desktop `/` and `/login` walks byte-matched (modulo the documented aria-label hardening in names); the mobile closed-panel walk byte-matched; the Tab-after-open sequence byte-matched. | — | Verified |
| 6 | **The storage surface (first inventory)**: the clone emits ZERO localStorage entries, ZERO sessionStorage entries and ZERO JS-visible cookies on every route (the session lives exclusively in the HttpOnly `nexus_session` cookie). The live persists 8 platform keys (base44_* tokens, i18nextLng, token) + 2 mixpanel sessionStorage keys on /login — platform infra, accepted-by-nature. | — | Verified — **PIN** (the no-storage guard) |
| 7 | **The network-request surface (first inventory)**: the live fires 3–6 client-side XHR calls per route (Base44 entities API: Course/Testimonial/Enrollment/User/me queries, public-settings, app-logs `log-user-in-app/{Route}`, analytics/track/batch); the clone fires ZERO on load — all data is server-rendered through Prisma server components (the clone's API routes serve interactions only, all e2e-verified). Architecture variance, verified. | — | Verified |
| 8 | **The media-emulation surface (first sweep)**: under `prefers-reduced-motion: reduce`, `prefers-color-scheme: dark` AND `print` emulation, NEITHER site changes any probed computed style (html/body/navbar/h1/button byte-identical in every mode — both sites are fixed-light, animation-free at rest, print-unstyled). Parity confirmed on a surface no prior session emulated. ONE cosmetic computed-slot variance: the live reports `animation-duration: 0.5s` with `animation-name: none` on the navbar + gradient buttons (its platform CSS carries a default duration in the shorthand slot); the clone reports `0s`. NO animation runs on either site — zero rendering impact. | — | **ACCEPT — document** (+ compact pin) |
| 9 | **The text-scaling surface (first sweep)**: root font-size 16 → 20px (125%) → 24px (150%) — body heights BYTE-IDENTICAL between the sites at 16px and 20px on all 5 probed routes (ratios equal to 4 decimals), proving the rem-based sizing system scales identically. ONE 1px rounding flip at 24px on `/` (live 11394 vs clone 11395; 0.009% — a sub-pixel rounding boundary flip, not a structural drift: any class/structure drift would diverge at 20px already). | — | **ACCEPT — document** |
| 10 | **Every standing surface re-verified at the documented session-21 state**: heights ×11 routes ×2 viewports byte-exact (incl. CourseDetail 34246.25/38745 + the /login 762 mobile pin); innerText 11/11 identical; tag drift 0; class sweep — all 78 diff lines in the four documented families (8 gradient + 48 panel + 2 selectOrder + 20 panel-CTA); the FULL mobile-menu battery (open panel 405/404 byte-exact, 8 links, toggle + route-change close verified invisible, scroll lock, ARIA — **no Tailwind v4 bug**); the console surface clean on the clone (the live's entries are its platform noise only). | — | Verified |

### Audit-surface note (the session-22 additions — FIVE new probe families)

The findings were invisible to every previous audit surface because:
- **the keyboard Tab-order inventory + real Tab walks** (findings 1–5) — the
  a11y tree showed structure and the session-13 audits showed focus RING
  styles, but the sequential focus ORDER, the accessible NAMES of form
  controls, Escape-key behavior and the collapsed panel's tabbability were
  never probed;
- **the storage surface** (finding 6) — no prior probe inventoried
  localStorage/sessionStorage/cookies;
- **the network-request surface** (finding 7) — no prior probe listened to
  request events;
- **the media-emulation surface** (finding 8) — no prior probe emulated
  reduced-motion/dark-scheme/print;
- **the text-scaling surface** (finding 9) — the height sweep ran at ONE root
  font size; scaling invariance was never tested.
All five join the standing audit surface set. **Methodology lessons**
(recorded as gotcha 51): (a) a `checkVisibility({checkOpacity})`-filtered
inventory conflicts with the live's pre-reveal `opacity: 0` scroll-reveal
state (below-fold controls vanish from the static inventory while remaining
tabbable) — the REAL Tab-key walk is the ground truth; (b) a child element's
`getBoundingClientRect().height` stays > 0 inside a collapsed
`overflow-hidden` container (clipped ≠ zero box) — visibility must be
measured on the CONTAINER (extends the session-20 visibility-aware rule);
(c) static focusable inventories must filter non-rendered elements or they
over-report `display:none` subtree members (the +9 mobile-panel false diff).

---

## B. Remediation (TDD — pins are green-by-design guards; no source defect exists this session)

### Phase 1 — verification-only (no source change)

- [1a] The five probe families re-run cleanly after every later phase (the
  documented state must not move).
- [1b] Production-build verification recorded: the standalone server's Tab
  walk matches the live's login sequence exactly (no nextjs-portal); the
  Escape-close behavior identical dev vs prod.

### Phase 2 — the hardening pins (specs only, no source change)

- [2a] e2e spec: **the form-control accessible-name hardening pin** — the
  /Courses search input carries `aria-label="Search courses"`; the three
  filter selects carry `Filter by category` / `Filter by level` / `Sort
  courses`; the AI textarea carries `Ask a question`; the send button carries
  `Send message`; the newsletter input carries `Enter your email`. Pins the
  deliberate stable-naming hardening (finding 1) so no future session
  "fixes" it into drift (matching the live's placeholder/value naming would
  be an a11y regression).
- [2b] e2e spec: **the no-storage pin** — on the audited route set, the clone
  emits ZERO localStorage keys and ZERO sessionStorage keys after load (the
  privacy-cleanliness guard; finding 6).
- [2c] e2e spec: **the invisible-focus guard** — at 375px with the mobile
  panel CLOSED, Tab from the trigger skips every panel link (focus lands on
  the first body focusable, not on any collapsed panel member); with the
  panel OPEN, Tab reaches the panel links (finding 4's both-sides).
- [2d] e2e spec: **the media-emulation stability pin** — under
  `colorScheme: "dark"` the body background stays white and under
  `reducedMotion: "reduce"` the navbar transition-duration stays `0.5s` (the
  parity-with-live no-adaptation contract, finding 8).

### Phase 3 — ship

- [3a] `.env.example` re-verified (no environment surface changed this
  session; byte-identical to `.env`).
- [3b] Screenshots: the standard set re-captured on the remediated dev
  server + the session-22 captures (the mobile menu keyboard/Escape states,
  the /Courses filter row, the AI composer).
- [3c] Docs alignment: README (badge 285, the session-22 paragraph), AGENTS.md
  (gotcha 51 — the interaction-modality + persistence surfaces; the commands
  table), CLAUDE.md (the 41 + 244 pyramid + the session-22 spec family), PAD
  ([S22] revision + §7.1 row), `nexuslearn-template_SKILL.md` v3.10.0 (the
  five new probes in the description + the variance-family additions +
  project_state), this plan (the results), `docs/session_40.md`, the repo
  worklog.
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
| The aria-label pins freeze WRONG names (a typo becomes a contract) | The pinned strings are byte-copied from the audited DOM extraction (probe 1f output), not hand-typed from memory. |
| The no-storage pin breaks when Next.js devtools legitimately add storage in future versions | The spec reads `localStorage`/`sessionStorage` AFTER networkidle + settle; if a future Next adds dev-mode keys, the failure flags re-documentation (the same discipline as the announcer pin). The e2e run uses the PRODUCTION standalone build — devtools storage does not apply there. |
| The invisible-focus pin is Chrome-specific (Tab skip semantics are engine behavior) | The e2e suite runs on bundled Chromium only (playwright.config `projects`); the pin documents current-engine parity — a browser upgrade changing skip semantics flags re-verification, not drift. |
| The media pin over-freezes (a future dark mode would be a feature) | The pin asserts the PARITY contract (the reference ships no adaptation); a future dark mode would be a deliberate beyond-reference decision that must pass through documentation — exactly what the pin enforces. |
| Spec-count drift in docs | README/CLAUDE/AGENTS/PAD/SKILL updated to 41 unit + 244 e2e (285 total) in Phase 3c; the worklog records the arithmetic. |
| The keyboard findings get misread as defects later | Findings 1–4 are documented as deliberate/accepted with their live-side evidence (the naming table, the Escape probe transcript, the production Tab walk); the pins make the deliberate ones executable. |

---

## D. Phase results (recorded after execution)

- **[1a/1b]**: all five probe families re-verified clean through the pins —
  no standing surface moved (heights/text/tagdrift/classes/mobile/console
  re-run after the spec additions: identical results).
- **[2a–2d] pins green**: 8 new e2e specs (the plan's 4 pins, two of them
  split across multiple routes/controls) — the accessible-name hardening
  pin (3 specs, 7 controls pinned), the no-storage pin (1 spec, 8 routes),
  the invisible-focus guard (2 specs — closed panel skipped by Tab, open
  panel reachable), the media-emulation stability pin (2 specs — dark-scheme
  body stays white, reduced-motion keeps `0.5s`). e2e 236 → 244, zero
  regressions.
- **[3b] Screenshots**: 61 files in `docs/screenshots/` (the standard set
  re-captured + the session-22 captures: mobile-menu-escape-closed--mobile,
  courses-filter-row--desktop, aiassistant-composer--desktop — VLM-verified).
- **[3c] Docs**: README (badge 285 + the session-22 paragraph), AGENTS.md
  (gotcha 51 + the commands table 244), CLAUDE.md (the 41+244 pyramid), PAD
  ([S22] + §7.1 row), SKILL v3.10.0 (the five probes + the variance-family
  additions + project_state), this plan, `docs/session_40.md`, the worklog.
- **[3d] Gates (final)**: lint ✓ · typecheck ✓ · 41/41 unit ✓ · build ✓ ·
  244/244 e2e ✓ · the CSS-leak spec re-ran LAST after every doc write —
  clean.
- **[3e] Ship**: committed to `main` and pushed via the SSH wrapper — remote
  verified, key shredded after use.
