import { AIAssistantChat } from "@/components/AIAssistantChat";

import type { Metadata } from "next";

import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ title: "AI Assistant", canonical: "/AIAssistant" });
}

export default function AIAssistantPage() {
  return <AIAssistantChat />;
}
