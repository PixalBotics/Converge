"use client";

import { Suspense } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { QaRosterWorkspace } from "@/features/chat-qa";

export default function QaRosterPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 4 }}>
          <Typography>Loading…</Typography>
        </Box>
      }
    >
      <QaRosterWorkspace />
    </Suspense>
  );
}
