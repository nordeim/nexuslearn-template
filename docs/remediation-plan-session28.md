# NexusLearn Remediation Plan — Session 28

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the e2e production standalone server on :3100; raw curl for
the protocol dimension).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-27 tree, commit `558065b`
plus the pulled `docs/session_51.md` transcript at `609eb39`): lint ✓ ·
typecheck ✓ · 41/41 unit ✓ · build ✓ · **266/266 e2e ✓** (re-verified this
session on the freshly cloned workspace). The environment contract re-verified
(`DATABASE_URL="file:../db/custom.db"` in `.env`, `db/custom.db` recreated at
the repo root by db:push + db:seed; `.env.example` byte-identical).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The image attribute/loading surface (first inventory — fresh-eyes family 1)**: the LOADING dimension of the rendered-image contract — the `loading`/`decoding`/`fetchpriority` attributes on every `<img>`, plus the src/alt VALUE inventory. Never swept: the session-21 "href/src VALUES" sweep pinned the href/src side but never the loading-family attributes, and innerText/class/height diffs are structurally blind to all attributes (the session-18 lesson, now on its fourth appearance). Probed across every img-bearing route on both sites (live `/`, `/Courses`, `/CourseDetail` — 36 imgs; clone all 11 routes — 37 imgs): **the live ships ZERO loading-family attributes — 0/36 images carry `loading`, `decoding` or `fetchpriority`; every image is EAGER (the browser default)**. The clone ships **`loading="lazy"` on 33/36** — 15/16 on `/` + `/Home` (the 12 featured-grid course cards + the 3 testimonial avatars), 18/18 on `/Courses` — all from THREE sources: `src/components/CourseCard.tsx` lines 42 (course cover) + 83 (instructor avatar) and `src/app/page.tsx` line 588 (testimonial avatar). A repo-wide documentation search confirms lazy loading was **never a documented deliberate decision** (zero mentions in AGENTS.md/CLAUDE.md/README/PAD/SKILL/worklog/every remediation plan) — it is undocumented drift from the original template build, NOT the session-26 autocomplete family (that hardening is INVISIBLE metadata with zero behavioral footprint; `loading` changes the FETCH BEHAVIOR itself — the live fetches every image at page load, the clone defers below-fold images until scroll, a real functional divergence). One route-set note: `/Pricing`, `/Contact`, `/BecomeInstructor`, `/Dashboard`, `/AIAssistant` render ZERO images on both sites; `/About` renders 1 (eager on both); `/CourseDetail` renders 2 (eager on both — the detail page never drifted); `/login` renders 1 (the Google logo, eager on both). | LOW (a real behavioral drift, but cosmetic-performance in effect — 3-line source fix + pins) | **FIX toward the live (eager everywhere) + PIN the eager contract + a source-level guard** |
| 2 | **The Advanced Python cover variance — the live's own seed data carries a BROKEN image URL (found inside finding 1)**: the live's seed-8 course "Advanced Python Programming" (live id `699081e752032065b87812a2`) points at `https://images.unsplash.com/photo-1515879218367-8466d910auj7?w=600&q=80` — a **malformed Unsplash ID** (the 12-char suffix `8466d910auj7` contains the non-hex characters `u` and `j`; every real Unsplash photo id is `photo-<13 digits>-<12 hex chars>`). The URL **404s** and the image **renders BROKEN on the live everywhere the course appears** — `/Courses` (catalog grid), `/` (landing featured grid) and its own `/CourseDetail?id=699081e752032065b87812a2` hero — verified `naturalWidth === 0` on all three pages. The clone ships a WORKING image for the same course (`photo-1526379095098-d400fd0bf935?w=600&q=80`, naturalWidth 600 — an authentic Python/code Unsplash photo) — the deliberate-better data choice that shipped from the original build, but it was **never pinned** (the session-4 "seed imagery parity" block pins ML/Business/EQ covers + the 7 instructor avatars, not seed-8) and never documented as a variance. | LOW (the clone is already correct; needs a pin + the variance documented) | **PIN the clone's working URL + DOCUMENT the live's broken URL as the variance (keep the working image — the same family as the session-25 byte-identical-asset re-host: replicate the app's INTENT, not its data typos)** |
| 3 | **The form-validation constraint surface (first inventory — fresh-eyes family 2)**: the CONSTRAINT dimension of the form contract — `type`/`required`/`maxLength`/`minLength`/`pattern`/`min`/`max`/`step` on every input/textarea/select. The session-26 sweep pinned the METADATA family (autocomplete/inputMode — invisible password-manager hints); the constraint family (the native validation semantics) was never swept. Probed on both sites across `/login`, `/Contact`, `/BecomeInstructor`, `/Courses`, `/AIAssistant`: **IDENTICAL on every route** — /login: `#email` type=email + required, `#password` type=password + required; /Contact: `#name` required (no type attr), `#email` type=email + required, `#message` textarea required; /BecomeInstructor: NO form controls at all (a CTA page on both sites); /Courses search: a BARE input (no type, no required — the session-18 pinned placeholder/id contract, now on the constraint axis); /AIAssistant composer: a BARE textarea. No maxlength/pattern/minlength/min/max/step on any DEFAULT-view control of either site. The contract is correct but UNPINNED — a future "hardening" pass adding constraints would be beyond-reference drift, and a removal would break parity, both invisible to every text/class diff. | LOW (pins only — the contract is correct) | **PIN the constraint contract** |
| 3b | **The login CLIENT-VIEW constraint drift (found during the screenshot-capture verification pass, extending family 2)**: the /login signup + reset views are CLIENT-side state switches — their inputs do not exist in the DOM until the view flips, so every constraint sweep that read the default signin view was structurally blind to them. The full view-by-view inventory found the session's SECOND source defect: **the clone's signup password input had shipped `minLength={8}` since session 5** (the original login state-machine build) while **the live ships NO minlength anywhere** — and the drift was FUNCTIONAL, not cosmetic: the live enforces the 8-char minimum in JS with an IN-DOM error message ("Password must be at least 8 characters long"), while the clone's minlength attribute swapped the UX to the browser's NATIVE validation tooltip (which blocks the submit event entirely — the clone's own JS length check was DEAD CODE, and its message text "…8 characters" lacked the live's trailing " long"). The password-mismatch path ("Passwords do not match") verified IDENTICAL on both sites. | LOW (a real behavioral drift — 2-line source fix + pins) | **FIX toward the live (drop the attribute, adopt the live's exact error text) + PIN the client-view contracts** |
| 4 | **Every standing surface re-verified at the documented session-27 state**: the full baseline gate (lint, typecheck, 41/41 unit, build, **266/266 e2e** — every standing parity pin green); the **mobile-menu battery re-run against the live** (the user-directed Tailwind v4 watch): trigger classes BYTE-IDENTICAL (`md:hidden p-2 rounded-lg text-white/80` over the hero), the open panel geometry IDENTICAL (NAV 375×469 on both = the 64px chrome + the 405px panel; per-link y-positions 81/129/177/225/273/321/369/417 with heights 44×7+36 — byte-identical), the aria-label hardening clone-only as documented. **No Tailwind v4 display, breakpoint or space-y bug.** | — | Verified |
| 5 | **The HTTP protocol posture (probed, documented)**: the live speaks **HTTP/2 AND HTTP/3** (its Cloudflare edge — `curl --http2` → 2, `curl --http3` → 3), while the standalone Node server speaks **HTTP/1.1 only** (h2c refused — `http_version=0`). The same proxy-layer family as session-27's brotli finding: Node's standalone server does not carry the ALPN/QUIC termination a CDN provides; it cannot move into the app. Documented in `docs/DEPLOYMENT.md` §8 alongside brotli (the reverse-proxy recommendation covers both — Caddy/Nginx/Cloudflare fronting the standalone terminates h2/h3 and adds brotli in one move). | INFO (proxy-layer, documentation only) | **DOCUMENT** |
| 6 | **The PWA/offline surface (probed, identical)**: NEITHER site registers a service worker (0 registrations on both), neither runs standalone, both link the same `/manifest.json` — the session-25-pinned portable-form variances are the complete PWA story. There is no offline capability to replicate; an offline-first PWA would be a beyond-reference feature requiring the documentation gate. | — | Verified (no action) |

### Audit-surface note (the session-28 additions — TWO new probe families)

- **the image attribute/loading surface** (findings 1–2) — the LOADING
  dimension of the rendered-image contract: which `loading`/`decoding`/
  `fetchpriority` attributes ship on each `<img>`, plus the complete src/alt
  VALUE inventory. This is the layer that would catch a lazy-loading drift
  (a behavioral divergence invisible to every DOM-text/class/height diff),
  a broken seed URL, and an accidental `next/image` migration (which ships
  `loading="lazy"` by default — a silent whole-surface drift);
- **the form-validation constraint surface** (finding 3) — the CONSTRAINT
  dimension of the form contract: the native validation semantics
  (`type`/`required`/`maxLength`/`pattern`/…). This is the layer that would
  catch both a constraint-removal parity break and a "hardening" drift
  beyond the reference.

Family 1 was the standing session-27 "suggested next directions" territory
(the session-50/51 transcripts' fresh-eyes list); family 2 is the natural
companion to the session-26 metadata sweep (metadata pinned, constraints not).

---

## B. Remediation (TDD)

Unlike session 27 (zero source defects), this session carries **two real
source fixes** (finding 1: the three `loading="lazy"` attributes; finding
3b: the signup password's `minLength={8}` + the error-text drift) plus pins
for the contracts that are correct but unpinned (findings 2–3).

### Phase 1 — the eager-loading fix + the image-surface pins (family 1)

- [1a] **RED**: new e2e spec block `session-28 parity: the image loading/
  attribute surface` — test (a): the eager-loading contract — on `/`,
  `/Courses`, `/CourseDetail?id=seed-8` and `/About`, NO rendered `<img>`
  carries `loading`, `decoding` or `fetchpriority` (the live's 0/36 eager
  contract). Runs RED on the baseline (33 lazy images).
- [1b] **FIX**: remove `loading="lazy"` from the three sources —
  `src/components/CourseCard.tsx` (course cover + instructor avatar) and
  `src/app/page.tsx` (testimonial avatar). The fix is behavior-changing BY
  DESIGN: below-fold images now fetch at page load exactly like the live
  (the boxes are CSS-sized — `aspect-video`, `w-7 h-7`, `w-11 h-11` — so
  zero layout/height/screenshot impact; the reveal animation is
  opacity-based, unaffected). [1a] goes GREEN.
- [1c] **PIN** (same block, test b): the image inventory — on `/Courses` all
  18 imgs carry non-empty `alt` (course titles + instructor names) and the
  Advanced Python cover's `src` is the clone's working
  `photo-1526379095098-d400fd0bf935?w=600&q=80`; on `/CourseDetail?id=seed-8`
  the hero cover `src` matches + the instructor avatar keeps its decorative
  `alt=""` (the session-18 pinned contract). GREEN-by-design.
- [1d] **GUARD (source-level)**: new unit spec `tests/img-attributes.test.ts`
  (the svg-props source-sweep pattern): NO `loading=`/`decoding=`/
  `fetchpriority=` JSX prop appears anywhere in `src/**/*.tsx` — catches a
  future creep at the source layer, e2e-independent (and catches an
  accidental `next/image` migration whose default lazy would otherwise
  drift the whole surface silently).
- [1e] **PIN (seed layer)**: extend the session-4 "seed imagery parity"
  block in `tests/seed-data.test.ts` — seed-8 "Advanced Python Programming"
  keeps the working cover URL, with the variance comment (the live's own
  URL is the malformed `photo-1515879218367-8466d910auj7` that 404s —
  deliberate-better, the session-25 asset-re-host family). Plus the
  rationale comment on the seed-data entry itself.

### Phase 2 — the form-constraint pins (family 2)

- [2a] **PIN**: new e2e spec block `session-28 parity: the form-validation
  constraint surface` — test (a): the constrained forms — /login `#email`
  type=email + required, `#password` type=password + required; /Contact
  `#name` required (no type), `#email` type=email + required, `#message`
  required; NO maxlength/minLength/pattern/min/max/step anywhere.
  GREEN-by-design.
- [2b] **PIN** (same block, test b): the bare forms — the /Courses search
  input and the /AIAssistant composer textarea carry NO constraint
  attributes (no type/required/maxLength/pattern), and /BecomeInstructor
  renders zero form controls. GREEN-by-design.
- [2c] **RED→FIX→GREEN** (finding 3b — added during execution): new e2e
  spec block `session-28 parity: the login client-view constraint surface
  (signup + reset views)` — test (a): the signup view's email/password/
  confirmPassword carry the live's exact constraint set with NO minlength
  on the password, AND the short-password submit renders the in-DOM error
  with the live's exact text "Password must be at least 8 characters long"
  (the dead-code regression guard); test (b): the reset view's email —
  type+required, nothing else. RED on the baseline (the minlength
  attribute + the wrong error text), GREEN after the fix: remove
  `minLength={8}` from `src/components/LoginForm.tsx` + adopt the live's
  error text.

### Phase 3 — documentation

- [3a] AGENTS.md: gotcha 57 (the image attribute/loading + form-constraint
  surfaces, the broken live cover, the protocol posture note) + the commands
  table counts (44 unit / 270 e2e).
- [3b] `docs/DEPLOYMENT.md` §8: the HTTP/2-or-3 protocol posture joins the
  brotli/static-compression proxy-layer gaps (the same reverse-proxy
  recommendation).
- [3c] `prisma/seed-data.ts`: the variance comment on seed-8's image.
- [3d] README (badge 307 → 316, the 272 count, the session-28 paragraph),
  CLAUDE.md (the 44+272 pyramid + the session-28 family), PAD ([S28] entry
  + §7.1 row), `nexuslearn-template_SKILL.md` v3.16.0 (the two new probes +
  the surface census + project_state), this plan (Phase D),
  `docs/session_52.md`, the repo worklog.

### Phase 4 — ship

- [4a] `.env.example` re-verified (no environment surface changed; byte-
  identical to `.env`).
- [4b] Screenshots: the standard set re-captured on the remediated dev
  server + the session-28 addition (`image-surface-s28.txt` — the complete
  img attribute inventory on BOTH servers, the verb-matrix-s26/encoding-
  validators-s27 textual-proof pattern).
- [4c] Full gate in order: `lint → typecheck → test → build → test:e2e`
  (44 unit + 272 e2e expected: 266 → 272 e2e = +6 session-28 specs; 41 → 44
  unit = +2 img-attribute guards + 1 seed pin; zero regressions), then the
  session-14 CSS-leak spec re-run LAST (the session-15 process rule).
- [4d] Commit to `main` + SSH-wrapper push (`docs/ssh_git_wrapper_v3.py`
  via `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`; key in a 0600 file
  OUTSIDE the repo, shredded after use). No new branches — main only.

---

## C. Risk register

| Risk | Mitigation |
|---|---|
| Removing `loading="lazy"` regresses a screenshot/height/CLS pin | The image boxes are CSS-sized (`aspect-video`, fixed avatar sizes) — layout is attribute-independent; the full 266-spec regression guard re-runs post-fix; the zero-CLS guard (session-16) is part of it. |
| The eager contract spec false-fails on a future `next/image` migration (its default `loading="lazy"`) | That is the spec WORKING as designed — `next/image` would be a whole-surface behavioral drift away from the reference's plain eager `<img>`s; the guard forces the decision through documentation (the standing deliberate-better rule). |
| A future a11y/perf pass adds constraints (maxlength etc.) or lazy loading, tripping the new pins | Deliberate: both are beyond-reference drift and must pass through the documentation gate (the session-26 precedent — the pins exist to make silent drift impossible). |
| The seed-8 pin freezes a DATA value the live might later fix | If the live ever repairs its broken URL, the standing re-audit surfaces the divergence and the pin is re-pointed deliberately (the same rule as every pinned variance); the comment at the pin explains the live's current URL. |
| The form-constraint pins depend on exact rendered attribute sets (browser-normalized) | The specs read `getAttribute()` (the literal attribute, not the IDL property) — the same mechanics as the session-18/26 attribute specs; no normalization risk. |
| Spec-count drift in docs | README/CLAUDE/AGENTS/PAD/SKILL updated to the new counts in Phase 3d; the worklog records the arithmetic (41→44 unit, 266→272 e2e, 307→316 total). |

---

## D. Phase results (recorded after execution)

- **[1a]**: RED confirmed — the eager-loading spec fails on the baseline
  build (33 lazy images across `/` + `/Courses`: 15 + 18).
- **[1b]**: GREEN — the three `loading="lazy"` attributes removed
  (CourseCard cover + avatar, testimonial avatar); every rendered image now
  eager, exactly like the live (0 lazy across all 11 routes — the full
  census re-run).
- **[1c]**: GREEN-by-design — the inventory pin passes: /Courses 18/18
  non-empty alts + the Advanced Python working cover URL; /CourseDetail
  hero + the decorative `alt=""` avatar contract.
- [1d]**: GREEN — `tests/img-attributes.test.ts` sweeps `src/**/*.tsx`:
  zero `loading=`/`decoding=`/`fetchpriority=` props + the three-source
  verification (41 → 44 unit with [1e]).
- **[1e]**: GREEN — the seed-8 cover pin + the variance comment in the
  seed data (44 unit total: 41 + 2 guards + 1 seed pin).
- **[2a–2b]**: GREEN-by-design — the form-constraint pins pass on the
  baseline (the constrained /login + /Contact set; the bare /Courses search
  + /AIAssistant composer + the control-free /BecomeInstructor).
- **[2c]**: RED confirmed then GREEN — the login client-view spec failed on
  the baseline (the signup password's `minLength={8}` + the missing
  " long" in the error text), passed after the 2-line fix (attribute
  removed; the live's exact error text adopted). The reset-view pin
  green-by-design.
- **[3a–3d]**: DONE — gotcha 57 + commands table; DEPLOYMENT §8 protocol
  posture; the seed-8 comment; README (badge 316), CLAUDE (44+272 pyramid),
  PAD ([S28] + §7.1), SKILL v3.16.0, this Phase D, session_52, worklog.
- **[4a–4c]**: `.env.example` byte-identical; the screenshot set (74 files:
  the standard set re-captured + the session-28 additions —
  `advanced-python-cover--desktop.png`, `courses-advanced-python--desktop.png`,
  `landing-signedin--desktop.png` + the `image-surface-s28.txt` dual-server
  proof: 37 imgs / 0 lazy on BOTH servers) captured; full gate green —
  lint ✓ typecheck ✓ 44/44 unit ✓ build ✓ **272/272 e2e ✓** (266 → 272:
  +6 session-28 specs, 41 → 44 unit, zero regressions; 316 total); the
  CSS-leak spec re-run LAST — clean.
- **[4d]**: recorded in the session log (`docs/session_52.md`) — committed
  to `main` + pushed via the SSH wrapper.
