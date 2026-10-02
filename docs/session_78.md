# Session 38 — Transcript (the session-38 conversation log)

I'll start by refreshing the workspace and reviewing the project documents as instructed. The workspace was reset — a fresh `git clone https://github.com/nordeim/nexuslearn-template.git` brings the repo to the session-37 end state (commits `dcc821e`/`4bba1a1`/`f18b94a`).

The five core docs: AGENTS.md carries 66 gotchas (the Tailwind v4 trap family, the Prisma path resolver, the platform-wall rule, the CSP nonce pattern, the s37 reset-route additions). CLAUDE.md codifies the six-phase workflow + the parity principles. README documents the 493-test state; the PAD carries the [S37] revision row; the SKILL is at v3.25.0.

The session documents: session_76.md (the session-37 transcript), remediation-plan-session37.md (the plan with its three families), the worklog tail (the session-37 entry), session_77.md (the execution log). The suggested next directions: (a) the logout-everywhere UI (the deferred beyond-reference decision), (b) the INP field-data budget, (c) a Lighthouse-style score budget.

Now validating against the codebase: the structure (src/app routes incl. reset-password, api/auth with the eight guarded POST routes, lib with verification.ts + mailer.ts), the env contract (.env == .env.example byte-identical, `DATABASE_URL="file:../db/custom.db"`, db/ at the repo root after db:push + db:seed), the test configs (skills/ excluded from both layers).

Now the baseline gates in order: lint ✓, typecheck ✓, 171/171 unit ✓, build ✓, **322/322 e2e ✓** (6.6m, zero flakes) — 493 total, matching the documented state exactly.

The standing parity audit (the s38-* scripts — the workspace reset means the prior sessions' scripts are rebuilt for this session): heights ×9 routes ×2 viewports **byte-exact 18/18** (main-scoped innerText per the house convention; the live's CourseDetail probed via ITS OWN course id — `699081e752032065b878129d`, the first in the catalog's Newest order = the clone's seed-1), innerText 18/18 identical, the **mobile battery fully identical** (trigger `md:hidden p-2 rounded-lg text-white/80` byte-identical, panel 375×405 @ y=64, link geometry identical — **NO Tailwind v4 bug**; the single diff is the documented ARIA hardening), console sweep 12/12 clean.

Now this session's fresh-eyes probes. Family 1 — the 404-metadata surface: the live's 404 view body was long since byte-identical, but what does its HEAD carry? Raw-HTML extraction (curl, the SSR tier): **the live derives the title from the raw path** — "Definitely Not A Real Route | NexusLearn" for `/definitely-not-a-real-route`. **A REAL functional parity drift** — the clone ships the plain "NexusLearn" + the root canonical.

Mapping the full contract across 12 shapes: the title = lodash-startCase of the LAST non-empty segment (decoded) + " | NexusLearn" — "/RESET-PASSWORD" → "RESET PASSWORD", "/cOurSes" → "C Our Ses" (the camel-hump splits!), "/UPPER_CASE_word" → "UPPER CASE Word" (rest preserved, not lowercased), "/with123numbers" → "With123numbers" (digits never split), "/a.b.c" → "A.b.c", "/Courses/deeper/missing" → "Missing" (the last non-empty segment), "/trailing/" → "Trailing" (trailing slashes never contribute). The canonical/og:url/twitter:url: the raw path, trailing slash stripped, query INCLUDED ("/no-such-page?x=1" → all three carry "?x=1").

The architectural spike: `notFound()` DISCARDS the page's `generateMetadata` (a catch-all page with metadata + notFound() renders the plain title — verified on the dev server). The validated design: the proxy injects the raw path + search as REQUEST headers; the root layout's generateMetadata derives the family — real pages restate their full payload (gotcha 18), so the derived values surface only on not-found renders. **The plan-time catch**: the no-title renders (/, /Home, /login, /reset-password) INHERIT the layout default — they would render "Login | NexusLearn"! The routeMetadata no-title branch must pin `title: { absolute: "NexusLearn" }`; the landing needs its own metadata export; and /Home's re-export (`export { default } from "../page"`) transfers the COMPONENT but NOT the metadata — it needs its own export.

