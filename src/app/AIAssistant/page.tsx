import { AIAssistantChat } from "@/components/AIAssistantChat";

import { routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata({
  title: "AI Assistant",
  canonical: "/AIAssistant",
});

export default function AIAssistantPage() {
  return <AIAssistantChat />;
}
