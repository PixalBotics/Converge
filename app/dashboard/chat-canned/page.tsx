"use client";

import { Suspense } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { ChatSettingsWorkspace } from "@/features/chat-settings";

function ChatCannedPageInner() {
  return <ChatSettingsWorkspace />;
}

export default function ChatCannedPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 4 }}>
          <Typography>Loading canned messages…</Typography>
        </Box>
      }
    >
      <ChatCannedPageInner />
    </Suspense>
  );
}
