import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const sendLicenseConfirmBackdropSx: SxProps<Theme> = (theme) => ({
  position: "fixed",
  inset: 0,
  zIndex: 1500,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: (theme as AppTheme).app.dashboard.backdropDark,
  p: 2,
});

export const sendLicenseConfirmCardSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    position: "relative",
    width: "100%",
    maxWidth: 440,
    /** `DashboardCard` defaults to `height: 100%` — that stretches this dialog to the viewport. */
    height: "auto",
    minHeight: 0,
    alignSelf: "center",
    flexShrink: 0,
    p: { xs: 2.5, sm: 3.5 },
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    background: t.appBackground,
    borderRadius: "14px",
    border: `1px solid ${t.app.dashboard.cardBorder}`,
  };
};

/** Large circle behind gear + check — radial highlight in center. */
export const sendLicenseConfirmIconCircleSx: SxProps<Theme> = (theme) => ({
  position: "relative",
  width: 88,
  height: 88,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  background: `radial-gradient(ellipse 85% 85% at 50% 32%, ${alpha(theme.palette.common.white, 0.14)} 0%, ${alpha(
    theme.palette.common.white,
    0.05
  )} 42%, ${alpha(theme.palette.common.white, 0)} 72%)`,
  boxShadow: `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.08)}`,
});

export const sendLicenseConfirmActionsRowSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: "stretch",
  justifyContent: "center",
  gap: 1.5,
  width: "100%",
  mt: 1,
};
