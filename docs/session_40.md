# Session 22 — The interaction-modality + persistence pass: five fresh-eyes probe families

Continuing from session 21 (`8681fcf` + the pulled transcript at `e8d1a1e`
— `docs/session_39.md`). Sessions 1–21 closed every static, content,
state, computed-style, cascade, font, preflight, reveal-entry,
navigation-transition, deep-link, pending-state/attribute/tag/token,
environment-pollution, element-tag, console-hygiene and a11y-exposure
surface — every height byte-exact, the mobile battery green, 277 tests.
This session's mandate: the standard parity re-audit with a
mobile-navigation focus (the Tailwind v4 watch), then five probe families
on surfaces no previous audit family could see, then the full ship ritual
(screenshots, `.env.example`, docs, gates, SSH-wrapper push).

## Baseline (the shipped session-21 tree)

All gates green on commit `e8d1a1e`: lint ✓ typecheck ✓ 41/41 unit ✓
(the build + 236/236 e2e re-verified in the final gate). The
database-location contract re-verified under the still-polluted shell
(`DATABASE_URL=file:/home/z/my-project/db/custom.db` injected): `db/custom.db`
+ `db/e2e.db` both at the repo root, no outside-repo database. skills/
exclusion re-verified (tsconfig, eslint, vitest, playwright, the
`@source not` set). `.env.example` byte-identical to `.env`.

## The five fresh-eyes probe families (the session's audit-surface additions)

1. **The keyboard Tab-order inventory** — a static DOM-order focusable
   extraction PLUS real Tab-key walks (desktop `/`, `/Courses`, `/login`;
   mobile closed-panel, open-panel and after-close states). Found the
   accessible-name variance family (finding 2 below) and drove the
   invisible-focus verification. The REAL walk is the ground truth: the
   static extraction over-reports `display:none` subtree members (a +9
   phantom-focusable diff from the clone's mounted mobile panel) and a
   `checkVisibility({checkOpacity})`-filtered one under-reports the
   live's pre-reveal `opacity: 0` below-fold controls (Chrome tabs INTO
   opacity-0 elements — the desktop `/` walk matched byte-for-byte even
   while the filtered inventories diverged).
2. **The storage surface** — localStorage/sessionStorage/cookie
   inventory per route, both sites. The clone: ZERO client-side storage
   anywhere (the session lives exclusively in the HttpOnly
   `nexus_session` cookie — invisible to `document.cookie` by design).
   The live: 8 base44 platform keys (tokens, i18nextLng, analytics) + 2
   mixpanel session keys on /login.
3. **The network-request surface** — request-event listeners per route.
   The live fires 3–6 client-side XHR calls per route (Base44 entities
   API + app-logs + analytics batch); the clone fires ZERO on load —
   every route is server-rendered through Prisma (the clone's API routes
   serve interactions only, all e2e-verified).
4. **The media-emulation sweep** — computed styles under emulated
   `prefers-reduced-motion: reduce`, `prefers-color-scheme: dark` and
   `print` on html/body/navbar/h1/CTA. NEITHER site changes anything
   (both fixed-light, print-unstyled, motion-unadapted) — parity on a
   surface never emulated. One cosmetic computed-slot variance: the
   live's `animation-duration: 0.5s` with `animation-name: none` (its
   platform CSS default) vs the clone's `0s` — no animation runs on
   either site.
5. **The text-scaling surface** — root font-size 16 → 20px (125%) →
   24px (150%): body heights BYTE-IDENTICAL between the sites at 16px
   and 20px on all 5 probed routes (ratios equal to 4 decimals at 24px),
   proving the rem-based sizing system scales identically. ONE 1px
   rounding flip at 24px on `/` (live 11394 vs clone 11395 — a sub-pixel
   rounding boundary, not structural drift; any class/structure drift
   would diverge at 20px already).

## Findings

1. **The keyboard Tab order: IDENTICAL on every probed surface (verified
   — no action)**: the desktop `/` + `/login` walks byte-matched (the
   login sequences: Google → email → password → Sign in → Forgot → Need
   an account → body); the mobile closed-panel walk byte-matched
   (trigger → Browse Courses — the panel links are SKIPPED on both
   sites); the Tab-after-open sequence byte-matched; focus-after-close
   lands on the trigger on both sites. **No invisible-focus bug** — the
   collapsed panel's grid-rows-0fr + overflow-hidden + opacity-0
   combination removes its links from Chromium's Tab order (previously
   an assumption; now empirically verified and pinned). The production
   standalone build re-verified: the login walk matches the live exactly
   with NO `nextjs-portal` (dev-only Next.js DevTools chrome — same
   accepted family as the route announcer).
