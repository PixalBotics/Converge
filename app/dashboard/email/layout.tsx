"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import { EmailResellerScopeProvider } from "@/features/email/context/EmailResellerScopeContext";
import { emailPageWrapper } from "@/features/email/styles/email-page.styles";

function EmailLayoutFallback() {
  return (
    <Box sx={emailPageWrapper}>
      <Skeleton variant="rounded" height={280} />
    </Box>
  );
}

export default function EmailSectionRootLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<EmailLayoutFallback />}>
      <EmailResellerScopeProvider>
        <Box sx={emailPageWrapper}>{children}</Box>
      </EmailResellerScopeProvider>
    </Suspense>
  );
}
