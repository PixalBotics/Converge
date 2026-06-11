"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import { EmailHubNav } from "@/features/email/components/EmailHubNav";
import { EmailDesignPageHeader } from "@/features/email/components/EmailDesignPageHeader";

function DesignLayoutFallback() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Skeleton variant="rounded" height={48} />
      <Skeleton variant="rounded" height={320} />
    </Box>
  );
}

export default function EmailDesignLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DesignLayoutFallback />}>
      <EmailHubNav />
      <EmailDesignPageHeader />
      {children}
    </Suspense>
  );
}
