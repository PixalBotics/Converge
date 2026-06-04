"use client";

import { Suspense } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { PublicDistributionFeedbackPage } from "@/features/email/pages/PublicDistributionFeedbackPage";

export default function RatePage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <CircularProgress />
        </Box>
      }
    >
      <PublicDistributionFeedbackPage />
    </Suspense>
  );
}
