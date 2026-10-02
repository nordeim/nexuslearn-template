# Session 38 — Final Log

**The 404-metadata derivation + AI-chat-timeout + INP-budget pass** — pushed to `main` and verified.

## What ran this session

**Baseline & standing parity (all green):** the full gate re-verified at the documented session-37 state (493 tests) → heights ×9 routes ×2 viewports **byte-exact 18/18** (the live's CourseDetail probed via its own course id), innerText 18/18 identical, **mobile battery fully identical — NO Tailwind v4 bug** (trigger byte-identical, panel 375×405 @ y=64, link geometry identical; the single diff is the documented ARIA hardening), console 12/12 clean.

**The headline fresh-eyes find — a REAL functional parity drift (the 404-metadata surface):** reading the live's raw HTML HEAD (the 404 body was already byte-identical; the head was never probed at the not-found render) revealed **the reference derives the 404 view's entire head family from the raw request path** — the title (lodash-startCase of the last non-empty segment: "Definitely Not A Real Route | NexusLearn", "RESET PASSWORD | NexusLearn", "C Our Ses | NexusLearn" — the camel humps split), the canonical/og:url/twitter:url (the raw path, trailing slash stripped, query included), og:title + twitter:title mirrors. The clone shipped the plain root family. The fix:

1. **The 404-metadata derivation** — the proxy injects `x-nexus-raw-path`/`x-nexus-raw-search` request headers; the root layout's `generateMetadata` derives the family through the pure seam (`src/lib/not-found-metadata.ts`). The spike retired the architectural risk FIRST (`notFound()` discards page metadata — the derivation must live at the layout level), and the plan-time catch fixed the inheritance trap (every no-title page pins `title: { absolute: "NexusLearn" }`; the landing + /Home carry explicit metadata exports — the /Home re-export transfers the component but NOT the metadata).
2. **The twitter:url dimension** (found BY the spec failure — the sixth head drift): the live ships `<meta name="twitter:url">` on every route; the clone never emitted it (Next's typed Twitter object has no url field). Rendered through the root-level `other` map in both routeMetadata() and the layout derivation.
3. **The AI-chat timeout** (the s37 mailer-timeout sibling): the SDK's raw fetch accepts no signal — `src/lib/ai-chat.ts` races the completion against a 60s bound; a hung LLM endpoint now degrades to the existing 502 + friendly message.
4. **The INP-proxy budget**: the mobile-menu OPEN interaction < 200ms (the Core-Web-Vitals INP "good" threshold; measured 6–9ms).

**GUARD:** the full standing parity battery re-ran after the changes (the layout is the highest-blast-radius file in the tree — the proof the global change moved nothing on real routes): heights 18/18 byte-exact, innerText identical, the mobile battery identical, console clean.

**Deliverables:** 530 tests green (202 unit + 328 e2e, zero regressions) · the seven-part proof matrix (`docs/screenshots/api-session-s38.txt`) · the screenshot matrix (viewport captures per the house convention + the new not-found captures) · all docs aligned (gotcha 67, SKILL v3.26.0) · remote verified, key shredded.

**Suggested next:** (a) the logout-everywhere UI — the deferred beyond-reference decision (a `/Settings` route; the live ships no settings surface, confirmed this session), (b) a Lighthouse-style score budget family, or (c) the error-boundary surface (the `error.tsx` rendering contract — unpinned).
