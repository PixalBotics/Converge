"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useQueryClient } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { DISTRIBUTION_ROUTES } from "@/features/distribution-setup/distribution.constants";
import {
  DistributionEmailFormConfigurator,
  DistributionWizardShell,
} from "@/features/distribution-setup";
import { DistributionMethodPicker } from "@/features/distribution-setup/components/DistributionMethodPicker";
import { DistributionWizardFooter } from "@/features/distribution-setup/components/DistributionWizardFooter";
import { useDistributionWizardNav } from "@/features/distribution-setup/hooks/useDistributionWizardNav";
import { distributionSetupKeys } from "@/features/distribution-setup/hooks/keys";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useDistributionSetupDetailQuery } from "@/features/distribution-setup/hooks/useDistributionSetupMutations";
import {
  distributionChannelCardSx,
  distributionSettingsLayoutSx,
} from "@/features/distribution-setup/styles/distribution-wizard-ui.styles";
import {
  readWizardMethod,
  readWizardSetupId,
  readWizardWebsite,
  writeWizardEmailFormId,
  writeWizardMethod,
  writeWizardSetupId,
  type DistributionWizardMethod,
} from "@/features/distribution-setup/wizard-storage";

export default function DistributionSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme() as AppTheme;
  const qc = useQueryClient();
  const setupId = searchParams.get("setupId")?.trim() || readWizardSetupId();
  const website = readWizardWebsite();
  const detailQuery = useDistributionSetupDetailQuery(setupId);
  const websiteId = website?.websiteId ?? detailQuery.data?.websiteId ?? "";

  const [method, setMethod] = useState<DistributionWizardMethod | null>(() => readWizardMethod());
  const [emailConfigId, setEmailConfigId] = useState<string | null>(null);

  useEffect(() => {
    if (setupId) writeWizardSetupId(setupId);
  }, [setupId]);

  useEffect(() => {
    const id =
      detailQuery.data?.emailConfigurationId ?? emailConfigId ?? null;
    if (id) {
      writeWizardEmailFormId(id);
      setEmailConfigId(id);
    }
  }, [detailQuery.data?.emailConfigurationId, emailConfigId]);

  useEffect(() => {
    if (!websiteId && !setupId) {
      router.replace(DISTRIBUTION_ROUTES.configure);
    }
  }, [router, websiteId, setupId]);

  const handleMethodChange = (next: DistributionWizardMethod) => {
    setMethod(next);
    writeWizardMethod(next);
  };

  const canContinue =
    method === "email" && Boolean(websiteId) && Boolean(emailConfigId);

  const { goBack, goNext, saving: navSaving } = useDistributionWizardNav({
    currentStep: 2,
    setupId,
    saveOverrides: {
      method,
      emailConfigurationId: emailConfigId ?? detailQuery.data?.emailConfigurationId,
    },
  });

  const handleFormSaved = (id: string) => {
    setEmailConfigId(id);
    writeWizardEmailFormId(id);
    void qc.invalidateQueries({ queryKey: distributionSetupKeys.all });
    if (setupId) {
      void qc.invalidateQueries({ queryKey: distributionSetupKeys.detail(setupId) });
    }
  };

  return (
    <DistributionWizardShell
      step={2}
      cardTitle="Email distribution form"
      subtitle="Choose Email delivery and configure the agent form in this step — no separate popup."
      footer={
        <DistributionWizardFooter onBack={goBack}>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={!canContinue || navSaving}
            onClick={goNext}
          >
            {navSaving ? "Saving…" : "Continue"}
          </Button>
        </DistributionWizardFooter>
      }
    >
      <Box sx={distributionSettingsLayoutSx}>
        <Box sx={distributionChannelCardSx}>
          <Typography
            variant="caption"
            sx={{
              color: theme.app.dashboard.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontWeight: 700,
              fontSize: 10,
              mb: 1.25,
              display: "block",
            }}
          >
            Step 2 · Delivery method
          </Typography>
          <DistributionMethodPicker value={method} onChange={handleMethodChange} />
          {!method ? (
            <Typography
              variant="caption"
              sx={{ color: theme.palette.warning.light, mt: 1.5, display: "block" }}
            >
              Select Email to configure the distribution form, subject, and recipients.
            </Typography>
          ) : null}
        </Box>

        {method === "email" && websiteId ? (
          <Box sx={distributionChannelCardSx}>
            <Typography variant="small" fontWeight={600} color="white" sx={{ mb: 1 }}>
              Email form fields
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 2, lineHeight: 1.6 }}
            >
              Save the form here before continuing. Agents will see this form in the chat transcript
              after each close.
            </Typography>
            <DistributionEmailFormConfigurator
              websiteId={websiteId}
              onSaved={handleFormSaved}
            />
          </Box>
        ) : method ? (
          <Box sx={distributionChannelCardSx}>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
              Select a website on step 1 before configuring the email form.
            </Typography>
          </Box>
        ) : null}
      </Box>
    </DistributionWizardShell>
  );
}
