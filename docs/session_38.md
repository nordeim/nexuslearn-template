# Session 21 — The console-hygiene + a11y-exposure pass: five fresh-eyes probes

Continuing from session 20 (`f861004` + the pulled transcript at `6311d6d`
— `docs/session_37.md`). Sessions 1–20 closed every static, content, state,
computed-style, cascade, font, preflight, reveal-entry,
navigation-transition, deep-link, pending-state/attribute/tag/token,
environment-pollution and element-tag surface — every height byte-exact,
the mobile battery green, 272 tests. This session's mandate: the standard
parity re-audit with a mobile-navigation focus (the Tailwind v4 watch), a
fresh set of eyes on surfaces no previous audit family could see, then the
full ship ritual (screenshots, `.env.example`, docs, gates, SSH-wrapper
push).

## Baseline (the shipped session-20 tree)

All gates green on commit `6311d6d`: lint ✓ typecheck ✓ 39/39 unit ✓
build ✓ 233/233 e2e ✓. The database-location contract re-verified under
the still-polluted shell (the harness injects `DATABASE_URL=file:/home/z/my-project/db/custom.db`):
`db/custom.db` + `db/e2e.db` both at the repo root, no outside-repo
database — the session-19 guard holds. skills/ exclusion re-verified
(tsconfig, eslint, vitest, playwright, the `@source not` set). The two
session-20 fixes verified in the source (the `<span>` count at
CourseCatalog.tsx:215, the `<div>` composer at AIAssistantChat.tsx:258),
`.env.example` byte-identical to `.env`.

## The five fresh-eyes probes (the session's audit-surface additions)

1. **The console-error surface** — a console + pageerror listener on
   every route + the mobile-menu and newsletter interaction flows, both
   sites. Found the ONE real defect (finding 1 below); the live's only
   entries are its platform's own noise (cdn.tailwindcss.com production
   warning + Base44 websocket chatter).
2. **The full a11y-tree snapshot** — `ariaSnapshot()` per route, diffed
   line by line (session-20 probed landmarks only). Surfaced the
   aria-hidden root cause + the route announcer + the social aria-labels
   (already documented) + the live's "Notifications" toast region
   (platform infra).
3. **The link + image inventory** — every `a` href/target/rel/aria-label
   and every `img` src/alt/natural-size/loading attr, diffed by VALUE.
   Surfaced the /login logo hosting variance (finding 4) and re-surfaced
   the footer-social aria-labels; everything else identical — including
   the footer's 14 text links byte-identical down to widths (112/103/82/
   47/63/129/54/84/27/95/115) and the 4 social links' classes.
4. **The pseudo-element sweep** — `getComputedStyle(el, ::before/::after)`
   content + backgrounds on every element of every route: 0 pseudo
   elements on BOTH sites (identical, now verified rather than assumed).
5. **The SVG class-histogram diff** — svg counts per class string per
   route: IDENTICAL on all 11 routes (91/39/28/12/12/14/10/13/3/405) —
   proving the icon inventory matches and isolating the aria-hidden
   attribute as the sole svg difference.

**Methodology lesson (recorded as gotcha 50e):** the live's /CourseDetail
renders its 380-lesson curriculum PROGRESSIVELY after `networkidle` — a
first-round a11y/svg probe raced a half-rendered page (7 svgs measured vs
405) and produced a phantom "405 vs 7" finding. Every probe now polls a
DOM signature (scrollHeight + svg/a counts) until stable. The settle-wait
is part of the surface.

## Findings

1. **The /Pricing FAQ icons' kebab-case SVG props (Medium — FIXED)**:
   `src/app/Pricing/page.tsx:209-211` declared `stroke-width`,
   `stroke-linecap`, `stroke-linejoin` as JSX props. React 19 logs three
   `Invalid DOM property … Did you mean strokeWidth?` console errors on
   every dev-server /Pricing load. Rendering is unaffected (React passes
   the attribute through — the DOM is byte-identical to the live's), which
   is why 20 sessions of DOM/class/height/text audits never saw it; only
   the console surface hears it. Production React strips the warning (the
   standalone build's console is clean), so the defect is dev-mode
   hygiene — the operator's daily `bun run dev` surface.
2. **lucide-react's `aria-hidden="true"` default (accepted — documented +
   pinned)**: lucide-react 0.525 hides every icon from the a11y tree
   (`!children && !hasA11yProp(rest) && { "aria-hidden": "true" }` in its
   Icon factory); the live's runtime ships its icons EXPOSED — 0/405
   aria-hidden on the live's /CourseDetail vs 405/405 on the clone, the
   same ratio on every route. The exposed icons surface as ~405 NAMELESS
   img nodes per page (screen-reader noise — the dominant root cause of
   the a11y-tree diff: they split adjacent text into separate nodes and
   turn named buttons into unnamed containers). The clone's hidden form
   is the WCAG-correct deliberate hardening — the same family as the
   documented mobile-trigger ARIA + footer-social aria-labels. PINNED by
   the session-21 e2e sweep (every svg hidden via self or wrapper
   aria-hidden) so no future session "fixes" it into drift.
3. **The `<next-route-announcer>` element (accepted — documented +
   pinned)**: Next.js's framework-level screen-reader route announcer,
   present on every clone page (the `- alert` a11y node; its DOM probe
   needed the tag name, not the legacy id). The Base44 live has no
   equivalent. The login-error specs already exclude it
   (`[role=alert]:not(#__next-route-announcer__)`).
4. **The /login logo hosting (accepted — documented)**: the live serves
   `…supabase.co/…/e461cd10b_logo.png`, the clone self-hosts `/logo.png`
   — the ASSET IS BYTE-IDENTICAL (md5 `f2d0170f…`, 1024×1024, alt
   identical). Platform-asset-hosting variance.
5. **Cross-references**: the footer-social aria-labels (surfaced by the
   link inventory — already documented in the SKILL hardening list) and
   the live's platform console noise (cdn.tailwindcss + websocket —
   accepted-by-nature).

