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
      backgroundColor: alpha(
        theme.palette.common.white,
        mode === "dark" ? 0.1 : 0.08,
      ),
      color: app.text.primary,
    },
    "&.Mui-disabled": {
      opacity: 0.45,
    },
  };
};

/** Check-in / check-out row. */
export const accountMenuCheckIconWrapSx = (theme: Theme): SxProps<Theme> => {
  const app = (theme as AppTheme).app;
  const mode = theme.palette.mode;
  return {
    backgroundColor: alpha(app.dashboard.accentBlue, mode === "dark" ? 0.2 : 0.14),
    border: `1px solid ${alpha(app.dashboard.accentBlue, mode === "dark" ? 0.5 : 0.38)}`,
    color: mode === "dark" ? app.dashboard.white80 : app.dashboard.accentBlue,
  };
};

/** Break-in / break-out row. */
export const accountMenuBreakIconWrapSx = (theme: Theme): SxProps<Theme> => {
  const app = (theme as AppTheme).app;
  const mode = theme.palette.mode;
  return {
    backgroundColor: alpha(app.dashboard.accentOrange, mode === "dark" ? 0.2 : 0.12),
    border: `1px solid ${alpha(app.dashboard.accentOrange, mode === "dark" ? 0.5 : 0.38)}`,
    color: app.dashboard.accentOrange,
  };
};

/** Meeting-in / meeting-out row. */
export const accountMenuMeetingIconWrapSx = (theme: Theme): SxProps<Theme> => {
  const app = (theme as AppTheme).app;
  const mode = theme.palette.mode;
  return {
    backgroundColor: alpha(theme.palette.info.main, mode === "dark" ? 0.2 : 0.12),
    border: `1px solid ${alpha(theme.palette.info.main, mode === "dark" ? 0.5 : 0.38)}`,
    color: theme.palette.info.light,
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
