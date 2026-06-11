"use client";

import { Suspense } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { ChatInvolvementWorkspace } from "@/features/chat-involvement/components/ChatInvolvementWorkspace";

export default function ChatInvolvementPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 4 }}>
          <Typography>Loading…</Typography>
        </Box>
      }
    >
      <ChatInvolvementWorkspace />
    </Suspense>
  );
}
