I'll continue the multi-stage task. The session numbers have been updated again (now session_118/119, remediation-plan-session51). Let me set up the todo list and start by refreshing the workspace.
Workspace already has both repos. `git pull` brings `92c0358` — the owner's session-log doc commit (`docs/session_119.md`, the session-51 transcript, 86 lines) on top of `2e44e55`.
Now reviewing the five core docs (AGENTS/CLAUDE/README/PAD/SKILL) + the session docs (session_118 final log, session_119 transcript, remediation-plan-session51, the worklog tail):

AGENTS.md: 80 gotchas internalized (the mobile-menu guard stack, the pins-are-the-deliverable s44–s51 precedent, the battery demo-state rule, the fetchPriority containment + the auth-route vt CSS tier). CLAUDE.md: the six-phase workflow + the gate order. README: badge 740. PAD: [S51]. SKILL v3.39.0 — 740 green (331 unit + 409 e2e). Session 51 complete and pushed; session_119's tail suggests: (a) Web Bluetooth/USB device-tier follow-ups, (b) Speculation Rules/prerender, (c) Container Queries/Scroll-Driven Animations.
This is **session 52** following the house pattern. Validating the codebase contracts:

.env == .env.example byte-identical ✓ · DATABASE_URL="file:../db/custom.db" ✓ · db/ at the repo root ✓ · skills/ excluded from all four tool configs (tsconfig/eslint/vitest/playwright) ✓ · the s51 changeset audited: 25 files, pins + docs only, NO source changes (sound). The skills catalog reviewed — tdd, tailwind-patterns, agent-browser, clone-app-pat-pro all in place.
Now the baseline gates in the house order (lint → typecheck → unit → build → e2e split):

lint ✓ · typecheck ✓ · 331/331 unit ✓ · build ✓ · 378 main + 31 tail = 409 e2e — **baseline 740 GREEN**, the documented session-51 state exactly.
Now the standing parity battery — boot the standalone on :3000 with the explicit AUTH_SECRET (the s46 lesson), reset the demo state to the live-matched zero-enrollment state (the s50 battery demo-state rule — the s51 screenshot phase left the canonical 3 enrollments):

**Standing parity battery: FULLY GREEN** — heights 18/18 byte-exact, innerText 5/5 identical (0 diffs on 214/96/789/15/9 lines), **mobile battery byte-identical — NO Tailwind v4 bug** (trigger BUTTON `md:hidden p-2 rounded-lg text-white/80` 40×40 @(319,12); panel 375×405 @(0,64); all 9 members identical), console 0 errors both sites.
Now the s52 fresh-eyes probe (s52-probe.mjs) for the three session_118 directions:

Family A (Speculation Rules/Prerender): the FULL declarative tier is a ZERO surface on both sites — zero speculationrules scripts, zero rel=expect/prefetch, zero Speculation-Rules/Supports-Loading-Mode headers, zero prerenderingchange listeners, document.prerendering false + activationStart 0 everywhere. Parity-clean.
Family B (Container Queries/SDA): the engine tier identical (all four CSS.supports probes TRUE both sites), zero @container/timeline/snap usage on both. **But there's a genuine finding: the live's styleDecls show 36 animation-timeline reads vs the clone's zero — and live scroll-behavior 9 vs clone 18.**
Let me attribute these findings precisely (s52-attribution.mjs):

**Attribution complete.** The live's USER SPA sheet exposes exactly 4 animation-timeline:auto reads per route — on .animate-pulse/.animate-spin/the two accordion utilities — because its platform compiler emits the LITERAL 8-component animation shorthand which Chromium resolves into every longhand; the clone's Tailwind v4 var()-indirected emission reads empty. The auth-route platform sheet carries 36+ more (the gotcha-80 family). The scroll-behavior counts: live 1/route (the runtime-injected universal pin) vs clone 2/route (the pin + the s25-documented popstate suppressor — deliberate-better).
Now the inertness proof (s52-inertness.mjs) — do any elements actually carry those animate classes?

**INERTNESS PROVEN**: zero animate-class elements on ANY of the 10 probed routes on EITHER site (animatedEls = 0 × 20 route-visits), zero running animations (getComputedStyle animation-name = none everywhere). The whole tier is dead CSS on both sides — a sheet-STRUCTURE serialization variance, not rendered drift.
Family C (WebGPU/Web Locks, the device-tier follow-up): navigator.gpu + GPUAdapter/GPUDevice + navigator.locks + navigator.usb present with identical shape, bluetooth headless-ABSENT on both (the gotcha-78 mirror re-verified), zero instrumented calls, zero canvases. Parity-clean.
Now the source grep zero-stance for the new pin strings (the plan-time validation):

All 21 candidate strings grep-zero in src/ (the bare `prerender` excluded — the two documented static-prerendered comments; `scroll-behavior` excluded — the s25-documented family). Writing the remediation plan (docs/remediation-plan-session52.md).
Phase 1 — the unit source pins (the s52 block in tests/platform-surface-source.test.ts): SPECULATION_PRERENDER_APIS + CONTAINER_SDA_APIS + WEBGPU_LOCKS_APIS.

334/334 GREEN. Now the honest RED verification — a temp offender file under src/:

Exactly the 3 new pins fail, the 16 existing stay green. Delete the offender, confirm 334/334.
Phase 2 — the e2e census singles (the s52 block before the s33 burst spec, the position contract): the speculation/prerender census, the CQ/SDA census with the scroll-behavior containment + the inertness contract, the WebGPU/Web Locks census. One typecheck iteration (the activationStart lib-type cast).

All 3 new e2e specs GREEN. Now the GUARD — kill the battery server first (the s46 RAM lesson), then the full gate:

**GUARD: 746 GREEN (334 unit + 412 e2e: 378 main + 34 tail)** — zero regressions. The standing battery re-verified green after the pins.
Now the screenshot phase — kill the standalone, boot `next dev` on :3000, restore the canonical demo state via the REAL API (login → enroll ×3 → progress):

All 13 dev-server captures done. The open mobile-menu shot is **byte-identical to s51 (89796 bytes)** — the panel verified open, no Tailwind v4 bug. Now the tracked dashboard pair from the standalone (kill dev, reboot with AUTH_SECRET):

**Tracked pair pixel-identical: 0/6220800 + 0/750375 RGB bytes** (PIL ImageChops, bbox=None). The proof matrix written (api-session-s52.txt).
Now the docs alignment phase — AGENTS.md counts + gotcha 81, CLAUDE.md pyramid + tails, README badge 746 + the session-52 paragraph, PAD [S52] row, SKILL v3.40.0, session_120/121 logs, the worklog entry.

Docs aligned. Now the final gate after all doc writes — the CSS-leak spec re-runs LAST per the house rule (gotcha 41): rebuild with all docs present, run the leak spec, then the full e2e split.

**FINAL GATE: 746 FULLY GREEN after all doc writes.** Now the commit + push phase — deploy the SSH key, review the changeset, commit with the house message convention, push via the wrapper (dry-run → real push → remote verified), then shred the key.
**Session 52 complete — pushed to `main` and remote-verified** ✅
