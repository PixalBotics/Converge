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
import { DashboardCard, Typography } from "@/components/common";
import { distributionSetupSectionIconBox } from "@/app/dashboard/distribution-setup/distribution-setup.styles";
import {
  distributionWizardCardFooter,
  distributionWizardCardSx,
  distributionWizardPageHeader,
  distributionWizardPageWrapper,
} from "@/app/dashboard/distribution-setup/wizard.styles";

const DEFAULT_SUBTITLE =
  "Connect your workflow with industry-leading CRM platforms in minutes.";

export interface CrmIntegrationWizardShellProps {
  step: 1 | 2 | 3;
  cardTitle: string;
  children: ReactNode;
  subtitle?: string;
  footer?: ReactNode | null;
}

function StepCircle({
  label,
  stepNum,
  active,
  completed,
}: {
  label: string;
  stepNum: string;
  active: boolean;
  completed: boolean;
}) {
  const theme = useTheme();

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
          {stepNum}
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

export function CrmIntegrationWizardShell({
  step,
  cardTitle,
  children,
  footer,
  subtitle = DEFAULT_SUBTITLE,
}: CrmIntegrationWizardShellProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={distributionWizardPageWrapper}>
      <Box sx={distributionWizardPageHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
          Configure CRM Integration
        </Typography>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
          {subtitle}
        </Typography>
      </Box>

      <Box sx={{ mb: 2.5, width: "100%" }}>
        <Box sx={stepperOuter}>
          <StepCircle
            label="Organization Selection"
            stepNum="01"
            active={step === 1}
            completed={step > 1}
          />
          <Box sx={stepperDivider} />
          <StepCircle
            label="CRM Selection"
            stepNum="02"
            active={step === 2}
            completed={step > 2}
          />
          <Box sx={stepperDivider} />
          <StepCircle
            label="HubSpot Connection Fields"
            stepNum="03"
            active={step === 3}
            completed={false}
          />
        </Box>
      </Box>

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
