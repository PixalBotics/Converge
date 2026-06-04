"use client";

import { Suspense } from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import { EmailFormSetPage } from "@/features/email/pages/EmailFormSetPage";

function FormSetFallback() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
      <Skeleton variant="rounded" height={48} />
      <Skeleton variant="rounded" height={360} />
    </Box>
  );
}

export default function EmailFormSetRoutePage() {
  return (
    <Suspense fallback={<FormSetFallback />}>
      <EmailFormSetPage />
    </Suspense>
  );
}
