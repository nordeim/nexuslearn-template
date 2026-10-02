The workspace exists with both repos (nexuslearn-template + scandihaven) and the persisted session-31 audit scripts. Let me refresh the local workspace first.
Workspace refreshed — the pull brought in the new `docs/session_60.md` (commit `dc1b2e2` on top of the pushed `dfc9f14`). Now let me set up the task plan and review the docs.
The core docs are large — I'll delegate the comprehensive review to a subagent while I verify the environment contract directly.
Doc review complete. The repo is at the session-31 end state (368 tests green — 77 unit + 291 e2e), with three suggested directions: a dependency-audit pass, an auth-session-lifetime/cookie-hardening probe, or an aria-live politeness family on the AI chat. Let me verify the environment contract and run the baseline gates.
Env contract verified: `.env` has `DATABASE_URL="file:../db/custom.db"`, `db/` at the repo root with custom.db + e2e.db, `.env.example` byte-identical, vitest + playwright scripts in place, skills/ excluded.
Lint ✓ typecheck ✓ 77/77 unit ✓. Now the build gate.
Build ✓. Now the e2e gate (~5.4 min).
**Baseline FULLY GREEN — 291/291 e2e**, matching the documented session-31 end state exactly. Now the standing parity audit. Let me re-seed the dev DB first (the known enrollment-state artifact prevention), then create the s32 scripts from the s31 templates.
The standard re-seed done. Now the parity audit with the dev server.
**Standing parity audit ALL GREEN** — heights 18/18 byte-exact, innerText 18/18 identical, tag drift 0. Now the mobile battery (the Tailwind v4 watch).
**Mobile battery GREEN — NO Tailwind v4 bug.** Trigger byte-identical, geometry 40×40 @ (319,12), panel 375×469, link geometry byte-exact. The clone's scroll lock + aria-expanded are the documented deliberate hardening. Now the console sweep.
Console sweep 9/10 clean (the 10th is the by-design 404 route). Now the three fresh-eyes families. First, let me examine the auth/session implementation to design the lifetime probe.
Key observation from `src/lib/session.ts`: `verifySessionToken` decodes the payload but never checks the embedded `iat` — the 7-day limit is only in the cookie's `maxAge`. Let me also check the cookie attributes and the logout route.
The logout route clears with a bare `{ path: "/", maxAge: 0 }` — no HttpOnly/SameSite. Now let me write the cookie/lifetime probe and run it against both sites.
First probe run crashed on a Playwright URL-parsing quirk with request-API responses — but it already revealed the logout Set-Cookie shape. Let me fix the probe to use raw fetch for the logout part.
Interesting — the corrected probe shows mangled-signature and no-userId tokens return `user: null` correctly... wait, the status was 200 for everything. Let me check the `/api/auth/me` route: it returns 200 with `{user: null}` for anonymous visitors — my probe only printed the STATUS, not the BODY. Let me fix the probe to read the body.
**MAJOR FINDING CONFIRMED**: with the body-reading probe — the fresh token returns the user (control ✓), but a **30-day-old signed token returns USER PRESENT** and a **future-iat token too**. The server-side session lifetime is NOT enforced. Let me also check how the live stores its session.
The live stores its JWT in **localStorage** (`token`, `base44_access_token`, `base44_app_id`) — no Set-Cookie at all, no server-visible expiry. So this is NOT a parity gap — it's deliberate-better hardening of the clone's own first-party-cookie contract. Now the aria-live probe on both sites.
Neither site exposes any aria-live surface on /AIAssistant — the "Thinking..." state and answers are invisible to screen readers. The clone already ships aria-label hardening on the composer; this is the same deliberate-better family. Now the dependency audit.
`bun audit` flags ONE HIGH: `deepmerge-ts < 8.0.0` via `prisma → @prisma/config → deepmerge-ts@7.1.5` (exact-pinned, no patched 7.x, prisma 8 RC-only). The v8 line keeps the same `deepmerge` named export. Also found: the scaffold-era `package-lock.json` is stale (missing `@axe-core/playwright`).
All findings inventoried. Let me check the e2e spec tail and the chat component structure, then write the remediation plan.
The messages container is at `AIAssistantChat.tsx` line ~182; the e2e session-31 burst block ends the spec file. No a11y-snapshot pins exist on the chat region — aria-live hardening is safe for the parity surfaces.
Remediation plan written (`docs/remediation-plan-session32.md`). Now **TDD Phase 1 — RED**: the unit specs first (the boundary battery + the source pins).
RED confirmed — 12 unit failures exactly as designed (8 lifetime + 2 logout pin + 2 dependency pin), all 80 other specs green. Now the RED e2e block, appended after the session-31 burst spec.
**E2E RED confirmed** — 4 failed exactly per findings (stale token, future token, logout attributes, aria-live), the fresh-token control green-by-design. Now **the GREEN phase** — the session-lifetime bounds in `src/lib/session.ts` first.
Now the `src/lib/auth.ts` re-export + the logout route's attribute-symmetric deletion.
Now the deepmerge-ts override in package.json + bun install.
Override applied — 8.0.2 resolved, `bun audit` clean ("No vulnerabilities found"). Now the aria-live changes on the chat component.
All GREEN changes applied. Unit tests: **92/92 GREEN**. The prisma CLI round-trip works with the override (generate + push + seed). Lint + typecheck clean. Now the rebuild + the session-32 e2e run.
One e2e failure — my logout spec expected `SameSite=Lax` but Next serializes `SameSite=lax`. The FIX works (all attributes present in the header); the spec needs a case-insensitive comparison. Fixing the spec.
**5/5 session-32 e2e specs GREEN** — including the real AI-chat round trip validating the aria-live surface. Now the full gate.
**FULL GATE GREEN — 92/92 unit + 296/296 e2e (388 total), zero regressions.** Now the parity re-verification after the changes (the house discipline).
Parity re-verified — heights 18/18, innerText 18/18, drift 0, mobile battery identical, console clean. The aria-live attributes perturbed nothing. Now `git rm package-lock.json`, then the docs-alignment phase.
Now the docs: AGENTS.md gotcha 61 + counts, CLAUDE.md, README (fixing the stale 53/278 counts + the session-32 paragraph), the PAD ([S32] row + §7.4 counts + the ADR-002 `/Home` wording), SKILL v3.20.0, DEPLOYMENT.md §10.
Found and fixed a typo I introduced in gotcha 60 (a stray quote replacing a closing backtick). All docs aligned. Now the session log `docs/session_61.md` + the transcript.
Now the screenshot capture — adapting the s31 capture script with the session-32 proof section.
The capture completed (82 files) with the known delayed-route teardown noise — but the proof file didn't get written: my sed missed the `api-guards-s31.txt` filename (no hyphen after "s31") and OVERWROTE session-31's proof artifact. Let me restore it from git and run a proof-only script.
Session-31's proof restored from git. The proof-only runner produced the session-32 artifact: the full token matrix (stale 30d/8d rejected, 6d accepted, future +2min rejected, +30s accepted, no-iat rejected, mangled rejected, the logout deletion Set-Cookie attribute-symmetric). Now `.env.example` re-verified byte-identical, the worklog entry, and the gotcha-41 leak-spec re-run.
`.env.example` byte-identical ✓. Worklog appended ✓. Leak spec clean ✓. Now the final pre-commit review of the complete change set, then the commit + push.
The change set: 2 new lib constants + the iat bounds, the logout symmetry, the override, the lockfile removal, the aria-live hardening, 3 new test files + the e2e block, and the docs. Final sanity: lint + typecheck + unit (cheap; the full e2e already green on this exact code).
All green. Now the commit — following the house convention (feat commit + the transcript's update commit), then the SSH wrapper push with the operator key.
Dry-run clean, then the real push — remote == local HEAD, operator key shredded.

**Session 32 complete — pushed to `main` and verified.**

**What this session delivered:**
- 🔍 **Standing parity re-audit: fully GREEN** — heights 18/18 byte-exact, innerText 18/18, tag drift 0, mobile battery identical (no Tailwind v4 bug), console 9/10 clean
- 🧪 **Three fresh-eyes families, five fixes (genuine RED→GREEN TDD):**
  1. **Server-side session lifetime** — the 7-day promise now enforced in `verifySessionToken` (the `iat` bounds with the single-source-of-truth constants), not just the browser cookie jar
  2. **Logout deletion-cookie symmetry** — the clearing Set-Cookie carries the full attribute set
  3. **Future-iat / clock-skew guard** — folded into the same enforcement (60s tolerance)
  4. **Dependency hygiene** — the `deepmerge-ts` HIGH advisory overridden to `^8.0.2` (`bun audit` clean) + the stale scaffold-era `package-lock.json` removed
  5. **AI-chat aria-live politeness** — `aria-live="polite"` + `role="status"` on the Thinking bubble (deliberate-better; the live ships neither)
- ✅ **388 tests green** (92 unit + 296 e2e, zero regressions), 83 screenshot files (incl. `api-session-s32.txt`), `.env`/`.env.example` verified, all docs aligned (gotcha 61, PAD [S32], SKILL v3.20.0, DEPLOYMENT.md §10, the README/PAD stale counts fixed)

**Suggested next steps:** review `docs/remediation-plan-session32.md` + `docs/session_61.md` for the evidence trail; future directions include a bundle-size/dependency-count budget pass, a logout-everywhere/session-revocation surface (the token lives until its 7-day bound — a revocation list or an `AUTH_SECRET` rotation drill), or a print/reading-mode deep dive (the frozen print surface is the natural next audit frontier).
