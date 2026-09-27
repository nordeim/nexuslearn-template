# NexusLearn Remediation Plan — Session 6

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; DOM extraction + computed classes + per-route head dumps +
mobile 375×667 sweeps; agent-browser sessions `live` + `clone`).

**Rule**: `skills/` folder excluded from checking/testing/compilation (already
excluded in tsconfig + eslint + vitest + playwright configs — re-verified).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 24/24 unit ✓ · build ✓ ·
68/68 e2e ✓ (session-5 state, commit `16c6296`, confirmed green on a fresh clone
with `db:push` + `db:seed`).

**Session-6 focus**: sessions 1–5 closed static, shell, content, sub-section and
interactive-state parity; this audit swept every surface again with fresh eyes
(desktop 1920×1080 + mobile 375×667), including the mobile navigation menu on
BOTH sites (the standing Tailwind v4 watchpoint — no display bug found on either
site; the clone's ARIA/scroll-lock/route-close hardening verified green), the
signed-in Dashboard (byte-exact), the full signup → verify → signed-in walk,
enroll → lesson-progress → stat recompute, newsletter + contact success states,
AI chat, and a per-route head dump. Findings below.

---

## A. Findings inventory (live vs clone)

### CourseDetail

| # | Finding | Severity |
|---|---------|----------|
| 1 | **"What You'll Learn" sidebar card missing the level row.** Live appends a divider section to the sticky card: `div.mt-6.pt-6.border-t.border-gray-100 > div.flex.items-center.gap-2` containing the lucide `Award` icon (`h-5 w-5 text-amber-500`) + `span.text-sm.font-medium.text-gray-700` rendering `"{level} Level"` (e.g. "Intermediate Level", "Advanced Level", "Beginner Level"). Present on ALL 9 courses. The clone's card stops after the tag checklist. | High |
| 2 | **Enroll button class drift.** Live: `inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 px-4 w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold py-6 rounded-xl text-lg shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-[1.02]`. Clone is missing `[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0` + `hover:bg-primary/90`, ships `font-semibold` early in the string, and appends `disabled:opacity-60` (live: `disabled:opacity-50` baked into the base). | Low |

### Head metadata (per-route OG identity)

| # | Finding | Severity |
|---|---------|----------|
| 3 | **og:title + twitter:title are static.** Live mirrors the per-route document title everywhere (`/Courses` → "Courses \| NexusLearn", `/Dashboard` → "Dashboard \| NexusLearn", CourseDetail → "Course Detail \| NexusLearn", `/` + `/login` → "NexusLearn"). The clone ships the root "NexusLearn" on every route. | Medium |
| 4 | **og:url is the static root.** Live mirrors the per-route canonical on every route — including the `?id=` query on CourseDetail (`…/CourseDetail?id=699081…`). The clone ships the bare origin everywhere. | Medium |

### /Pricing

| # | Finding | Severity |
|---|---------|----------|
| 5 | **Cards section missing the reference overlap wrapper.** Live: gray wrapper > `div.-mt-8` > `section.py-24.px-4.bg-gray-50` (the cards area pulled 32px up over the hero bottom). Clone: bare `section.py-24.px-4` — 32px taller page (2401 vs 2369 at desktop). Hero (`pt-16 pb-12`) and FAQ (`py-24 px-4 bg-white`, `max-w-3xl mx-auto` inner) match exactly. | Medium |

### /Courses

| # | Finding | Severity |
|---|---------|----------|
| 6 | **Hero search input class drift (24px mobile diff).** Live: `flex h-9 w-full border px-3 … file:text-foreground … pl-12 py-6 bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl text-base focus:border-purple-500 focus:bg-white/15` with `type="text"` — the `h-9` + `py-6` combination collapses the content box (border-box) producing the reference 50px height. Clone: missing `h-9 w-full file:text-foreground`, uses `type="search"` → 74px. | Medium |
| 7 | **Catalog wrapper div.** Live gray wrapper's children are the hero + content divs directly; the clone renders an extra classless `<div>` root (component boundary). Use a fragment. | Low |

### Landing

| # | Finding | Severity |
|---|---------|----------|
| 8 | **Hero missing `min-h-[100vh]`.** Live: `w-full h-screen relative flex items-center justify-center antialiased overflow-hidden min-h-[100vh] bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a]`. Clone lacks `min-h-[100vh]` (and uses the deliberate sRGB arbitrary-value gradient form — computed identical, keep). | Low |
| 9 | **Sections wrapper.** Live: `main > div (classless) > [hero div, 8 sections]`; clone renders the sections as `main`'s direct children. Add the wrapper to match the reference DOM. | Low |
| 10 | **Instructor grid base column class.** Live: `grid grid-cols-1 md:grid-cols-3 gap-8`; clone: `grid md:grid-cols-3 gap-8` (missing `grid-cols-1` base). | Low |

### AIAssistant

| # | Finding | Severity |
|---|---------|----------|
| 11 | **Welcome/empty-state bubble padding.** Live: `flex flex-col items-center justify-center h-full py-16 text-center`; clone: `py-12` — 32px diff (plus the documented hero-subtitle font-wrap, total 82px mobile). | Low |
| 12 | **Chat card has an extra `overflow-hidden`.** Live card: `bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[60vh] flex flex-col`; clone appends `overflow-hidden`. | Low |

### CourseCard badge

| # | Finding | Severity |
|---|---------|----------|
| 13 | **Level badge variant classes.** Live's badge div carries the shadcn variant classes `hover:bg-primary/80` and `border-0` (`… border-transparent shadow hover:bg-primary/80 absolute top-3 left-3 bg-red-100 text-red-700 border-0 font-medium text-xs`). Clone's badge (span with `data-slot`) is missing those two. | Low |

### Verified matching (no action)

Signed-in + signed-out Dashboard (desktop byte-exact 1573; mobile text-identical,
22px font band); mobile menu on BOTH sites at 375×667 (opens, 9 links, panel link
classes, desktop row `display:none`, route-change close, ARIA wiring + scroll lock
kept as the clone's hardening — no Tailwind v4 display bug on either site); all 9
course cards' data + imagery + avatars + lesson counts (1,904 — **no drift**), same
course order, prices, levels; CourseDetail hero/breadcrumb/stats/price card/
curriculum (220 rows)/instructor/About This Course (4 courses, Read More ↔ Show
Less, identical text length); login card (desktop byte-exact 1080), signup →
verify → signed-in walk on the dev server; newsletter in-place green success;
contact "Message sent!" state; enroll → dashboard stats → lesson completion →
1% / 1-95 progress recompute; AI chat (real responses); footer links + structure;
404 byte-exact; `/Home` renders the landing; all desktop heights within the
documented font-metric bands (Contact/AIAssistant/login/404/CourseDetail-not-found
byte-exact); head description/OG-desc/type/card/canonicals/icon/manifest.

### Accepted variances (documented, no action)

Font-metric wrap differences (card titles at mobile — live resolves system
"Inter" with no @font-face while the clone self-hosts next/font Inter; AI hero
subtitle 3-line vs 2-line; login h1; footer 22px; landing ~200px accumulated
mobile wrap); live's scroll-reveal animation wrappers (`opacity/transform` divs
around cards/badges); hero gradient class form (clone's arbitrary sRGB form —
computed background-image identical to live); clone's a11y hardening (ARIA on
the mobile menu, instructor avatar alt text, scroll lock); clone's real
enrollment vs live's dead Enroll button; clone's working Python course image vs
live's corrupt URL; lucide icon path variants (clock `polyline` vs `path` — same
rendering); clone's "Enrolling…"/"Signing in…" loading labels.

