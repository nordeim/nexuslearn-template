# NexusLearn Remediation Plan — Session 4

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; DOM extraction + computed classes + y-position measurements;
agent-browser sessions `live` + `clone`, 1920×1080 and 375×667).

**Rule**: `skills/` folder excluded from checking/testing/compilation (already
excluded in tsconfig + eslint + vitest + playwright configs — re-verified).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 16/16 unit ✓ · build ✓ ·
34/34 e2e ✓ (incl. 6 mobile-nav guards). Session-3 state confirmed green. Final: 21 unit + 50 e2e.

---

## A. Findings inventory (live vs clone)

| # | Area | Finding | Severity |
|---|------|---------|----------|
| 1 | Page shell — 7 pages | Live wraps every non-landing page the same way: root `min-h-screen bg-white` → `main.pt-20` → **`div.min-h-screen.bg-gray-50`** containing hero + content. Clone uses per-page variants: bare `main` (Courses, CourseDetail, Dashboard) or `main.pt-16 md:pt-20` (About, Contact, BecomeInstructor, AIAssistant), hero as first child, **no gray wrapper**, root sometimes `bg-gray-50`. Worst symptom: on /Courses and /Dashboard the clone's h1 renders at y=64 — **hidden behind the 81px fixed navbar** (live: y=144); CourseDetail h1 at 129 vs live 208. Affected: Courses, CourseDetail, Dashboard, About, Contact, BecomeInstructor, AIAssistant. (/Pricing already uses the live pattern — session 3.) | High |
| 2 | CourseDetail — "About This Course" | Live has an expandable section between hero and curriculum for 4 courses (ML, WebDev, UI/UX, Marketing): h2 `text-2xl font-bold text-gray-900 mb-4` + p `text-gray-600 leading-relaxed line-clamp-6` + button `mt-2 text-purple-600 font-medium text-sm flex items-center gap-1 hover:text-purple-700` toggling "Read More" (ChevronDown h-4 w-4) ↔ "Show Less" (ChevronUp) and removing `line-clamp-6`. Left column becomes `lg:col-span-2 space-y-12` when present (plain `lg:col-span-2` otherwise). Clone lacks the section entirely. | High |
| 3 | Seed imagery | 3 course images differ from live: ML → `photo-1677442136019-21780ecad995`, Business → `photo-1454165804606-c3d57bc86b40`, EQ → `photo-1506126613408-eca07ce68773`. 6 instructor avatars shuffled vs live's per-instructor map: Sarah Mitchell → `photo-1494790108377-be9c29b29330` (×2 courses), James Chen → `photo-1507003211169-0a1dd7228f2d` (×2), Alex Kim → `photo-1472099645785-5658abf4ff4e`, Michael Park → `photo-1560250097-0b93528c311a`, Lisa Chen → `photo-1580489944761-15a19d654956`. (Python course: live's URL `photo-1515879218367-8466d910auj7` is corrupt — 0×0 load; the clone keeps its working Python image as a documented improvement.) | High |
| 4 | Hero rhythm | Live heroes: About `pt-16 pb-20 px-4` (clone `py-20`); Contact `pt-16 pb-12 px-4` (clone `py-20`); BecomeInstructor `pt-16 pb-20 px-4 relative overflow-hidden` (clone `py-24`). AIAssistant hero classes already match (pt-16 pb-12 px-4). | Medium |
| 5 | Contact container | Live: content `max-w-6xl mx-auto px-4 -mt-6 pb-24` (overlap card pattern). Clone: `section.py-24.px-4.bg-gray-50` + `max-w-5xl` inner — wrong container, no overlap. | Medium |
| 6 | AIAssistant shell | Live: hero inner `max-w-3xl` (clone `max-w-4xl`); icon wrapper `flex items-center justify-center gap-3` around `w-14 h-14` gradient box with **Sparkles** `h-7 w-7` (clone: `w-16` box + Bot, no wrapper); h1 `text-3xl md:text-5xl` (clone `text-4xl` base); p `mt-4 text-lg text-gray-400` (clone adds `max-w-2xl mx-auto`). Content `max-w-3xl mx-auto px-4 -mt-6 pb-24` (clone `max-w-4xl … -mt-8`). Chat card `bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[60vh] flex flex-col` (clone: `shadow-2xl shadow-purple-500/5`, no min-h/flex). Messages area `flex-1 p-6 space-y-6 overflow-y-auto` (clone: fixed `h-[480px]`). Empty state: icon `w-16 h-16 … bg-purple-50` + Bot `h-8 w-8 text-purple-500` (clone: gradient box), p `text-gray-500 max-w-sm` (clone adds text-sm mb-8), suggestions `mt-8 … gap-2` with `px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all` (clone: rounded-full, no bg, different hovers). Message rows: `flex gap-3 justify-start/justify-end` + fade-in style, avatars with `mt-1` (user avatar `bg-gray-200`), bubbles `max-w-[80%] rounded-2xl px-5 py-3` (clone `px-4 py-3 text-sm leading-relaxed`). Composer: textarea `flex-1 resize-none rounded-xl border-gray-200 focus:border-purple-500 min-h-[48px] max-h-32` placeholder "Ask a question..." (clone: `<input>` h-12); send button `h-9 py-2 … rounded-xl px-5 shadow-lg shadow-purple-500/20 … self-end` (clone: `w-12 h-12`); composer wrapper `p-4 border-t border-gray-100` (clone adds bg-white). | Medium |
| 7 | Nav "Home" link | Live → `/Home`; clone → `/`. (Logo already fixed to /Home in session 3.) | Medium |
| 8 | Footer hrefs | Learning Paths → `/Courses` (clone `/`); Help Center → `/Contact` (clone `#`); FAQ → `/Contact` (clone `#`); Privacy Policy → `/About` (clone `#`); Terms of Service → `/About` (clone `#`). | Medium |
| 9 | 404 page | Live is a light slate page, NOT the clone's dark gradient: `div.min-h-screen flex items-center justify-center p-6 bg-slate-50` > `div.max-w-md.w-full` > `div.text-center.space-y-6` > [`div.space-y-2` > h1 `text-7xl font-light text-slate-300` "404" + `div.h-0.5.w-16.bg-slate-200.mx-auto`; `div.space-y-3` > h2 `text-2xl font-medium text-slate-800` "Page Not Found" + p `text-slate-600 leading-relaxed` `The page <span class="font-medium text-slate-700">"<path>"</span> could not be found in this application.` (dynamic path, no leading slash); `div.pt-6` > button `inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500` with home svg `w-4 h-4 mr-2` → navigates to `/`]. | High |
| 10 | BecomeInstructor hero decor | Live: two blur divs as DIRECT hero children — `absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl` + `absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl`; content `max-w-4xl mx-auto text-center relative z-10`. Clone: `absolute inset-0` wrapper + radial-gradient + mirrored blur positions. | Medium |
| 11 | Login wrapper | Live: `main.min-h-screen…` is the direct root child. Clone: identical structure + `min-h-dvh`. Card 40px shorter on clone — live's h1 "Welcome to NexusLearn" wraps to 2 lines under base44's font metrics (all classes identical; font-rendering variance). | Low (accept) |
| 12 | Accepted variances | Landing h1 y-offset ±25px (centered stack + font metrics; every class matches); nav `bg-white/95` oklab vs rgba (invisible, session-1 accepted); clone mobile panel always-in-DOM with grid-rows animation (hardening); clone's working Python course image vs live's corrupt URL. | Info |
| 13 | Lesson-count drift (found during verification) | The live catalog drifted since session 1: Python 180→178, ML 250→245, WebDev 375→380, Business 150→156 lessons (badge + actual curriculum rows re-verified per course; the other 5 courses unchanged). Seed re-captured: 1,904 lessons total. | High |
| 14 | SEO files (found during .env.example verification) | The live app serves `robots.txt` (allow all + sitemap link) and `sitemap.xml` (9 routes: landing 1.0 + Courses/CourseDetail/AIAssistant/Pricing/BecomeInstructor/About/Contact/Dashboard at 0.8, all weekly). The clone served neither, while `.env.example` already documented `NEXT_PUBLIC_SITE_URL` "used for metadata, sitemap.xml, and robots.txt" — added `src/app/robots.ts` + `src/app/sitemap.ts` to make the docs true. | Medium |

