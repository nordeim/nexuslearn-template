# NexusLearn Remediation Plan — Session 3

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; DOM extraction + computed classes + screenshot band
comparison; agent-browser sessions `live` + `clone`, 1920×1080 and 375×667).

**Rule**: `skills/` folder excluded from checking/testing/compilation (already
excluded in tsconfig + eslint + vitest + playwright configs — re-verified).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 16/16 unit ✓ · build ✓ ·
25/25 e2e ✓ (incl. 6 mobile-nav guards). Session-2 remediation verified intact.

---

## A. Findings inventory (live vs clone)

| # | Area | Finding | Severity |
|---|------|---------|----------|
| 1 | Landing — AI section | Structure differs. Live = 2-col grid `grid grid-cols-1 lg:grid-cols-2 gap-16 items-center`; LEFT column: badge `✨ Powered by AI` (`inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6`), h2 `Your Personal<br><span class="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">AI Study Companion</span>` (`text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight`), p `mt-6 text-lg text-gray-400 leading-relaxed max-w-lg`, CTA `mt-8` gradient button; RIGHT column: `grid grid-cols-1 sm:grid-cols-2 gap-4` of 4 glass cards `bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300` with bare lucide icons `h-8 w-8 text-cyan-400 mb-4` (message-square, lightbulb, chart-column, sparkles) + h3 `font-semibold text-white mb-2` + p `text-sm text-gray-400 leading-relaxed`. Clone = centered text block + 4 cards in a row (`md:grid-cols-2 lg:grid-cols-4 gap-6`), gradient icon boxes, badge above h2 with different classes. Section bg decorations: live = `absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl` + `absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl`; clone = radial-gradient + corner blurs. | High |
| 2 | Landing — Become an Instructor | Live = 2-col `grid grid-cols-1 lg:grid-cols-2 gap-16 items-center`; LEFT: `relative` image column — `relative rounded-3xl overflow-hidden aspect-[4/3]` > img `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80` (alt "Instructor", `w-full h-full object-cover`) + overlay `absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-transparent`; floating stat card `absolute -bottom-6 -right-6 bg-white rounded-2xl p-5 shadow-xl hidden md:block` > `flex items-center gap-3` > icon box `w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center` (DollarSign `h-6 w-6 text-green-600`) + `p.text-2xl font-bold text-gray-900` "$12.5M+" + `p.text-sm text-gray-500` "Paid to Instructors". RIGHT: span eyebrow `text-sm font-semibold text-purple-600 tracking-wider uppercase` "Teach With Us", h2 `mt-3 text-3xl md:text-5xl font-bold text-gray-900 tracking-tight`, p `mt-6 text-lg text-gray-500 leading-relaxed`, features `mt-8 space-y-6` — each `flex items-start gap-4` > icon box `w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0` (dollar-sign / globe / chart-column, `h-5 w-5 text-purple-600`) + div(h3 `font-semibold text-gray-900` + p `text-sm text-gray-500 mt-1`); CTA `mt-10` gradient "Start Teaching Today" AFTER features. Clone = text left + 3 white cards right (sm:grid-cols-3), CTA BEFORE features, eyebrow as `<p>` with wrong classes, no image, no $12.5M stat. | High |
| 3 | Landing — Pricing cards | Live card: `relative rounded-3xl p-8 transition-all duration-500 bg-white border border-gray-100 hover:shadow-xl hover:border-gray-200`; popular: `relative rounded-3xl p-8 transition-all duration-500 bg-gradient-to-br from-[#0a0a1a] to-[#1a1a3a] text-white shadow-2xl shadow-purple-500/20 scale-105 border border-purple-500/30`. Badge: `bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1` (Sparkles `h-3 w-3`, no shadow). h3: `text-lg font-semibold text-gray-500` (light) / `text-gray-300` (dark). Price: `text-5xl font-bold text-gray-900` / `text-white` + period `text-sm text-gray-500` / `text-gray-400`. **Desc line exists**: `mt-2 text-sm text-gray-500` / `text-gray-400` ("Perfect for getting started" / "For serious learners" / "Best value for committed learners") — clone MISSING. Features: Check `h-5 w-5 shrink-0 text-purple-600` / `text-cyan-400` + span `text-sm text-gray-600` / `text-gray-300`. Buttons: popular `mt-8 w-full py-6 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 bg-gradient-to-r from-cyan-500 to-purple-600 ... shadow-lg shadow-purple-500/25`; others `bg-gray-900 hover:bg-gray-800 text-white` + shadow. Clone: rounded-2xl, white popular card w/ border-2, text-xl font-bold h3, text-4xl price, CheckCircle2 icons green/purple, no desc. | High |
| 4 | /Pricing page | (a) main = `pt-20` (clone `pt-16 md:pt-20`); content wrapped in `div.min-h-screen.bg-gray-50` (clone: `min-h-dvh bg-white` page + section bg). (b) hero `pt-16 pb-12 px-4` (clone `py-20 px-4`). (c) Same pricing-card diffs as #3. (d) FAQ: `space-y-6` single-column stack of items `bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100`, h3 `flex items-center gap-2 font-semibold text-gray-900` with CircleHelp icon `h-5 w-5 text-purple-500` + p answer; clone = `space-y-4` white bordered cards, no icons. (e) **FAQ content differs** — live: "Can I switch plans at any time?", "Is there a free trial for Pro?", "What payment methods do you accept?", "Can I get a refund?" (with exact answers captured); clone invented 4 different Q&As. | High |
| 5 | Landing — Category grid | Live grid: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6` (cards wrap 4+3); clone: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4` (single row). Live card classes add `cursor-pointer overflow-hidden`. Links already match (`/Courses?category=slug`). | Medium |
| 6 | Landing — section eyebrows | Live: `<span class="text-sm font-semibold text-purple-600 tracking-wider uppercase">Explore</span>` — text-sm, Title-Case source text, `span` element, no `mb-3` (h2 has `mt-3`). Clone: `<p class="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">EXPLORE</p>`. Applies to Explore / Top Picks / Career Tracks / Testimonials / Pricing on the landing + "Pricing" on /Pricing page. | Medium |
| 7 | Landing — Learning Paths cards | Live: `group relative bg-gray-50 rounded-3xl p-8 hover:bg-white hover:shadow-2xl hover:shadow-purple-500/10` (gray bg, NO border). Clone: `group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-...`. | Medium |
| 8 | Landing — Newsletter decor | Live: single centered blur `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl`. Clone: radial-gradient + 2 corner blurs. (Hero decorations DO match — only the newsletter section differs.) | Medium |
| 9 | Hero "Start Learning" CTA | Live href → `/Courses`; clone → `/login`. | Medium |
| 10 | Nav logo href | Live `/Home`; clone `/` (both render the landing; href-level parity fix). | Low |
| 11 | Login signup button text | Live: "Need an account? Sign up"; clone: "Sign up". | Low |

