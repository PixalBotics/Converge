"use client";

import type { KeyboardEvent } from "react";
import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
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
  { n: 1 as const, label: "Parent company", hint: "Edit company name" },
  { n: 2 as const, label: "Child companies", hint: "Branches under this parent" },
];

export type CompanyEditStepperProps = {
  step: 1 | 2;
  onStepChange: (step: 1 | 2) => void;
  parentName?: string;
  childCount?: number;
  disabled?: boolean;
};

export function CompanyEditStepper({
  step,
  onStepChange,
  parentName,
  childCount = 0,
  disabled = false,
}: CompanyEditStepperProps) {
  const theme = useTheme() as AppTheme;
  const progressPct = (step / STEPS.length) * 100;

  const goToStep = (target: 1 | 2) => {
    if (disabled || target === step) return;
    onStepChange(target);
  };

  return (
    <Box sx={distributionStepperRootSx} role="tablist" aria-label="Edit company steps">
      <Box sx={distributionStepperProgressTrackSx}>
        <Box sx={distributionStepperProgressFillSx(progressPct)} />
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.25,
        }}
      >
        {STEPS.map((s) => {
          const state = step === s.n ? "active" : step > s.n ? "done" : "upcoming";
          const isActive = step === s.n;
          const interactive = !disabled;

          return (
            <Box
              key={s.n}
              component="button"
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "step" : undefined}
              tabIndex={interactive ? 0 : -1}
              disabled={!interactive}
              onClick={() => goToStep(s.n)}
              onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
                if (!interactive) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goToStep(s.n);
                }
              }}
              sx={mergeSx(
                distributionStepCardSx(state),
                interactive
                  ? {
                      cursor: "pointer",
                      font: "inherit",
                      textAlign: "left",
                      width: "100%",
                      appearance: "none",
                      WebkitAppearance: "none",
                      outline: "none",
                      transition:
                        "transform 0.15s ease, border-color 0.2s ease, background-color 0.2s ease",
                      "&:hover": {
                        borderColor: alpha(theme.palette.primary.main, isActive ? 0.65 : 0.45),
                        bgcolor: alpha(theme.palette.primary.main, isActive ? 0.12 : 0.06),
                        transform: "translateY(-1px)",
                      },
                      "&:focus-visible": {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.45)}`,
                      },
                    }
                  : { cursor: "default", pointerEvents: "none", opacity: 0.65 },
              )}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box sx={distributionStepNumberSx(state)}>
                  {state === "done" ? <Check sx={{ fontSize: 16 }} /> : s.n}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{
                      color:
                        state === "active"
                          ? theme.palette.primary.light
                          : theme.app.dashboard.white95,
                    }}
                  >
                    {s.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                    {s.hint}
                    {s.n === 2 && childCount > 0 ? ` · ${childCount}` : ""}
                  </Typography>
                </Box>
              </Box>
              {s.n === 1 && parentName?.trim() && state !== "upcoming" ? (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.app.dashboard.textMuted,
                    mt: 0.5,
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {parentName.trim()}
                </Typography>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
