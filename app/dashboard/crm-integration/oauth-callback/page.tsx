"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { CRM_ROUTES } from "@/features/crm-integration";
import {
  writeCrmWizardIntegrationId,
  writeCrmWizardPlatform,
} from "@/features/crm-integration/wizard-storage";
import type { CrmPlatformCode } from "@/features/crm-integration/crm.constants";

export default function CrmOAuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const status = params.get("status");
    const integrationId = params.get("integrationId");
    const platform = params.get("platform");
    const message = params.get("message");

    if (status === "success" && integrationId) {
      writeCrmWizardIntegrationId(integrationId);
      if (platform) writeCrmWizardPlatform(platform as CrmPlatformCode);
      router.replace(CRM_ROUTES.fieldMapping);
      return;
    }

    if (status === "error") {
      publishError(message ?? "OAuth connection failed.");
      router.replace(CRM_ROUTES.connection);
      return;
    }

    router.replace(CRM_ROUTES.home);
  }, [params, router]);

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="medium">Completing CRM connection…</Typography>
    </Box>
  );
}

function publishError(message: string) {
  if (typeof window === "undefined") return;
  void import("@/lib/notify").then(({ publishAppToast }) => {
    publishAppToast({ variant: "error", message });
  });
}