---

## B. Remediation plan (execution order)

### Phase 1 — TDD: specs first (RED)

- [1a] `tests/e2e/nexuslearn.spec.ts` new `session-6 parity` blocks:
  - **CourseDetail level row**: on `/CourseDetail?id=seed-1` the sticky sidebar
    card contains the Award icon row — `div.border-t.border-gray-100` with inner
    `span.text-sm.font-medium.text-gray-700` text "Intermediate Level"; check a
    Beginner course (seed-9 → "Beginner Level") too.
  - **Enroll button classes**: the Enroll Now button carries `[&_svg]:size-4`
    and `hover:bg-primary/90` (and NOT `disabled:opacity-60`).
  - **OG identity**: `/Courses` → `og:title` = "Courses \| NexusLearn",
    `twitter:title` = "Courses \| NexusLearn", `og:url` ends with `/Courses`;
    `/Dashboard` → "Dashboard \| NexusLearn"; `/CourseDetail?id=seed-1` →
    "Course Detail \| NexusLearn" + og:url containing `?id=seed-1`; `/` and
    `/login` → "NexusLearn".
  - **Pricing overlap wrapper**: the gray wrapper's 2nd child is a `div.-mt-8`
    whose inner section has `py-24 px-4 bg-gray-50`; page height parity.
  - **Courses search input**: input has `h-9` in its class list and
    `type="text"`; mobile hero height matches the reference collapse (content
    box ≤ 2px).
  - **Courses structure**: gray wrapper's direct children = hero + content (no
    intermediate classless div).
  - **Landing hero**: hero section has `min-h-[100vh]`; `main`'s single child is
    the classless wrapper div containing the hero + 8 sections.
  - **Instructor grid**: `grid-cols-1` base present.
  - **AI welcome bubble**: `py-16` present, `py-12` absent; card classes do NOT
    include `overflow-hidden`.
- [1b] `tests/metadata.test.ts` (new): pin the `routeMetadata()` helper — full
  title resolution ("X \| NexusLearn"), og/twitter title mirroring, og:url
  canonical mirroring, description/images/siteName propagation.

### Phase 2 — CourseDetail level row (GREEN for finding 1)

- [2a] `src/app/CourseDetail/page.tsx`: import `Award` from lucide-react; after
  the topics `space-y-3` block inside the sticky card, append the reference
  divider row (`mt-6 pt-6 border-t border-gray-100` > `flex items-center gap-2`
  > Award `h-5 w-5 text-amber-500` + `span.text-sm.font-medium.text-gray-700`
  `{course.level} Level`).

