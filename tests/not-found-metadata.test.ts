import { describe, expect, it } from "vitest";

import {
  notFoundCanonical,
  notFoundTitle,
  startCaseSegment,
} from "@/lib/not-found-metadata";

/**
 * Session 38 — the 404-metadata seam battery (fresh-eyes family 1: the live
 * derives the 404 view's ENTIRE head family from the raw request path —
 * probed on 12 shapes via raw-HTML head extraction; the body was already
 * byte-identical, the head was not).
 *
 * The probed reference contract:
 *  - title = lodash-startCase of the LAST non-empty path segment
 *    (decoded), + " | NexusLearn"
 *  - words split on hyphens, underscores AND lower→upper camel boundaries;
 *    each word's FIRST letter uppercased, the REST PRESERVED
 *  - canonical = the raw path, trailing slash stripped, query included
 */

describe("startCaseSegment — the reference title-caser (session 38)", () => {
  it("capitalizes each hyphen-separated word, rest preserved", () => {
    expect(startCaseSegment("definitely-not-a-real-route")).toBe(
      "Definitely Not A Real Route"
    );
    expect(startCaseSegment("no-such-page")).toBe("No Such Page");
    expect(startCaseSegment("single")).toBe("Single");
  });

  it("PRESERVES the case of every letter after the first (not lowercased)", () => {
    // probed: /RESET-PASSWORD -> "RESET PASSWORD | NexusLearn"
    expect(startCaseSegment("RESET-PASSWORD")).toBe("RESET PASSWORD");
    // probed: /UPPER_CASE_word -> "UPPER CASE Word"
    expect(startCaseSegment("UPPER_CASE_word")).toBe("UPPER CASE Word");
  });

  it("splits at lower→upper camel boundaries (the lodash startCase hump rule)", () => {
    // probed: /cOurSes -> "C Our Ses | NexusLearn"
    expect(startCaseSegment("cOurSes")).toBe("C Our Ses");
    // probed: /mixedCASE-words -> "Mixed CASE Words"
    expect(startCaseSegment("mixedCASE-words")).toBe("Mixed CASE Words");
  });

  it("digits and dots do NOT split words", () => {
    // probed: /with123numbers -> "With123numbers | NexusLearn"
    expect(startCaseSegment("with123numbers")).toBe("With123numbers");
    // probed: /a.b.c -> "A.b.c | NexusLearn"
    expect(startCaseSegment("a.b.c")).toBe("A.b.c");
  });

  it("collapses dash-only and empty segments to the empty string", () => {
    // probed: /--double-- -> "Double | NexusLearn"
    expect(startCaseSegment("--double--")).toBe("Double");
    expect(startCaseSegment("")).toBe("");
    expect(startCaseSegment("---")).toBe("");
    expect(startCaseSegment("_-_-")).toBe("");
  });

  it("trims and joins multi-space runs", () => {
    expect(startCaseSegment("  spaced  out  ")).toBe("Spaced Out");
  });
});

describe("notFoundTitle — the derived 404 document title (session 38)", () => {
  it("derives from the LAST non-empty segment + the site suffix", () => {
    expect(notFoundTitle("/definitely-not-a-real-route")).toBe(
      "Definitely Not A Real Route | NexusLearn"
    );
    // probed: /Courses/deeper/missing -> "Missing | NexusLearn"
    expect(notFoundTitle("/Courses/deeper/missing")).toBe("Missing | NexusLearn");
  });

  it("ignores trailing slashes (the last NON-EMPTY segment wins)", () => {
    // probed: /trailing/ -> "Trailing | NexusLearn"
    expect(notFoundTitle("/trailing/")).toBe("Trailing | NexusLearn");
    // probed: /Courses/deeper/ -> "Deeper | NexusLearn"
    expect(notFoundTitle("/Courses/deeper/")).toBe("Deeper | NexusLearn");
  });

  it("decodes percent-encoded segments before title-casing", () => {
    // probed: /%20space%20word -> "Space Word | NexusLearn"
    expect(notFoundTitle("/%20space%20word")).toBe("Space Word | NexusLearn");
  });

  it("keeps case-variant misses raw (the exact-match 404 family)", () => {
    // probed: /RESET-PASSWORD -> "RESET PASSWORD | NexusLearn"
    expect(notFoundTitle("/RESET-PASSWORD")).toBe("RESET PASSWORD | NexusLearn");
    // the cOurSes-style hump split (every lower->upper transition is a
    // boundary — the spec-authoring lesson: "cOurSesX" splits at sX too)
    expect(notFoundTitle("/cOurSesX")).toBe("C Our Ses X | NexusLearn");
  });

  it("falls back to the plain root title for the empty path", () => {
    expect(notFoundTitle("")).toBe("NexusLearn");
    expect(notFoundTitle("/")).toBe("NexusLearn");
  });
});

