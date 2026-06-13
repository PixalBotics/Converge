"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { publishAppToast } from "@/lib/notify";
import { mergeSx } from "@/lib/mui/merge-sx";
import type { CrmWizardStep } from "../crm-wizard.types";
import { CRM_WIZARD_STEP_COUNT } from "../crm-wizard.types";
import {
  crmStepCardSx,
  crmStepNumberSx,
  crmStepperGridSx,
  crmStepperProgressFillSx,
  crmStepperProgressTrackSx,
  crmStepperRootSx,
} from "../styles/crm-wizard-ui.styles";
import { canOpenCrmWizardStep, crmWizardStepHref } from "../utils/crm-wizard-nav";

const STEPS: { n: CrmWizardStep; label: string; hint: string }[] = [
  { n: 1, label: "Organization", hint: "Company scope" },
  { n: 2, label: "CRM platform", hint: "HubSpot · SF · Zoho" },
  { n: 3, label: "Method", hint: "Form or API" },
  { n: 4, label: "Connection", hint: "Credentials" },
  { n: 5, label: "Mapping", hint: "Field sync" },
];

export type CrmWizardStepperProps = {
  currentStep: CrmWizardStep;
};

export function CrmWizardStepper({ currentStep }: CrmWizardStepperProps) {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const progressPct = (currentStep / CRM_WIZARD_STEP_COUNT) * 100;

  const handleStepClick = useCallback(
    (target: CrmWizardStep) => {
      if (target === currentStep || navigating) return;
      if (!canOpenCrmWizardStep(target)) {
        publishAppToast({
          variant: "error",
          message: "Complete earlier steps before jumping ahead.",
        });
        return;
      }
      setNavigating(true);
      router.push(crmWizardStepHref(target));
      setNavigating(false);
    },
    [currentStep, navigating, router],
  );

  return (
    <Box sx={crmStepperRootSx}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 1.25,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="small" fontWeight={600} sx={{ color: theme.app.dashboard.textMuted }}>
          Step {currentStep} of {CRM_WIZARD_STEP_COUNT}
          {navigating ? " · Loading…" : " · Follow the guide for HubSpot or Salesforce setup"}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.primary.light, fontWeight: 600 }}>
          {Math.round(progressPct)}% complete
        </Typography>
      </Box>

      <Box sx={crmStepperProgressTrackSx}>
        <Box sx={crmStepperProgressFillSx(progressPct)} />
      </Box>

      <Box sx={crmStepperGridSx}>
        {STEPS.map(({ n, label, hint }) => {
          const state = n < currentStep ? "done" : n === currentStep ? "active" : "upcoming";
          const reachable = canOpenCrmWizardStep(n);
          return (
            <Box
              key={n}
              component="button"
              type="button"
              onClick={() => handleStepClick(n)}
              disabled={navigating}
              sx={mergeSx(crmStepCardSx(state), {
                cursor: reachable && !navigating ? "pointer" : "default",
                textAlign: "left",
                border: "none",
                font: "inherit",
                width: "100%",
                opacity: reachable ? 1 : 0.55,
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": reachable && !navigating ? { transform: "translateY(-1px)" } : undefined,
                "&:focus-visible": {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              })}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={crmStepNumberSx(state)}>
                  {state === "done" ? <Check sx={{ fontSize: 16 }} /> : String(n).padStart(2, "0")}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      state === "active" ? theme.palette.primary.light : theme.app.dashboard.textMuted,
                    fontWeight: state === "active" ? 700 : 500,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    fontSize: 10,
                  }}
                >
                  {hint}
                </Typography>
              </Box>
              <Typography
                variant="small"
                fontWeight={state === "active" ? 700 : 600}
                sx={{
                  color:
                    state === "upcoming"
                      ? theme.app.dashboard.textMuted
                      : theme.app.dashboard.white95,
                  lineHeight: 1.3,
                }}
              >
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
