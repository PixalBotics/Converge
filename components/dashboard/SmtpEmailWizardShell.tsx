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
} from "@/app/dashboard/companies/overview.styles";
import { DashboardCard, Typography } from "@/components/common";
import { distributionSetupSectionIconBox } from "@/app/dashboard/distribution-setup/distribution-setup.styles";
import {
  distributionWizardCardFooter,
  distributionWizardCardSx,
  distributionWizardPageHeader,
  distributionWizardPageWrapper,
} from "@/app/dashboard/distribution-setup/wizard.styles";

const DEFAULT_SUBTITLE =
  "Configure your organization's outgoing email server settings.";

export interface SmtpEmailWizardShellProps {
  step: 1 | 2;
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

export function SmtpEmailWizardShell({
  step,
  cardTitle,
  children,
  footer,
  subtitle = DEFAULT_SUBTITLE,
}: SmtpEmailWizardShellProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={distributionWizardPageWrapper}>
      <Box sx={distributionWizardPageHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
          SMTP / Email Integration
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
            completed={step === 2}
          />
          <Box sx={stepperDivider} />
          <StepCircle
            label="SMTP Configuration"
            stepNum="02"
            active={step === 2}
            completed={step === 2}
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
