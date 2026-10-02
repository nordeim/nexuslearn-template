import { describe, expect, it } from "vitest";

import {
  isExcludedCanonicalParam,
  processCanonicalQuery,
} from "@/lib/canonical-query";

/**
 * Session 39 — the canonical query-processing seam (fresh-eyes family B: the
 * live processes the query of EVERY canonical — real routes AND the 404 —
 * through a pinned algorithm, mirrored into og:url + twitter:url; the clone
 * hardcoded query-less canonicals and passed the 404's raw search through).
 *
 * The probed reference contract (Playwright, 23+ shapes):
 *  - the tracking-param exclusion set (CASE-INSENSITIVE): the utm_* PREFIX
 *    (utm_source/utm_id/utm_medium/UTM_source all dropped) + the EXACT keys
 *    gclid/GCLID, fbclid, wbraid, msclkid, dclid, igshid, twclid, yclid,
 *    _ga, mc_cid, mc_eid, ref/REF/Ref
 *  - `ref` is EXACT, NOT a prefix (referrer/reference KEPT — probed);
 *    source, gclsrc, ttclid, tiktok_click, li_fat_id, si are KEPT
 *  - the kept params are ALPHABETICALLY SORTED by key (stable: dupes keep
 *    their original order: ?b=2&a=1&a=3 -> ?a=1&a=3&b=2)
 *  - URLSearchParams serialization semantics (?x=a%20b -> x=a+b)
 *  - an empty query is dropped; the hash fragment never reaches the server
 */

describe("isExcludedCanonicalParam — the tracking-param exclusion set (session 39)", () => {
  it("drops the utm_* prefix (case-insensitive)", () => {
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_id",
      "UTM_source",
      "Utm_Content",
    ]) {
      expect(isExcludedCanonicalParam(key), key).toBe(true);
    }
  });

  it("drops the exact ad/analytics click ids (case-insensitive)", () => {
    for (const key of [
      "gclid",
      "GCLID",
      "fbclid",
      "wbraid",
      "msclkid",
      "dclid",
      "igshid",
      "twclid",
      "yclid",
      "_ga",
      "mc_cid",
      "mc_eid",
    ]) {
      expect(isExcludedCanonicalParam(key), key).toBe(true);
    }
  });

  it("drops `ref` EXACTLY — NOT as a prefix (referrer/reference kept, probed)", () => {
    expect(isExcludedCanonicalParam("ref")).toBe(true);
    expect(isExcludedCanonicalParam("REF")).toBe(true);
    expect(isExcludedCanonicalParam("Ref")).toBe(true);
    expect(isExcludedCanonicalParam("referrer")).toBe(false);
    expect(isExcludedCanonicalParam("reference")).toBe(false);
  });

  it("keeps the probed non-excluded params", () => {
    for (const key of [
      "source",
      "gclsrc",
      "ttclid",
      "tiktok_click",
      "li_fat_id",
      "si",
      "x",
      "id",
      "token",
      "extra",
      "a",
      "z",
    ]) {
      expect(isExcludedCanonicalParam(key), key).toBe(false);
    }
  });
});

describe("processCanonicalQuery — the pinned algorithm (session 39)", () => {
  it("keeps non-excluded params verbatim (the identity for single params)", () => {
    // probed: /no-such-page-xyz?x=1 -> ...?x=1 (the s38 pin's shape)
    expect(processCanonicalQuery("?x=1")).toBe("?x=1");
    expect(processCanonicalQuery("?id=seed-1")).toBe("?id=seed-1");
    // the leading '?' is optional (defensive)
    expect(processCanonicalQuery("x=1")).toBe("?x=1");
  });

  it("drops the excluded params, keeps the rest", () => {
    // probed: /Courses?utm_campaign=foo&x=1 -> .../Courses?x=1
    expect(processCanonicalQuery("?utm_campaign=foo&x=1")).toBe("?x=1");
    // probed: /reset-password?token=abc&utm_source=z -> ?token=abc
    expect(processCanonicalQuery("?token=abc&utm_source=z")).toBe("?token=abc");
    // probed: /no-such-page-xyz?utm_source=a&y=2 -> ?y=2
    expect(processCanonicalQuery("?utm_source=a&y=2")).toBe("?y=2");
    // the ad ids all dropped together
    expect(processCanonicalQuery("?gclid=1&fbclid=2&keep=3")).toBe("?keep=3");
  });

  it("drops the query entirely when everything is excluded or empty", () => {
    // probed: /Courses?utm_source=test -> .../Pricing-style bare canonical
    expect(processCanonicalQuery("?utm_source=test")).toBe("");
    expect(processCanonicalQuery("?gclid=123")).toBe("");
    expect(processCanonicalQuery("?fbclid=abc")).toBe("");
    expect(processCanonicalQuery("?ref=x")).toBe("");
    // the empty forms
    expect(processCanonicalQuery("")).toBe("");
    expect(processCanonicalQuery("?")).toBe("");
  });

  it("sorts the kept params alphabetically by key", () => {
    // probed: /Courses?z=1&a=2 -> ?a=2&z=1
    expect(processCanonicalQuery("?z=1&a=2")).toBe("?a=2&z=1");
    // probed: /Courses?b=2&a=1&c=3 -> ?a=1&b=2&c=3
    expect(processCanonicalQuery("?b=2&a=1&c=3")).toBe("?a=1&b=2&c=3");
    // probed: /CourseDetail?id=<real>&extra=2 -> ?extra=2&id=<real>
    expect(processCanonicalQuery("?id=699081e752032065b878129d&extra=2")).toBe(
      "?extra=2&id=699081e752032065b878129d"
    );
  });

  it("preserves duplicate keys in their original order (the stable sort)", () => {
    // probed: /Courses?a=1&a=2 -> ?a=1&a=2
    expect(processCanonicalQuery("?a=1&a=2")).toBe("?a=1&a=2");
    // probed: /Courses?b=2&a=1&a=3 -> ?a=1&a=3&b=2
    expect(processCanonicalQuery("?b=2&a=1&a=3")).toBe("?a=1&a=3&b=2");
    // probed: /reset-password?token=a&token=b -> ?token=a&token=b
    expect(processCanonicalQuery("?token=a&token=b")).toBe("?token=a&token=b");
  });

  it("serializes with URLSearchParams semantics (the form encoding)", () => {
    // probed: /Courses?x=a%20b -> x=a+b (the '+' for spaces)
    expect(processCanonicalQuery("?x=a%20b")).toBe("?x=a+b");
    // probed: /Courses?x=%C3%A9 stays percent-encoded
    expect(processCanonicalQuery("?x=%C3%A9")).toBe("?x=%C3%A9");
  });

  it("keeps empty-valued params (probed: ?token= survives)", () => {
    expect(processCanonicalQuery("?token=")).toBe("?token=");
  });

  it("mixes the rules (the full algorithm)", () => {
    // drop + sort + keep together
    expect(processCanonicalQuery("?utm_source=a&z=9&m=3&a=1")).toBe("?a=1&m=3&z=9");
    expect(processCanonicalQuery("?mc_eid=2&mc_cid=1&id=seed-1")).toBe("?id=seed-1");
  });
});
