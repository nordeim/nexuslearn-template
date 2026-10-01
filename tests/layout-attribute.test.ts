import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

// Session-30 guard: the router-scroll modality contract. The root layout's
// <html> must carry data-scroll-behavior="smooth" — the Next.js-documented
// declaration that makes the App Router wrap its OWN scroll operations (the
// nav reset-to-top, the popstate restore) in a temporary scroll-behavior:
// auto (see next/dist/shared/lib/router/utils/disable-smooth-scroll.js:
// the wrapper only engages when html.dataset.scrollBehavior === "smooth").
// Without it the router's scrolls run unsuppressed under the session-13
// universal * { scroll-behavior: smooth } parity pin — every in-app nav
// reset GLIDED (~600ms for 2000px) and the dev console carried the
// "Detected `scroll-behavior: smooth` on the `<html>` element" warning.
// The behavioral pin lives in the e2e session-30 block; this guard keeps
// the SOURCE from silently dropping the attribute in a refactor.

describe("session-30: the router-scroll modality contract (source guard)", () => {
  test("the root layout's <html> ships data-scroll-behavior=\"smooth\"", () => {
    const layout = readFileSync(
      path.resolve(__dirname, "..", "src", "app", "layout.tsx"),
      "utf8"
    );
    // The attribute must be on the <html> element itself (dataset.scrollBehavior).
    expect(layout).toMatch(/<html[^>]*data-scroll-behavior="smooth"/);
  });
});
