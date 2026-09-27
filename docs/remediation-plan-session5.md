# NexusLearn Remediation Plan — Session 5

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; DOM extraction + computed classes + per-route head dumps +
mobile 375×667 sweeps; agent-browser sessions `live` + `clone`).

**Rule**: `skills/` folder excluded from checking/testing/compilation (already
excluded in tsconfig + eslint + vitest + playwright configs — re-verified).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 21/21 unit ✓ · build ✓ ·
50/50 e2e ✓ (incl. 6 mobile-nav guards). Session-4 state confirmed green.

**Session-5 focus**: sessions 1–4 closed static/shell/content parity; this audit
targeted what they could not see — the document **head**, the login card's
**interactive state machine**, **form submission behavior**, and residual
class-level drift on About / Pricing / BecomeInstructor.

---

## A. Findings inventory (live vs clone)

### Head / metadata (every route)

| # | Finding | Severity |
|---|---------|----------|
| 1 | Meta description: clone ships invented per-page descriptions; live uses ONE root description everywhere — "SkillSphere is a dynamic online learning platform offering a wide range of courses, structured learning paths, and AI-powered study tools to empower students, creators, and instructors in shaping their future." | High |
| 2 | Missing OpenGraph tags: og:title, og:description, og:url (origin), og:type=website, og:site_name, og:image (1200×630 render of the logo). | High |
| 3 | Missing Twitter tags: twitter:title/description/card=summary_large_image/url/image. | Medium |
| 4 | Missing per-route `<link rel=canonical>` (live: origin + route on every page). | Medium |
| 5 | Missing favicon: live links `logo.png` (supabase); clone serves `public/favicon.svg` with NO `<link rel=icon>` at all (browsers don't auto-request .svg). Logo image downloaded to `public/logo.png` (1024×1024, verified loads). | High |
| 6 | Missing `manifest.json` + link (live: name/short_name NexusLearn, SkillSphere description, logo icons 192/512, standalone, theme #000000, bg #ffffff). | Medium |
| 7 | Missing `mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style=black`, `apple-mobile-web-app-title=NexusLearn`. | Low |
| 8 | Viewport: clone `initial-scale=1, maximum-scale=5, viewport-fit=cover` vs live `width=device-width, initial-scale=1.0`. The clone's `maximum-scale=5` is an a11y downgrade vs live's unlimited pinch zoom — align to live. | Medium |

### Login card (visual + functional)

| # | Finding | Severity |
|---|---------|----------|
| 9 | OR divider: live label wrapper has `uppercase` (renders "OR"); clone lacks it (renders "or"). Live line is the shadcn Separator (`data-orientation=horizontal role=none shrink-0 h-[1px] w-full bg-slate-200`); clone is a plain div. | Medium |
| 10 | **Sign in button**: live = dark slate button `w-full h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200` (full shadcn base); clone = gradient CTA (`bg-gradient-to-r from-cyan-500 to-purple-600 … h-12 font-semibold hover:scale-[1.02]`). Also fixes the mobile 44 vs 48px height diff. | High |
| 11 | Error alert: live = shadcn Alert (`role=alert relative w-full border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground text-foreground bg-red-50/70 border-red-200 rounded-xl` + inner `[&_p]:leading-relaxed text-red-700 text-sm`); clone = plain `text-sm text-red-600 bg-red-50 …` div. | High |
| 12 | Login logo: live = slate glow (`from-slate-200 to-slate-300 opacity-30`) + `<img>` of the logo.png inside the ring span; clone = cyan/purple glow + gradient span with GraduationCap svg. | High |
| 13 | Field labels: live = shadcn Label classes (`peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700`); clone missing the peer-disabled prefix classes. | Low |
| 14 | **Forgot password flow** (missing entirely): live swaps the card body to a Reset view — "Back to sign in" (ArrowLeft, `text-sm text-slate-500 … -mb-2`), h2 "Reset your password" (`text-xl sm:text-2xl font-bold text-slate-900`), p `text-slate-600 text-sm sm:text-base`, Mail-icon email input (`pl-10 h-10 sm:h-11 bg-slate-50/50 …`), "Send reset link" (`w-full h-10 sm:h-11 bg-slate-900 …`); submit → "Check your email" success state (Mail icon in `w-14 h-14 sm:w-16 sm:h-16 bg-slate-100` circle, `<br>` + `<span class="font-medium text-slate-900">email</span>`, green alert `bg-green-50/70 border-green-200` + `text-green-700 text-sm`, "Back to sign in"). Clone: dead button. | High |
| 15 | **Sign up flow** (missing entirely): live swaps to a Create-account view — "Back to sign in", h2 "Create your account", Email (Mail icon) / Password (Lock, "Min. 8 characters") / Confirm Password (Lock, "Re-enter password"), "Create account" slate button; client-side "Passwords do not match" alert; server-side "A user with this email already exists" alert; submit → **Verify your email** state — ShieldCheck icon in slate-100 circle (`mb-3 sm:mb-4`), "We've sent a 6-digit code to<br><span font-medium>email</span>", 6 single-digit inputs (`gap-1.5`, `text-center w-10 h-11 text-base font-semibold`, first autocomplete=one-time-code), helper `text-xs text-slate-500 text-center mt-3`, "Verify email" slate button, "Didn't receive the code? Resend". Clone: dead button. | High |
| 16 | "Continue with Google": live navigates to REAL Google OAuth (base44 platform client — not replicable without the operator's own OAuth credentials). Clone's button is presentational. Documented variance — but PAD §10 wording must be corrected (the reference button is NOT dead; it is platform-wired). | Info |

### CourseDetail

| # | Finding | Severity |
|---|---------|----------|
| 17 | Unknown/missing `?id=` → live renders an **in-page state** inside the reference shell: `div.min-h-screen.bg-gray-50.flex.flex-col.items-center.justify-center.gap-4` > `p.text-xl.text-gray-500` "Course not found" + `<a href="/Courses">` wrapping the outline Button "Browse Courses" (`h-9 px-4 py-2` shadcn outline). Clone calls `notFound()` → the 404 page. | High |

### Data / cards

| # | Finding | Severity |
|---|---------|----------|
| 18 | EQ course card eyebrow: live renders **"Personal Dev"** (raw text) while its filter option and the landing category grid show "Personal Development". Clone renders the full string on the card. Fix = display map in CourseCard (keep `category` data intact for filters). | Medium |

### Navbar

| # | Finding | Severity |
|---|---------|----------|
| 19 | Home active state: live highlights Home (`bg-purple-50 text-purple-600`) on BOTH `/` and `/Home` (desktop row + mobile panel); clone's `isActive` never matches `/` because Home's href is `/Home`. | Medium |

### Landing newsletter

| # | Finding | Severity |
|---|---------|----------|
| 20 | **BUG — native form POST navigates the browser to the raw `{"ok":true}` JSON** (`action="/api/newsletter" method="post"` on the server-rendered landing). Live submits via fetch and stays on the page. | High |
| 21 | Success state missing: live replaces the form with `div.mt-10.flex.items-center.justify-center.gap-3.text-green-400` > CircleCheckBig `h-6 w-6` + `span.text-lg.font-medium` "You're subscribed! Welcome aboard." | High |
| 22 | Form class drift: live form `mt-10` (clone mt-8); input = shadcn base + `flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl py-6 px-5 focus:border-purple-500` (clone: `h-12 px-4 bg-white/5 border-white/10 … focus:ring-2 backdrop-blur-sm`) — the py-6 is what produces live's 69px mobile input (flex-basis ignores h-*, min-content rules) and 50px desktop height; button = full shadcn base + `hover:bg-primary/90 h-9 … px-8 py-6 …` + Send icon `ml-2 h-4 w-4`. | High |

### Pricing

| # | Finding | Severity |
|---|---------|----------|
| 23 | FAQ answer p: live `mt-3 text-gray-600 leading-relaxed ml-7`; clone `text-sm text-gray-500 leading-relaxed mt-2` (no ml-7, wrong color/size — causes the 50px-per-item mobile diff). FAQ icon: live has no `shrink-0`. | Medium |

### About

| # | Finding | Severity |
|---|---------|----------|
| 24 | Hero h1 base: live `text-3xl md:text-5xl`; clone `text-4xl md:text-5xl` (matters at <768px). | Low |

### BecomeInstructor

| # | Finding | Severity |
|---|---------|----------|
| 25 | Section h2s: live = direct children of `max-w-7xl mx-auto` with `text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16`; clone wraps them in `text-center mb-16` divs with `text-3xl md:text-5xl … tracking-tight`. | Medium |
| 26 | Benefits cards: live left-aligned — card `hover:border-gray-200` (no purple shadow/translate, no `text-center`), icon box without `mx-auto`, p without `text-sm`. | Medium |
| 27 | Hero "Apply Now" button: live `mt-8 … px-10` + full shadcn base; clone `mt-10 … px-8` + trimmed base. | Medium |
| 28 | CTA section: live has NO inner max-w-2xl wrapper — h2 (`text-3xl font-bold text-white mb-4`), p (`text-gray-400 mb-8 max-w-lg mx-auto`), and the `<a>` are direct section children; button `px-10`, no mt, full shadcn base. | Medium |

### Verified matching (no action)

Titles on every route (incl. "Become Instructor", "Course Detail"); course card
data + imagery + avatars + lesson counts (1,904 — no drift this pass); catalog
search/filter/sort/empty-state behaviors; signed-in + signed-out Dashboard
(byte-exact); mobile menu on BOTH sites (opens, 8 links + CTA, route-change
close; clone keeps ARIA/scroll-lock/inert hardening; live has none — and the
live panel correctly hides the desktop row at 375px, no Tailwind v4 display bug
on the reference); AI chat on both (real responses); contact form loading +
success states; enroll (live's button is dead — clone's real enrollment is the
documented improvement); footer; Pricing shell; testimonials; learning paths;
landing hero/sections.

### Accepted variances (documented, no action)

Login h1 2-line wrap (font metrics, ±32px mobile); landing mobile ±286px
accumulated font-wrap + scroll-reveal measurement timing; About hero 29px
(live's p wraps 3 lines vs clone 2 — different Inter builds); Pricing/BI/Courses
±15–50px font variance; `lucide-circle-help` vs `lucide-circle-question-mark`
(lucide-react 0.525 renamed the component — same paths, invisible); nav
`bg-white/95` oklab vs rgba (session-1); clone's working Python course image vs
live's corrupt URL; clone's "Signing in…" loading text (live has none);
viewport serializes `initial-scale=1` (Next) vs live's `initial-scale=1.0`
(identical semantics).

---

## B. Remediation plan (execution order)

### Phase 1 — TDD: specs first (RED)

- [1a] `tests/e2e/nexuslearn.spec.ts` new `session-5 parity` blocks:
  - **head metadata**: /Courses → meta description = the SkillSphere sentence;
    og:title/og:type/og:site_name/twitter:card present; canonical ends with
    `/Courses`; `link[rel=icon]` → `/logo.png`; manifest link present.
  - **login shell**: divider wrapper `uppercase`; Sign in button `bg-slate-900`
    (and NOT gradient); login logo is an `img[src$=logo.png]`.
  - **login error alert**: bad credentials → `[role=alert]` with
    `bg-red-50/70` + inner `text-red-700`.
  - **forgot-password flow**: click → "Reset your password" + "Send reset
    link"; submit → "Check your email" + green alert + the submitted email.
  - **signup flow**: click → "Create your account" + Confirm Password +
    "Create account"; mismatch → "Passwords do not match"; valid new user →
    "Verify your email" + 6 code inputs + Resend; verify → signed in
    (lands on `/` with session).
  - **duplicate email**: signup with the demo email → "A user with this email
    already exists".
  - **CourseDetail not-found**: `?id=does-not-exist` → "Course not found" +
    "Browse Courses" link (NOT the 404 page); no id → same state.
  - **EQ eyebrow**: 9th card eyebrow text = "Personal Dev".
  - **Home active**: on `/` the desktop Home link carries `bg-purple-50` (and
    the mobile panel link when open).
  - **newsletter**: fill + Subscribe → URL unchanged + "You're subscribed!
    Welcome aboard." state visible.
  - **Pricing FAQ**: answer p has `ml-7` + `text-gray-600`.
  - **BI sections**: benefits card NOT `text-center`; h2 `md:text-4xl`; CTA
    section's first child is the h2 (no wrapper div).
  - **About hero h1**: `text-3xl` base class.
- [1b] `tests/seed-data.test.ts` or new `tests/course-eyebrow.test.ts`: pin the
  category→eyebrow display map (only "Personal Development" → "Personal Dev").

### Phase 2 — Head / metadata (GREEN for the metadata spec)

- [2a] `src/app/layout.tsx`: root metadata — description = SkillSphere
  sentence, `metadataBase` from `NEXT_PUBLIC_SITE_URL`, openGraph
  (title/description/url/type/siteName/images=[/logo.png]), twitter
  (card summary_large_image, title/description/images), `appleWebApp`
  (capable/statusBarStyle/title), `icons: { icon: "/logo.png" }`; viewport →
  `width: "device-width", initialScale: 1` (drop maximumScale + viewportFit).
- [2b] Per-page `metadata`: drop the invented descriptions; add
  `alternates: { canonical: "<route>" }` to every route (incl. dynamic
  CourseDetail `./`-style resolution and the login page).
- [2c] `public/manifest.json` matching the live fields (icons → local
  `/logo.png` 192/512, standalone, theme #000000, bg #ffffff).
- [2d] Remove the now-unreferenced `public/favicon.svg` (or keep — decide by
  what Next emits; the icon link points at /logo.png).

### Phase 3 — Login card state machine (GREEN for the login specs)

- [3a] `src/components/LoginForm.tsx` rework:
  - state machine: `view: "signin" | "reset" | "reset-sent" | "signup" | "verify"`
    (the card body swaps in place, exactly like live);
  - shadcn Label classes on labels; shadcn Alert markup for errors (red +
    green variants);
  - Sign in button → live's slate-900 classes;
  - Reset view + reset-sent view + signup view + verify view (6 digit inputs
    with paste/arrow handling, auto-advance) — class strings copied from the
    live DOM extractions above;
  - "Passwords do not match" client validation; min-8 password validation.
- [3b] `src/app/login/page.tsx`: divider `uppercase` + Separator attrs; logo →
  slate glow + `<img src="/logo.png">` (alt "NexusLearn logo"); remove the
  per-page description.
- [3c] New API routes:
  - `POST /api/auth/signup` — validate email + password(≥8); scrypt-hash;
    reject existing email ("A user with this email already exists"); create
    user with `emailVerified: false`; generate + server-log a 6-digit code
    (documented email-delivery stub); return `{ ok: true }`.
  - `POST /api/auth/verify` — { email, code }: 6-digit format check; user must
    exist + be unverified (or already verified → still sign in); **simulated
    delivery**: any 6-digit code verifies (no SMTP in the template —
    documented; wire real email before production); sets emailVerified + the
    session cookie.
  - `POST /api/auth/forgot-password` — email format check; always `{ ok: true }`
    (no user enumeration, matches live's generic success); logs the request.
- [3d] `prisma/schema.prisma`: `emailVerified Boolean @default(true)` on User
  (seeded demo user stays verified; signup creates unverified) → `db:push`.

### Phase 4 — CourseDetail not-found (GREEN for the not-found spec)

- [4a] `src/app/CourseDetail/page.tsx`: replace `notFound()` with the in-page
  reference state (`main.pt-20` shell + gray flex-center wrapper + "Course not
  found" + Browse Courses outline button → /Courses). Also covers missing id.

### Phase 5 — Small fixes (GREEN for the rest)

- [5a] `src/components/CourseCard.tsx`: eyebrow display map
  (`Personal Development` → `Personal Dev`; fallback = category).
- [5b] `src/components/Navbar.tsx`: `isActive` — Home matches `/` OR `/Home`.
- [5c] `src/components/NewsletterForm.tsx` (new client component): fetch POST
  JSON → success state; live class strings (mt-10 form, py-6 px-5 input,
  px-8 py-6 button + Send icon, green CircleCheckBig success row). Landing
  page swaps the native form for it.
- [5d] `src/app/Pricing/page.tsx`: FAQ p → `mt-3 text-gray-600 leading-relaxed
  ml-7`; icon drops `shrink-0`.
- [5e] `src/app/About/page.tsx`: hero h1 base → `text-3xl`.
- [5f] `src/app/BecomeInstructor/page.tsx`: h2 unwrapping + `md:text-4xl`;
  benefits cards left-aligned + `hover:border-gray-200` + p without text-sm;
  hero button `mt-8 px-10` + full shadcn base; CTA section unwrapped (direct
  children) + h2/p/button class fixes.

### Phase 6 — Verification

- [6] `lint → typecheck → test → build → test:e2e`; agent-browser re-audit of
  every reworked surface vs live (desktop 1920×1080 + mobile 375×667): head
  dumps per route, login state machine walks, newsletter flow, CourseDetail
  bad-id, BI/About/Pricing class parity, mobile menu regression.

### Phase 7 — Screenshots & docs

- [7] Fresh dev-server screenshots → `docs/screenshots/` (incl. the new login
  states + newsletter success); update AGENTS.md / CLAUDE.md / README.md /
  PAD / nexuslearn-template_SKILL.md (test counts, new auth surface, head
  parity, corrected Google-OAuth note); `.env.example` re-verified.

### Phase 8 — Ship

- [8] Final full gate; single commit on `main`; SSH-wrapper push; worklog +
  `docs/session_6.md`.

---

## C. Extracted reference data

**Root description (all routes)**:
"SkillSphere is a dynamic online learning platform offering a wide range of courses, structured learning paths, and AI-powered study tools to empower students, creators, and instructors in shaping their future."

**manifest.json** (live): name/short_name "NexusLearn", the SkillSphere
description, icons = logo.png at 192×192 + 512×512, start_url = origin,
display standalone, theme_color #000000, background_color #ffffff, scope = origin.

**Sign in button (live)**: `inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200`

**Alert (live, red)**: `relative w-full border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground text-foreground bg-red-50/70 border-red-200 rounded-xl` + inner `[&_p]:leading-relaxed text-red-700 text-sm`

**Alert (live, green)**: same base with `bg-green-50/70 border-green-200` + inner `text-green-700 text-sm`

**Login logo (live)**: glow `absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-300`; span `flex shrink-0 overflow-hidden rounded-full relative h-20 w-20 sm:h-24 sm:w-24 shadow-lg ring-4 ring-white/50 group-hover:shadow-xl transition-all duration-300` containing `<img class="aspect-square h-full w-full object-cover" alt="NexusLearn logo" src="…/logo.png">`

**Reset view (live)**: Back button `flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors -mb-2` + ArrowLeft h-4 w-4; h2 wrapper `text-center space-y-2` > `text-xl sm:text-2xl font-bold text-slate-900`; p `text-slate-600 text-sm sm:text-base`; email input (Mail icon) `pl-10 h-10 sm:h-11 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-400` id=email placeholder "you@example.com"; submit `… w-full h-10 sm:h-11 bg-slate-900 hover:bg-slate-800 …` "Send reset link".

**Reset success (live)**: icon circle `mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center` + Mail `h-7 w-7 sm:h-8 sm:w-8 text-slate-700`; h2 "Check your email"; p "We've sent password reset instructions to" + `<br>` + `<span class="font-medium text-slate-900">email</span>`; green alert "Please check your email for the password reset link. It may take a few minutes to arrive."; Back button `w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors`.

**Signup view (live)**: Back button (same); h2 `text-xl sm:text-2xl font-bold text-slate-900` "Create your account" (direct, no wrapper); form `space-y-3 sm:space-y-4` > fields `space-y-3` > 3 fields (Email/Mail/"you@example.com", Password/Lock/"Min. 8 characters", Confirm Password/Lock/"Re-enter password") with the same input classes as reset; submit `w-full h-10 sm:h-11 bg-slate-900 …` "Create account". Client errors: "Passwords do not match"; server error: "A user with this email already exists".

**Verify view (live)**: Back button (same); icon wrapper `text-center space-y-2` > circle `mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 sm:mb-4` + ShieldCheck `h-7 w-7 sm:h-8 sm:w-8 text-slate-700`; h2 "Verify your email"; p "We've sent a 6-digit code to<br><span class="font-medium text-slate-900">email</span>"; inputs row `flex items-center justify-center gap-1.5` > 6× input `flex rounded-lg border border-input bg-background px-3 py-2 … text-center w-10 h-11 text-base font-semibold` (first: inputmode=numeric autocomplete=one-time-code; rest autocomplete=off); helper `text-xs text-slate-500 text-center mt-3` "Enter the verification code sent to your email"; wrapper `space-y-3` > "Verify email" slate button + `div.text-center` > p `text-sm text-slate-600` "Didn't receive the code? " + button `font-medium text-slate-700 hover:text-slate-900 disabled:opacity-50 transition-colors` "Resend".

**Course not found (live)**: `main.pt-20` > `div.min-h-screen.bg-gray-50.flex.flex-col.items-center.justify-center.gap-4` > `p.text-xl.text-gray-500` "Course not found" + `<a href="/Courses">` > outline button `inline-flex … border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2` "Browse Courses".

**Newsletter (live)**: form `mt-10 flex flex-col sm:flex-row gap-4 max-w-md mx-auto`; input `flex h-9 w-full border text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl py-6 px-5 focus:border-purple-500` placeholder "Enter your email"; button `inline-flex items-center justify-center gap-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105 whitespace-nowrap` + "Subscribe" + Send `ml-2 h-4 w-4`; success `div.mt-10 flex items-center justify-center gap-3 text-green-400` + CircleCheckBig `h-6 w-6` + `span.text-lg.font-medium` "You're subscribed! Welcome aboard."