**FAMILY 2 CONFIRMED**: the AI-chat completion await has NO bound (the SDK's raw fetch accepts no signal — verified in its dist source); a hung LLM endpoint pins `POST /api/ai/chat` indefinitely. The s37 mailer-timeout sibling.

**FAMILY 3 MEASURED**: the mobile-menu OPEN interaction lands at 6–9ms (click → panel state flip, 5 runs) — the INP-proxy budget gets pinned at 200ms (the Core-Web-Vitals "good" threshold).

The deferred direction (a) resolved: the live's signed-in chrome probed — NO settings/logout/user surface anywhere (the navbar's "My Dashboard" only; the Dashboard's Browse links only). The beyond-reference decision stands.

The remediation plan (docs/remediation-plan-session38.md) — findings 1–5, the spike validation, the phased TDD fix plan, the risk notes (all validated against the codebase BEFORE any code).

RED: 31 unit specs (tests/not-found-metadata.test.ts — the startCase battery + the title/canonical derivations; tests/layout-source.test.ts — the wiring pins: the proxy headers, the layout seam, the landing//Home explicit exports, the absolute-title guard; tests/ai-chat-timeout.test.ts — the withTimeout race + the route delegation) + the 6-spec session-38 e2e block (inserted before the s33 burst spec, which stays last) + the metadata.test.ts no-title pin updated to the absolute form (the deliberate contract change). RED verified — failing for the designed reasons.

GREEN: `src/lib/not-found-metadata.ts` (the pure seam); the routeMetadata absolute-title branch + the twitter:url `other` map; the landing + /Home explicit metadata exports; the proxy's x-nexus-raw-path/x-nexus-raw-search injection; the layout's generateMetadata derivation; `src/lib/ai-chat.ts` (withTimeout + callAiCompletion); the route delegation.

**THE SPEC-FAILURE DISCOVERY**: the e2e canonical assertions failed on the twitter:url check — the live ships `<meta name="twitter:url">` on EVERY route and the clone NEVER emitted it (Next's typed Twitter object has no url field) — a SIXTH head-dimension drift caught by the spec itself. Fixed through the root-level `other` map (both routeMetadata and the layout derivation).

Spec-authoring fixes caught by the runs: the camel-split expectation ("cOurSesX" → "C Our Ses X" — every lower→upper transition is a boundary), the origin-agnostic canonical assertions (the house pattern — the build-time metadataBase port is not a parity surface), the twitter:url attribute-order regex (the live's SSR emits content-first).

**UNIT GREEN: 202/202** (+31). Lint + typecheck clean. Build ✓. **E2E GREEN: 328/328** (+6, zero regressions) — **530 total.**

GUARD: the standing parity surfaces re-verified (the layout is the highest-blast-radius file in the tree): heights 18/18 byte-exact, innerText identical, the mobile battery identical — NO Tailwind v4 bug — console 12/12 clean.

The proof matrix (docs/screenshots/api-session-s38.txt, seven parts): the 404 head family across the probed shapes (clone vs live — every title MATCH), the real-route title guard, the twitter:url dimension (every route incl. the 404), the unchanged 404 status + view contract, the AI seam unit proof, the INP measurement, the env contract.

Screenshots: the standard matrix recaptured (viewport captures — the house convention, learned after a fullPage first pass produced wrong dimensions) + the new not-found captures (both viewports + the case variant) + the reset-password house-named set — the byte-diffs all in the documented families (remote-image variance + the fresh-Chromium font antialiasing; the pixel-diffs quantified at 0.006–2.5% localized to the image/text regions, dimensions byte-identical).

Documentation alignment: README (badge 493→530, the testing lines, the session-38 paragraph), AGENTS.md (gotcha 67 + the commands table 202/328 + Where-things-live), CLAUDE.md (the pyramid counts + the seam descriptions), the PAD ([S38] revision row), SKILL v3.26.0 (project_state wrapping the session-38 state), the session logs, the worklog entry. `.env`/`.env.example` unchanged (no new knobs — the timeout is a constant).

The final full gate after all doc writes (the gotcha-41 rule): lint ✓, typecheck ✓, 202/202 unit ✓, build ✓, **328/328 e2e ✓** — **530 tests.**

Commit + the SSH wrapper push: the paramiko shim, the operator key materialized + fingerprint-verified, the dry-run clean, the real push verified (remote refs/heads/main == local HEAD), the operator key shredded.

**Session 38 complete — pushed to `main` and verified.** ✅
