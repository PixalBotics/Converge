"use client";

import { Suspense } from "react";
import { ChatSettingsWorkspace } from "@/features/chat-settings";
import { Typography } from "@/components/common";
import Box from "@mui/material/Box";

function ChatSettingsPageInner() {
  return <ChatSettingsWorkspace />;
}

export default function ChatSettingsPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 4 }}>
          <Typography>Loading chat settings…</Typography>
        </Box>
      }
    >
      <ChatSettingsPageInner />
    </Suspense>
  );
}