describe("notFoundTitle — the encoded-slash (%2F) decode-order contract (session 39)", () => {
  // The live decodes the FULL raw path FIRST, THEN splits on "/" — the last
  // non-empty DECODED segment is the title source (7 shapes probed).
  // The clone's previous seam split the raw path first, decoding only the
  // last raw segment: "/enc%2Fslash" titled "Enc/slash" vs the live "Slash".
  it("splits on the DECODED slash (the last decoded segment wins)", () => {
    // probed: /enc%2Fslash -> "Slash | NexusLearn"
    expect(notFoundTitle("/enc%2Fslash")).toBe("Slash | NexusLearn");
    // probed: /a%2Fb%2Fc -> "C | NexusLearn"
    expect(notFoundTitle("/a%2Fb%2Fc")).toBe("C | NexusLearn");
    // probed: /Courses%2Fdeeper%2Fmissing -> "Missing | NexusLearn"
    expect(notFoundTitle("/Courses%2Fdeeper%2Fmissing")).toBe(
      "Missing | NexusLearn"
    );
  });

  it("treats a trailing encoded slash as a real trailing slash", () => {
    // probed: /a%2F -> "A | NexusLearn" (decode -> "/a/" -> last "a")
    expect(notFoundTitle("/a%2F")).toBe("A | NexusLearn");
    // probed: /enc%2F -> "Enc | NexusLearn"
    expect(notFoundTitle("/enc%2F")).toBe("Enc | NexusLearn");
  });

  it("startCases the decoded segment's camel humps", () => {
    // probed: /x%2FmyPage -> "My Page | NexusLearn"
    expect(notFoundTitle("/x%2FmyPage")).toBe("My Page | NexusLearn");
    // probed: /first%2Fsecond-third -> "Second Third | NexusLearn"
    expect(notFoundTitle("/first%2Fsecond-third")).toBe(
      "Second Third | NexusLearn"
    );
  });

  it("an encoded-slash-only path renders the plain root title", () => {
    // probed: /%2F -> decode "/" -> no non-empty segment -> plain
    expect(notFoundTitle("/%2F")).toBe("NexusLearn");
  });

  it("the s38 shape identities are preserved (decode is a no-op on plain paths)", () => {
    expect(notFoundTitle("/definitely-not-a-real-route")).toBe(
      "Definitely Not A Real Route | NexusLearn"
    );
    expect(notFoundTitle("/foo%20bar")).toBe("Foo Bar | NexusLearn");
    expect(notFoundTitle("/caf%C3%A9")).toBe("Café | NexusLearn");
    expect(notFoundTitle("/hello+world")).toBe("Hello+world | NexusLearn");
    expect(notFoundTitle("/50%25off")).toBe("50%off | NexusLearn");
    expect(notFoundTitle("/a//double")).toBe("Double | NexusLearn");
    expect(notFoundTitle("///")).toBe("NexusLearn");
    expect(notFoundTitle("/%zz")).toBe("%zz | NexusLearn");
  });
});

describe("notFoundCanonical — the derived 404 canonical (session 38)", () => {
  it("mirrors the raw path", () => {
    expect(notFoundCanonical("/definitely-not-a-real-route", "")).toBe(
      "/definitely-not-a-real-route"
    );
  });

  it("strips the trailing slash (probed: /trailing/ -> /trailing)", () => {
    expect(notFoundCanonical("/trailing/", "")).toBe("/trailing");
    expect(notFoundCanonical("/Courses/deeper/", "")).toBe("/Courses/deeper");
  });

  it("includes the query string (probed: ?x=1 rides the canonical)", () => {
    expect(notFoundCanonical("/no-such-page", "?x=1")).toBe("/no-such-page?x=1");
    expect(notFoundCanonical("/no-such-page/", "?x=1")).toBe(
      "/no-such-page?x=1"
    );
  });

  it("normalizes the empty path to the root", () => {
    expect(notFoundCanonical("", "")).toBe("/");
    expect(notFoundCanonical("/", "")).toBe("/");
  });
});

describe("notFoundCanonical — the processed query (session 39)", () => {
  // The live PROCESSES the 404's query through the canonical algorithm
  // (probed: ?utm_source=a&y=2 -> ?y=2; ?z=1&a=2 -> ?a=2&z=1) — the raw
  // pass-through was the s38 shape that only coincided for single kept params.
  it("drops the tracking params (probed on the 404)", () => {
    expect(notFoundCanonical("/no-such-page-xyz", "?utm_source=a&y=2")).toBe(
      "/no-such-page-xyz?y=2"
    );
    expect(notFoundCanonical("/no-such-page-xyz", "?gclid=1")).toBe(
      "/no-such-page-xyz"
    );
  });

  it("sorts the kept params (probed on the 404)", () => {
    expect(notFoundCanonical("/no-such-page-xyz", "?z=1&a=2")).toBe(
      "/no-such-page-xyz?a=2&z=1"
    );
  });

  it("drops an empty or fully-excluded query to the bare path", () => {
    expect(notFoundCanonical("/no-such-page-xyz", "?")).toBe("/no-such-page-xyz");
    expect(notFoundCanonical("/no-such-page-xyz", "?utm_source=a")).toBe(
      "/no-such-page-xyz"
    );
  });

  it("preserves the s38 identity: a single kept param rides unchanged", () => {
    expect(notFoundCanonical("/no-such-page-xyz", "?x=1")).toBe(
      "/no-such-page-xyz?x=1"
    );
  });
});
