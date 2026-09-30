# NexusLearn Remediation Plan — Session 21

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the e2e production standalone server on :3100).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`, the `@source
not` set in `globals.css`).

**Baseline before remediation** (the shipped session-20 tree, commit `6311d6d`
— f861004 plus the pulled `docs/session_37.md` transcript): lint ✓ ·
typecheck ✓ · 39/39 unit ✓ · build ✓ · 233/233 e2e ✓ — fully green, matching
the documented session-20 end state. The database-location contract
re-verified under the still-polluted shell: `db/custom.db` + `db/e2e.db` both
at the repo root, no outside-repo database.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The /Pricing FAQ icons use KEBAB-CASE SVG props** (`src/app/Pricing/page.tsx:209-211`: `stroke-width`, `stroke-linecap`, `stroke-linejoin`): React 19 logs three `Invalid DOM property … Did you mean strokeWidth?` console errors on every /Pricing load of the dev server. The live's console carries ZERO app-level errors (its only entries are the Base44 platform's own cdn-tailwind + websocket noise). Production React strips the warning, so the standalone build is clean — the defect is dev-mode console hygiene (the operator's daily `bun run dev` surface). Rendering itself is unaffected (React passes the kebab attribute through), which is why every DOM/class/height diff stayed green for 20 sessions. | Medium | **FIX (TDD)** |
| 2 | **lucide-react 0.525 adds `aria-hidden="true"` to every icon by default; the live's runtime ships its icons EXPOSED** (0/405 aria-hidden on the live's /CourseDetail vs 405/405 on the clone; same ratio on every route). This single attribute is the dominant root cause of the a11y-tree diff (~90% of its lines: the live's icons appear as nameless `img` nodes that split adjacent text into separate nodes and turn named buttons into unnamed containers). The clone's form is the WCAG-correct one (nameless decorative icons MUST be hidden — the live exposes screen-reader noise 405× per page); it is the same deliberate-better family as the documented mobile-trigger ARIA + footer-social aria-labels (SKILL §"Icon-only buttons carry aria-label"). The SVG inventory is IDENTICAL on all routes (per-class histograms byte-exact: 91/39/28/12/12/14/10/13/3/405) — the attribute is the ONLY svg difference. | — | **ACCEPT — document + PIN** |
| 3 | **The `<next-route-announcer>` element** (Next.js's framework-level screen-reader route announcer) renders on every clone page and surfaces as the `- alert` a11y node; the live (a Base44 SPA) has no equivalent. Framework infrastructure, invisible, empty until navigation — the login-error specs already exclude it (`[role=alert]:not(#__next-route-announcer__)`). | — | **ACCEPT — document + PIN** |
| 4 | **The /login logo `src` hosting variance**: the live serves `…supabase.co/…/e461cd10b_logo.png`, the clone self-hosts `/logo.png` — the ASSET IS BYTE-IDENTICAL (md5 `f2d0170f…`, 1024×1024, alt identical). Same family as any CDN-vs-local platform variance. | — | **ACCEPT — document** |
| 5 | **Verified at parity (no action)**: every standing surface — heights ×11 routes ×2 viewports byte-exact; innerText 11/11 line-identical; tag drift 0; class diffs documented-family-only (gradient 8 + panel 48 + selectOrder 2 + panel-CTA 20); the FULL mobile-menu battery (open panel 405/404 byte-exact, 8 links, toggle + route-change close verified invisible via the grid-collapse probe, scroll lock, ARIA — **no Tailwind v4 bug**); the link inventory (hrefs/targets/rels) identical; the image inventory (srcs/alts/natural sizes/loading attrs) identical; the pseudo-element sweep (0 on both sites); the footer byte-identical down to widths. | — | Verified |
| 6 | The live-only console entries (cdn.tailwindcss.com production warning, Base44 socket.io websocket chatter, the "Notifications alt+T" toast region in the a11y tree) are the live's platform infrastructure — accepted-by-nature. | — | Verified |

### Audit-surface note (the session-21 additions — FIVE new probes)

The findings were invisible to every previous audit surface because:
- **the console-error surface** (finding 1) — no prior probe listened to the
  console at all; rendering-neutral React prop defects are silent in every
  DOM/class/height/text diff;
- **the a11y-tree snapshot** (findings 2/3) — session-20 probed LANDMARKS
  only; the full `ariaSnapshot()` tree exposes per-icon exposure, accessible
  names and framework announcers;
- **the link/image inventory** (findings 4 + the footer-social cross-ref) —
  href/src VALUES were never swept (class diffs see the class, not the URL);
- **the pseudo-element sweep** — computed styles were read on elements only;
- **the SVG class-histogram diff** — proves the icon inventory itself is
  identical, isolating the aria-hidden attribute as the sole difference.
All five join the standing audit surface set.

---

## B. Remediation (TDD — RED first, then GREEN)

### Phase 1 — the console-hygiene fix (the one source change)

- [1a] **RED** `tests/svg-props.test.ts` (new vitest file, 2 specs): (a) a
  sweep asserting NO kebab-case SVG presentation attribute props
  (`stroke-width`, `stroke-linecap`, `stroke-linejoin`, `stroke-dasharray`,
  `stroke-dashoffset`, `stroke-opacity`, `stroke-miterlimit`, `fill-rule`,
  `fill-opacity`, `clip-rule`) appear as JSX props in any `.tsx` under `src/`
  (allowlist: `data-*`/`aria-*`/`xmlns`/`viewBox` are legitimate attribute
  names); fails now with exactly the three `Pricing/page.tsx` hits;
  (b) a pin that `src/app/Pricing/page.tsx` uses the camelCase forms
  (`strokeWidth`, `strokeLinecap`, `strokeLinejoin`).
- [1b] **GREEN** `src/app/Pricing/page.tsx:209-211`: the three kebab props →
  camelCase. React maps them to the SAME rendered attributes, so the DOM stays
  byte-identical (`stroke-width="2"` etc. — pinned by the e2e spec in [2a]).
- [1c] **VERIFY**: the console probe re-run on the dev server → zero
  `Invalid DOM property` errors; every standing parity surface unchanged
  (heights, classes, innerText, mobile battery); full gates green.

### Phase 2 — the hardening pins (specs only, no source change)

- [2a] e2e spec: the /Pricing FAQ icons render the reference attributes in
  the DOM (`stroke-width="2"`, `stroke-linecap="round"`,
  `stroke-linejoin="round"`, the `lucide-circle-help` class) — pins the
  rendered output through the [1b] prop change.
- [2b] e2e spec: every svg on the route set is hidden from the accessibility
  tree — itself `aria-hidden="true"` OR wrapped in an aria-hidden ancestor
  (the hero flowing-lines svg's `div[aria-hidden]` wrapper case) — pinning
  the deliberate lucide-react hardening (finding 2) so no future session
  "fixes" it into drift.
- [2c] e2e spec: the `next-route-announcer` framework element exists (the
  `- alert` a11y node's source — finding 3), documenting it as framework
  infrastructure rather than app markup.

### Phase 3 — ship

- [3a] `.env.example` re-verified (no environment surface changed this
  session; byte-identical to `.env`).
- [3b] Screenshots: the standard set re-captured on the remediated dev
  server + the session-21 captures (the /Pricing FAQ section, the clean dev
  console, the mobile-menu states).
- [3c] Docs alignment: README (badge 277, the session-21 paragraph), AGENTS.md
  (gotcha 50 — the console/a11y/attribute-value surfaces + the five probes),
  CLAUDE.md (the 41 + 236 pyramid + the session-21 spec family), PAD ([S21]
  revision + the §7.1 row), `nexuslearn-template_SKILL.md` v3.9.0 (the five
  new surfaces + project_state), this plan (the results),
  `docs/session_38.md`, the repo worklog.
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
| The camelCase props change the rendered DOM | React's attribute mapping renders `strokeWidth={2}` as `stroke-width="2"` — the e2e DOM pin [2a] asserts the exact rendered attributes; the class histogram is untouched (classes live on the same elements). |
| The vitest source sweep is brittle (false positives on legitimate kebab attrs) | The forbidden list is the React-mapped SVG presentation set only; `data-*`, `aria-*`, `xmlns`, `viewBox` are allowlisted — the sweep regex targets `attr="` prop form in JSX only. |
| The aria-hidden pin breaks on a future legitimately-exposed svg | The spec allows BOTH forms (self aria-hidden OR aria-hidden ancestor) and asserts only on the audited route set; a future meaningful icon (with a name) would legitimately fail the sweep — that's the pin doing its job (documented decision point). |
| The announcer pin breaks across Next upgrades | The element is framework-provided and stable across 15/16; if a future Next removes/renames it, the spec failure flags re-documentation, not a regression. |
| Spec-count drift in docs | README/CLAUDE/AGENTS/PAD/SKILL updated to 41 unit + 236 e2e (277 total) in Phase 3c; the worklog records the arithmetic. |
| The a11y diff's remaining families get misread as drift later | All five root causes documented here + in AGENTS gotcha 50 + the SKILL surfaces; the pin specs make the deliberate ones executable. |

---

## D. Phase results (recorded after execution)

- **[1a] RED verified**: `tests/svg-props.test.ts` — the sweep failed with
  exactly the three pinned hits (`src/app/Pricing/page.tsx:209 stroke-width`,
  `:210 stroke-linecap`, `:211 stroke-linejoin` — the vitest output printed the
  full expected/received diff); the camelCase pin failed (zero camelCase forms
  present). One infra correction during RED: the first draft used the `/s`
  regex flag + a lookbehind (both ES2018-only, rejected by the older tsconfig
  target at `next build`) — replaced with an `[^>]*` class match and a
  non-capturing prefix group before the GREEN phase.
- **[1b] GREEN applied**: the three props → `strokeWidth` / `strokeLinecap` /
  `strokeLinejoin`; both specs green; DOM attribute pin green (rendered
  `stroke-width="2"` etc. — byte-identical rendering).
- **[2a-2c] pins green**: the FAQ-attribute spec, the aria-hidden sweep spec
  (all svgs hidden on the audited routes) and the announcer-existence spec.
- **[1c] VERIFY**: the dev-server console probe re-run → ZERO
  `Invalid DOM property` errors (the live-vs-clone console diff now contains
  only the live's platform noise); heights ×11×2 byte-exact; the class sweep
  unchanged (78 documented-family lines); innerText 11/11; the mobile battery
  unchanged.
- **[3b] Screenshots**: 58 files (the standard set re-captured on the
  remediated dev server + the session-21 captures: pricing-faq-section and
  pricing-faq-row — the remediated icons — the mobile-menu states, the AI
  answer with the wait-for-answer condition; all VLM-verified: the FAQ section
  with its purple circle-help icons, the fully-visible 405px mobile panel, the
  complete non-loading AI answer).
- **[3c] Docs**: README (badge 277 + the session-21 paragraph), AGENTS.md
  (gotcha 50 + the commands-table counts), CLAUDE.md (the 41 + 236 pyramid),
  PAD ([S21] + §7.1 row), SKILL v3.9.0 (surfaces 18h-18l + project_state),
  this plan, `docs/session_38.md`, the repo worklog.
- **[3d] Gates (final)**: lint ✓ · typecheck ✓ · 41/41 unit ✓ · build ✓ ·
  236/236 e2e ✓ · the CSS-leak spec re-ran LAST after every doc write —
  clean.
- **[3e] Ship**: committed to `main` and pushed via the SSH wrapper — remote
  verified, key shredded after use.
