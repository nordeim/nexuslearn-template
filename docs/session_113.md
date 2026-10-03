I'll continue this multi-phase remediation task on the nexuslearn-template repository. Let me set up a task list and begin with Phase 1 (workspace refresh + documentation review).
The workspace has been reset, so I'll clone the repository fresh. Let me also check the uploaded prompt file.
Repo cloned successfully (2826 files). Let me check the repo structure and recent git history.
Repo cloned at latest main (commit `718e050`, session 48 work). Now Phase 1 continues — reading the core documentation files.
The docs are large. Let me read them strategically in sections.
The file has very long lines. Let me read it with truncation.
Let me read AGENTS.md in chunks directly.
The doc lines are extremely long. Let me create truncated versions for reading.
AGENTS.md reviewed. Now let me read the session docs and worklog (most recent entries).
Now the remediation plan and worklog tail.
Now the worklog tail and the SKILL doc.
I now have the full picture of the house conventions. Let me read the remaining core docs (CLAUDE.md, SKILL, README key parts).
Now let me validate understanding against the codebase config files (package.json, .env, .env.example, test configs).
`.env` already carries the correct `DATABASE_URL="file:../db/custom.db"` contract. Let me verify the test configs and skills catalog.
Configs verified. Now let me check the skills catalog and the SSH push instructions, then set up the environment.
Now let me check the TDD and SSH-wrapper skills, then set up the environment.
Docs review complete. Now Phase 1 setup — install dependencies and set up the database.
`db/custom.db` created at repo root. Let me verify skills/ exclusion across tool configs, then start the baseline gates.
All environment contracts verified. Now the baseline gates in order: lint → typecheck → unit tests.
322/322 unit green. Now the production build.
Build complete with 400 e2e specs. Running the e2e suite using the documented split strategy (mobile-nav 14 + main + tail).
**Baseline gates: 722 GREEN** — lint ✓, typecheck ✓, 322/322 unit ✓, build ✓, 400/400 e2e ✓ (14 mobile + 378 main + 22 tail). This matches the documented session-48 state exactly. Now let me audit the recent code changes.
The s48 changeset is test pins + docs only (no source change, per the documented precedent). Let me audit the recent test additions.
Pins audited and sound. Now let me review the scandihaven reference repo (tech-stack pattern reference, per the user's instruction).
Scandihaven reference reviewed — same Next 16/React 19/Tailwind v4 patterns, monorepo variant. The nexuslearn codebase is aligned. Now the live-site parity battery. Let me boot the clone standalone and write the battery script.
Now let me boot the clone's standalone server on :3000 (with explicit AUTH_SECRET per the s46 boot lesson) and write the parity battery script.
Server up. Let me check the LoginForm structure for the battery's login selectors.
Let me examine the Navbar structure for the mobile battery selectors.
Now let me write the standing parity battery script (s49-battery.mjs, following the documented s48 pattern).
Node resolves imports from the script's own directory. Let me fix the import path to use the repo's node_modules.
**STANDING PARITY BATTERY: FULLY GREEN** — heights 18/18 byte-exact, innerText 5/5 identical, **mobile menu byte-identical on both sites — NO Tailwind v4 bug** (trigger 40×40, panel 405h, all 9 members at identical geometry), console clean. Now the fresh-eyes probes for the session-49 families: WebAuthn/credentials, Web Speech, and Bluetooth/Serial.
All three families are parity-clean zero surfaces. The one anomaly: `error` listener counts (live 56 vs clone 130) — needs attribution. Let me qualify that with a focused follow-up probe.
The delta is fully qualified — it's the **framework-internal listener family** (the s48 precedent): the clone's Next.js runtime monitors script-tag loads (56× script), registers document/window-tier error listeners + the `__next-route-announcer__` (a11y), while the live's older platform React uses its div#root tier. The img family is **identical (37=37 — same image set)**. No app-level handlers on either site. Now the source zero-stance census for the three families.
All 17 strings zero in src/ — the three families are parity-clean zero surfaces. The audit is complete. Now let me study the s48 e2e block pattern before writing the remediation plan.
All probe work complete. Now writing the remediation plan (docs/remediation-plan-session49.md) following the house format.
Plan written and validated. Now Phase 1 — TDD unit source pins. Let me add the session-49 constants + block to tests/platform-surface-source.test.ts.
Now the honest RED-verification pass — a temp offender file under src/ must fail the new pins, then be deleted.
Honest RED verified — all 3 new pins fail with the offender present; the existing 322 stay green. Now delete the offender and confirm GREEN.
325/325 unit green. Now Phase 2 — the e2e census specs. Let me find the insertion point (before the s33 burst spec).
Now let me write the session-49 e2e block (3 census specs), inserted before the s33 burst spec.
Now lint + typecheck the new specs, then run them against the current tree.
Typecheck errors in the connectivity api reads. Let me fix the types.
All 3 new specs green. Now the GUARD phase — fresh build + full gate re-run.
**GUARD COMPLETE: 728 GREEN** (14 + 378 + 25 e2e). Now the standing parity battery re-run (the house rule).
Battery re-verified green — identical. Now the screenshot phase. Let me check the canonical demo state convention (the e2e global-setup + prior dev-shot state).
Let me check the tracked dashboard screenshot to identify the canonical demo state (which 3 courses).
Canonical state identified: 3 enrollments (seed-1 WebDev, seed-3 Cloud, seed-5 EmotionalIQ) with seed-5 at 1%. Let me check the progress API contract, then write the capture script.
Lesson ids are auto-generated — I'll query the DB directly in the capture script. Let me write it now.
All 13 captures done. Let me verify the mobile-menu shot shows the open panel and byte-diff the tracked dashboard pair.
Panel verified open. The tracked-pair diff is larger than the documented asset-variance family — let me qualify it (the s48 re-shoot was from the standalone server; mine is from dev). Let me inspect both.
The re-shoot was signed-out — my capture contexts lacked the session cookie. Let me fix the script to set the login cookie in every context and re-capture.
State restored; the remaining small diffs are dev-server artifacts (the Next dev-tools badge + dev rendering). Let me qualify the tracked pair properly from the standalone server (the s48 convention).
**Tracked pair re-shot BYTE-IDENTICAL (0 bytes both)** — canonical state verified. Now let me write the proof matrix (following the s48 format).
Now writing the session-49 proof matrix.
Proof matrix written. Now the docs-alignment phase, starting with AGENTS.md.
Now let me add gotcha 78 to AGENTS.md (after gotcha 77).
AGENTS.md updated. Now CLAUDE.md.
Those are Tailwind/HTTP references, not counts. Let me check the pyramid total line and add the s49 tails.
Now README.md — badge + session paragraph.
Now the PAD — [S49] row + Last-Updated stamp.
PAD updated. Now the SKILL file version bump.
SKILL updated to v3.37.0. Now the session logs — session_111.md (transcript) + session_112.md (final log).
Now the worklog entry.
Worklog appended. Now the final full gate after all doc writes (the gotcha-41 rule — the CSS-leak spec runs LAST). Let me find it first.
**FINAL GATE: 728 FULLY GREEN** — CSS-leak spec clean after all doc writes, 403/403 e2e. Now the commit + push. Let me read the SSH wrapper instructions first.
Instructions internalized. Let me review the changeset and prepare the commit.
Clean changeset. Let me do the final `.env.example` codebase-match verification (the user's explicit requirement), then commit.
All contracts verified. Now the commit with the house message convention.
Committed (`7d51dbf`). No ssh binary — deploying the paramiko shim path per the runbook.
The python/pip mismatch — installing into the active venv python.
Now deploying the paramiko SSH shim (Appendix A) outside the repo.
Key verified (ed25519). Now the dry-run with the wrapper (explicit remote for nexuslearn-template).
Dry-run successful — auth verified, fast-forward `718e050..7d51dbf` confirmed. Now the real push.
**Push verified: `main @ 7d51dbf` == local HEAD** (the wrapper's authoritative verification). Operator key shredded, shim removed. Let me clean up and finalize the workspace worklog.
**Session 49 complete — pushed to `main` (`7d51dbf`) and remote-verified** ✅

**What ran:**
- **Baseline 722 green** re-verified (lint → typecheck → 322 unit → build → 400 e2e), then the live-site parity battery (logged in as the demo user on both sites): heights **18/18 byte-exact**, innerText **5/5 identical**, **mobile menu byte-identical — no Tailwind v4 bug**, console 0 errors on both sites.
- **Three fresh-eyes families** (the session_109 directions): credentials/WebAuthn, Web-Speech, Bluetooth/Serial/USB — all parity-clean zero surfaces on both sites. **One genuine discovery**: the Next.js runtime error-listener family (framework-internal, all inert — documented as gotcha 78).
- **TDD: +3 unit +3 e2e = 728 green** (RED-verified honestly with a temp offender file); `.env`/`db/`/`.env.example`/vitest+playwright contracts verified; **13 dev-server screenshots** (incl. the open mobile menu) + proof matrix landed under `docs/screenshots/`; the tracked dashboard pair re-shot **byte-identical** from the standalone.
- All docs aligned, committed, pushed via the SSH wrapper (dry-run → real push → remote verified), operator key shredded, servers stopped.

**Suggested next:** (a) the WebXR/immersive family, (b) the File System Access API tier, or (c) the Web NFC/Web SMS census — or tell me any specific surface you'd like probed first.
