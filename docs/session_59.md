I'll start by refreshing the workspace and reviewing the required docs.
Workspace pulled at the session-30 end state (4576c00: docs/session_57.md transcript only, on top of the pushed dcf0e44). Now the five core docs.
AGENTS.md gotchas 1–59 internalized — the platform-wall family, the keep-our-own-forms rule, the CSS-leak re-run rule. CLAUDE.md, README, the PAD, the SKILL doc v3.18.0 next.
Now the session-30 pair: session_56.md, session_57.md, remediation-plan-session30.md, the worklog tail. The session_56-suggested directions: a rate-limiting surface probe on the auth/contact/newsletter APIs, a request-size/payload-depth guard sweep, or a dependency-audit pass. This will be session 31.
Environment contract verified: `.env` == `.env.example` byte-identical, `DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root, skills/ excluded everywhere (tsconfig, eslint, vitest, playwright).
Now the baseline gates in the documented order — lint, typecheck, 54/54 unit, build.
Build green — all routes dynamic per the session-24 pin. Now the e2e gate (~5.3 minutes).
**Baseline fully GREEN — 283/283 e2e** matching the documented session-30 end state exactly.
Now the standing parity audit. Let me reuse the session-30 probe scripts (s30-* → s31-*).
Heights and innerText are byte-exact 17/18 — but /Dashboard shows a diff (14px on mobile + 8 text lines). Let me examine.
The diff is the known enrollment-state artifact: the clone's dev db carries session-30 probe enrollments (1 course, 1/380 lessons) while the live demo user has none. Let me re-seed and re-probe /Dashboard.
/Dashboard now byte-exact on both viewports — heights 18/18, innerText 18/18, tag drift 0. Now the mobile battery.
Mobile battery fully identical — trigger `md:hidden p-2 rounded-lg text-white/80` byte-identical, 40×40 @ (319,12), panels 375×469, link geometry byte-identical. **No Tailwind v4 bug.** Console sweep 9/10 clean.
Now fresh-eyes family 1 — the rate-limiting/abuse-throttle probe (12-request bursts ×4 sequences on both sites).
Zero 429s anywhere — but the LIVE returns 405 on newsletter/contact/ai-chat and "Security verification is required" on login. Let me dig into why.
The live's protection is a PLATFORM WALL: its SPA submits through the Base44 internal channel; every external POST to the writing APIs 405s regardless of headers. The live's login shows the FastAPI dialect (422 missing-field). The clone's API is completely open — the finding.
Now fresh-eyes family 2 — the request-size/payload-depth probe (oversized strings, deep JSON, wrong content-types on both sites).
**Finding CONFIRMED**: the clone persists unbounded strings — the 1MB newsletter email returned 200 + the row; the 2MB contact message likewise; the 1MB signup email created a User whose derived name was also ~1MB. Let me inspect the dev database to confirm.
The junk rows are there (a 1,048,588-char subscriber email, a 1MB user). Let me clean them, then check the e2e suite's per-route POST load to size safe throttle thresholds.
The suite makes ~7 real login POSTs, ~2 newsletter, ~1 contact, 0 real ai-chat (the AI specs intercept the route) — generous thresholds keep ≥ 4× headroom. Now let me write the remediation plan.
The plan (docs/remediation-plan-session31.md): findings 1/2/3 + the pre-execution validation (the six routes verified one-by-one; no existing spec asserts on rejection statuses for these shapes; the burst spec must be the suite's LAST API-touching spec).
TDD Phase 1a — the RED unit specs: tests/request-guard.test.ts, tests/rate-limit.test.ts, tests/api-guard-source.test.ts. The source-pin walk has a doubled-path bug — let me fix it with the import.meta.dirname pattern, and the "me" substring false positive needs the exact-set assertion instead.
Unit RED confirmed (7 source-pin failures + the two missing-module suites). Now the RED e2e specs — the session-31 block appended at the spec-file tail.
**E2E RED confirmed exactly as designed** — 7 failed (the six size-guard specs + the burst), 1 green-by-design (the happy-path newsletter). Let me clean the RED-run junk from db/e2e.db.
Now the GREEN phase — src/lib/request-guard.ts + src/lib/rate-limit.ts, then the six route wirings.
A double-negation typo crept into the signup validation (`!!` instead of `!`) — caught on review, fixed immediately before any test run.
Unit GREEN — 77/77 after fixing the source-pin's path bug. Build, then the session-31 e2e specs.
**8/8 session-31 specs GREEN.** Let me verify stability with a second run, then the full e2e gate.
**FULL GATE GREEN — 291/291 e2e** (283 + 8, zero regressions; 368 total). Now the dev-tier verification: the guard matrix, the burst, the heights spot-sweep, the mobile battery, the console sweep — all identical/green, zero regressions.
Now the screenshot capture (the standard set re-captured + the session-31 proof artifact).
The delayed-route teardown noise is the documented capture artifact — all state shots verified, 74 PNG + 7 txt. The proof's login line shows an empty body — a display artifact; let me verify the true response directly.
The login 400 body is correct (`{"error":"Email is too long"}`) — the proof artifact corrected. Now the docs alignment phase: AGENTS.md gotcha 60 + counts, CLAUDE.md, README, the PAD [S31] row, SKILL v3.19.0, DEPLOYMENT.md §9, session_58.md, the worklog.
The `.env.example` re-verified byte-identical (no environment surface changed — the thresholds are code constants).
The CSS-leak spec re-runs LAST after every doc write — clean. Final sanity: lint, typecheck, 77/77 unit — green.
The change set is surgical (six routes +9 to +26 lines each, two new libs, three new test files, 148 spec lines, the docs). Committed as the session-31 feat commit.
Now the SSH wrapper push — materialize the operator key, dry-run, then the real push. Remote verified, operator key shredded after use.
**Session 31 complete — pushed to `main` and verified (remote == local HEAD).**

**What was done:**
- 🔄 Pulled at the session-30 end state; all 5 core docs + the session-30 pair + worklog reviewed; baseline gates re-verified green (**283/283 e2e**)
- 🔍 **Standing parity audit GREEN** — heights 18/18 byte-exact (the /Dashboard first-run diff resolved as the known enrollment-state artifact), innerText 18/18, tag drift 0, mobile battery fully identical, **no Tailwind v4 bug**, console 9/10 clean
- 🧪 **Two fresh-eyes families → two source fixes (genuine RED→GREEN TDD):**
  1. **Request-size/payload-depth** — the writing routes persisted unbounded strings (1MB newsletter rows, 2MB contact rows, 1MB-derived-name users); fixed with the two-layer guard (413 pre-check + field caps)
  2. **Rate-limiting/abuse-throttle** — neither site throttles, but the live hides behind its platform wall while the clone was wide open; fixed with the in-memory per-IP throttle (429 + Retry-After)
- ✅ **368 tests green** (77 unit + 291 e2e, zero regressions); 81 screenshot files; `.env`/`.env.example` verified; docs aligned (gotcha 60, PAD [S31], SKILL v3.19.0, DEPLOYMENT.md §9)

**Suggested next steps**: review `docs/session_58.md` + `docs/remediation-plan-session31.md` for the evidence trail; future session directions include a dependency-audit pass, an auth-session-lifetime/cookie-hardening probe, or an aria-live politeness family on the AI chat.
