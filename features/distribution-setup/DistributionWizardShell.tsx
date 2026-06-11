"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import { DistributionWizardStepper } from "./components/DistributionWizardStepper";
import { DISTRIBUTION_ROUTES } from "./distribution.constants";
import {
  distributionWizardBackLinkSx,
  distributionWizardCardFooter,
  distributionWizardMainCardSx,
  distributionWizardPageHeader,
  distributionWizardPageWrapper,
  distributionWizardSectionBody,
  distributionWizardSectionHeader,
} from "@/app/dashboard/distribution-setup/wizard.styles";

const DEFAULT_SUBTITLE =
  "Configure email distribution: company & website, email form, subject, and department recipients.";

export type { DistributionWizardStep } from "./distribution-wizard.types";
import type { DistributionWizardStep } from "./distribution-wizard.types";

export interface DistributionWizardShellProps {
  step: DistributionWizardStep;
  cardTitle: string;
  children: ReactNode;
  subtitle?: string;
  footer?: ReactNode | null;
  cardHeaderRight?: ReactNode;
  /** Pass on step 1 so step clicks persist website before leaving. */
  websitePreset?: import("@/features/website-assignments/components/PickWebsiteModal").PickWebsitePreset | null;
}

const STEP_COUNT = 5;

export function DistributionWizardShell({
  step,
  cardTitle,
  children,
  footer,
  subtitle = DEFAULT_SUBTITLE,
  cardHeaderRight,
  websitePreset,
}: DistributionWizardShellProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={distributionWizardPageWrapper}>
      <Link href={DISTRIBUTION_ROUTES.home} style={{ textDecoration: "none" }}>
        <Box component="span" sx={distributionWizardBackLinkSx}>
          <ArrowBack sx={{ fontSize: 18 }} />
          Back to distribution list
        </Box>
      </Link>

      <Box sx={distributionWizardPageHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
          Distribution setup
        </Typography>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
          {subtitle}
        </Typography>
      </Box>

      <DistributionWizardStepper currentStep={step} websitePreset={websitePreset} />

      <DashboardCard sx={distributionWizardMainCardSx}>
        <Box sx={distributionWizardSectionHeader}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
                {cardTitle}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Step {step} of {STEP_COUNT}
              </Typography>
            </Box>
            {cardHeaderRight ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "stretch", md: "flex-end" },
                  gap: 1.5,
                  flex: { xs: "1 1 100%", md: "0 1 auto" },
                  minWidth: 0,
                  width: { xs: "100%", md: "auto" },
                }}
              >
                {cardHeaderRight}
              </Box>
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
