import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { dialogBackdropBackground } from "@/lib/ui/dialogBackdrop";

export const sendLicenseConfirmBackdropSx: SxProps<Theme> = (theme) => ({
  position: "fixed",
  inset: 0,
  zIndex: 1500,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: dialogBackdropBackground(theme),
  p: 2,
});

/** Layout only — glass surface from `ModalGlassShell`. */
export const sendLicenseConfirmCardSx: SxProps<Theme> = {
  position: "relative",
  width: "100%",
  maxWidth: 440,
  /** Avoid stretching to viewport height (legacy `DashboardCard` default). */
  height: "auto",
  minHeight: 0,
  alignSelf: "center",
  flexShrink: 0,
  p: { xs: 2.5, sm: 3.5 },
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  borderRadius: "14px",
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
