"use client";

import type { ReactNode } from "react";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { resolveSx } from "@/utils/resolveSx";
import {
  stepperDivider,
  stepperNumberCircleActive,
  stepperNumberCircleInactive,
  stepperOuter,
  stepperSegment,
  stepperCheckIcon,
  stepperLabelChildInactive,
  stepperLabelResellerActive,
  stepperLabelResellerDone,
} from "@/app/dashboard/all-companies/allCompaniesOverview.styles";
import { distributionSetupSectionIconBox } from "@/app/dashboard/distribution-setup/distribution-setup.styles";
import {
  distributionWizardCardFooter,
  distributionWizardCardSx,
  distributionWizardPageHeader,
  distributionWizardPageWrapper,
} from "@/app/dashboard/distribution-setup/wizard.styles";
import { DashboardCard, Typography } from "@/components/common";

interface StepperConfig {
  labels: string[];
  currentStep: number;
}

export interface WidgetFlowShellProps {
  pageTitle: string;
  subtitle: string;
  cardTitle: string;
  children: ReactNode;
  footer?: ReactNode | null;
  stepper?: StepperConfig;
}

function StepItem({
  label,
  stepIndex,
  currentStep,
}: {
  label: string;
  stepIndex: number;
  currentStep: number;
}) {
  const theme = useTheme();
  const completed = stepIndex < currentStep;
  const active = stepIndex === currentStep;

  return (
    <Box sx={stepperSegment}>
      {completed ? (
        <CheckCircle sx={resolveSx(stepperCheckIcon, theme)} aria-hidden />
      ) : (
        <Box
          component="span"
          sx={resolveSx(active ? stepperNumberCircleActive : stepperNumberCircleInactive, theme)}
          aria-hidden
        >
          {String(stepIndex + 1).padStart(2, "0")}
        </Box>
      )}
      <Typography
        variant="body2"
        sx={resolveSx(
          active
            ? stepperLabelResellerActive
            : completed
              ? stepperLabelResellerDone
              : stepperLabelChildInactive,
          theme
        )}
      >
        {label}
      </Typography>
    </Box>
  );
}

export function WidgetFlowShell({
  pageTitle,
  subtitle,
  cardTitle,
  children,
  footer,
  stepper,
}: WidgetFlowShellProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={distributionWizardPageWrapper}>
      <Box sx={distributionWizardPageHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
          {pageTitle}
        </Typography>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 760 }}>
          {subtitle}
        </Typography>
      </Box>

      {stepper ? (
        <Box sx={{ mb: 2.5, width: "100%" }}>
          <Box sx={stepperOuter}>
            {stepper.labels.map((label, idx) => (
              <Box key={label} sx={{ display: "contents" }}>
                <StepItem label={label} stepIndex={idx} currentStep={stepper.currentStep} />
                {idx < stepper.labels.length - 1 ? <Box sx={stepperDivider} /> : null}
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}

      <DashboardCard sx={distributionWizardCardSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={distributionSetupSectionIconBox} aria-hidden>
            <Typography
              sx={{
                color: theme.app.dashboard.white95,
                fontWeight: 700,
                fontSize: "1.1rem",
                lineHeight: 1,
              }}
            >
              $
            </Typography>
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            {cardTitle}
          </Typography>
        </Box>

        {children}
        {footer != null && footer !== false ? <Box sx={distributionWizardCardFooter}>{footer}</Box> : null}
      </DashboardCard>
    </Box>
  );
}
