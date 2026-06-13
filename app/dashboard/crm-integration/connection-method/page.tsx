"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  CrmConnectionMethodPicker,
  CrmIntegrationWizardShell,
  CrmSelectedScopeBanner,
  CrmWizardFooter,
  CRM_ROUTES,
} from "@/features/crm-integration";
import { crmChannelCardSx, crmWizardLayoutSx } from "@/features/crm-integration/styles/crm-wizard-ui.styles";
import {
  readCrmWizardConnectionMethod,
  readCrmWizardPlatform,
  readCrmWizardWebsite,
  writeCrmWizardConnectionMethod,
} from "@/features/crm-integration/wizard-storage";
import { useCrmPlatformsQuery } from "@/features/crm-integration/hooks/useCrmIntegrationQueries";
import { publishAppToast } from "@/lib/notify";

export default function CrmConnectionMethodPage() {
  const router = useRouter();
  const website = readCrmWizardWebsite();
  const platformCode = readCrmWizardPlatform();
  const platformsQuery = useCrmPlatformsQuery();
  const [method, setMethod] = useState<string | null>(() => readCrmWizardConnectionMethod());

  useEffect(() => {
    if (!website?.childCompanyId || !platformCode) {
      router.replace(CRM_ROUTES.configure);
    }
  }, [router, website?.childCompanyId, platformCode]);

  const platform = useMemo(
    () => platformsQuery.data?.items.find((p) => p.code === platformCode),
    [platformsQuery.data?.items, platformCode],
  );

  const methods = platform?.connectionMethods ?? [];

  useEffect(() => {
    if (!method && methods.length) {
      const preferred = methods.find((m) => m.available && m.recommended) ?? methods.find((m) => m.available);
      if (preferred) setMethod(preferred.id);
    }
  }, [method, methods]);

  const handleNext = () => {
    if (!method) {
      publishAppToast({ variant: "error", message: "Select a connection method." });
      return;
    }
    writeCrmWizardConnectionMethod(method);
    router.push(CRM_ROUTES.connection);
  };

  return (
    <CrmIntegrationWizardShell
      step={3}
      cardTitle="Connection method"
      subtitle={`Choose how ${platform?.name ?? "your CRM"} receives chat wrap-up data.`}
      footer={
        <CrmWizardFooter onBack={() => router.push(CRM_ROUTES.crmSelection)} backLabel="Back">
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={handleNext}>
            Continue
          </Button>
        </CrmWizardFooter>
      }
    >
      <Box sx={crmWizardLayoutSx}>
        <CrmSelectedScopeBanner platformCode={platformCode} />

        <Box sx={crmChannelCardSx}>
          <Typography
            variant="caption"
            sx={(t) => ({
              color: t.app.dashboard.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontWeight: 700,
              fontSize: 10,
              mb: 1.5,
              display: "block",
            })}
          >
            Integration method
          </Typography>
          <CrmConnectionMethodPicker options={methods} value={method} onChange={setMethod} />
        </Box>
      </Box>
    </CrmIntegrationWizardShell>
  );
}
