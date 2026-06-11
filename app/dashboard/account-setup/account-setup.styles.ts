import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { cardPadding } from "../dashboard.styles";

/** Layout on top of `DashboardCard`: same padding as table cards (`cardPadding`) + width. */
export const accountSetupDashboardCardSx: SxProps<Theme> = {
  ...cardPadding,
  maxWidth: 1100,
  mx: "auto",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: { xs: 2, sm: 2.5 },
  height: "auto",
  overflow: "hidden",
};

/** $ icon — uses shared dashboard gradient token. */
export const accountSetupSectionIconSx: SxProps<Theme> = (theme) => {
  const d = (theme as AppTheme).app.dashboard;
  return {
    width: 44,
    height: 44,
    borderRadius: "12px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: d.gradientIcon,
    color: d.white95,
    fontWeight: 700,
    fontSize: "1.25rem",
    fontFamily: theme.typography.fontFamily,
    boxShadow: "none",
  };
};

export const accountSetupGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
  gap: { xs: 2, sm: 2.5, md: 3.75 },
  position: "relative",
  zIndex: 1,
};

