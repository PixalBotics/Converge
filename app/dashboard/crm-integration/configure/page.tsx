"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  CrmIntegrationWizardShell,
  CrmSelectedScopeBanner,
  CrmWizardFooter,
  CRM_ROUTES,
} from "@/features/crm-integration";
import { crmChannelCardSx, crmWizardLayoutSx } from "@/features/crm-integration/styles/crm-wizard-ui.styles";
import {
  readCrmWizardIntegrationId,
  readCrmWizardWebsite,
  writeCrmWizardWebsite,
} from "@/features/crm-integration/wizard-storage";
import {
  isPickWebsiteComplete,
  PickWebsiteFields,
} from "@/features/website-assignments/components/PickWebsiteFields";
import type { PickWebsitePreset } from "@/features/website-assignments/components/PickWebsiteModal";

const EMPTY_PRESET: PickWebsitePreset = {
  websiteId: "",
  parentCompanyId: "",
  childCompanyId: "",
  resellerId: "",
};

export default function CrmOrganizationSelectionPage() {
  const router = useRouter();
  const isNewIntegration = !readCrmWizardIntegrationId();
  const [preset, setPreset] = useState<PickWebsitePreset>(() =>
    isNewIntegration ? EMPTY_PRESET : (readCrmWizardWebsite() ?? EMPTY_PRESET),
  );

  useEffect(() => {
    if (isPickWebsiteComplete(preset)) writeCrmWizardWebsite(preset);
  }, [preset]);

  const canContinue = isPickWebsiteComplete(preset);

  return (
    <CrmIntegrationWizardShell
      step={1}
      cardTitle="Company & website"
      subtitle="Select the child company and website this CRM integration applies to."
      footer={
        <CrmWizardFooter onBack={() => router.push(CRM_ROUTES.home)} backLabel="Back to list">
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={!canContinue}
            onClick={() => router.push(CRM_ROUTES.crmSelection)}
          >
            Continue
          </Button>
        </CrmWizardFooter>
      }
    >
      <Box sx={crmWizardLayoutSx}>
        {canContinue ? <CrmSelectedScopeBanner /> : null}

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
            Organization scope
          </Typography>
          <PickWebsiteFields value={preset} onChange={setPreset} showProgressChips={false} />
        </Box>
      </Box>
    </CrmIntegrationWizardShell>
  );
}
