"use client";

import { Suspense, use } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { ChatMonitorWorkspace } from "@/features/chat-monitor";

function ChatMonitorConversationInner({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  return <ChatMonitorWorkspace initialConversationId={conversationId} />;
}

export default function ChatMonitorConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 4 }}>
          <Typography>Loading monitor…</Typography>
        </Box>
      }
    >
      <ChatMonitorConversationInner params={params} />
    </Suspense>
  );
}
