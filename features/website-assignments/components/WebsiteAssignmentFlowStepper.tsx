"use client";

import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import NextLink from "next/link";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  websiteFlowProgressFillSx,
  websiteFlowProgressTrackSx,
  websiteFlowStepCardSx,
  websiteFlowStepNumberSx,
  websiteFlowStepperGridSx,
  websiteFlowStepperRootSx,
} from "../styles/website-assignment-ui.styles";

export type WebsiteAssignmentFlowStep = 1 | 2 | 3 | 4;

const STEPS = [
  { n: 1 as const, label: "Website", hint: "Organization & site" },
  { n: 2 as const, label: "Scheduling", hint: "Hours & topics" },
  { n: 3 as const, label: "Agent roster", hint: "Primary / Backup" },
  { n: 4 as const, label: "Complete", hint: "Ready for chat" },
];

export function WebsiteAssignmentFlowStepper({
  activeStep,
  websiteId,
  pickHref = "/dashboard/website-assigning/assign",
  schedulingComplete = false,
  rosterComplete = false,
}: {
  activeStep: WebsiteAssignmentFlowStep;
  websiteId?: string;
  /** Step 1 link — assign hub vs add-schedule picker. */
  pickHref?: string;
  schedulingComplete?: boolean;
  rosterComplete?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const wid = websiteId?.trim() ?? "";
  const schedulingHref = wid
    ? `/dashboard/website-assigning/website/${encodeURIComponent(wid)}/service-scheduling`
    : undefined;
  const rosterHref = wid ? `/dashboard/website-assigning/website/${encodeURIComponent(wid)}` : undefined;
  const progressPct = (activeStep / STEPS.length) * 100;

  function stepState(n: WebsiteAssignmentFlowStep): "active" | "done" | "upcoming" {
    if (n === activeStep) return "active";
    if (n < activeStep) return "done";
    if (n === 2 && schedulingComplete && activeStep > 2) return "done";
    if (n === 3 && rosterComplete && activeStep === 4) return "done";
    if (n === 4 && rosterComplete) return "done";
    return "upcoming";
  }

  function stepHref(n: WebsiteAssignmentFlowStep): string | undefined {
    if (n === 1) return pickHref;
    if (n === 2 && schedulingHref) return schedulingHref;
    if (n === 3 && rosterHref && schedulingComplete) return rosterHref;
    if (n === 4 && rosterHref && rosterComplete) return rosterHref;
    return undefined;
  }

  return (
    <Box sx={websiteFlowStepperRootSx}>
      <Box sx={websiteFlowProgressTrackSx}>
        <Box sx={websiteFlowProgressFillSx(progressPct)} />
      </Box>
      <Box sx={websiteFlowStepperGridSx}>
        {STEPS.map(({ n, label, hint }) => {
          const state = stepState(n);
          const href = stepHref(n);
          const clickable = href && n !== activeStep && state !== "upcoming";

          const card = (
            <Box sx={websiteFlowStepCardSx(state)}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={websiteFlowStepNumberSx(state)}>
                  {state === "done" ? <Check sx={{ fontSize: 16 }} /> : n}
                </Box>
                <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary, lineHeight: 1.2 }}>
                  {label}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, pl: 4.5, lineHeight: 1.4 }}>
                {hint}
              </Typography>
            </Box>
          );

          if (clickable && href) {
            return (
              <Box
                key={n}
                component={NextLink}
                href={href}
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                {card}
              </Box>
            );
          }
          return <Box key={n}>{card}</Box>;
        })}
      </Box>
    </Box>
  );
}
