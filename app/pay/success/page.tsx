"use client";

import { Suspense } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { PaySuccessPageClient } from "@/features/billing/PaySuccessPageClient";
import { PayPageShell } from "@/features/billing/PayPageShell";

function PaySuccessFallback() {
  return (
    <PayPageShell title="Confirming payment">
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    </PayPageShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PaySuccessFallback />}>
      <PaySuccessPageClient />
    </Suspense>
  );
}
