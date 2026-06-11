"use client";

import CheckCircle from "@mui/icons-material/CheckCircle";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Groups from "@mui/icons-material/Groups";
import Schedule from "@mui/icons-material/Schedule";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import NextLink from "next/link";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  journeyConnectorSx,
  journeyStepCardSx,
  journeyStepperRootSx,
} from "../styles/website-assignment-ui.styles";

type StepState = "active" | "complete" | "upcoming";

function stepState(step: 1 | 2, activeStep: 1 | 2, schedulingComplete: boolean): StepState {
  if (step === activeStep) return "active";
  if (step === 1 && (schedulingComplete || activeStep === 2)) return "complete";
  return "upcoming";
}

function StepCard({
  step,
  state,
  title,
  description,
  href,
  icon,
}: {
  step: 1 | 2;
  state: StepState;
  title: string;
  description: string;
  href?: string;
  icon: React.ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  const badgeColor =
    state === "active"
      ? theme.palette.primary.main
      : state === "complete"
        ? theme.palette.success.main
        : theme.app.dashboard.textMuted;

  const inner = (
    <Box sx={journeyStepCardSx(state)}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          bgcolor: `${badgeColor}22`,
          color: badgeColor,
          border: `1px solid ${badgeColor}55`,
        }}
      >
        {state === "complete" ? <CheckCircle sx={{ fontSize: 26 }} /> : icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.35 }}>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontWeight: 700 }}>
            Step {step}
          </Typography>
          {state === "active" ? (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.light,
                bgcolor: `${theme.palette.primary.main}22`,
                px: 1,
                py: 0.15,
                borderRadius: 1,
              }}
            >
              You are here
            </Typography>
          ) : null}
          {state === "complete" ? (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.success.light,
                bgcolor: `${theme.palette.success.main}22`,
                px: 1,
                py: 0.15,
                borderRadius: 1,
              }}
            >
              Done
            </Typography>
          ) : null}
        </Box>
        <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.35 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
          {description}
        </Typography>
      </Box>
    </Box>
  );

  if (href && state !== "active") {
    return (
      <Box component={NextLink} href={href} sx={{ textDecoration: "none", color: "inherit" }}>
        {inner}
      </Box>
    );
  }
  return inner;
}

export function WebsiteAssignmentJourneyStepper({
  variant = "website",
  activeStep,
  websiteId = "",
  schedulingComplete = false,
  websiteLabel,
}: {
  variant?: "website" | "hub";
  activeStep: 1 | 2;
  websiteId?: string;
  schedulingComplete?: boolean;
  websiteLabel?: string;
}) {
  const theme = useTheme() as AppTheme;
  const isHub = variant === "hub";
  const schedulingHref = isHub
    ? undefined
    : `/dashboard/website-assigning/website/${encodeURIComponent(websiteId)}/service-scheduling`;
  const rosterHref = isHub
    ? undefined
    : `/dashboard/website-assigning/website/${encodeURIComponent(websiteId)}`;

  const step1 = stepState(1, activeStep, schedulingComplete);
  const step2 = stepState(2, activeStep, schedulingComplete);

  return (
    <Box sx={journeyStepperRootSx}>
      <StepCard
        step={1}
        state={step1}
        title="Service scheduling"
        description="Operating mode, hours, timezone, and visitor topics for this website."
        href={!isHub && activeStep === 2 ? schedulingHref : undefined}
        icon={<Schedule sx={{ fontSize: 24 }} />}
      />
      <Box sx={journeyConnectorSx} aria-hidden>
        <ChevronRight sx={{ fontSize: 28, color: theme.palette.primary.main }} />
      </Box>
      <StepCard
        step={2}
        state={step2}
        title="Agent roster"
        description={
          schedulingComplete
            ? `Assign Primary → Secondary → Backup by channel and topic${websiteLabel ? ` for ${websiteLabel}` : ""}.`
            : "Unlocks after you save scheduling. Assign agents per visitor topic."
        }
        href={!isHub && schedulingComplete && activeStep === 1 ? rosterHref : undefined}
        icon={<Groups sx={{ fontSize: 24 }} />}
      />
    </Box>
  );
}
