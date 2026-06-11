"use client";

import { Suspense } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { ChatTranscriptsListWorkspace } from "@/features/chat-transcripts";

export default function ChatTranscriptsPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 4 }}>
          <Typography>Loading transcripts…</Typography>
        </Box>
      }
    >
      <ChatTranscriptsListWorkspace />
    </Suspense>
  );
}
