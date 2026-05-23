"use client";

import { alpha, styled } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const accountMenuRowSx = (theme: Theme): SxProps<Theme> => {
  const app = (theme as AppTheme).app;
  const mode = theme.palette.mode;
  return {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    px: 1.5,
    py: 1.25,
    mx: 0.5,
    my: 0.25,
    borderRadius: 1.5,
    minHeight: 48,
    textTransform: "none",
    fontSize: 14,
    fontWeight: 500,
    color: app.text.primary,
    transition: "background-color 0.15s ease, color 0.15s ease",
    "&:hover, &.Mui-focusVisible": {
      backgroundColor: alpha(app.dashboard.overlayMedium, mode === "dark" ? 0.9 : 0.65),
    },
  };
};

/** Profile row — tinted chip so the person icon stays visible on light/custom menu surfaces. */
export const accountMenuProfileIconWrapSx = (theme: Theme): SxProps<Theme> => {
  const app = (theme as AppTheme).app;
  const mode = theme.palette.mode;
  return {
    backgroundColor: alpha(app.dashboard.accentBlue, mode === "dark" ? 0.2 : 0.14),
    border: `1px solid ${alpha(app.dashboard.accentBlue, mode === "dark" ? 0.5 : 0.38)}`,
    color: mode === "dark" ? app.dashboard.white80 : app.dashboard.accentBlue,
  };
};

/** “Theme / appearance” row — matches dashboard section gradient tiles (not the neutral profile chip). */
export const accountMenuThemeIconWrapSx = (theme: Theme): SxProps<Theme> => {
  const app = (theme as AppTheme).app;
  const mode = theme.palette.mode;
  return {
    backgroundColor: "transparent",
    background: app.dashboard.gradientIcon,
    border: `1px solid ${alpha(app.dashboard.accentPurple, mode === "dark" ? 0.55 : 0.42)}`,
    color: app.dashboard.gradientButtonText,
    boxShadow: mode === "dark" ? "inset 0 1px 0 rgba(255,255,255,0.1)" : "inset 0 1px 0 rgba(255,255,255,0.35)",
  };
};

export const AccountMenuIconWrap = styled("span")(({ theme }) => {
  const app = (theme as AppTheme).app;
  const mode = theme.palette.mode;
  return {
    display: "inline-flex",
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: alpha(app.dashboard.overlayLight, mode === "dark" ? 0.95 : 0.85),
    border: `1px solid ${alpha(app.dashboard.cardBorder, mode === "dark" ? 0.65 : 0.45)}`,
    color: app.dashboard.white80,
  };
});
