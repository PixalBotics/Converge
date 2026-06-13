"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import {
  distributionWizardBackLinkSx,
  distributionWizardCardFooter,
  distributionWizardMainCardSx,
  distributionWizardPageHeader,
  distributionWizardPageWrapper,
  distributionWizardSectionBody,
  distributionWizardSectionHeader,
} from "@/app/dashboard/distribution-setup/wizard.styles";
import { IpBlockWizardStepper, type IpBlockWizardStep } from "./components/IpBlockWizardStepper";
import { IP_BLOCK_ROUTES } from "./ip-block.constants";

const DEFAULT_SUBTITLE =
  "Block visitor IPs on selected websites so chat cannot start from those addresses.";

const STEP_COUNT = 2;

export interface IpBlockWizardShellProps {
  step: IpBlockWizardStep;
  cardTitle: string;
  children: ReactNode;
  subtitle?: string;
  footer?: ReactNode | null;
  /** Hide stepper on confirmation screen */
  showStepper?: boolean;
}

export function IpBlockWizardShell({
  step,
  cardTitle,
  children,
  footer,
  subtitle = DEFAULT_SUBTITLE,
  showStepper = true,
}: IpBlockWizardShellProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={distributionWizardPageWrapper}>
      <Link href={IP_BLOCK_ROUTES.list} style={{ textDecoration: "none" }}>
        <Box component="span" sx={distributionWizardBackLinkSx}>
          <ArrowBack sx={{ fontSize: 18 }} />
          Back to IP block list
        </Box>
      </Link>

      <Box sx={distributionWizardPageHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
          IP block
        </Typography>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
          {subtitle}
        </Typography>
      </Box>

      {showStepper ? <IpBlockWizardStepper currentStep={step} /> : null}

      <DashboardCard sx={distributionWizardMainCardSx}>
        <Box sx={distributionWizardSectionHeader}>
          <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
            {cardTitle}
          </Typography>
          {showStepper ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Step {step} of {STEP_COUNT}
            </Typography>
          ) : null}
        </Box>

        <Box sx={distributionWizardSectionBody}>{children}</Box>

        {footer != null && footer !== false ? (
          <Box sx={distributionWizardCardFooter}>{footer}</Box>
        ) : null}
      </DashboardCard>
    </Box>
  );
}
