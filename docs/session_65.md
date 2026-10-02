The workspace exists with both repos at the session-32 end state. Let me refresh the local workspace first.
Workspace refreshed — the pull brought in the new `docs/session_63.md` (commit `e0e5af9` on top of the pushed `bb05da8`). Now let me set up the task plan and review the docs.
The five core docs are large — I'll delegate the comprehensive review to a subagent while I verify the environment contract directly. The subagent inventories TWELVE stale-doc spots (CLAUDE.md's 291-bullet, PAD §7.1 at session-28, the stranded [S31]/[S32] rows, the SKILL frontmatter/§11 counts, the npm/lockfile line, four next/font references, PAD §3.2's ancient tests listing, the 26-vs-32 glossary, the guard/spec terminology, the DEPLOYMENT numbering) — a full docs-alignment backlog for this session. Env contract verified: `.env` byte-identical to `.env.example`, `DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root, skills/ excluded, `session.ts` carries the session-32 constants.
Lint ✓ typecheck ✓ 92/92 unit ✓. Now the build, then the e2e gate.
**Baseline FULLY GREEN — 296/296 e2e** (5.4m), matching the documented session-32 end state exactly. Now the standing parity audit — first the standard re-seed, then the s33 scripts (adapted from the s32 templates).
**Standing parity audit ALL GREEN** — heights 18/18 byte-exact, innerText 18/18 identical, tag drift 0. Now the mobile battery (the Tailwind v4 watch) and the console sweep.
**Mobile battery GREEN — NO Tailwind v4 bug.** Trigger byte-identical, geometry 40×40 @ (319,12), panel 375×469, link geometry byte-exact. Console sweep 9/10 clean (the 10th is the by-design 404 route). Now the fresh-eyes families. Let me examine the auth routes to design the probes — starting with a completeness sweep of the public POST surface.
Reading the verify route: it MINTS the session cookie (signup verification signs the user in) but carries none of the session-31 guards. Let me boot the production standalone twins and probe it at the API level.
**FAMILY 1 CONFIRMED** — the verify route: a >1MB body is parsed (400, not 413), a 100KB email reaches the DB lookup, and a 14× burst returns 14× 200 — every request minting a session cookie. The login-burst control on the same server trips the throttle: the machinery exists, the route was never wired. The session-31 pin asserted "exactly six" — the pin codified the blind spot.
Now the timing probe. First run: both paths measured ~2ms — the login-burst control had POISONED the throttle bucket, so every sample hit the 429 short-circuit. Restarting a fresh server and re-running clean.
**FAMILY 2 CONFIRMED** — nonexistent user: median 6ms; real user + bad password: median 35ms. A 29ms user-existence timing oracle, 12/12 pairs cleanly separated. Now the secret posture — booting a second, deliberately SECRETLESS standalone on :3300 and forging a token with the public repo constant.
**FAMILY 3 CONFIRMED — the forged token is ACCEPTED** by the secretless production server (200 + the seeded demo user; the control twin with a real secret correctly rejects it). The only signal was a console.warn. Let me also record the bundle baseline (the fourth family) — the live's JS per route vs the clone's chunk pool.
Bundle baseline recorded (live 727 KB SPA per route vs clone 766 KB pool — no action). All findings inventoried; the verify-POST census (exactly ONE in the whole e2e suite) measured for throttle safety. Writing the remediation plan.
Plan written (`docs/remediation-plan-session33.md`) and validated against the codebase. Now **TDD RED**: the re-pinned seven-route source pin + the equalizer battery + the secret battery + the session-33 e2e block.
RED confirmed — 15 unit failures exactly as designed (the verify route ungoverned, the set at six, the missing exports), 91 others green. Now **GREEN**: the guard stack in the verify route, the equalizer in session.ts + the login route, the typed secret contract.
All GREEN changes applied. Unit tests: **106/106 GREEN**. Lint + typecheck + build clean. Now the full e2e run.
**FULL GATE GREEN — 106/106 unit + 300/300 e2e (406 total), zero regressions.** The timing spec passed at ~46ms median (the scrypt floor well above the 12ms assertion). Now the parity re-verification after the changes (the house discipline).
Parity re-verified — heights 18/18, innerText 18/18, drift 0, mobile battery identical, console clean. The server-side fixes perturbed nothing. Now the post-fix proof matrix on the production twins: the forged token should now fail LOUD.
The proof matrix: verify 413/cap/429s all GREEN; the timing drift FLATTENED to 0ms; the forged token now 500s on the secretless twin with the typed error while anonymous public pages keep rendering. The proof artifact written. Now the screenshot capture — adapting the s32 capture script with the session-33 proof section.
The capture completed (84 files, the known route-teardown noise) with the script-generated `api-session-s33.txt`. Now the docs-alignment phase — the twelve stale spots plus the session-33 content everywhere.
Docs aligned: gotcha 62, the commands tables, CLAUDE.md's 291-bullet fixed, the README badge + session-33 paragraph, the PAD revision block rebuilt ([S31]/[S32] moved in, [S33] added, §7.1 through session 33, the next/font purges, the glossary), SKILL v3.21.0, DEPLOYMENT.md §3 + §11, the worklog. The gotcha-41 leak spec re-runs LAST after every doc write — clean. Final review of the change set, then the commit.
The change set is surgical: three lib/route files + two new test files + one re-pinned pin + the e2e block + the docs. Final cheap gates, then the commit — feat + the SSH wrapper push.
Dry-run clean, then the real push — remote == local HEAD, operator key shredded.

**Session 33 complete — pushed to `main` and verified.** ✅

The full cycle ran: baseline gates green (296/296 e2e) → standing parity audit byte-exact (mobile menu identical, **no Tailwind v4 bug**) → four fresh-eyes probe families → TDD remediation → full gate **406 tests green** (106 unit + 300 e2e, zero regressions).

**Three fixes shipped:**
1. **The verify-route guard stack** — the seventh public POST route (it mints session cookies) now carries the limiter + the 413 pre-check + the field cap; the source pin re-pinned to the exact seven-route set
2. **The login timing equalizer** — the 29ms user-existence oracle flattened to 0ms (both 401 paths burn the same scrypt)
3. **The enforced AUTH_SECRET contract** — production without a real secret now fails LOUD (the typed `SessionSecretError` rethrown past the catch-alls) instead of accepting tokens forged with the public repo constant

Plus the bundle-size baseline recorded and TWELVE stale-doc spots closed.

**Suggested next steps:** review `docs/remediation-plan-session33.md` + `docs/session_64.md` for the evidence trail; future directions include the session-revocation surface (a per-user epoch checked in `getSession`), a per-route bundle budget enforced by spec, or an SMTP-transport drill for the simulated-delivery surfaces.
