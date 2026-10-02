# Session 37 — Transcript (the session-37 conversation log)

I'll start by refreshing the workspace and reviewing the project documents as instructed.

The workspace exists with the repo on main. `git pull` fast-forwards `5279b8f..d19b4ff` (docs/session_74.md — the session-36 execution log). The repo is at the session-36 end state: 455 tests, the unverified-login gate + the mailer transport + the web-vitals budget pass.

Now the five core docs: AGENTS.md carries 65 gotchas accumulated over 36 sessions — the Tailwind v4 trap family (the bare-HSL transparent theme, the oklch palette drift, the space-y `:where()` engine, the shadow-scale shift, the button-cursor preflight drop, the line-height composition flip), the Prisma path resolver, the platform-wall rule, the CSP nonce pattern, and the session-36 additions. CLAUDE.md codifies the six-phase workflow + the parity principles. README documents the 455-test state; the PAD carries the [S36] revision row; the SKILL is at v3.24.0.

Now the session documents: session_73.md (the session-36 transcript), remediation-plan-session36.md (the plan with its three families), the worklog tail (the session-36 entry), and session_74.md (the execution log). The suggested next directions: (a) the forgot-password reset token (the drill's step 6 — believed the only remaining stub), (b) the logout-everywhere UI (deferred — the beyond-reference decision), (c) the INP/TBT interaction-latency budget family.

Documentation review complete. Validating against the codebase: the structure (src/app routes, api/auth with the seven guarded POST routes, lib with verification.ts + mailer.ts), the env contract (.env == .env.example byte-identical, `DATABASE_URL="file:../db/custom.db"`, db/ at the repo root), the test config (skills/ excluded from both layers), the proxy (the case-insensitive content-route rewrites), the sitemap (the 9-route reference set).

Now the baseline gates in order: lint ✓, typecheck ✓, 143/143 unit ✓, build ✓, **312/312 e2e ✓** (6.3m, zero flakes) — 455 total, matching the documented state exactly.

Skills reviewed (the repo catalog): code-review-and-audit, tdd, agent-browser, clone-app-pat-pro — plus the house audit scripts from the prior sessions (s35-*/s36-* at /home/z/my-project/scripts/, adapted to s37-* for this session).

Now the standing parity audit against the live. Re-seed, boot the dev server, run the probes: heights ×9 routes ×2 viewports **byte-exact 18/18**, innerText 18/18 identical, tag drift 0. The mobile battery: trigger byte-identical, panels 375×469, link geometry identical — **NO Tailwind v4 bug** (the 3 diffs are the documented clone hardenings). Console sweep 10/11 clean (the 404 by design).

Now this session's fresh-eyes probes — starting with the suggested direction (a), the forgot-password reset token. First: what does the LIVE actually do with the reset flow? Probe its UI: /login → "Forgot password?" → the reset view → submit the demo email → the reset-sent view ("We've sent password reset instructions to..."). The API calls observed: the live's reset-password-request returns 200 with a message body.

**THE KEY QUESTION: does the live have a /reset-password PAGE?** The clone 404s there. But the live is an SPA — the platform returns 200 for EVERY GET (the client router decides). So the probe must read the RENDERED view, not the status. First: the 404 fingerprint (GET /definitely-not-a-real-route → "404 Page Not Found..."). Then the guesses:

**MAJOR FRESH-EYES FIND — a REAL functional parity drift:** `GET /reset-password` on the live renders "**Invalid Reset Link** — This password reset link is invalid or has expired. — Back to Login" — **the LIVE SHIPS the route; the CLONE 404s.**

Now mapping the full reference contract through the live's own UI: `/reset-password?token=anything` renders the "**Set new password**" form OPTIMISTICALLY (any non-empty token param — the validation happens at submit). The token param name is `token` (?t=/?code=/?key= all render the invalid state). The full DOM captured verbatim: the shell (`div.min-h-screen flex items-center justify-center bg-gray-50 p-4` — NO `<main>`, not the /login gradient), the invalid state (the red circle-alert w-20 h-20, the h2 + copy + the Back to Login button), the form state (the card gains `relative` + the `h-0.5 bg-gray-900` accent bar; the two lock-icon inputs with the captured class strings; the "Must be at least 8 characters" helper under the first only; the submit + the Back to login text button), the metadata (the plain "NexusLearn" title; the canonical/og:url INCLUDING the `?token=` — the CourseDetail `?id=` pattern), the case contract (EXACT-MATCH — /RESET-PASSWORD 404s, the /login family, so no proxy change), the sitemap (absent — the auth-route family).

The validation behavior probed: mismatched passwords → "Passwords do not match"; short/empty → "Password must be at least 8 characters long" — both in a shadcn-style `[role=alert]` (`bg-red-50/50 border-red-200` + the `text-red-800 text-sm` inner). The alert's exact DOM position pinned: a DIRECT child of `form.space-y-6`, between the fields (`div.space-y-5`) and the buttons (`div.space-y-3`). An invalid token at submit → the platform API 400s → "Invalid or expired reset token" in the same alert.

The focus-ring check (the s13 cascade family): the live's inputs compute `--tw-ring-color: rgb(156 163 175 / 1)` = **gray-400** on keyboard focus (probed with real Tab focus; the first probe attempt misread the INHERITED runtime default blue — the inheritance-chain trace corrected it). The clone will need the `.focus:ring-gray-400:focus` UNLAYERED cascade pin (the slate-400 sibling).

**FAMILY 2 CONFIRMED**: the mailer's fetch carries NO timeout — a hung Resend endpoint (or a black-hole `RESEND_BASE_URL`) would pin `POST /api/auth/signup` indefinitely.

**FAMILY 3 MEASURED**: TBT per route on the production standalone (:3400): 0–51ms (long tasks 0–2, max 84ms).

Now the remediation plan (docs/remediation-plan-session37.md) — the house rule: plan before code. Validated against the codebase BEFORE execution: the s35 spec patterns (s34SpecDb + throwaway users + the E2E_AUTH_SECRET constant), the api-guard exact-set discipline (the deliberate 7→8), the FIELD_LIMITS/RATE_LIMITS individual-assertion pins, the Tailwind gray palette already in the @theme pin, the schema push flow (the e2e global-setup automates it), the no-enumeration vs fail-loud tension (the MailerError swallow on forgot-password — documented as the deliberate override).

RED phase: 28 unit specs (tests/reset-token.test.ts — the seam battery; tests/mailer.test.ts additions — the reset-email family + the timeout battery with a never-resolving fetch; tests/reset-password-route.test.ts — the route source pins) + the api-guard pin moved to EIGHT + the 10-spec session-37 e2e block (inserted before the s33 burst spec, which stays last). RED verified — 26 failing for the designed reasons.

GREEN phase: the schema columns (resetTokenHash + resetTokenExpiresAt); the verification.ts extension (the 32-byte bearer token, the `r1:` HMAC domain separation, the timing-safe match); the mailer additions (buildResetEmail + sendPasswordResetEmail + the shared postToResend with the 10s AbortController); the forgot-password rewrite (mint BEFORE the lookup — the shared-cost equalizer; the MailerError swallowed into ok); the reset-password route (the full guard stack + the single atomic consumption update with the sessionVersion bump); the page + the client form (the reference classes byte-copied); the gray-400 cascade pin; RATE_LIMITS["reset-password"]=10 + FIELD_LIMITS.resetToken=128.

Spec-authoring fixes caught by the runs: the label locator ambiguity (getByLabel needs exact: true — "New Password" matches "Confirm New Password" too), the alert scoped to the form (Next's route announcer also matches role=alert), the E2E_AUTH_SECRET constant (not process.env). One pin corrected: the timing-equalizer source pin now asserts the mint PRECEDES the lookup (the shared-cost form).

**UNIT GREEN: 171/171** (+28). Lint + typecheck clean. Build ✓. **E2E GREEN: 322/322** (+10, zero regressions — one environmental transient in a back-to-back run, green on the re-run and in isolation, the documented house precedent) — **493 total.**

Post-fix parity re-verified: the standing surfaces 18/18 byte-exact, the mobile battery identical — NO Tailwind v4 bug — **plus the NEW route's own parity battery: both /reset-password states × both viewports byte-identical vs the live (heights, innerText, title) + all 8 class spot checks identical** (shell / h2 / input / submit / back / accent / body / alert).

The proof matrix (docs/screenshots/api-session-s37.txt, ten parts): the signup+verify throwaway, the always-ok forgot-password, the log line with the reset LINK (the raw token), the link's rendered view + the token-bearing canonical, the 200 consumption, the dead replayed token, the new-password login 200 + the old-password 401, the garbage-token 400 with the exact reference message, the identical always-ok for a non-existent email, the UI reset-sent view.

Screenshots: the standard matrix recaptured + the 4 new /reset-password captures (both states × both viewports) — 97 files; the three byte-diffs all in the documented families (the remote-image variance at identical dimensions+size; the probe-email timestamp).

Documentation alignment: README (badge 455→493, the testing lines, the session-37 paragraph, the API-table reset rows), AGENTS.md (gotcha 66 + the commands table 171/322 + Where-things-live), CLAUDE.md (the pyramid + the API-design reset lines + the reference-parity route line), the PAD ([S37] revision row + §6.1 four new security rules + §7.1 the s35/s36/s37 rows + §7.4 the checklist), SKILL v3.25.0 (project_state wrapping the session-36 state), DEPLOYMENT.md (§13 step 6 SHIPPED), .env + .env.example (the delivery block's reset note — byte-identical, no new knobs), docs/session_75.md (the final log), the worklog entry.

The final full gate after all doc writes (the gotcha-41 rule): lint ✓, typecheck ✓, 171/171 unit ✓, build ✓, **322/322 e2e ✓** (the CSS-leak spec green inside the suite) — **493 tests.**

Commit `dcc821e` with the house message convention. The SSH wrapper push: the paramiko shim extracted from the skill's Appendix A, the operator key materialized + fingerprint-verified (SHA256:3ddaNlFhMz1JXiGEDgVEaRsUzI4Ev0IpGEEB7NnU4PU), the dry-run clean (fast-forward d19b4ff..dcc821e), the real push verified (**remote refs/heads/main @ dcc821e == local HEAD**), the operator key shredded, the shim removed.

**Session 37 complete — pushed to `main` (`dcc821e`) and verified.** ✅

The full cycle ran against the live reference at `https://nexuslearn-template.base44.app/`:

**Baseline & parity (all green)**
- Full gate re-verified: lint → typecheck → 143/143 unit → build → 312/312 e2e (455 total)
- Heights ×9 routes ×2 viewports **byte-exact 18/18**; innerText 18/18 identical; tag drift 0
- **Mobile battery identical** (trigger byte-identical, 375×469 panels, identical link geometry) — **NO Tailwind v4 bug**
- `.env` verified (`DATABASE_URL="file:../db/custom.db"`, db/ at repo root, byte-identical to `.env.example`)

**Three fresh-eyes families → three TDD fixes:**
1. **The /reset-password route** — a REAL functional parity drift (the live SHIPS the page; the clone 404'd): the complete round trip now ships — the route (both reference states, byte-exact), the token lifecycle (mint → deliver → consume single-use with the epoch bump), the eighth guarded POST route
2. **The mailer timeout** — the 10s AbortController on every real-delivery fetch (a hung endpoint previously pinned the signup route indefinitely)
3. **The TBT budget** — per-route main-thread blocking < 500ms (measured 0–51ms)

**Deliverables:** 493 tests green (171 unit + 322 e2e, zero regressions) · the ten-part proof matrix (`docs/screenshots/api-session-s37.txt`) · 4 new route screenshots + the standard matrix · all docs aligned · remote verified `dcc821e == HEAD` · key shredded.

**Suggested next steps:** (a) the logout-everywhere UI (the standing deferred decision — a `/Settings` route), (b) the INP field-data budget (real-user latency complementing the lab TBT), or (c) a Lighthouse CI-style score budget family.
