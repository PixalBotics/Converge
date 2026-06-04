"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  withChatEditQuery,
  resolveEditWidgetKeyForNavigation,
} from "@/lib/chat-widget/chat-wizard-edit";
import {
  distributionStepCardSx,
  distributionStepNumberSx,
  distributionStepperProgressFillSx,
  distributionStepperProgressTrackSx,
  distributionStepperRootSx,
} from "@/features/distribution-setup/styles/distribution-wizard-ui.styles";
import { widgetStepperGridSx } from "@/features/chat-widget/styles/widget-wizard-ui.styles";
import { mergeSx } from "@/lib/mui/merge-sx";

const WIDGET_WIZARD_STEPS = [
  {
    index: 0,
    label: "Button design",
    hint: "Launcher",
    path: "/dashboard/chat-widget/add/chat/button",
  },
  {
    index: 1,
    label: "Chat box",
    hint: "Panel & topics",
    path: "/dashboard/chat-widget/add/chat/box",
  },
  {
    index: 2,
    label: "Notifications",
    hint: "Alerts & forms",
    path: "/dashboard/chat-widget/add/chat/notifications",
  },
  {
    index: 3,
    label: "Install",
    hint: "Publish & embed",
    path: "/dashboard/chat-widget/add/chat/script",
  },
] as const;

const STEP_COUNT = WIDGET_WIZARD_STEPS.length;

export type WidgetWizardStepperProps = {
  /** Zero-based index of the active wizard step. */
  currentStep: number;
};

export function WidgetWizardStepper({ currentStep }: WidgetWizardStepperProps) {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const editKey = resolveEditWidgetKeyForNavigation(searchParams.get("edit") ?? "");
  const safeStep = Math.min(Math.max(0, currentStep), STEP_COUNT - 1);
  const progressPct = ((safeStep + 1) / STEP_COUNT) * 100;

  const handleStepClick = useCallback(
    (target: number) => {
      if (target === safeStep || target > safeStep) return;
      const step = WIDGET_WIZARD_STEPS[target];
      if (!step) return;
      router.push(withChatEditQuery(step.path, editKey || undefined));
    },
    [editKey, router, safeStep],
  );

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
          Step {safeStep + 1} of {STEP_COUNT}
          {" · "}
          Draft saves on each Next — full publish on Install (step 4)
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.primary.light, fontWeight: 600 }}>
          {Math.round(progressPct)}% complete
        </Typography>
      </Box>

      <Box sx={distributionStepperProgressTrackSx}>
        <Box sx={distributionStepperProgressFillSx(progressPct)} />
      </Box>

      <Box sx={widgetStepperGridSx}>
        {WIDGET_WIZARD_STEPS.map(({ index, label, hint }) => {
          const state = index < safeStep ? "done" : index === safeStep ? "active" : "upcoming";
          const canGoBack = index < safeStep;

          return (
            <Box
              key={label}
              component={canGoBack ? "button" : "div"}
              type={canGoBack ? "button" : undefined}
              onClick={canGoBack ? () => handleStepClick(index) : undefined}
              sx={mergeSx(
                distributionStepCardSx(state),
                {
                  textAlign: "left",
                  width: "100%",
                  ...(canGoBack
                    ? {
                        cursor: "pointer",
                        border: "none",
                        font: "inherit",
                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                        "&:hover": { transform: "translateY(-1px)" },
                        "&:focus-visible": {
                          outline: `2px solid ${theme.palette.primary.main}`,
                          outlineOffset: 2,
                        },
                      }
                    : { cursor: "default" }),
                },
              )}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={distributionStepNumberSx(state)}>
                  {state === "done" ? <Check sx={{ fontSize: 16 }} /> : String(index + 1).padStart(2, "0")}
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
                sx={{
                  color:
                    state === "upcoming"
                      ? theme.app.dashboard.textMuted
                      : theme.app.dashboard.white95,
                  lineHeight: 1.3,
                }}
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
