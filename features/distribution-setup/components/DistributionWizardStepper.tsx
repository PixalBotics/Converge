"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { publishAppToast } from "@/lib/notify";
import type { DistributionWizardStep } from "../distribution-wizard.types";
import {
  canOpenDistributionWizardStep,
  distributionWizardStepHref,
} from "../utils/distribution-wizard-nav";
import { flushWizardStep } from "../utils/flush-wizard-step";
import { useDistributionDraftSave } from "../hooks/useDistributionDraftSave";
import {
  readWizardSetupId,
  readWizardWebsite,
  writeWizardWebsite,
} from "../wizard-storage";
import { isPickWebsiteComplete } from "@/features/website-assignments/components/PickWebsiteFields";
import type { PickWebsitePreset } from "@/features/website-assignments/components/PickWebsiteModal";
import {
  distributionStepCardSx,
  distributionStepNumberSx,
  distributionStepperGridSx,
  distributionStepperProgressFillSx,
  distributionStepperProgressTrackSx,
  distributionStepperRootSx,
} from "../styles/distribution-wizard-ui.styles";

const STEPS: { n: DistributionWizardStep; label: string; hint: string }[] = [
  { n: 1, label: "Company", hint: "Website scope" },
  { n: 2, label: "Method & form", hint: "Agent fields" },
  { n: 3, label: "Subject", hint: "Email line" },
  { n: 4, label: "Recipients", hint: "Departments" },
  { n: 5, label: "Test", hint: "Verify send" },
];

export type DistributionWizardStepperProps = {
  currentStep: DistributionWizardStep;
  /** When set (step 1), persisted before navigating away. */
  websitePreset?: PickWebsitePreset | null;
};

export function DistributionWizardStepper({
  currentStep,
  websitePreset,
}: DistributionWizardStepperProps) {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupId =
    searchParams.get("setupId")?.trim() || readWizardSetupId();
  const { saveDraft, saveDraftToServer, saving } = useDistributionDraftSave(setupId);
  const [navigating, setNavigating] = useState(false);
  const progressPct = (currentStep / STEPS.length) * 100;
  const busy = navigating || saving;

  const flushSession = useCallback(async (): Promise<string | null> => {
    if (websitePreset && isPickWebsiteComplete(websitePreset)) {
      writeWizardWebsite(websitePreset);
    }
    return flushWizardStep(currentStep, setupId, saveDraft, saveDraftToServer);
  }, [currentStep, saveDraft, saveDraftToServer, setupId, websitePreset]);

  const handleStepClick = useCallback(
    async (target: DistributionWizardStep) => {
      if (target === currentStep || busy) return;
      if (!canOpenDistributionWizardStep(target)) {
        publishAppToast({
          variant: "error",
          message:
            target >= 3
              ? "Select Email on step 2 before opening later steps."
              : "Select company and website on step 1 first.",
        });
        return;
      }
      setNavigating(true);
      try {
        await flushSession();
        if (target > 1 && !readWizardWebsite()?.websiteId?.trim()) {
          publishAppToast({
            variant: "error",
            message: "Select company and website on step 1 first.",
          });
          return;
        }
        router.push(distributionWizardStepHref(target, readWizardSetupId()));
      } finally {
        setNavigating(false);
      }
    },
    [busy, currentStep, flushSession, router],
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
          Step {currentStep} of {STEPS.length}
          {busy ? " · Saving…" : " · Draft syncs to list from step 2; publish to activate"}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.primary.light, fontWeight: 600 }}>
          {Math.round(progressPct)}% complete
        </Typography>
      </Box>

      <Box sx={distributionStepperProgressTrackSx}>
        <Box sx={distributionStepperProgressFillSx(progressPct)} />
      </Box>

      <Box sx={distributionStepperGridSx}>
        {STEPS.map(({ n, label, hint }) => {
          const state =
            n < currentStep ? "done" : n === currentStep ? "active" : "upcoming";
          const reachable = canOpenDistributionWizardStep(n);
          return (
            <Box
              key={n}
              component="button"
              type="button"
              onClick={() => void handleStepClick(n)}
              disabled={busy}
              sx={[
                distributionStepCardSx(state),
                {
                cursor: reachable && !busy ? "pointer" : "default",
                textAlign: "left",
                border: "none",
                font: "inherit",
                width: "100%",
                opacity: reachable ? 1 : 0.55,
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": reachable && !busy
                  ? { transform: "translateY(-1px)" }
                  : undefined,
                "&:focus-visible": {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              },
              ]}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={distributionStepNumberSx(state)}>
                  {state === "done" ? (
                    <Check sx={{ fontSize: 16 }} />
                  ) : (
                    String(n).padStart(2, "0")
                  )}
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