2. **The form-control accessible-name hardening family (accepted —
   documented + pinned)**: the clone carries stable aria-labels the live
   lacks — the /Courses search input `Search courses` (live:
   placeholder-named "Search courses, topics, or instructors…"), the
   three filter selects `Filter by category` / `Filter by level` / `Sort
   courses` (live: VALUE-named "All Categories" / "All Levels" /
   "Newest" — a name that mutates with the filter state), the AI
   textarea `Ask a question` (live: placeholder-named) and the
   already-documented icon-only send button `Send message`. The
   newsletter input's aria-label mirrors its placeholder exactly (the
   names match — no user-visible variance). The clone's form is the
   WCAG-robust one (placeholder names vanish on input; value names
   mutate with state) — the same deliberate-better family as the
   mobile-trigger ARIA + footer-social aria-labels, previously
   undocumented because no surface extracted accessible names.
3. **Escape-to-close on the mobile menu (accepted — the live-differing
   side now documented)**: with the panel open, the live KEEPS it open
   on Escape; the clone closes it (aria-expanded false, the grid fully
   collapses to 0/opacity 0 through the transition, scroll lock
   released — geometry-verified at esc+1150ms). Already pinned by the
   existing e2e spec; the variance is now in the documented families.
4. **The `nextjs-portal` dev Tab stop (accepted — verified absent in
   production)**: on `bun run dev`, Tab past the last login focusable
   lands on the Next.js DevTools portal before body; the production
   standalone walk matches the live exactly.
5. **The media/network/storage/text-scale/storage surfaces (verified —
   pinned where meaningful)**: see the probe summaries above — all at
   parity or accepted-by-nature/architecture. Two cosmetic micro-
   variances documented: the live's empty animation-duration slot and
   the 1px landing rounding flip at 150%.

## Remediation (TDD)

**Zero source defects this session** — the remediation is documentation
plus green-by-design regression pins (the session-21 Phase-2 pattern):

8 new e2e specs across two files:
- the **accessible-name hardening pin** (3 specs): the /Courses search +
  3 selects, the AI composer textarea + send, the newsletter input —
  asserting the exact stable aria-labels;
- the **no-storage pin** (1 spec): zero localStorage + sessionStorage
  entries on the 8-route audited set;
- the **invisible-focus guard** (2 specs, mobile-navigation.spec.ts):
  Tab from the trigger SKIPS the collapsed panel's links (the next stop
  is the hero's Browse Courses link) while the open panel's first link
  IS reachable;
- the **media-emulation stability pin** (2 specs): dark-scheme leaves
  the body white; reduced-motion leaves the navbar transition at 0.5s.

One operational correction during the spec run: a manually-booted
standalone server was found still holding :3100 (Next renames the
process to `next-server`, so a `pkill -f server.js` missed it) — killed
by PID; the final gate re-ran everything on the isolated `db/e2e.db`
infrastructure.

## Parity re-audit (live vs clone, both signed in)

Every standing surface GREEN at the byte-exact state: heights ×11 routes
×2 viewports byte-exact (incl. CourseDetail 34246.25/38745 and the
/login 762 mobile pin); the class-set diff sweep — all 78 diff lines in
the FOUR documented variance families; innerText 11/11 identical; tag
drift 0 on shared classes; the FULL mobile-menu battery — trigger
classes byte-identical, the open panel at 405px wrapper / 404px inner
byte-exact, 8 links with identical texts, toggle close + route-change
close both verified invisible, scroll lock + ARIA = the documented
clone-only hardening — **no Tailwind v4 display/breakpoint/space-y
bug**; the console surface clean on the clone (the live's entries are
its platform noise only).

## Gates (final)

lint ✓ · typecheck ✓ · 41/41 unit ✓ · build ✓ · 244/244 e2e ✓ (236 →
244: +8 session-22 pins, zero regressions). The CSS-leak spec re-ran
LAST after every doc write (the session-15 process rule).

## Ship

- 61 screenshots in `docs/screenshots/` (the standard set re-captured on
  the dev server + the session-22 captures: courses-filter-row--desktop,
  aiassistant-composer--desktop, mobile-menu-escape-closed--mobile —
  VLM-verified: the filter card with its sliders icon + three selects,
  the composer with its Ask-a-question input + gradient send button, the
  fully-closed panel after Escape with the navbar + hero intact).
- `.env.example` re-verified: byte-identical to `.env`, covering every
  user-facing `process.env` reference. Included in the commit.
- Docs aligned: README (badge 285, the session-22 paragraph, the 244
  count), AGENTS.md (gotcha 51 — the interaction-modality + persistence
  surfaces; the commands table), CLAUDE.md (the 41 + 244 pyramid + the
  session-22 spec family), PAD ([S22] revision + §7.1 row),
  `nexuslearn-template_SKILL.md` v3.10.0 (the five new probes + surface
  18i + the project_state), `docs/remediation-plan-session22.md` (with
  the results), this session log, the repo worklog.
- Committed to `main` + pushed via the SSH wrapper
  (`docs/ssh_git_wrapper_v3.py`) — remote verified, operator key
  shredded after use.
