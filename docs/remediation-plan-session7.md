# NexusLearn Remediation Plan — Session 7

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; DOM structure walks + unique class-set diffs + computed
styles + pixel-cropped icon samples + per-route head dumps + desktop 1920×1080 and
mobile 375×667 height sweeps; agent-browser sessions `live` + `clone`).

**Rule**: `skills/` folder excluded from checking/testing/compilation (already excluded
in tsconfig + eslint + vitest + playwright configs — re-verified this session).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 29/29 unit ✓ · build ✓ ·
85/85 e2e ✓ (session-6 state, commit `8cee28c`, confirmed green on a fresh clone with
`bun install` + `db:push` + `db:seed` and the pinned `DATABASE_URL`).

**Session-7 focus**: sessions 1–6 closed static, shell, content, sub-section,
interactive-state, head-metadata, OG-identity and class-verbatim parity. This audit
re-swept every surface with fresh eyes (desktop + mobile), with particular attention
to the **mobile navigation menu** (the standing Tailwind v4 watchpoint) — **re-verified
GREEN on both sites**: menu opens (panel `md:hidden bg-white`, 8 links, link classes
byte-identical incl. the active `bg-purple-50 text-purple-600`), icon swaps to X,
desktop row `display:none` at 375px, route-change close, body scroll lock + ARIA
(clone hardening kept; live has neither — documented), **no Tailwind v4 display-mismatch
bug on either site**. The 6 mobile-nav e2e guards pass. This session's findings are
concentrated in the **landing-page section internals** (category icons, featured header,
learning paths, testimonials) plus a set of **button-base / form-control / hero-h1
class drifts** across routes and the **course display order**.

---

## A. Findings inventory (live vs clone)

### Data / ordering

| # | Finding | Severity |
|---|---------|----------|
| 1 | **Course display order.** Live's default ("Newest") /Courses order is stable across reloads: WebDev → DataScience → Cloud → Business → EmotionalIQ → ML → UI/UX → AdvancedPython → DigitalMarketing. The landing "Featured Courses" grid follows the SAME underlying sequence (WebDev, Business, ML, UI/UX, AdvancedPython, DigitalMarketing — same 6-course set, different order than the clone's seed order). The clone renders seed insertion order (Cloud first). Live's "Most Popular" sorts by students desc (clone matches — verified). | High |
| 2 | **Testimonial order + avatar.** Live: Sarah Chen → Elena Rodriguez (avatar `photo-1438761681033-6461ffad8d80`) → Marcus Johnson. Clone: Sarah → Marcus → Elena (Elena carries `photo-1472099645785-5658abf4ff4e`). | Medium |

### Landing — Browse by Category

