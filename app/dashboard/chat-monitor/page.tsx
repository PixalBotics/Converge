"use client";

import { Suspense } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { ChatMonitorWorkspace } from "@/features/chat-monitor";

export default function ChatMonitorPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 4 }}>
          <Typography>Loading monitor…</Typography>
        </Box>
      }
    >
      <ChatMonitorWorkspace />
    </Suspense>
  );
}
