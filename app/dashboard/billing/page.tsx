"use client";

import { Suspense } from "react";
import Box from "@mui/material/Box";
import { BillingClientOverviewPanel } from "@/features/billing/BillingClientOverviewPanel";
import { BillingResellerPlatformInvoicePanel } from "@/features/billing/BillingResellerPlatformInvoicePanel";
import { BillingInvoicesPanel } from "@/features/billing/BillingInvoicesPanel";
import { BillingOverviewPanel } from "@/features/billing/BillingOverviewPanel";
import { useAuth } from "@/lib/auth";
import { billingPageWrapper } from "./billing.styles";

function BillingPageContent() {
  const { isPlatformAdmin, user } = useAuth();
  const isResellerAdmin = user?.wideResellerScope === true && !isPlatformAdmin;
  const isBillingClient = Boolean(user?.parentCompanyId?.trim()) && !isPlatformAdmin && !isResellerAdmin;

  return (
    <Box sx={billingPageWrapper}>
      {isBillingClient ? <BillingClientOverviewPanel /> : null}
      {isPlatformAdmin ? (
        <Suspense fallback={null}>
          <BillingOverviewPanel />
        </Suspense>
      ) : null}
      {isResellerAdmin ? (
        <Suspense fallback={null}>
          <BillingResellerPlatformInvoicePanel />
        </Suspense>
      ) : null}
      <Suspense fallback={null}>
        <BillingInvoicesPanel />
      </Suspense>
    </Box>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingPageContent />
    </Suspense>
  );
}