**Verified matching (no action)**: landing page (all sections, nav, footer
structure/tagline/socials, hero SVG, category/featured/paths/AI/instructor/
testimonials/pricing/newsletter — session-3 reworks intact); Courses catalog
contents (9 cards, search, filters, count row, floating filter card); login
page (h1, labels, buttons, card classes, flow → `/`); Dashboard content
(greeting, 4 stat cards incl. `shadow-lg border border-gray-100`, My Courses +
"Browse More" → /Courses + empty state + "Browse Courses"); signed-out
Dashboard behavior; CourseDetail hero contents (back link, 3-col grid, price
card, perks, meta, instructor block), curriculum (220 lessons), What You'll
Learn; Pricing page (session-3 rebuild); footer text/columns/socials; **mobile
menu on both sites** (opens via trigger, closes on route change; clone keeps
ARIA + scroll-lock + icon hardening — 6 e2e guards green).

---

## B. Remediation plan (execution order)

### Phase 1 — TDD: specs first (RED)

- [1a] `tests/seed-data.test.ts`: pin the 3 corrected course images + the
  per-instructor avatar map (6 avatars) + the 4 `longDescription` texts +
  `longDescription` absent for the other 5 courses.
- [1b] `tests/e2e/nexuslearn.spec.ts` new specs:
  - page-shell spec: /Courses, /CourseDetail, /Dashboard, /About, /Contact,
    /BecomeInstructor, /AIAssistant → `main` has `pt-20`; `main`'s first child
    is `div.min-h-screen.bg-gray-50`; /Courses h1 clears the fixed navbar
    (boundingBox y ≥ 100).
  - CourseDetail "About This Course": ML course shows the section + long
    description + "Read More" toggle → click → "Show Less" + line-clamp
    removed; AWS course has NO "About This Course" heading.
  - footer hrefs: Learning Paths → /Courses, Help Center → /Contact, FAQ →
    /Contact, Privacy Policy → /About, Terms of Service → /About.
  - nav Home link → /Home.
  - AI shell: chat card `min-h-[60vh]` + `flex flex-col`; messages area
    `flex-1` (not fixed height); container `max-w-3xl`; hero icon = Sparkles.
  - Contact container: `max-w-6xl` + `-mt-6` overlap.
  - 404: `bg-slate-50` page, `text-7xl font-light` 404, dynamic path in the
    message, "Go Home" button → `/`.
