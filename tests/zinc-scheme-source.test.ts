import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Session 43 — the /login zinc block's color-scheme contract (fresh-eyes
 * family B: the color-scheme media census). The s18 zinc block shipped
 * wrapped in a @media (prefers-color-scheme: light) query "to keep the
 * dark-scheme :root block untouched" — but the LIVE's runtime zinc sheet
 * carries NO media wrapper (census: 0 prefers-color-scheme rules on the live
 * vs the clone's 1 — the wrapper itself), so under a dark-scheme visitor the
 * LIVE keeps zinc (the focused ring rgb(9,9,11) — identical to its light
 * tier) while the clone DEACTIVATED the block (neutral rgb(10,10,10)) — a
 * real drift in the exact 1-3 sRGB-unit family the s18 pin exists to close.
 *
 * The fix unwraps the block: the zinc tokens apply under EVERY scheme,
 * mirroring the live's runtime sheet behavior (the s22 no-adaptation
 * contract applied to the zinc tier — the live adapts nothing under dark,
 * including its zinc). These source pins freeze the census contract: the
 * block present + zero color-scheme media queries in the stylesheet.
 */
const read = (f: string) => readFileSync(f, "utf8");

const GLOBALS = "src/app/globals.css";

describe("zinc-scheme — the /login zinc block under every color scheme (session 43)", () => {
  it("the zinc block is present (the body:has() scope + the zinc ring token)", () => {
    const css = read(GLOBALS);
    expect(css).toContain("body:has(main[data-login-theme])");
    expect(css).toMatch(/--ring:\s*#09090b/);
  });

  it("carries NO prefers-color-scheme media wrapper (the live's runtime zinc sheet has none — the census contract)", () => {
    const css = read(GLOBALS);
    expect(css.includes("prefers-color-scheme")).toBe(false);
  });

  it("the zinc block still scopes ONLY to the login page (the body:has() selector form is unchanged)", () => {
    const css = read(GLOBALS);
    // The block must remain a body-level custom-property scope (not :root —
    // the s18 GUARD contract: every other route keeps the neutral theme).
    expect(css).toMatch(/body:has\(main\[data-login-theme\]\)\s*\{/);
    expect(css).not.toMatch(/:root[^\{]*\{[\s\S]{0,200}--ring:\s*#09090b/);
  });
});
