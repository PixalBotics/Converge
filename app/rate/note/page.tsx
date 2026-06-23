"use client";

import { Suspense } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { PublicDistributionNotePage } from "@/features/email/pages/PublicDistributionNotePage";

export default function RateNotePage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <CircularProgress />
        </Box>
      }
    >
      <PublicDistributionNotePage />
    </Suspense>
  );
}