### Phase 3 — Head metadata per-route OG identity (GREEN for findings 3–4)

- [3a] `src/lib/metadata.ts` (new): `routeMetadata({ title?, canonical })`
  helper returning `{ title, alternates, openGraph (full: title = resolved
  document title, description, url = canonical, type, siteName, images),
  twitter (card, title, description, images) }` — child `openGraph`/`twitter`
  objects replace the root's wholesale, so the helper re-states every field.
- [3b] Swap every route's `metadata` export to the helper: Courses, Pricing,
  About, Contact, BecomeInstructor, AIAssistant, Dashboard, login (title-less →
  "NexusLearn"), Home (title-less), CourseDetail `generateMetadata` (canonical
  + og:url include the `?id=` query).
- [3c] Root layout keeps its metadata (defaults for `/`).

### Phase 4 — /Pricing overlap (GREEN for finding 5)

- [4a] `src/app/Pricing/page.tsx`: wrap the cards `<section>` in
  `<div className="-mt-8">` and add `bg-gray-50` to the inner section
  (`py-24 px-4 bg-gray-50`).

### Phase 5 — /Courses fixes (GREEN for findings 6–7)

- [5a] `src/components/CourseCatalog.tsx`: search input → live class string
  verbatim (`flex h-9 w-full border px-3 … file:text-foreground … pl-12 py-6
  …`) + `type="text"` (keep `value`/`onChange`; keep the aria-label).
- [5b] Root `<div>` → `<…>` fragment so the hero + content become the gray
  wrapper's direct children.

### Phase 6 — Landing + AI + badge fixes (GREEN for findings 8–13)

- [6a] `src/app/page.tsx`: hero section + `min-h-[100vh]`; wrap the hero +
  8 sections in a single classless `<div>` inside `<main>`; instructor grid +
  `grid-cols-1`.
- [6b] `src/components/AIAssistantChat.tsx`: welcome bubble `py-12` → `py-16`;
  drop `overflow-hidden` from the chat card.
- [6c] `src/components/CourseCard.tsx` (badge): add `hover:bg-primary/80` +
  `border-0` to the level badge class string (match the reference variant).
- [6d] `src/components/course-detail/EnrollButton.tsx`: CARD_BUTTON → live's
  verbatim string (adds the `[&_svg]` trio + `hover:bg-primary/90`,
  `disabled:opacity-50`; drop the appended `disabled:opacity-60`).

### Phase 7 — Verification

- [7] `lint → typecheck → test → build → test:e2e`; agent-browser re-audit of
  every reworked surface vs live (desktop + mobile): level row, head dumps per
  route (og:title/twitter:title/og:url), Pricing overlap + height, Courses
  input height (50px) + structure, landing hero/wrapper/instructor grid, AI
  bubble padding, badge/enroll classes; mobile menu regression re-run.

### Phase 8 — Screenshots & docs

- [8] Fresh dev-server screenshots → `docs/screenshots/` (refresh the key
  surfaces: course-detail level row, pricing, courses, landing, AI assistant,
  dashboard both states, login states, mobile menu); update AGENTS.md /
  CLAUDE.md / README.md / PAD / nexuslearn-template_SKILL.md (test counts, the
  OG-identity layer, the level row, the pricing overlap); `.env.example`
  re-verified.

### Phase 9 — Ship

- [9] Final full gate; single commit on `main`; SSH-wrapper push; worklog +
  `docs/session_8.md`.

---

## C. Extracted reference data

**Level row (live, sticky card bottom)**:
```html
<div class="mt-6 pt-6 border-t border-gray-100">
  <div class="flex items-center gap-2">
    <svg class="lucide lucide-award h-5 w-5 text-amber-500" …></svg>
    <span class="text-sm font-medium text-gray-700">Intermediate Level</span>
  </div>
</div>
```

**Enroll button (live)**: `inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 px-4 w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold py-6 rounded-xl text-lg shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-[1.02]`

**Courses search input (live)**: `flex h-9 w-full border px-3 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-12 py-6 bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl text-base focus:border-purple-500 focus:bg-white/15` (type=text; 50px via h-9 border-box content collapse)

**Pricing cards wrapper (live)**: `div.-mt-8` > `section.py-24.px-4.bg-gray-50`

**OG identity (live)**: og:title = twitter:title = document title on every
route; og:url = canonical on every route (CourseDetail includes `?id=`).

**AI welcome bubble (live)**: `flex flex-col items-center justify-center h-full py-16 text-center`

**AI chat card (live)**: `bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[60vh] flex flex-col`

**Landing hero (live)**: `w-full h-screen relative flex items-center justify-center antialiased overflow-hidden min-h-[100vh] bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a]`

**Instructor grid (live)**: `grid grid-cols-1 md:grid-cols-3 gap-8`

**Card level badge (live)**: `inline-flex items-center rounded-md px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80 absolute top-3 left-3 bg-red-100 text-red-700 border-0 font-medium text-xs`
