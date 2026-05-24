"use client";

import { Suspense } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { ChatSettingsOperationsWorkspace } from "@/features/chat-settings/components/ChatSettingsOperationsWorkspace";

function ClosePolicyPageInner() {
  return <ChatSettingsOperationsWorkspace />;
}

export default function ChatSettingsClosePolicyPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 4 }}>
          <Typography>Loading close policy…</Typography>
        </Box>
      }
    >
      <ClosePolicyPageInner />
    </Suspense>
  );
}
