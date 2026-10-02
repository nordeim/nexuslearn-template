import type { Metadata } from "next";

import { pageMetadata } from "@/lib/page-metadata";

// The reference app's footer logo links to /Home — the landing page renders
// there directly (no redirect, matching the original behavior).
export const dynamic = "force-dynamic";

// Session 38: /Home needs its OWN metadata export — the re-export below
// transfers the COMPONENT but NOT the metadata export, and the layout
// default is now the DERIVED 404 family. The live's /Home head: plain
// "NexusLearn" title + the ROOT canonical (probed — the footer-link route
// carries the landing's canonical).
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ canonical: "/" });
}

export { default } from "../page";
