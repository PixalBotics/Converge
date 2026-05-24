"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import { WidgetWizardStepper } from "@/features/chat-widget/components/WidgetWizardStepper";
import {
  distributionWizardBackLinkSx,
  distributionWizardCardFooter,
  distributionWizardMainCardSx,
  distributionWizardPageHeader,
  distributionWizardPageWrapper,
  distributionWizardSectionBody,
  distributionWizardSectionHeader,
} from "@/app/dashboard/distribution-setup/wizard.styles";

const WIDGET_WIZARD_STEP_COUNT = 3;

export interface WidgetFlowShellProps {
  pageTitle: string;
  subtitle: string;
  cardTitle: string;
  children: ReactNode;
  footer?: ReactNode | null;
  /** Zero-based wizard step index (0 = button, 1 = box, 2 = notifications). */
  currentStep?: number;
}

export function WidgetFlowShell({
  pageTitle,
  subtitle,
  cardTitle,
  children,
  footer,
  currentStep,
}: WidgetFlowShellProps) {
  const theme = useTheme() as AppTheme;
  const stepIndex =
    currentStep !== undefined
      ? Math.min(Math.max(0, currentStep), WIDGET_WIZARD_STEP_COUNT - 1)
      : undefined;

  return (
    <Box sx={distributionWizardPageWrapper}>
      <Link href="/dashboard/chat-widget" style={{ textDecoration: "none" }}>
        <Box component="span" sx={distributionWizardBackLinkSx}>
          <ArrowBack sx={{ fontSize: 18 }} />
          Back to widget list
        </Box>
      </Link>

      <Box sx={distributionWizardPageHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
          {pageTitle}
        </Typography>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 760 }}>
          {subtitle}
        </Typography>
      </Box>

      {stepIndex !== undefined ? <WidgetWizardStepper currentStep={stepIndex} /> : null}

      <DashboardCard sx={distributionWizardMainCardSx}>
        <Box sx={distributionWizardSectionHeader}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
              {cardTitle}
            </Typography>
            {stepIndex !== undefined ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Step {stepIndex + 1} of {WIDGET_WIZARD_STEP_COUNT}
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Box sx={distributionWizardSectionBody}>{children}</Box>

        {footer != null && footer !== false ? (
          <Box sx={distributionWizardCardFooter}>{footer}</Box>
        ) : null}
      </DashboardCard>
    </Box>
  );
}
