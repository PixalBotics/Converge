import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { mainBackgroundGradient } from "@/theme/theme";

/** Bordered circular hits (settings / notifications) — fixed box + no padding so glyph centers in the ring. */
export function dashboardHeaderCircleIconButtonSx(app: AppTheme["app"]): SxProps<Theme> {
  return {
    boxSizing: "border-box",
    width: 40,
    height: 40,
    minWidth: 40,
    minHeight: 40,
    p: 0,
    borderRadius: "50%",
    border: `1px solid ${app.dashboard.searchChromeBorder}`,
    color: app.dashboard.white80,
    lineHeight: 0,
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    "& .MuiSvgIcon-root": {
      display: "block",
      lineHeight: 0,
      margin: 0,
    },
  };
}

export function createDashboardHeaderShellSx(theme: AppTheme): SxProps<Theme> {
  const app = theme.app;
  return {
    height: { xs: 72, sm: 88, md: 104 },
    px: { xs: 1.5, sm: 2, md: 3 },
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: { xs: 1, sm: 1.5, md: 3 },
    position: "relative",
    boxSizing: "border-box",
    overflow: "hidden",
    borderRadius: { xs: 0, md: app.dashboard.shellRadius },
    border: { xs: "none", md: `1px solid ${app.dashboard.shellBorder}` },
    mb: { xs: 0, md: 2 },
    boxShadow: {
      md: "0 8px 32px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    },
    background: (t) => {
      const a = (t as AppTheme).app;
      const hb = a.dashboard.headerBackdropBlur;
      if (hb && hb !== "none") {
        return a.dashboard.headerBg;
      }
      return (t as Theme & { appBackground?: string }).appBackground ?? mainBackgroundGradient;
    },
    backdropFilter:
      app.dashboard.headerBackdropBlur && app.dashboard.headerBackdropBlur !== "none"
        ? app.dashboard.headerBackdropBlur
        : undefined,
    WebkitBackdropFilter:
      app.dashboard.headerBackdropBlur && app.dashboard.headerBackdropBlur !== "none"
        ? app.dashboard.headerBackdropBlur
        : undefined,
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "1px",
      backgroundColor: app.dashboard.shellBorder,
    },
  };
}
