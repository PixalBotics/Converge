"use client";

import { use } from "react";
import { ChatMonitorWorkspace } from "@/features/chat-monitor";

export default function ChatMonitorConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  return <ChatMonitorWorkspace initialConversationId={conversationId} />;
}
