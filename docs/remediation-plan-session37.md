# NexusLearn Remediation Plan — Session 37

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667, both sites signed in as the demo user; the dev server on
:3000; the production standalone on :3400 for the TBT probe; the evidence
scripts under `/home/z/my-project/scripts/s37-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-36 tree, commits
`60bc477`/`5279b8f`/`d19b4ff`): lint ✓ · typecheck ✓ · 143/143 unit ✓ ·
build ✓ · **312/312 e2e ✓** (6.3m, zero flakes) — 455 total, matching the
documented session-36 end state exactly. The environment contract re-verified
(`DATABASE_URL="file:../db/custom.db"` in `.env` — byte-identical to
`.env.example`, `db/custom.db` + `db/e2e.db` at the repo root after the
standard re-seed). The standing parity surfaces ALL re-verified at the
documented state: heights ×9 routes ×2 viewports **byte-exact 18/18**,
normalized innerText 18/18 identical, tag-of-shared-class drift 0, the
**mobile battery fully identical** (trigger `md:hidden p-2 rounded-lg
text-white/80` byte-identical, 40×40 @ (319,12), open NAV 375×469, link
geometry y 81/129/177/225/273/321/369/417 — **NO Tailwind v4 bug**), console
sweep 10/11 clean (the 11th is the by-design 404 route).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The /reset-password route surface (fresh-eyes family 1 — a REAL functional parity drift + the drill's step 6, the ONLY remaining stub)**: the LIVE ships a working password-reset route at `/reset-password` (probed through its own UI; discovered by probing the SPA's reset-path guesses — the platform returns 200 for every GET so the RENDERED view is the only truth): **(a)** the bare route (or a non-`token` query param) renders the "Invalid Reset Link" state (red circle-alert icon w-20 h-20, `h2.text-2xl font-bold text-gray-900` "Invalid Reset Link", `p.text-gray-600` "This password reset link is invalid or has expired.", a full-width "Back to Login" button → `/login`); **(b)** ANY non-empty `?token=` renders the "Set new password" form OPTIMISTICALLY (the token validates at submit): h2 "Set new password" + p "Enter your new password for NexusLearn", two lock-icon password inputs (`id="password"`/`id="confirmPassword"`, `pl-10 h-11 bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-gray-400`, placeholder `••••••••`, `required`), the helper `p.text-xs.text-gray-500` "Must be at least 8 characters" under the FIRST input only, a `div.space-y-3` with the "Reset password" submit + the "Back to login" text button (`w-full text-sm text-gray-600 hover:text-gray-700`); **(c)** client-side validation in a shadcn-style `[role=alert]` destructive alert (`bg-red-50/50 border-red-200` + `text-red-800 text-sm` inner): "Passwords do not match" (mismatch) and "Password must be at least 8 characters long" (short/empty) — the alert sits as a DIRECT child of `form.space-y-6` between the fields (`div.space-y-5`) and the buttons (`div.space-y-3`); **(d)** an invalid token at submit → the API's "Invalid or expired reset token" renders in the SAME alert (the live's platform API 400s); **(e)** the page shell is `div.min-h-screen flex items-center justify-center bg-gray-50 p-4` — NO `<main>` landmark, NOT the /login gradient shell; **(f)** metadata: the plain "NexusLearn" title (the `/` + `/login` convention), the canonical/og:url INCLUDING the `?token=` query (the CourseDetail `?id=` pattern); **(g)** the route is EXACT-MATCH (case variants 404 — the `/login` family, NOT the case-insensitive content-route family); **(h)** NOT in the sitemap (the auth-route family). The CLONE 404s on every variant — the entire reset leg of the auth flow is missing. | **HIGH** (functional parity) | fix below |
| 2 | **The forgot-password token surface (fresh-eyes family 1b — the drill's step 6 backend)**: `POST /api/auth/forgot-password` is a stub — it logs a line and always returns `{ ok: true }`; NO token is minted, persisted, or delivered. The live's own API accepts the request and (for real accounts) delivers a reset LINK — the live's reset-sent view copy says "We've sent password reset instructions to…" and the link lands on `/reset-password?token=…`. The clone needs the full token lifecycle: generate → persist (an HMAC-SHA256 hash, never the raw token) → deliver (the mailer seam) → consume (`POST /api/auth/reset-password`). | **HIGH** (functional parity) | fix below |
| 3 | **The mailer fetch timeout (fresh-eyes family 2 — an independent hardening discovery)**: `sendVerificationEmail`'s Resend `fetch` carries NO timeout — a hung/slow Resend endpoint (or a black-hole `RESEND_BASE_URL` self-host) pins `POST /api/auth/signup` indefinitely: the route `await`s the delivery inline, requests pile up, and under a network partition the throttle bucket fills with zombie requests. The `AbortController` + a bounded timeout (10s) → the typed `MailerError` → the existing 502 degrade is the fix. | MEDIUM (hardening) | fix below |
| 4 | **The TBT budget surface (fresh-eyes family 3 — the session_72-suggested direction (c))**: the interaction-latency dimension of the per-route performance contract remains unpinned (the s33 bundle → s34 JS → s35 TTFB → s36 FCP/LCP precedent). Measured on the production standalone (:3400): per-route TBT 0–51ms (long tasks 0–2 per route, max task 84ms). A `TBT < 500ms` budget (10x+ headroom) catches the pathological regressions the family exists for (a giant synchronous hydration task, a render-blocking script). | LOW (pin/record) | spec below |
| 5 | **Documentation staleness (found during the doc-review phase)**: the counts across AGENTS.md / CLAUDE.md / README / PAD §7 shift with the new specs (143 unit + 312 e2e → new totals); DEPLOYMENT.md §13's step 6 gets the SHIPPED strikethrough; AGENTS.md gains the gotcha (the api-guard pin moves SEVEN → EIGHT — the deliberate exact-set update). | MEDIUM (doc hygiene) | Phase 6 |

### Audit-surface note (the session-37 additions — THREE new probe families)

- **the reset-route surface** (findings 1+2) — the RESET dimension of the auth
  contract: whether the forgot-password dead-end is actually a round trip.
  Probed through the live's own UI + the SPA's rendered views (the raw API is
  platform-walled): the route inventory (reset-path guesses vs the rendered
  404 fingerprint), the two view states' DOM, the token-param name
  (`token` — the ONLY param that flips the state), the client-side validation
  messages, the submit API's error text, the metadata/canonical contract, the
  case-sensitivity contract, the sitemap exclusion.
- **the delivery-timeout surface** (finding 3) — the AVAILABILITY dimension
  of the delivery seam: what bounds a hung upstream. The probe surface is the
  mailer source (no AbortController/signal anywhere in the seam).
- **the main-thread-blocking budget surface** (finding 4) — the INTERACTION
  dimension of the per-route performance contract: `PerformanceObserver`
  longtask entries, blocking = max(0, duration − 50ms), summed per route.

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — the reset-token pure seam (finding 2, the crypto layer)

**Design**: extend `src/lib/verification.ts` (the s35 pure-seam pattern — no
Next.js imports, node:crypto only) with the token family, domain-separated
from the 6-digit code family by the `r1:` HMAC prefix (a verification-code
hash can never be replayed as a reset-token hash and vice versa):

- `RESET_TOKEN_TTL_MS = 10 * 60 * 1000` (the same window as the code).
- `generateResetToken()` → `randomBytes(32).toString("hex")` (a 64-char
  hex token — URL-safe by construction, 256 bits of entropy vs the code's
  10^6 space: a reset link is a BEARER credential, the code is not).
- `hashResetTokenForStorage(token, secret)` → HMAC-SHA256 keyed by
  AUTH_SECRET over `r1:${token}` (never the raw token at rest).
- `resetTokenMatches(stored, submitted, secret)` → the timing-safe compare
  (the `codeMatches` pattern; absent storage never matches).
- `resetExpiryFromNow(now?)` → the expiry timestamp.

**Schema** (`prisma/schema.prisma`): `User.resetTokenHash String?` +
`User.resetTokenExpiresAt DateTime?` (both clear on consumption — the s35
housekeeping pattern). `db:push` re-runs for dev; the e2e global-setup
pushes its own schema (automated, no spec edits).

**RED unit** (`tests/reset-token.test.ts`): the token shape (64 hex chars,
unique across mints), the hash determinism + the `r1:` domain separation
(a `v1:` code hash NEVER matches a reset hash), the timing-safe match
(present/absent/length-mismatch), the expiry window + the fail-closed
`isCodeExpired` reuse, the TTL constants.

### Phase 2 — the mailer additions + the timeout (finding 3)

**Design**: extend `src/lib/mailer.ts` with the reset-email family + the
timeout on BOTH send functions:

- `buildResetEmail(resetUrl)` → `{ subject, text, html }` (the link
  embedded in a short plain-text + minimal-HTML body; the code never rides
  the subject — the s36 pattern).
- `sendPasswordResetEmail(env, to, resetUrl, fetchImpl)` → the same
  3-mode contract: simulated (the log line
  `[auth] password reset link for <email>: <url> (simulated delivery)`),
  resend (the same POST shape), misconfigured (the MailerError throw).
- **The timeout**: an `AbortController` with a 10-second cap on every
  real-delivery fetch — an `AbortError` rejection maps to the typed
  `MailerError("Email delivery failed (timeout after 10s)")` → the existing
  502 degrade path. A constant `FETCH_TIMEOUT_MS` + an options override for
  the unit tests (a mocked fetch that never resolves + a 5ms test timeout
  proves the abort).

**RED unit** (`tests/mailer.test.ts` additions): the reset-email builder
(the link in text + html), the simulated log line, the resend POST, and the
TIMEOUT battery (a never-resolving fetch + a short override → the
MailerError; the controller is aborted).

### Phase 3 — the API routes (findings 1b + 2, the consumption layer)

**`POST /api/auth/forgot-password`** (rewrite):

- The guard stack stays (throttle + 413 + the field caps — pinned).
- After the email validation: look up the user. **EXISTS** → mint the token,
  persist hash + expiry, build the reset URL
  (`${origin}/reset-password?token=${raw}`; origin =
  `NEXT_PUBLIC_SITE_URL || req.nextUrl.origin`), deliver via
  `sendPasswordResetEmail`. **A MailerError is SWALLOWED into the ok
  response** (logged server-side) — the no-enumeration contract outranks
  the fail-loud contract here: a 502 for existing emails only would leak
  the account-existence signal the always-ok shape exists to hide (the
  signup route 502s because signup's caller ALREADY knows the email exists —
  theirs).
- **MISSING** → the dummy mint + hash (discarded — the s33 timing-equalizer
  precedent: both paths pay the same crypto CPU; the response and its timing
  stay indistinguishable), no delivery.
- The response is ALWAYS `{ ok: true }` (the pinned reference contract).

**`POST /api/auth/reset-password`** (NEW — the EIGHTH public POST route):

- The FULL guard stack: `RATE_LIMITS["reset-password"]` (10/min — the
  verify-route sibling), the 413 pre-check, the token field cap (128 — a
  bounded lookup key) + the password field cap.
- Consumes `{ token, password }` (the client validates the match locally —
  the live's own client does).
- Validates: password ≥ 8 (the signup convention, 400); token present (400).
- Look up `findFirst({ where: { resetTokenHash: hash } }` → verify the
  expiry (fail-closed: absent expiry = expired) → **the exact reference
  error** for the bad/expired/absent cases: 400
  `{ "error": "Invalid or expired reset token" }` (the live's alert text,
  verbatim).
- On success (a 200 `{ ok: true }`): set the new `passwordHash`, CLEAR both
  token fields (the single-use contract), **bump `sessionVersion`** (the
  s34 epoch lever — a password reset kills every outstanding session for
  the account; the industry-standard consequence), and clear the caller's
  cookie attribute-symmetrically IF present (the revoke-sessions shape —
  harmless when absent).
- **The api-guard source pin moves SEVEN → EIGHT** (the deliberate
  exact-set update: the ROUTES map + the count + the sorted list — the
  gotcha-62 discipline; a future public POST route MUST consciously touch
  `tests/api-guard-source.test.ts`).

**RED unit** (`tests/reset-password-route.test.ts` — source pins): the
route wires the limiter first + the 413 + both field caps; the exact
"Invalid or expired reset token" message; the sessionVersion bump + the
token clearing in the same update; the forgot-password swallow (the
MailerError does NOT 502 on forgot-password — the no-enumeration override);
the forgot-password mint+persist+deliver wiring (BOTH the hit and the dummy
equalizer on the miss).

### Phase 4 — the /reset-password page (finding 1a, the view layer)

**Design**: `src/app/reset-password/page.tsx` (server) +
`src/components/ResetPasswordForm.tsx` (client — the LoginForm pattern):

- **The server page**: `generateMetadata` reading `searchParams` — the
  canonical/og:url INCLUDES the `?token=` query when present (the
  CourseDetail `?id=` pattern; the reference's og:url was captured with the
  token), the plain "NexusLearn" title (no segment — the `/` + `/login`
  convention, `routeMetadata({ canonical })`), the root description. The
  page renders the shell `div.min-h-screen flex items-center justify-center
  bg-gray-50 p-4` (NO `<main>` — the landmark-less reference form, the s10
  404-wrapper family) wrapping the client form inside `<Suspense>`
  (Next 16's `useSearchParams` requirement).
- **The client form** (the reference DOM, classes verbatim from the probe):
  - **No token** → the invalid state: `div.p-6.pt-12.pb-10.px-12.text-center.space-y-6`
    with the `w-20 h-20 bg-red-100` circle-alert circle (lucide
    `CircleAlert`, `h-10 w-10 text-red-600`), the `h2.text-2xl.font-bold.text-gray-900`
    "Invalid Reset Link" + `p.text-gray-600` "This password reset link is
    invalid or has expired.", and the "Back to Login" button (the shadcn
    base + `px-3 py-2 w-full h-11 bg-gray-900 hover:bg-gray-800 text-white
    font-medium shadow-sm`) → `window.location.href = "/login"` (the live's
    navigation, a full page load).
  - **Token present** → the set-password form: the card gains `relative` +
    the `div.absolute.top-0.left-0.right-0.h-0.5.bg-gray-900` accent bar;
    `div.p-6.pt-12.pb-10.px-12.space-y-8` > the `text-center space-y-2`
    header ("Set new password" / "Enter your new password for NexusLearn")
    + `form.space-y-6` > `div.space-y-5` (the two `space-y-2` field groups:
    the lucide `Lock` icons `absolute left-3 top-1/2 -translate-y-1/2 h-4
    w-4 text-gray-400`, the inputs with the captured class string, the
    `text-xs text-gray-500` helper under the first only) + the `[role=alert]`
    slot (a DIRECT form child between the fields and the `div.space-y-3`
    buttons — the captured position) + the buttons (`Reset password`
    submit + `Back to login` text button).
  - **Client validation** (the live's exact messages): mismatch →
    "Passwords do not match"; short/empty → "Password must be at least 8
    characters long" — rendered in the alert slot.
  - **The API error** renders in the same slot (`data.error` — the
    LoginForm pattern).
  - **On success** → `window.location.href = "/login"` (the full navigation
    — the post-action shape of the LoginForm's own redirects). The success
    state is UNOBSERVABLE on the live (no inbox access to mint a valid
    token) — the natural completion is the documented deliberate choice.
- The svgs carry `aria-hidden="true"` (the clone-wide s18/22 a11y
  hardening — invisible to every parity surface).
- NO proxy change (the route is exact-match — the `/login` family, probed).
  NO sitemap change (the auth-route family — probed).

**RED e2e** (the session-37 block, inserted BEFORE the s33 burst spec which
stays LAST):

1. `GET /reset-password` (no token) renders the "Invalid Reset Link" state
   (the heading + the copy + the button); the metadata pins (plain title,
   the bare canonical).
2. `GET /reset-password?token=anything` renders the form state (the
   heading + both labels + the helper + both buttons — the optimistic
   contract).
3. The client validation: mismatch → the alert shows "Passwords do not
   match"; short → "Password must be at least 8 characters long".
4. The full API flow on a THROWAWAY user (never the demo user — the s35
   precedent): signup → verify (any-code) → forgot-password → 200 ok → the
   row carries `resetTokenHash` + `resetTokenExpiresAt` (the s34SpecDb
   pattern) → mint a fresh token IN-SPEC (the same `hashResetTokenForStorage`
   + the server's AUTH_SECRET) → write the hash + expiry directly → POST
   `/api/auth/reset-password` { token, password } → 200 → login with the NEW
   password → 200 (verified path) → login with the OLD password → 401 → the
   row's token fields are CLEARED + `sessionVersion` BUMPED.
5. The invalid-token contract: POST with a garbage token → 400 + the exact
   "Invalid or expired reset token" message; the UI renders it in the alert
   (submit through the form).
6. The always-ok no-enumeration contract: forgot-password for a
   non-existent email → 200 `{ ok: true }` (identical body + timing family).
7. The TBT budget spec: per-route TBT < 500ms on the e2e standalone (the
   longtask PerformanceObserver, the s36 vitals-spec shape).

### Phase 5 — the GUARD phase

- Full gate re-run: lint → typecheck → test → build → test:e2e (the
  expected counts: 143 → ~160 unit, 312 → ~320 e2e).
- The standing parity surfaces re-verified AFTER the changes (the standard
  re-seed first): heights/innerText ×9 routes ×2 viewports byte-exact +
  the NEW /reset-password route added to the parity set (both states × both
  viewports vs the live) + the mobile battery re-run.
- The CSS-leak spec re-runs LAST (the gotcha-41 rule) — the new component's
  classes must not leak the compiled sheet (`@source` covers `src/`
  automatically — the new files are in-tree).

### Phase 6 — docs alignment (finding 5)

AGENTS.md (gotcha 66 — the reset route + the eight-route pin + the
timing-equalizer note; the commands-table counts; Where-things-live),
CLAUDE.md (the API surface + the reset-flow line + the pyramid counts),
README (badge + the session-37 paragraph), PAD ([S37] revision row + §6 the
reset story + §7 counts + §8.2), SKILL.md v3.25.0 + project_state,
DEPLOYMENT.md (§13 step 6 SHIPPED + the reset wiring), `.env` +
`.env.example` (NO new knobs — the reset shares the AUTH_DELIVERY /
RESEND_* family; a comment line for the reset link), the session logs +
the worklog entry.

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-36 tree re-verified — 455).
2. [x] Standing parity audit green (heights/innerText/mobile/console).
3. [x] Fresh-eyes probes: family 1 (the /reset-password route gap — a REAL
   functional parity drift) CONFIRMED, family 2 (the mailer timeout gap)
   CONFIRMED, family 3 (TBT) MEASURED.
4. [ ] RED: the unit batteries (reset-token seam + mailer additions + the
   route source pins) + the e2e block → verified failing.
5. [ ] GREEN: the schema columns; the verification.ts extension; the
   mailer additions + the timeout; the forgot-password rewrite; the new
   reset-password route; the page + the client form; the api-guard pin
   update (SEVEN → EIGHT).
6. [ ] GUARD: the full gate re-run + the standing parity surfaces + the
   new route's parity battery + the mobile battery re-run.
7. [ ] The proof matrix (`docs/screenshots/api-session-s37.txt`: the full
   reset round trip on the dev server — the log line with the link, the
   link's view, the new-password login, the old-password 401, the epoch
   bump, the always-ok no-enumeration matrix) + screenshots (the s37
   capture matrix + the new route's two states × both viewports).

### Risk notes (validated against the codebase pre-execution)

- **The e2e suite's login surface**: the demo user is untouched by every
  new spec (the throwaway-user pattern — the s35 revoke precedent). The
  s36 unverified-login specs use their own throwaways. The existing
  forgot-password spec (the always-ok shape) re-runs unchanged — the
  response stays `{ ok: true }` in both branches.
- **The schema push**: `db:push` adds two nullable columns — no migration
  risk (SQLite ALTER-free additive columns; the e2e global-setup pushes the
  same schema before every run — automated).
- **The api-guard pin**: the exact-set assertion is the discipline — the
  EIGHT-route update is deliberate and its own RED-then-GREEN step (the
  pin fails first, proving the discipline, then the route lands).
- **The always-ok + fail-loud tension**: the forgot-password swallow is
  the documented exception (no-enumeration outranks fail-loud — an error
  response only for existing emails IS the enumeration oracle); the
  signup 502 stays (the caller knows their own email exists).
- **The reset-link origin**: `NEXT_PUBLIC_SITE_URL || req.nextUrl.origin`
  — the e2e standalone's request origin is correct (localhost:3100); the
  dev server's is localhost:3000; production operators set the env (the
  metadataBase convention).
- **The canonical-with-token parity**: the reference's og:url carries the
  `?token=` — matched (the CourseDetail `?id=` precedent). The token is a
  single-use 10-minute GET-only credential (never consumed by a page
  render — only the POST consumes), and the page carries no per-token
  personalization.
- **The Suspense requirement**: Next 16's `useSearchParams` in a client
  component requires a Suspense boundary at the page level — the page is
  dynamic anyway (`generateMetadata` reading `searchParams`), and the
  layout's `force-dynamic` covers the render path (the CSP nonce needs it
  regardless).
- **The new route's Tailwind surface**: the classes are copied verbatim
  from the live's DOM — `bg-gray-50`, `bg-red-100`, `text-red-600`,
  `bg-gray-50/50`, `border-gray-200` are all v3-palette utilities already
  in the `@theme` pin (the gray scale) — no new tokens, no `@source`
  changes (the component is under `src/`).
- **The TBT spec's flake surface**: measured 0–51ms against a 500ms
  ceiling (10x+ headroom — effectively unflakeable while catching the
  pathological regressions); runs inside `workers: 1` — no cross-spec
  load.
