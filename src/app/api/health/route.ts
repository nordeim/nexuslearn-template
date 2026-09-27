import { NextResponse } from "next/server";

/** GET /api/health — liveness probe used by e2e webServer + deployments. */
export async function GET() {
  return NextResponse.json({ ok: true, service: "nexuslearn" });
}
