"use client";

import { Suspense } from "react";
import Box from "@mui/material/Box";
import { useParams } from "next/navigation";
import { Typography } from "@/components/common";
import { ChatTranscriptDetailWorkspace } from "@/features/chat-transcripts";

function ChatTranscriptDetailInner() {
  const params = useParams();
  const conversationId =
    typeof params.conversationId === "string" ? params.conversationId : null;
  if (!conversationId) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography>Invalid conversation id.</Typography>
      </Box>
    );
  }
  return <ChatTranscriptDetailWorkspace conversationId={conversationId} />;
}

export default function ChatTranscriptDetailPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 4 }}>
          <Typography>Loading transcript…</Typography>
        </Box>
      }
    >
      <ChatTranscriptDetailInner />
    </Suspense>
  );
}