## Remediation (TDD)

**RED first**: `tests/svg-props.test.ts` (2 specs — the kebab-case sweep
over every `.tsx` under `src/`, and the camelCase pin on the FAQ icon's
opening tag). RED verified: the sweep printed exactly the three pinned
hits (`src/app/Pricing/page.tsx:209 stroke-width`, `:210
stroke-linecap`, `:211 stroke-linejoin`); the camelCase pin failed (zero
camelCase forms). One infra correction during RED: the draft regex used
the `/s` flag + a lookbehind (both ES2018-only — `next build`'s typecheck
rejected them) → replaced with an `[^>]*` class match + a non-capturing
prefix group.

**GREEN**: the three props → `strokeWidth` / `strokeLinecap` /
`strokeLinejoin` in `src/app/Pricing/page.tsx`. React maps them to the
SAME rendered attributes — the DOM stays byte-identical (pinned by the
new e2e FAQ-attribute spec: `stroke-width="2"`, `stroke-linecap="round"`,
`stroke-linejoin="round"`, `fill="none"`, `stroke="currentColor"`,
`aria-hidden="true"` on the `lucide-circle-help` svg).

**Phase 2 pins** (3 new e2e specs, green-by-design guards): the FAQ
attributes spec above; the aria-hidden sweep (every svg on the audited
route set hidden via self OR wrapper aria-hidden — covering the hero
flowing-lines svg's `div[aria-hidden]` wrapper form); the route-announcer
existence pin.

## Parity re-audit (live vs clone, both signed in)

Every standing surface GREEN at the byte-exact state: heights ×11 routes
×2 viewports byte-exact (incl. CourseDetail 34246.25 / 38745 and the
/login 762 mobile pin); the class-set diff sweep — all 78 diff lines in
the FOUR documented variance families; innerText 11/11 identical; tag
drift 0 on shared classes; the FULL mobile-menu battery — trigger
classes byte-identical, the open panel at 405px wrapper / 404px inner
byte-exact, 8 links with identical texts, toggle close + route-change
close both verified invisible (the visibility-aware probe: wrapperH=0,
opacity=0, innerH=0 — the grid-collapse mechanism; the live unmounts),
scroll lock + ARIA = the documented clone-only hardening — **no Tailwind
v4 display/breakpoint/space-y bug**; the link + image inventory identical
(findings 4 + the social cross-ref only); the pseudo-element surface 0/0;
the SVG class histogram identical on all routes; the dev console CLEAN on
the clone after the fix (the remaining diff is the live's platform noise
only).

## Gates (final)

lint ✓ · typecheck ✓ · 41/41 unit ✓ · build ✓ · 236/236 e2e ✓ (233 →
236: +3 session-21 specs, zero regressions). The CSS-leak spec re-ran
LAST after every doc write (the session-15 process rule).

## Ship

- 58 screenshots in `docs/screenshots/` (the standard set re-captured on
  the remediated dev server + the session-21 captures:
  pricing-faq-section--desktop, pricing-faq-row--desktop — the remediated
  icons — the mobile-menu states, the AI answer with the wait-for-answer
  condition — VLM-verified: the FAQ section with its purple circle-help
  icons and clean layout, the fully-visible 405px mobile panel with all
  links + CTA, the complete non-loading AI answer).
- `.env.example` re-verified: byte-identical to `.env`, covering every
  user-facing `process.env` reference (`DATABASE_URL` — enforced by
  tests, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`). Included in the commit.
- Docs aligned: README (badge 277, the session-21 paragraph, the 41/236
  counts), AGENTS.md (gotcha 50 — the runtime-noise + attribute-value
  surfaces incl. the settle-wait rule; the commands table), CLAUDE.md
  (the 41 + 236 pyramid + the session-21 spec family), PAD ([S21]
  revision + two §7.1 rows), `nexuslearn-template_SKILL.md` v3.9.0 (the
  five new probes in the description + surface 18h + the project_state),
  `docs/remediation-plan-session21.md` (with the results), this session
  log, the repo worklog.
- Committed to `main` + pushed via the SSH wrapper
  (`docs/ssh_git_wrapper_v3.py`) — remote verified, operator key shredded
  after use.
