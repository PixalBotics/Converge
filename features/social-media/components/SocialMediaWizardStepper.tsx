"use client";

import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { mergeSx } from "@/lib/mui/merge-sx";
import {
  distributionStepCardSx,
  distributionStepNumberSx,
  distributionStepperProgressFillSx,
  distributionStepperProgressTrackSx,
  distributionStepperRootSx,
} from "@/features/distribution-setup/styles/distribution-wizard-ui.styles";

const STEPS = [
  { n: 1 as const, label: "Organization", hint: "Website" },
  { n: 2 as const, label: "Platform", hint: "Channel" },
  { n: 3 as const, label: "Connect", hint: "Authorize" },
];

export type SocialMediaWizardStep = 1 | 2 | 3;

export function SocialMediaWizardStepper({ currentStep }: { currentStep: SocialMediaWizardStep }) {
  const theme = useTheme() as AppTheme;
  const progressPct = (currentStep / STEPS.length) * 100;

  return (
    <Box sx={distributionStepperRootSx}>
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
          Step {currentStep} of {STEPS.length} · Messages route to the same inbox as live chat
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.primary.light, fontWeight: 600 }}>
          {Math.round(progressPct)}% complete
        </Typography>
      </Box>

      <Box sx={distributionStepperProgressTrackSx}>
        <Box sx={distributionStepperProgressFillSx(progressPct)} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
          gap: { xs: 1, md: 1.25 },
        }}
      >
        {STEPS.map(({ n, label, hint }) => {
          const state = n < currentStep ? "done" : n === currentStep ? "active" : "upcoming";
          return (
            <Box key={n} sx={distributionStepCardSx(state)}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={distributionStepNumberSx(state)}>
                  {state === "done" ? <Check sx={{ fontSize: 16 }} /> : String(n).padStart(2, "0")}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      state === "active"
                        ? theme.palette.primary.light
                        : theme.app.dashboard.textMuted,
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
                sx={mergeSx({
                  color:
                    state === "upcoming"
                      ? theme.app.dashboard.textMuted
                      : theme.app.dashboard.white95,
                  lineHeight: 1.3,
                })}
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
