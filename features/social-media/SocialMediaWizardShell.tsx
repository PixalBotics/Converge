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
import { SocialMediaWizardStepper, type SocialMediaWizardStep } from "./components/SocialMediaWizardStepper";
import { SOCIAL_MEDIA_ROUTES } from "./social-media.constants";

const STEP_COUNT = 3;

const DEFAULT_SUBTITLE =
  "Connect Facebook Messenger, Instagram DM, or WhatsApp to a website. Inbound messages appear in the agent inbox.";

export interface SocialMediaWizardShellProps {
  step: SocialMediaWizardStep;
  cardTitle: string;
  children: ReactNode;
  subtitle?: string;
  footer?: ReactNode | null;
  cardHeaderRight?: ReactNode;
}

export function SocialMediaWizardShell({
  step,
  cardTitle,
  children,
  footer,
  subtitle = DEFAULT_SUBTITLE,
  cardHeaderRight,
}: SocialMediaWizardShellProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={distributionWizardPageWrapper}>
      <Link href={SOCIAL_MEDIA_ROUTES.list} style={{ textDecoration: "none" }}>
        <Box component="span" sx={distributionWizardBackLinkSx}>
          <ArrowBack sx={{ fontSize: 18 }} />
          Back to integrations
        </Box>
      </Link>

      <Box sx={distributionWizardPageHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
          Social media integration
        </Typography>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
          {subtitle}
        </Typography>
      </Box>

      <SocialMediaWizardStepper currentStep={step} />

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
