# Session 34 — Final Log (post-push)

**Session 34 complete — pushed to `main` (`99cb082`) and verified.** ✅

The full cycle ran: workspace refreshed (`4dd3c58` — the session-67 final log on top of the pushed `423d18f`) → the five core docs + the session docs reviewed → baseline gates green (**300/300 e2e**, 406 total) → the standing parity audit byte-exact on every surface → THREE fresh-eyes probe families → TDD remediation → full gate **416 tests green** (113 unit + 303 e2e, zero regressions) → docs aligned → committed + SSH-wrapper pushed → remote verified `99cb082 == HEAD` → the operator key shredded.

**The standing record re-verified at session start and re-verified again after every fix:**
- heights ×9 routes ×2 viewports **byte-exact 18/18** (after the standard re-seed)
- normalized innerText **18/18 identical**; tag-of-shared-class drift **0**
- the **mobile battery fully identical** (trigger `md:hidden p-2 rounded-lg text-white/80` byte-identical, 40×40 @ (319,12), open NAV 375×469, link geometry y 81/129/177/225/273/321/369/417) — **NO Tailwind v4 bug**
- console sweep 9/10 clean (the 10th is the by-design 404 route)

**Three fresh-eyes families (the thirty-fifth through thirty-seventh, executing the session-33 suggested directions):**

1. **The session-revocation / deleted-user surface** (direction (a) — the per-user epoch): `getSession()` verified the HMAC signature + the session-32 iat bounds but NEVER re-validated the user against the database — a **DELETED user's token authenticated until its 7-day bound** (verified end-to-end: the ghost-token probe minted a real cookie, deleted the user row via the side-channel Prisma client, and `/api/auth/me` kept serving the full user object; only the schema's FK stopped ghost writes, with zero orphan rows). The only revocation lever was rotating the global `AUTH_SECRET`. The session-32 e2e control had even PINNED the ghost behavior (a token minted for a NONEXISTENT userId asserting 200) — the pin codified the blind spot, the session-33 lesson exactly.
2. **The per-route delivered-JS budget surface** (direction (b) — the recorded baseline converted into a spec): measured per-route delivered JS on the production standalone across 10 routes — `/Courses` 662.3 KB (91% of the live's 727 KB SPA monolith) down to `/login` 536.8 KB (74%). Every route under the live ceiling, but nothing pinned it.
3. **The SMTP-transport drill** (direction (c) — docs): the verify-code + reset flows deliver via `console.info` (simulated); the PAD §10 "wire real SMTP" hint had no concrete drill.

**One source fix + two pins (genuine RED→GREEN TDD — 7 RED unit failures by design, then GREEN):**
1. **The per-user epoch** — `User.sessionVersion Int @default(0)` embedded in the signed payload at mint (`ver` — `createSessionToken(user, sessionVersion)`; both minting routes pass the user's current value) and re-compared on every `getSession()` read (ONE indexed `findUnique` in the adapter; the pure `session.ts` stays DB-free for the unit layer). Null when the user is gone (the ghost case), null when the epoch mismatches (the bump); the session's email/name refresh from the row. **Pre-34 tokens read `ver: 0` and stay valid — no forced re-login wave.** The operator levers: `UPDATE User SET sessionVersion = sessionVersion + 1` kills that user's outstanding tokens WITHOUT rotating the global `AUTH_SECRET`; deleting the user kills them too (DEPLOYMENT.md §12). The session-32 control updated to mint for the real seeded demo user.
2. **The bundle-budget spec** — every route's same-origin JS response-body sum must stay under the live's 727 KB monolith ceiling (a heavy shared-chunk import trips RED; the measured max leaves ~9% headroom).
3. **The SMTP swap-in drill** — DEPLOYMENT.md §13 (the seam, the swap, the test impact: the e2e signup/verify specs rely on the any-code-verifies contract — gate behind an env flag or re-pin deliberately).

**The evidence trail:** `docs/remediation-plan-session34.md` (the plan, validated before execution) · `docs/screenshots/api-session-s34.txt` (the script-generated proof matrix: the ghost + epoch evidence with the pre-fix baselines annotated, the per-route budget table, the :3400 standalone matrix) · 85 files in `docs/screenshots/` (73 fresh PNGs on the remediated dev server — 69 of them byte-identical to HEAD, the pixel-stability signal).

**Docs aligned:** AGENTS.md (gotcha 63 + the commands table 113/303 + Where-things-live) · CLAUDE.md (the unit/e2e bullets + the 303 line) · README (badge 416 + the testing lines + the session-34 paragraph) · the PAD ([S34] revision row, the §6.1 REVOCABLE rule, the §6.4 stale/leaked-token row, §3.2 tree counts, §7.1 two new rows, §7.4 113/303, the §10 SMTP row pointing at the drill) · SKILL v3.22.0 (frontmatter + project_state wrapping the session-33 state) · DEPLOYMENT.md (§12 the revocation levers + §13 the SMTP drill) · the worklog entry.

**Suggested next steps:** review the evidence trail above; future session directions include (a) the **logout-everywhere UI surface** — a "sign out of all devices" affordance that bumps the epoch (the lever exists, the UX does not), (b) a **verification-code persistence drill** — moving the code from the log line to a `verificationCode` column with expiry as the first half of the SMTP drill, testable without a transport, or (c) the **per-route performance budget family** — extending the JS budget to TTFB/FCP/LCP pins on the standalone (the session-24 web-vitals direction, now with a budget precedent).