- [1c] Update the existing 404 spec (branded 404) to the live design.

### Phase 2 — Data layer (GREEN for 1a)

- [2a] `prisma/schema.prisma`: add `longDescription String?` to Course.
- [2b] `prisma/seed-data.ts`: add the 3 image fixes, 6 avatar fixes, 4 long
  descriptions; `bun run db:push && bun run db:seed` (additive column — no
  data loss).

### Phase 3 — Page shells (GREEN for 1b page-shell spec)

- [3a] Courses: root → `min-h-dvh bg-white`; `main.pt-20` > gray wrapper;
  CourseCatalog drops its own `min-h-screen bg-gray-50` (page provides it).
- [3b] CourseDetail: same shell + hero `pt-8 pb-16` kept + body left col
  `lg:col-span-2` + conditional `space-y-12` + `<AboutCourse/>`.
- [3c] Dashboard: same shell (hero pt-16 pb-20 kept; stats -mt-10 kept).
- [3d] About: shell + hero `pt-16 pb-20 px-4` (div, not section).
- [3e] Contact: shell + hero `pt-16 pb-12 px-4` + content
  `max-w-6xl mx-auto px-4 -mt-6 pb-24` (drop the py-24 section + max-w-5xl).
- [3f] BecomeInstructor: shell + hero `pt-16 pb-20 px-4 relative
  overflow-hidden` + decor divs as direct children (top-20 left-10 purple /
  bottom-10 right-10 cyan; no inset-0 wrapper, no radial).
- [3g] AIAssistant (AIAssistantChat.tsx): shell + all item-6 fixes.

### Phase 4 — Chrome + 404 (GREEN for 1b rest)

- [4a] Navbar: Home link → `/Home`.
- [4b] Footer: 5 href fixes.
- [4c] not-found.tsx: rebuild as the live light slate design (client
  component with `usePathname()` for the dynamic path, strip leading `/`;
  "Go Home" button → `/`).

### Phase 5 — Verification

- [5] `lint → typecheck → test → build → test:e2e`; agent-browser re-audit of
  every reworked page vs live (desktop + 375×667): y-positions, classes,
  mobile menu regression (guards already in e2e).

### Phase 6 — Screenshots & docs

- [6] Fresh dev-server screenshots → `docs/screenshots/`; update AGENTS.md /
  CLAUDE.md / README.md / PAD / nexuslearn-template_SKILL.md; `.env.example`
  re-verified.

### Phase 7 — Ship

- [7] Final full gate; single commit on `main`; SSH-wrapper push; worklog +
  session_4.md.

---

## C. Extracted reference data

Course images (live → clone fix):
- Machine Learning & AI Masterclass → `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80`
- Business Strategy & Leadership → `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80`
- Emotional Intelligence & Mindfulness → `https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80`

Instructor avatars (per-instructor, live):
- David Wright → `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80` (already correct)
- Dr. Sarah Mitchell → `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80`
- Prof. James Chen → `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80`
- Alex Kim → `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80`
- Emma Rodriguez → `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80` (already correct)
- Michael Park → `https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80`
- Dr. Lisa Chen → `https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80`

Long descriptions (4 courses; the other 5 have none on live):
1. ML & AI Masterclass — "Dive deep into the world of artificial intelligence. This course covers supervised and unsupervised learning, neural networks, natural language processing, computer vision, and reinforcement learning. Build 15+ ML projects from scratch."
2. Complete Web Development Bootcamp 2026 — "This comprehensive bootcamp takes you from absolute beginner to professional web developer. You'll learn front-end technologies like HTML5, CSS3, JavaScript ES6+, and React, then move to back-end with Node.js, Express, and MongoDB. Includes 50+ real-world projects, portfolio building, and job preparation."
3. UI/UX Design Professional Certificate — "Become a professional UI/UX designer. Master design thinking, user research, wireframing, prototyping, and visual design using industry-standard tools. Build a portfolio-ready case study by the end."
4. Digital Marketing Strategy A-Z — "Learn every aspect of digital marketing in one comprehensive course. From SEO and content marketing to Facebook Ads, Google Ads, email automation, and analytics. Includes real campaign case studies and templates."
