"use client";

import { Suspense } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { InternalSupervisorsWorkspace } from "@/features/chat-internal-supervisors/components/InternalSupervisorsWorkspace";

export default function ChatInternalSupervisorsPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 4 }}>
          <Typography>Loading…</Typography>
        </Box>
      }
    >
      <InternalSupervisorsWorkspace />
    </Suspense>
  );
}