**Verified matching (no action)**: landing title/h1 (incl. `<br>` + 3-stop gradient
span)/hero SVG (858×434, 8 paths, opacity-60)/badge/stats row/hero decorations;
Featured Courses (6 cards + View All → /Courses); testimonials (names, grid);
newsletter outline; Courses page (dark hero, glassy search, floating filter card,
9 cards, count row); CourseDetail (hero, price card, exactly 220 "Lesson N:
Module Content" items, tags card); Dashboard signed-in (h1, 4 stat labels, My
Courses) + signed-out render; AIAssistant (title + outline); About / Contact /
BecomeInstructor outlines; footer (logo → /Home, columns, tagline, 5 socials);
login flow (→ `/`); mobile menu (opens, ARIA, route-change close; clone's
hardening kept; 6 e2e guards green).

---

## B. Remediation plan (execution order)

### Phase 1 — TDD: update e2e specs first (RED)
- [1] `tests/e2e/nexuslearn.spec.ts`: update landing assertions —
  AI section (2-col grid, badge text, gradient h2 span, 4 glass cards in
  `sm:grid-cols-2`), instructor section (image + "$12.5M+" stat + CTA after
  features), pricing cards (rounded-3xl, dark popular card, desc line,
  "Start Pro Trial"), category grid (`lg:grid-cols-4`), eyebrows (text-sm span),
  paths cards (bg-gray-50, no border), Start Learning → /Courses.
  New /Pricing page spec: hero `pt-16 pb-12`, FAQ stack with CircleHelp icons +
  the 4 live questions. Nav logo href /Home; login "Need an account? Sign up".

### Phase 2 — Landing page reworks (GREEN)
- [2a] AI section: 2-col restructure + decorations (left-1/4 purple blur +
  right-1/4 cyan blur, remove radial).
- [2b] Instructor section: image column + floating stat + features +
  CTA-after-features.
- [2c] Pricing section: card classes, dark popular card, desc line, check
  icons, badge, buttons.
- [2d] Category grid classes + card `cursor-pointer overflow-hidden`.
- [2e] Eyebrows → `span.text-sm ... uppercase` Title-Case (5 sections).
- [2f] Paths cards → bg-gray-50, drop border.
- [2g] Newsletter decor → single centered 600px blur.
- [2h] Start Learning href → /Courses.

### Phase 3 — /Pricing page rework
- [3] main `pt-20`; `div.min-h-screen.bg-gray-50` wrapper; hero `pt-16 pb-12`;
  card rework (shared pattern with landing); FAQ stack + icons + live content;
  eyebrow fix.

### Phase 4 — Small fixes
- [4a] Navbar logo href → `/Home` (both states).
- [4b] LoginForm "Need an account? Sign up" text.

### Phase 5 — Verification
- [5] `lint → typecheck → test → build → test:e2e`; agent-browser re-compare of
  reworked sections vs live (desktop + 375px); mobile menu regression (guards
  already in e2e).

### Phase 6 — Screenshots & docs
- [6] Fresh dev-server screenshots → `docs/screenshots/`; update AGENTS.md /
  CLAUDE.md / README.md / PAD / nexuslearn-template_SKILL.md where they
  describe the reworked sections; `.env.example` re-verified.

### Phase 7 — Ship
- [7] Final full gate; single commit on `main`; SSH-wrapper push; worklog.

---

## C. Extracted reference data

Pricing descs: Free → "Perfect for getting started"; Pro → "For serious
learners"; Lifetime → "Best value for committed learners".

Live FAQ (/Pricing):
1. "Can I switch plans at any time?" — "Yes, you can upgrade or downgrade your
   plan at any time. Changes take effect at the start of your next billing
   cycle."
2. "Is there a free trial for Pro?" — "Absolutely! Pro comes with a 7-day free
   trial. No credit card required to start."
3. "What payment methods do you accept?" — "We accept all major credit cards,
   PayPal, and bank transfers for enterprise plans."
4. "Can I get a refund?" — "Yes, we offer a 30-day money-back guarantee on all
   paid plans. No questions asked."

AI feature cards (icons): message-square "AI Study Assistant" / lightbulb
"Smart Recommendations" / chart-column "Progress Analytics" / sparkles "Course
Summaries" (texts match clone).

Instructor features: dollar-sign "Competitive Revenue" / globe "Global Reach" /
chart-column "Analytics Dashboard" (texts match clone).
