# Session 5 — Parity pass: head metadata, login state machine, newsletter, not-found states

Continuing from session 4 (`0f11cac` + the pulled `docs/session_5.md`
transcript). Sessions 1–4 closed static, shell and content parity; this
session audited what those passes could not see — the document **head**, the
login card's **interactive state machine**, **form submission behavior**, and
residual class-level drift on About / Pricing / BecomeInstructor.

## Audit (agent-browser, live vs clone, 1920×1080 + 375×667)

28 findings → `docs/remediation-plan-session5.md`. Highlights:

1. **Head/metadata (every route)** — the live app ships ONE root description
   ("SkillSphere is a dynamic online learning platform…") on every route plus
   OpenGraph + Twitter cards, per-route canonicals (CourseDetail's includes
   the `?id=` query), the logo.png favicon, a PWA `manifest.json` and the
   apple web-app metas. The clone had invented per-page descriptions and none
   of the rest; its viewport also capped pinch zoom (`maximum-scale=5`).
2. **Login card** — live's Sign-in button is the dark **slate-900** variant
   (the clone had the gradient CTA); the OR divider renders via `uppercase`
   + the shadcn Separator markup; errors use the shadcn Alert structure; the
   logo is the **logo image** with a subtle slate glow (the clone had a
   gradient icon tile).
3. **Forgot password** — live swaps the card into a Reset view →
   "Check your email" success state (green alert + the submitted email).
   The clone's button was dead.
4. **Signup + verify** — live swaps into a Create-account view (Confirm
   Password, "Passwords do not match", "A user with this email already
   exists") and then a **6-digit code verification** view that signs the user
   in. The clone had no signup at all.
5. **Newsletter bug** — the clone's landing form was a native
   `action="/api/newsletter"` POST: submitting **navigated the browser to the
   raw `{"ok":true}` JSON**. Live submits via fetch and shows an in-place
   green success row.
6. **CourseDetail not-found** — live renders an in-page "Course not found" +
   Browse Courses state inside the gray shell for unknown/missing ids; the
   clone called `notFound()` → the 404 page.
7. **Smaller drift** — EQ card eyebrow "Personal Dev" (display-only short
   label; the filter keeps the full name), Home nav link active on `/` (the
   clone only matched `/Home`), Pricing FAQ answer `ml-7 gray-600`
   paragraph, About hero h1 `text-3xl` base, BecomeInstructor structure
   (unwrapped h2s at `md:text-4xl`, left-aligned benefit cards with border
   hover, unwrapped CTA section, `px-10` buttons), the mobile-only login
   spacer div.
8. **Live findings accepted as documented variances** — the reference's
   "Continue with Google" IS wired to real Google OAuth through the base44
   platform (not transferable to a standalone repo without the operator's own
   OAuth client — docs corrected); font-metric wrap differences (login h1,
   About hero p, landing mobile accumulation).

Mobile menu re-verified on BOTH sites (opens, 8 links + CTA, route-change
close; clone keeps ARIA/scroll-lock/inert hardening; live has none). No
Tailwind v4 display bug on either site's nav at 375px. Lesson counts
re-captured: 1,904 total — no drift since session 4.

## Remediation (TDD)

- **RED first**: 18 new e2e specs + 3 unit tests (eyebrow map) — verified
  failing against the pre-fix build.
- **GREEN**:
  - `layout.tsx` — root metadata (description, OG, Twitter, appleWebApp,
    icons, manifest, metadataBase) + reference viewport; per-page metadata
    cleaned (no description overrides, canonicals everywhere,
    `generateMetadata` for CourseDetail's query-string canonical);
    `public/manifest.json`; `public/logo.png` (downloaded reference asset).
  - `LoginForm.tsx` — full 5-view state machine with verbatim reference
    classes; `login/page.tsx` — OR divider + Separator attrs + logo image +
    slate glow + mobile spacer.
  - New routes: `POST /api/auth/signup` (scrypt, duplicate detection, code
    logged server-side), `POST /api/auth/verify` (6-digit format, marks
    `User.emailVerified`, sets the session cookie), `POST /api/auth/
    forgot-password` (always ok — no user enumeration). Schema:
    `User.emailVerified Boolean @default(true)` (seeded users skip
    verification). Email delivery is SIMULATED (no SMTP in the template —
    documented in README/AGENTS/PAD; any complete 6-digit code verifies).
  - `NewsletterForm.tsx` client island + landing swap (fixes the JSON
    navigation bug; reference success row).
  - CourseDetail in-page not-found state (never `notFound()`).
  - `course-eyebrow.ts` display map; Navbar Home-active on `/`; Pricing FAQ
    paragraph; About h1 base; BecomeInstructor structure rework.

## Gates (final)

lint ✓ · typecheck ✓ · 24/24 unit ✓ · build ✓ · **68/68 e2e ✓** (50 → 68).

Visual re-verification vs live: head dumps match per route (description,
OG/Twitter, canonical, icon, manifest); login desktop **byte-exact 1080px**
(was 40px off in session 4); Contact/AIAssistant byte-exact; Courses/Pricing/
About/BI/landing within the ±20–41px font-metric band (Pricing mobile diff
133px → 6px; BI mobile 51px → 28px; login mobile 84px → 44px documented
font-wrap). Signup → verify → signed-in walked end-to-end on the dev server;
reset + newsletter success states screenshotted; mobile menu regression
green (ARIA, lock, route-close, Home active in the panel).

## Ship

- 23 screenshots in `docs/screenshots/` (18 refreshed + 5 new states:
  login-reset, login-signup, login-verify, newsletter-success,
  course-not-found).
- Docs aligned: README (92 tests, signup/reset features, API table), AGENTS
  (5 new gotchas), CLAUDE (test pyramid + parity behaviors), PAD ([S5]
  revision + schema + distribution + checklist + corrected Google-OAuth
  note), SKILL.md v2.3.0. `.env.example` re-verified (no new variables —
  `NEXT_PUBLIC_SITE_URL` now feeds `metadataBase` at build time).
