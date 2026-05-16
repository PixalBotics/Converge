"use client";

import { alpha, styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import type { AppTheme } from "@/theme/theme";

/**
 * Site-wide dropdown trigger — pill chrome driven by `AppTheme` (light + dark + custom accents).
 * Uses MUI `styled` (Emotion) — same stack as the rest of the app, not the `styled-components` package.
 */
export const DropdownTrigger = styled(Button)(({ theme }) => {
  const app = (theme as AppTheme).app;
  return {
    textTransform: "none",
    fontWeight: 500,
    borderRadius: "9999px",
    paddingInline: theme.spacing(2.5),
    paddingBlock: theme.spacing(1),
    borderColor: app.dashboard.cardBorder,
    color: app.text.primary,
    background: app.dashboard.pillBg,
    backgroundBlendMode: "normal",
    boxShadow: "none",
    "&:hover": {
      borderColor: app.dashboard.overlayBorder,
      background: app.dashboard.pillActive,
      backgroundBlendMode: "normal",
      boxShadow: "none",
    },
  };
});

export const DropdownMenuRow = styled(MenuItem)(({ theme }) => {
  const app = (theme as AppTheme).app;
  const mode = theme.palette.mode;
  return {
    borderRadius: 12,
    marginInline: theme.spacing(0.75),
    marginBlock: theme.spacing(0.25),
    fontSize: 14,
    minHeight: 40,
    color: app.text.primary,
    transition: "background-color 0.15s ease",
    "&:hover, &.Mui-focusVisible": {
      bgcolor: alpha(app.dashboard.overlayMedium, mode === "dark" ? 0.95 : 0.85),
    },
    "&.Mui-selected": {
      bgcolor: alpha(theme.palette.primary.main, mode === "dark" ? 0.22 : 0.14),
      fontWeight: 600,
      "&:hover": {
        bgcolor: alpha(theme.palette.primary.main, mode === "dark" ? 0.28 : 0.18),
      },
    },
  };
});
