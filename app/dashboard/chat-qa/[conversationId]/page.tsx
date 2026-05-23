"use client";

import { use } from "react";
import { ChatQaWorkspace } from "@/features/chat-qa";

export default function ChatQaConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  return <ChatQaWorkspace initialConversationId={conversationId} />;
}
