import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  createSessionToken,
  verifySessionToken,
  type SessionUser,
} from "@/lib/session";

// Session 34 — the session-revocation / deleted-user surface. getSession()
// verified the HMAC + the session-32 iat bounds but never re-validated the
// user against the database: a DELETED user's token authenticated until
// its 7-day bound (verified end-to-end on the dev server — the ghost-token
// probe). The fix: the per-user epoch (User.sessionVersion) embedded in the
// token (ver) and re-checked on every getSession() read.

const REPO = join(import.meta.dirname, "..");

const demoUser: SessionUser = {
  userId: "epoch-demo-user",
  email: "epoch@example.com",
  name: "Epoch",
};

function decodePayload(token: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(token.slice(0, token.lastIndexOf(".")), "base64url").toString("utf8"));
}

describe("session-34: the per-user epoch in the token contract", () => {
  it("createSessionToken(user, 3) embeds ver: 3 in the payload", () => {
    const payload = decodePayload(createSessionToken(demoUser, 3));
    expect(payload.ver, "the epoch rides the signed payload").toBe(3);
    expect(payload.userId).toBe(demoUser.userId);
  });

  it("createSessionToken(user) embeds ver: 0 (the default epoch)", () => {
    const payload = decodePayload(createSessionToken(demoUser));
    expect(payload.ver, "the mint defaults to epoch 0").toBe(0);
  });

  it("verifySessionToken returns the embedded ver", () => {
    const verified = verifySessionToken(createSessionToken(demoUser, 3));
    expect(verified?.ver, "the verifier surfaces the epoch for the adapter's DB compare").toBe(3);
  });

  it("a pre-34 token (no ver field) verifies with ver: 0 — graceful compat", () => {
    // The outstanding-cookie contract: every token minted before session 34
    // carries no ver. It must verify as epoch 0 (the schema default), so
    // the epoch rollout does NOT force a re-login wave.
    const payload = Buffer.from(JSON.stringify({ ...demoUser, iat: Date.now() })).toString("base64url");
    const token = `${payload}.${createHmacFor(payload)}`;
    const verified = verifySessionToken(token);
    expect(verified, "the pre-34 token still verifies").not.toBeNull();
    expect(verified?.ver, "the missing epoch reads as 0").toBe(0);
  });
});

describe("session-34: source pins (the revocation contract wiring)", () => {
  it("src/lib/auth.ts getSession re-validates the user against the DB", () => {
    const src = readFileSync(join(REPO, "src/lib/auth.ts"), "utf8");
    expect(src, "imports the Prisma singleton").toMatch(/from "@\/lib\/db"/);
    expect(src, "reads the user row (the existence + epoch source)").toContain(
      "db.user.findUnique"
    );
    expect(src, "compares the token epoch against the user's current sessionVersion").toContain(
      "sessionVersion !=="
    );
    expect(src, "nulls the session when the user is gone (the ghost case)").toContain(
      "if (!user"
    );
  });

  it("both minting routes pass the user's current sessionVersion", () => {
    for (const route of ["login", "verify"]) {
      const src = readFileSync(
        join(REPO, "src/app/api/auth", route, "route.ts"),
        "utf8",
      );
      expect(src, `${route}: the mint carries the epoch`).toMatch(
        /createSessionToken\(\s*\{[^}]*\}\s*,\s*user\.sessionVersion/
      );
    }
  });

  it("prisma/schema.prisma declares the epoch column", () => {
    const schema = readFileSync(join(REPO, "prisma/schema.prisma"), "utf8");
    expect(schema, "User.sessionVersion Int @default(0)").toMatch(
      /sessionVersion\s+Int\s+@default\(0\)/
    );
  });
});

// The local HMAC helper (mirrors the e2e mintToken pattern — signs with the
// dev fallback secret the pure module resolves in the test environment).
function createHmacFor(payload: string): string {
  return createHmac("sha256", "nexuslearn-dev-only-insecure-secret").update(payload).digest("base64url");
}
