import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const leaveBalanceHeaderWrapSx: SxProps<Theme> = {
  mb: 0.5,
};

export const leaveBalanceSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.75,
  color: (theme as AppTheme).app.dashboard.textMuted,
  maxWidth: 720,
});

export const leaveBalanceGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
  gap: 2,
  mt: 2.5,
};

export const leaveBalanceCardSx: SxProps<Theme> = () => ({
  p: { xs: 2, sm: 2.25 },
  display: "flex",
  flexDirection: "column",
  gap: 1.1,
  minHeight: 124,
  justifyContent: "space-between",
});

export const leaveBalanceIconWrapSx = (tone: "blue" | "orange" | "rose"): SxProps<Theme> => (theme) => {
  const app = (theme as AppTheme).app;
  const palette = {
    blue: app.dashboard.accentBlue,
    orange: theme.palette.warning.main,
    rose: theme.palette.error.light,
  };
  const color = palette[tone];
  return {
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: alpha(color, 0.25),
    color: app.dashboard.white95,
  };
};

export const leaveBalanceAmountSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.accentBlue,
  letterSpacing: "0.3px",
});

export const leaveBalanceMetaSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
  display: "flex",
  alignItems: "center",
  gap: 0.5,
});
