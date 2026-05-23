"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { getEmailFormForWebsite } from "@/api/email/email-forms.api";
import { EMAIL_ROUTES } from "@/features/email/email.constants";
import { DISTRIBUTION_ROUTES } from "@/features/distribution-setup/distribution.constants";
import { DistributionWizardShell } from "@/features/distribution-setup";
import { useDistributionSetupDetailQuery } from "@/features/distribution-setup/hooks/useDistributionSetupMutations";
import {
  apiMethodToUi,
  readWizardMethod,
  readWizardSetupId,
  readWizardSubject,
  readWizardWebsite,
  uiMethodToApi,
  writeWizardEmailFormId,
  writeWizardMethod,
  writeWizardSetupId,
  writeWizardSubject,
} from "@/features/distribution-setup/wizard-storage";

type DistributionMethod = "Email" | "CRM" | "Both";

export default function DistributionSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupId = searchParams.get("setupId")?.trim() || readWizardSetupId();
  const theme = useTheme() as AppTheme;
  const website = readWizardWebsite();
  const detailQuery = useDistributionSetupDetailQuery(setupId);
  const websiteId = website?.websiteId ?? detailQuery.data?.websiteId ?? "";

  const [subject, setSubject] = useState(() => readWizardSubject());
  const [method, setMethod] = useState<DistributionMethod>(() => apiMethodToUi(readWizardMethod()));

  useEffect(() => {
    if (setupId) writeWizardSetupId(setupId);
  }, [setupId]);

  useEffect(() => {
    if (!detailQuery.data) return;
    if (detailQuery.data.subject) setSubject(detailQuery.data.subject);
    setMethod(apiMethodToUi(detailQuery.data.method));
    if (detailQuery.data.emailConfigurationId) {
      writeWizardEmailFormId(detailQuery.data.emailConfigurationId);
    }
  }, [detailQuery.data]);

  useEffect(() => {
    if (!websiteId && !setupId) {
      router.replace(DISTRIBUTION_ROUTES.configure);
    }
  }, [router, websiteId, setupId]);

  const formQuery = useQuery({
    queryKey: ["email-form", websiteId],
    queryFn: () => getEmailFormForWebsite(websiteId),
    enabled: Boolean(websiteId) && method === "Email",
  });

  useEffect(() => {
    if (formQuery.data?.id) {
      writeWizardEmailFormId(formQuery.data.id);
    }
  }, [formQuery.data?.id]);

  const primary = theme.palette.primary.main;
  const muted = theme.app.dashboard.textMuted;
  const inactiveBorder = theme.app.dashboard.radioInactiveBorder;
  const showEmailForm = method === "Email" || method === "Both";

  const radioIcon = (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: `2px solid ${inactiveBorder}`,
        boxSizing: "border-box",
      }}
    />
  );
  const radioChecked = (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: `2px solid ${primary}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: primary }} />
    </Box>
  );

  const methodOptions: { value: DistributionMethod; label: string }[] = [
    { value: "Email", label: "Email" },
    { value: "CRM", label: "CRM" },
    { value: "Both", label: "Both" },
  ];

  const enabledFields =
    formQuery.data?.fields.filter((f) => f.enabled || f.isRequired) ?? [];

  return (
    <DistributionWizardShell
      step={2}
      cardTitle="Distribution settings"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push(DISTRIBUTION_ROUTES.home)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() => {
              writeWizardMethod(uiMethodToApi(method));
              writeWizardSubject(subject);
              if (formQuery.data?.id) writeWizardEmailFormId(formQuery.data.id);
              const tableHref = setupId
                ? `${DISTRIBUTION_ROUTES.table}?setupId=${encodeURIComponent(setupId)}`
                : DISTRIBUTION_ROUTES.table;
              router.push(tableHref);
            }}
          >
            Next
          </Button>
        </>
      }
    >
      {showEmailForm ? (
        <>
          <InputField
            label="Email subject"
            name="subject"
            placeholder="Chat Transcript - [Company] - [Department]"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mb: 1 }}>
              <Typography variant="small" fontWeight={600}>
                Wrap-up form for this website
              </Typography>
              {formQuery.data ? (
                <Chip
                  size="small"
                  label={formQuery.data.formType === "custom" ? "Custom" : "Standard"}
                  color={formQuery.data.formType === "custom" ? "success" : "info"}
                  variant="outlined"
                />
              ) : null}
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  router.push(
                    `${EMAIL_ROUTES.formsSet}?websiteId=${encodeURIComponent(websiteId)}`,
                  )
                }
              >
                Set form
              </Button>
            </Box>
            {formQuery.isLoading ? (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Loading form…
              </Typography>
            ) : enabledFields.length ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {enabledFields.map((f) => (
                  <Chip key={f.fieldKey} size="small" label={f.label} variant="outlined" />
                ))}
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                No form saved yet — use Set form to configure standard or custom fields.
              </Typography>
            )}
          </Box>
        </>
      ) : null}

      <Box sx={{ mt: showEmailForm ? 1 : 0 }}>
        <Typography
          id="distribution-method-label"
          variant="mediumLarge"
          component="p"
          sx={{ mb: 0.75, color: theme.app.text.primary }}
        >
          Distribution method
        </Typography>
        <RadioGroup
          row
          value={method}
          onChange={(e) => setMethod(e.target.value as DistributionMethod)}
          aria-labelledby="distribution-method-label"
          sx={{ gap: { xs: 2, sm: 4 }, flexWrap: "wrap" }}
        >
          {methodOptions.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={
                <Radio disableRipple icon={radioIcon} checkedIcon={radioChecked} sx={{ p: 0.75 }} />
              }
              label={
                <Typography
                  variant="medium"
                  sx={{
                    color: method === opt.value ? primary : muted,
                    fontWeight: method === opt.value ? 600 : 500,
                  }}
                >
                  {opt.label}
                </Typography>
              }
              sx={{ mr: 0, gap: 1, alignItems: "center" }}
            />
          ))}
        </RadioGroup>
      </Box>
    </DistributionWizardShell>
  );
}
