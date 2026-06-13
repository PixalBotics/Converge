"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  CrmIntegrationWizardShell,
  CrmPlatformPicker,
  CrmSelectedScopeBanner,
  CrmWizardFooter,
  CRM_ROUTES,
} from "@/features/crm-integration";
import { crmChannelCardSx, crmWizardLayoutSx } from "@/features/crm-integration/styles/crm-wizard-ui.styles";
import {
  readCrmWizardPlatform,
  readCrmWizardWebsite,
  writeCrmWizardPlatform,
} from "@/features/crm-integration/wizard-storage";
import { useCrmPlatformsQuery } from "@/features/crm-integration/hooks/useCrmIntegrationQueries";
import { publishAppToast } from "@/lib/notify";

export default function CrmSelectionPage() {
  const router = useRouter();
  const website = readCrmWizardWebsite();
  const platformsQuery = useCrmPlatformsQuery();
  const [platformCode, setPlatformCode] = useState(() => readCrmWizardPlatform() ?? "");

  useEffect(() => {
    if (!website?.childCompanyId) {
      router.replace(CRM_ROUTES.configure);
    }
  }, [router, website?.childCompanyId]);

  const platforms = useMemo(() => platformsQuery.data?.items ?? [], [platformsQuery.data?.items]);

  useEffect(() => {
    if (!platformCode && platforms.length) {
      setPlatformCode(platforms[0].code);
    }
  }, [platforms, platformCode]);

  const handleNext = () => {
    if (!platformCode) {
      publishAppToast({ variant: "error", message: "Select a CRM platform." });
      return;
    }
    writeCrmWizardPlatform(platformCode as "hubspot" | "salesforce" | "zoho");
    router.push(CRM_ROUTES.connectionMethod);
  };

  return (
    <CrmIntegrationWizardShell
      step={2}
      cardTitle="CRM platform"
      subtitle="Choose the CRM your client uses. Setup guides follow HubSpot and Salesforce integration docs."
      footer={
        <CrmWizardFooter onBack={() => router.push(CRM_ROUTES.configure)} backLabel="Back">
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={handleNext}>
            Continue
          </Button>
        </CrmWizardFooter>
      }
    >
      <Box sx={crmWizardLayoutSx}>
        <CrmSelectedScopeBanner />

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
            Available platforms
          </Typography>
          {platformsQuery.isLoading ? (
            <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted }}>
              Loading platforms…
            </Typography>
          ) : (
            <CrmPlatformPicker platforms={platforms} value={platformCode} onChange={setPlatformCode} />
          )}
        </Box>
      </Box>
    </CrmIntegrationWizardShell>
  );
}
