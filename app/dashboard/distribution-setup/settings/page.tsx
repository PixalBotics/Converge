"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { getEmailFormForWebsite } from "@/api/email/email-forms.api";
import { EMAIL_ROUTES } from "@/features/email/email.constants";
import { DISTRIBUTION_ROUTES } from "@/features/distribution-setup/distribution.constants";
import {
  AgentDistributionFormPreview,
  DistributionWizardShell,
} from "@/features/distribution-setup";
import { DistributionMethodPicker } from "@/features/distribution-setup/components/DistributionMethodPicker";
import { DistributionWizardFooter } from "@/features/distribution-setup/components/DistributionWizardFooter";
import { useDistributionWizardNav } from "@/features/distribution-setup/hooks/useDistributionWizardNav";
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
  const setupId = searchParams.get("setupId")?.trim() || readWizardSetupId();
  const website = readWizardWebsite();
  const detailQuery = useDistributionSetupDetailQuery(setupId);
  const websiteId = website?.websiteId ?? detailQuery.data?.websiteId ?? "";

  const [method, setMethod] = useState<DistributionWizardMethod | null>(() => readWizardMethod());

  useEffect(() => {
    if (setupId) writeWizardSetupId(setupId);
  }, [setupId]);

  useEffect(() => {
    if (!detailQuery.data?.emailConfigurationId) return;
    writeWizardEmailFormId(detailQuery.data.emailConfigurationId);
  }, [detailQuery.data?.emailConfigurationId]);

  useEffect(() => {
    if (!websiteId && !setupId) {
      router.replace(DISTRIBUTION_ROUTES.configure);
    }
  }, [router, websiteId, setupId]);

  const formQuery = useQuery({
    queryKey: ["email-form", websiteId],
    queryFn: () => getEmailFormForWebsite(websiteId),
    enabled: Boolean(websiteId) && method === "email",
  });

  useEffect(() => {
    if (formQuery.data?.id) {
      writeWizardEmailFormId(formQuery.data.id);
    }
  }, [formQuery.data?.id]);

  const handleMethodChange = (next: DistributionWizardMethod) => {
    setMethod(next);
    writeWizardMethod(next);
  };

  const canContinue = method === "email" && Boolean(websiteId);

  const { goBack, goNext, saving: navSaving } = useDistributionWizardNav({
    currentStep: 2,
    setupId,
    saveOverrides: {
      method,
      emailConfigurationId: formQuery.data?.id ?? detailQuery.data?.emailConfigurationId,
    },
  });

  const openFormEditor = () => {
    router.push(`${EMAIL_ROUTES.formsSet}?websiteId=${encodeURIComponent(websiteId)}`);
  };

  return (
    <DistributionWizardShell
      step={2}
      cardTitle="Distribution method & form"
      subtitle="Choose how transcripts are delivered. Email is available now; CRM will be added later."
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
              Select Email to configure wrap-up form, subject, and recipients.
            </Typography>
          ) : null}
        </Box>

        {method === "email" ? (
          <Box sx={distributionChannelCardSx}>
            <Typography variant="small" fontWeight={600} color="white" sx={{ mb: 0.75 }}>
              What happens next
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.6 }}>
              1. Chat closes → agent opens distribution form
              <br />
              2. Fields prefilled from visitor &amp; transcript
              <br />
              3. Agent picks department → email sends
            </Typography>
          </Box>
        ) : null}

        {method === "email" ? (
          <Box sx={distributionChannelCardSx}>
            <AgentDistributionFormPreview
              fields={formQuery.data?.fields ?? []}
              formType={formQuery.data?.formType}
              formName={formQuery.data?.formName}
              loading={formQuery.isLoading}
              onConfigure={websiteId ? openFormEditor : undefined}
            />
          </Box>
        ) : method ? null : (
          <Box sx={distributionChannelCardSx}>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
              Choose <strong style={{ color: theme.app.text.primary }}>Email</strong> above to preview the
              agent wrap-up form and continue setup.
            </Typography>
          </Box>
        )}
      </Box>
    </DistributionWizardShell>
  );
}