| # | Finding | Severity |
|---|---------|----------|
| 3 | **Category icons: wrong shapes AND colors.** Live renders each category icon with `bg-gradient-to-r from-X-500 to-X-600 bg-clip-text` (dead gradient — computed stroke `rgb(10,10,10)`, near-black, verified by pixel sampling: live icons render near-black, clone renders colored). Live mapping: Business=briefcase(blue grad), Technology=**monitor**(cyan), Marketing=megaphone(pink), Design=palette(purple), Personal Development=heart(rose), Programming=code(emerald), AI & Innovation=sparkles(violet). Clone: Technology=**cpu**, and all icons use `text-X-600` classes (blue/cyan/**orange**/**pink**/**green**/**purple**/**indigo**) — both the icon set and the tint wrappers differ (live tints: blue/cyan/pink/purple/**rose**/**emerald**/**violet**). | High |
| 4 | **Category card gradient overlay carries an extra `rounded-2xl`** (clone) — live's overlay has none. | Low |

### Landing — hero / CTA buttons (all gradient + outline + text button variants)

| # | Finding | Severity |
|---|---------|----------|
| 5 | **Landing buttons missing the shadcn base.** Every live landing button carries `disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`; gradient variants also carry `hover:bg-primary/90` (live class strings extracted verbatim). Affected: hero "Browse Courses" + "Start Learning", AI-section "Try AI Assistant" (mt-8), instructor "Start Teaching Today" (mt-10), pricing-card buttons (2 variants, `px-4 mt-8 w-full py-6 rounded-xl font-semibold text-base…`), learning-path "Start This Path" (text variant with `hover:bg-primary/90`), and the featured-header "View All Courses" outline button. The clone ships `font-semibold` early in the string and omits the base utilities. | Medium |
| 6 | **Featured section header structure.** Live: `div.flex.flex-col.md:flex-row.md:items-end.md:justify-between.mb-16` holding a classless title block (eyebrow + h2 + LEFT-aligned `p.mt-4.text-lg.text-gray-500.max-w-xl`) plus `a.mt-6.md:mt-0` with the "View All Courses" outline button (arrow icon `lucide-arrow-right ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform`). Clone: centered `text-center mb-16` block with `max-w-2xl mx-auto` subtitle and the button BELOW the grid in a `div.text-center.mt-12`. | High |
| 7 | **Learning-path cards.** (a) missing `border border-transparent hover:border-gray-100` on the card; (b) Data Science Expert icon: live = **TrendingUp**, clone = Code (all three cards ship the same Code icon); (c) Digital Marketing Pro: live = **Target** icon with `from-amber-500 to-orange-600` gradient (icon wrapper + step circles), clone = Code with `from-orange-500 to-red-600`. | Medium |
| 8 | **Testimonials card design.** Live card: `relative bg-gray-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-500 border border-transparent hover:border-gray-100`; quote icon `lucide-quote h-10 w-10 text-purple-200 mb-4`; stars row `div.flex.gap-1.mb-4`; quote `p.text-gray-600.leading-relaxed.mb-6`; avatar row `div.flex.items-center.gap-3` with `img.w-11.h-11.rounded-full.object-cover` + `p.font-semibold.text-gray-900.text-sm` (name) + `p.text-xs.text-gray-500` (role). Clone ships the old design: `group p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1…`, quote `h-8 w-8`, name `p.font-semibold.text-gray-900`, role `text-sm`, avatar row carries `pt-6 border-t border-gray-50`. | High |

### /Courses

| # | Finding | Severity |
|---|---------|----------|
| 9 | **Filter card missing the leading icon.** Live's floating filter card starts with `svg.lucide-sliders-horizontal.h-5.w-5.text-gray-400.hidden.sm:block` before the three selects; the clone renders none. | Medium |
| 10 | **Filter select triggers use the new shadcn v4 form.** Live ships the old v3-style trigger: `flex h-9 items-center justify-between whitespace-nowrap border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-[150px|160px|180px] rounded-xl border-gray-200` with `chevron-down h-4 w-4 opacity-50`. The clone's `SelectTrigger` renders the new-york v4 string (`data-[slot=…]`, `shadow-xs`, `size-4`, `ring-[3px]`…). Same drift on /Contact's subject trigger. | Medium |
| 11 | **Level badge map + element + class order.** Live's Beginner badge: `bg-emerald-100 text-emerald-700` (clone: `bg-green-100 text-green-700`); Intermediate amber and Advanced red match. Live renders the badge as a plain **DIV** with the classes ordered `…border-transparent shadow hover:bg-primary/80 absolute top-3 left-3 bg-X-100 text-X-700 border-0 font-medium text-xs` (the clone's Badge span reorders them: `…shadow absolute top-3 left-3 font-medium text-xs hover:bg-primary/80 border-0 bg-X-100 text-X-700`). | Medium |

### /CourseDetail

| # | Finding | Severity |
|---|---------|----------|
| 12 | **Hero stat lessons icon.** Live: `lucide-circle-play h-5 w-5` next to "380 lessons"; clone: `lucide-book-open h-5 w-5`. (Everything else on the page is at parity — like-for-like diff showed only this + the accepted gradient class form; desktop -25px = font band; mobile -1195px = accumulated lesson-row font-wrap band, verified row-by-row: identical row HTML, live's system-fallback font wraps ~150 more "Lesson N: Module Content" rows.) | Low |

### /Pricing

| # | Finding | Severity |
|---|---------|----------|
| 13 | **FAQ icon component name.** Live: `lucide lucide-circle-help`; clone renders `lucide lucide-circle-question-mark` (lucide-react 0.525 aliases `CircleHelp` → `circle-question-mark.js`). Same glyph, different class — inline the reference SVG to match verbatim. | Low |
| 14 | **Hero h1 base size.** Live: `text-3xl md:text-5xl font-bold text-white tracking-tight`; clone: `text-4xl md:text-5xl …`. | Medium |
| 15 | **Pricing-card buttons** — same shadcn-base drift as finding 5. | Medium |

### /Contact

| # | Finding | Severity |
|---|---------|----------|
| 16 | **Form control drift.** Labels: live `text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 font-medium` (clone missing the peer-disabled pair). Textarea: live `min-h-[60px]` + `mt-2 rounded-xl` + `px-3 py-2` (clone: `min-h-[120px]`, different class order). Subject select trigger: old-style (see finding 10). **Send button completely different**: live ships the reference gradient button (`…disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 bg-gradient-to-r from-cyan-500 to-purple-600 … font-semibold px-8 py-6 rounded-xl shadow-lg shadow-purple-500/25 … hover:scale-105`) with `lucide-send ml-2 h-4 w-4`; clone ships `w-full h-12 … disabled:opacity-60` with no icon. Info-card values: email/phone are `<a class="text-gray-500 hover:text-purple-600 transition-colors">` on live (clone appends `text-sm`), address `p.text-gray-500`. | High |
| 17 | **Contact hero h1 base size** — `text-3xl` (live) vs `text-4xl` (clone). | Medium |

### /About

| # | Finding | Severity |
|---|---------|----------|
| 18 | **Stats grid structure.** Live: `div.max-w-7xl.mx-auto` wrapper > bare `div.grid.grid-cols-2.md:grid-cols-4.gap-8`; stat label `p.mt-2.text-gray-500.font-medium`. Clone: grid itself carries `max-w-5xl mx-auto` (renders 1024px vs live's 1280px); label `mt-2 text-sm text-gray-500`. | Medium |

### /BecomeInstructor

| # | Finding | Severity |
|---|---------|----------|
| 19 | **Hero drift.** h1: live `text-3xl md:text-5xl` vs clone `text-4xl md:text-6xl`; gradient text: live `from-cyan-400 to-purple-500` vs clone `from-cyan-400 via-purple-500 to-pink-500`; hero icon: live **Video** vs clone Clapperboard; hero subtitle: live has NO `leading-relaxed` (clone appends it); wrapper class order (`max-w-4xl mx-auto text-center relative z-10`). | Medium |
| 20 | **Benefit h3.** Live: `font-bold text-gray-900 text-lg mb-2`; clone: `font-semibold text-gray-900 mb-2`. | Low |

### /AIAssistant

| # | Finding | Severity |
|---|---------|----------|
| 21 | **Composer send button + icon.** Live: `…disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 py-2 … self-end` with `lucide-send h-5 w-5`; clone appends `disabled:hover:scale-100 disabled:cursor-not-allowed` instead of the `[&_svg]` trio + `hover:bg-primary/90`, icon `h-4 w-4`. | Low |

### /login

| # | Finding | Severity |
|---|---------|----------|
| 22 | **Google icon wrapper.** Live wraps the Google svg (`class="h-5 w-5"`) in `<div class=" transition-transform duration-200 -ml-4">`; the clone puts all classes directly on the svg. | Low |

### Verified matching (no action)

Mobile menu on BOTH sites at 375×667 (opens, 8 links, byte-identical panel link
classes incl. active state, desktop row `display:none`, route-change close, icon swap;
clone's ARIA + scroll-lock hardening kept — live has neither); sign-in returns to `/`
on both; signed-in + signed-out Dashboard (byte-exact 1573 desktop, "No courses yet"
state on both); head metadata per route (title/og:title/twitter:title/og:url mirror —
spot-verified on /Courses); CourseDetail like-for-like (WebDev 380 lessons, $49.99/
$149.99, Enroll Now + Read More, sidebar level row, 776≈777 flex rows, desktop 34246
vs 34221); /Pricing overlap + FAQ stack; landing section set + order (8 sections);
hero stats (10K+/500+/50+/95%); instructor section (image, $12.5M stat card, CTA);
AI glass cards (message-square/lightbulb/chart-column/sparkles); newsletter form
(verified flow: "You're subscribed! Welcome aboard."); contact flow ("Message sent!");
footer (16 links, tagline, 22px font band); 404; /Home; sort dropdown options and
"Most Popular" behavior; all 9 courses' data (titles/ratings/students/prices/levels/
lesson counts 1,904); OG identity; e2e 85/85 + unit 29/29 baseline green.

### Accepted variances (documented, no action)

Font-metric wrap differences (live resolves system "Inter" with no @font-face —
in THIS headless environment both fall back to system fonts that render slightly
wider on live, wrapping more card titles / lesson rows: /Courses -47px, /About -33px,
CourseDetail mobile -1195px, /login -44px, /AIAssistant -50px, /Pricing -38px — all
accumulated wrap bands with identical row HTML); live's scroll-reveal animation
wrappers (`div` + inline `opacity/transform` styles) and the classless per-card
wrapper divs in the category grid; the hero gradient class form (clone's arbitrary
sRGB form — computed background-image identical); clone's a11y hardening (ARIA,
scroll lock, alt text); real enrollment vs live's dead Enroll button; working Python
course image; clone's dev-only Next.js dev-tools overlay elements; lucide path-count
variants (identical glyphs).

---

## B. Remediation plan (execution order — TDD: specs RED first, then GREEN)

### Phase 1 — RED: pin the new reference state in specs

- [1a] `tests/seed-data.test.ts`: new test — the seed array order matches the
  reference display order (WebDev, DataScience, Cloud, Business, EmotionalIQ, ML,
  UI/UX, AdvancedPython, DigitalMarketing) and `sortOrder` follows array index.
- [1b] `tests/e2e/nexuslearn.spec.ts` new `session-7 parity` describe block:
  - **Category icons**: the 7 category cards' icon svgs carry
    `bg-gradient-to-r … bg-clip-text` classes (and NOT `text-X-600`); Technology
    uses the monitor icon (svg class `lucide-monitor`); tint wrappers include
    `bg-pink-500/10` (Marketing), `bg-rose-500/10` (Personal Development),
    `bg-emerald-500/10` (Programming), `bg-violet-500/10` (AI & Innovation).
  - **Category overlay**: no `rounded-2xl` on the hover overlay div.
  - **Featured header**: the featured section's first child is the flex header
    (`flex flex-col md:flex-row md:items-end md:justify-between mb-16`); its last
    child is the grid (no `text-center mt-12` button row); the header contains a
    "View All Courses" button carrying `border-gray-300` + `hover:border-purple-500`.
  - **Learning paths**: cards carry `border border-transparent hover:border-gray-100`;
    Data Science card has `lucide-trending-up`; Digital Marketing card has
    `lucide-target` + `from-amber-500 to-orange-600`.
  - **Testimonials**: card class `relative bg-gray-50 rounded-3xl p-8 … hover:shadow-xl
    transition-all duration-500 border border-transparent hover:border-gray-100`; quote
    icon `h-10 w-10`; name `text-sm` + role `text-xs`; avatar row has NO `border-t`;
    second card = Elena Rodriguez (Data Scientist).
  - **Button bases**: hero "Browse Courses" has `[&_svg]:size-4` + `hover:bg-primary/90`;
    pricing-card buttons + path "Start This Path" + AI "Try AI Assistant" carry
    `disabled:opacity-50` + `[&_svg]:size-4`.
  - **Level badge**: the card badge is a DIV carrying `hover:bg-primary/80` BEFORE
    `absolute top-3 left-3` and `bg-emerald-100 text-emerald-700` for Beginner
    (not `bg-green-100`).
  - **Courses filter card**: leading `lucide-sliders-horizontal` icon present
    (`hidden sm:block`); select triggers carry `ring-offset-background` +
    `[&>span]:line-clamp-1` (old-style) and NOT `data-[slot=select-value]`.
  - **Catalog order**: the /Courses h3 sequence equals the reference order
    (WebDev first); landing featured h3 sequence (WebDev, Business, ML, UI/UX,
    AdvancedPython, DigitalMarketing).
  - **CourseDetail lessons stat**: hero stat row shows `lucide-circle-play` (not
    book-open).
  - **Pricing**: FAQ icon svg class contains `circle-help`; hero h1 base `text-3xl`.
  - **Contact**: textarea `min-h-[60px]`; Send button carries `px-8 py-6` +
    `hover:scale-105` + a `lucide-send` child; labels carry `peer-disabled:opacity-70`;
    hero h1 base `text-3xl`; email/phone anchors without `text-sm`.
  - **About**: stats grid is bare (`grid grid-cols-2 md:grid-cols-4 gap-8` exactly)
    inside a `max-w-7xl mx-auto` wrapper; labels `mt-2 text-gray-500 font-medium`.
  - **BecomeInstructor**: h1 `text-3xl md:text-5xl`; gradient text `from-cyan-400
    to-purple-500` (no `via-`); `lucide-video` present / `lucide-clapperboard` absent;
    benefit h3 `font-bold text-gray-900 text-lg mb-2`; subtitle without
    `leading-relaxed`.
  - **AIAssistant**: send button has `hover:bg-primary/90` + `[&_svg]:size-4` and
    NOT `disabled:hover:scale-100`; send icon `h-5 w-5`.
  - **Level badge**: covered above under the catalog specs (emerald Beginner + DIV).
  - **login**: Google svg wrapped in a div with `-ml-4` (svg itself only `h-5 w-5`).
- [1c] Update the 3 seed-position-dependent specs to the new IDs: "About This
  Course visible" → `seed-6` (ML); "About This Course absent" → `seed-2`
  (DataScience); sidebar level row "Intermediate Level" → `seed-3` (Cloud).
  (`seed-9` Beginner spec: new seed-9 = Digital Marketing — still Beginner ✓.)
- [1d] Verify RED: run vitest (order test fails) + the new e2e specs against the
  current build (expect failures; the 3 re-pointed specs may pass or fail depending
  on the current seed mapping — accept either, they pin the NEW mapping).

> Validation note (post-write): the badge finding was corrected after a deeper DOM
> check — live's Beginner badge is `emerald` (not Intermediate) and the badge element
> is a plain DIV; Phase 6c and the badge spec reflect this.

### Phase 2 — GREEN: seed reorder (findings 1, 2 partially)

- [2a] `prisma/seed-data.ts`: reorder the COURSES array to the reference display
  order; renumber `sortOrder` 1–9 and the ids `seed-1`…`seed-9` to follow the new
  order (id ↔ position binding keeps the "newest" id-sort == sortOrder sort).
- [2b] Re-seed the dev DB (`db:push` + `db:seed` with the pinned DATABASE_URL;
  e2e re-seeds its own `db/e2e.db` in global-setup).
- [2c] Update `tests/seed-data.test.ts` imagery/avatar expectations if any are
  position-dependent (they are title-keyed — verify).

### Phase 3 — GREEN: landing categories + overlay (findings 3, 4)

- [3a] `src/app/page.tsx`: CATEGORIES — swap Technology icon Cpu → **Monitor**;
  replace the `CATEGORY_ICON_COLOR` map with the reference gradient classes
  (`bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text` etc. per category);
  update `CATEGORY_ICON_TINT` to the live tints (pink/rose/emerald/violet for
  Marketing/Personal Development/Programming/AI & Innovation).
- [3b] Remove `rounded-2xl` from the category hover overlay div.

### Phase 4 — GREEN: featured header + learning paths + testimonials (findings 6, 7, 8)

- [4a] Featured section: restructure the header to the reference flex row
  (`flex flex-col md:flex-row md:items-end md:justify-between mb-16` with the
  classless title block + left-aligned `max-w-xl` subtitle and the
  `a.mt-6.md:mt-0` outline button); delete the below-grid `text-center mt-12` row.
- [4b] Learning paths: add `border border-transparent hover:border-gray-100` to the
  cards; add a `TrendingUp`/`Target` icon per card (replace the shared Code);
  Digital Marketing gradient `from-orange-500 to-red-600` → `from-amber-500
  to-orange-600`.
- [4c] Testimonials: rework the card to the reference design (classes above);
  reorder to Sarah → Elena → Marcus; Elena's avatar → `photo-1438761681033-6461ffad8d80`.

### Phase 5 — GREEN: landing button bases (finding 5) + AI CTA + instructor CTA + pricing cards + path button

- [5a] Update every affected landing button to the verbatim live class string
  (add the `disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none
  [&_svg]:size-4 [&_svg]:shrink-0` base + `hover:bg-primary/90` on gradient variants;
  move `font-semibold` to the live position; arrow icon class order
  `ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform`).

### Phase 6 — GREEN: /Courses filter card + badge map (findings 9, 10, 11)

- [6a] `src/components/CourseCatalog.tsx`: add the leading `SlidersHorizontal`
  icon (`h-5 w-5 text-gray-400 hidden sm:block`).
- [6b] `src/components/ui/select.tsx`: rebase `SelectTrigger` on the old-style
  reference class string (`flex h-9 items-center justify-between … ring-offset-background
  data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1
  focus:ring-ring … [&>span]:line-clamp-1` + `size-4` → `h-4 w-4` chevron), keeping
  the `data-slot` + size props; call-sites keep their width/rounded utilities.
  (Single shared primitive — fixes /Courses AND /Contact triggers at once.)
- [6c] `src/components/CourseCard.tsx`: level badge map Beginner green → emerald
  (`bg-emerald-100 text-emerald-700`); render the badge as a plain `<div>` with the
  verbatim live class order (`…border-transparent shadow hover:bg-primary/80 absolute
  top-3 left-3 bg-X-100 text-X-700 border-0 font-medium text-xs`) instead of the
  Badge span.

### Phase 7 — GREEN: CourseDetail + Pricing + Contact + About + BI + AIAssistant + login (findings 12–22)

- [7a] `src/app/CourseDetail/page.tsx`: lessons stat icon BookOpen → CirclePlay.
- [7b] `src/app/Pricing/page.tsx`: h1 `text-4xl` → `text-3xl`; FAQ icon → inline
  reference SVG (`lucide lucide-circle-help`); pricing-card buttons → verbatim live
  strings (same base as Phase 5).
- [7c] `src/components/ContactForm.tsx`: labels + textarea + Send button → reference
  classes (Send gains `lucide-send ml-2 h-4 w-4`); `src/app/Contact/page.tsx`: h1
  `text-3xl`; info anchors drop `text-sm` (address `p.text-gray-500` stays).
- [7d] `src/app/About/page.tsx`: stats grid → bare grid inside a `max-w-7xl mx-auto`
  wrapper; labels → `mt-2 text-gray-500 font-medium`.
- [7e] `src/app/BecomeInstructor/page.tsx`: h1 base/`md:` sizes; gradient text;
  Clapperboard → Video (import + benefits icon entry); benefit h3 classes; subtitle
  drops `leading-relaxed`; wrapper class order.
- [7f] `src/components/AIAssistantChat.tsx`: send button → verbatim live string;
  send icon `h-5 w-5`.
- [7g] `src/app/login/page.tsx`: wrap the Google svg in the reference
  `div.-ml-4` wrapper (svg keeps only `h-5 w-5`).

### Phase 8 — Verification

- [8a] `lint → typecheck → test → build → test:e2e` (full gate).
- [8b] agent-browser re-audit of every reworked surface vs live (desktop + mobile):
  category icons (pixel-sample near-black), featured header, paths, testimonials,
  button class sets, filter card, catalog + featured ORDER, CourseDetail stat icon,
  Pricing/Contact/About/BI/AI/login class sets; mobile menu regression re-run;
  heights sweep.

### Phase 9 — Screenshots & docs

- [9a] Fresh dev-server screenshots → `docs/screenshots/` (landing, categories
  close-up, featured, courses, course-detail, pricing, dashboard, AI, login, about,
  contact, becomeinstructor + mobile landing/menu-open/courses).
- [9b] Docs: README (features/test counts), AGENTS.md (new gotchas: reference
  display order, category icon gradient dead-classes, old-style select trigger),
  CLAUDE.md, PAD ([S7] revision), nexuslearn-template_SKILL.md version bump,
  `.env.example` re-verify, this plan, `docs/session_10.md` session log, worklog.

### Phase 10 — Ship

- [10] Final full gate; single commit on `main`; SSH-wrapper push; key shredded
  after push.

---

## C. Extracted reference data (verbatim live strings)

**Course display order (also featured order = filtered subsequence):**
1. Complete Web Development Bootcamp 2026 (Beginner, featured, longDesc)
2. Data Science with Python & SQL (Beginner, not featured)
3. Cloud Computing with AWS (Intermediate, not featured)
4. Business Strategy & Leadership (Intermediate, featured)
5. Emotional Intelligence & Mindfulness (Beginner, not featured)
6. Machine Learning & AI Masterclass (Intermediate, featured, longDesc)
7. UI/UX Design Professional Certificate (Beginner, featured, longDesc)
8. Advanced Python Programming (Advanced, featured)
9. Digital Marketing Strategy A-Z (Beginner, featured, longDesc)

**Category icons (svg class)**: `lucide lucide-{briefcase|monitor|megaphone|palette|
heart|code|sparkles} h-7 w-7 bg-gradient-to-r from-{blue|cyan|pink|purple|rose|emerald|
violet}-500 to-{…}-600 bg-clip-text` (renders near-black rgb(10,10,10) — dead gradient).

**Category tint wrappers**: `inline-flex p-4 rounded-2xl bg-{blue|cyan|pink|purple|rose|
emerald|violet}-500/10 mb-4 group-hover:scale-110 transition-transform duration-300`.

**Hero "Browse Courses"**: `inline-flex items-center justify-center gap-2 whitespace-
nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:
pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4
[&_svg]:shrink-0 hover:bg-primary/90 h-9 bg-gradient-to-r from-cyan-500 to-purple-600
hover:from-cyan-400 hover:to-purple-500 text-white font-semibold px-8 py-6 text-lg
rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300
hover:shadow-purple-500/40 hover:scale-105`

**Hero "Start Learning"**: `inline-flex items-center justify-center gap-2 whitespace-
nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-
ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none
[&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm h-9 border-white/20 bg-white/10
text-white hover:bg-white/15 hover:text-white px-8 py-6 text-lg rounded-xl
backdrop-blur-sm transition-all duration-300 hover:scale-105`

**Featured header**: `div.flex.flex-col.md:flex-row.md:items-end.md:justify-between.mb-16`
> classless div (span eyebrow, h2 `mt-3 text-3xl md:text-5xl font-bold text-gray-900
tracking-tight`, p `mt-4 text-lg text-gray-500 max-w-xl`) + `a.mt-6.md:mt-0` >
button `inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm
font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none
[&_svg]:size-4 [&_svg]:shrink-0 border bg-background shadow-sm h-9 group
border-gray-300 text-gray-700 hover:border-purple-500 hover:text-purple-700
hover:bg-purple-50 rounded-xl px-6 py-3 transition-all duration-300` + svg
`lucide-arrow-right ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform`.

**Learning path card**: `group relative bg-gray-50 rounded-3xl p-8 hover:bg-white
hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 border
border-transparent hover:border-gray-100`; icon wrappers
`inline-flex p-3 rounded-2xl bg-gradient-to-r from-{cyan-500 to-blue-600|purple-500
to-pink-600|amber-500 to-orange-600} mb-6` with `{Code|TrendingUp|Target} h-6 w-6
text-white`.

**Path "Start This Path" button**: `inline-flex items-center justify-center gap-2
whitespace-nowrap text-sm font-medium focus-visible:outline-none
focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none
disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
hover:bg-primary/90 h-9 px-4 py-2 mt-6 w-full text-purple-600 hover:text-purple-700
hover:bg-purple-50 group/btn rounded-xl transition-all duration-300`.

**Testimonial card**: `relative bg-gray-50 rounded-3xl p-8 hover:bg-white
hover:shadow-xl transition-all duration-500 border border-transparent
hover:border-gray-100` > svg `lucide-quote h-10 w-10 text-purple-200 mb-4` >
`div.flex.gap-1.mb-4` (5× star `h-4 w-4 fill-yellow-400 text-yellow-400`) >
`p.text-gray-600.leading-relaxed.mb-6` > `div.flex.items-center.gap-3` >
`img.w-11.h-11.rounded-full.object-cover` + div > `p.font-semibold.text-gray-900.
text-sm` + `p.text-xs.text-gray-500`.

**Testimonials data**: Sarah Chen / Software Engineer at Google /
`photo-1494790108377-be9c29b29330`; Elena Rodriguez / Data Scientist /
`photo-1438761681033-6461ffad8d80`; Marcus Johnson / Marketing Director /
`photo-1507003211169-0a1dd7228f2d` (all `?w=100&q=80`).

**Courses filter card**: `div.bg-white.rounded-2xl.shadow-lg.border.border-gray-100.
p-4.flex.flex-wrap.items-center.gap-4` > svg `lucide-sliders-horizontal h-5 w-5
text-gray-400 hidden sm:block` + 3 triggers + `span.ml-auto.text-sm.text-gray-500`.

**Old-style select trigger**: `flex h-9 items-center justify-between whitespace-nowrap
border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background
data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1
focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1
{w-[150px]|w-[160px]|w-[180px]} rounded-xl border-gray-200` + chevron
`lucide-chevron-down h-4 w-4 opacity-50`.

**Contact**: labels `text-sm leading-none peer-disabled:cursor-not-allowed
peer-disabled:opacity-70 text-gray-700 font-medium`; textarea `flex min-h-[60px]
w-full border border-input bg-transparent px-3 py-2 text-base shadow-sm
placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1
focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm
mt-2 rounded-xl`; Send button = the hero "Browse Courses" string verbatim +
`lucide-send ml-2 h-4 w-4`; info anchors `text-gray-500 hover:text-purple-600
transition-colors`.

**About stats**: wrapper `div.max-w-7xl.mx-auto` > `div.grid.grid-cols-2.
md:grid-cols-4.gap-8`; value `p.text-4xl.md:text-5xl.font-bold.bg-gradient-to-r.
from-cyan-500.to-purple-600.bg-clip-text.text-transparent`; label `p.mt-2.
text-gray-500.font-medium`.

**BI**: h1 `text-3xl md:text-5xl font-bold text-white tracking-tight`; gradient span
`bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent`; hero icon
`lucide-video h-6 w-6 text-purple-600`-family wrapper; subtitle `mt-6 text-lg
text-gray-400 max-w-2xl mx-auto`; benefit h3 `font-bold text-gray-900 text-lg mb-2`.

**AIAssistant send**: `inline-flex items-center justify-center gap-2 whitespace-
nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1
focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50
[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90
h-9 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400
hover:to-purple-500 text-white rounded-xl px-5 shadow-lg shadow-purple-500/20
transition-all duration-300 hover:scale-105 self-end` + `lucide-send h-5 w-5`.

**login Google wrapper**: `<div class=" transition-transform duration-200 -ml-4">`
> `<svg class="h-5 w-5" viewBox="0 0 24 24">…`.

**CourseDetail lessons stat**: `lucide-circle-play h-5 w-5` (was book-open).

**Pricing FAQ icon**: `lucide lucide-circle-help h-5 w-5 text-purple-500` (inline
SVG: circle cx12 cy12 r10 + question-mark paths).
