import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const approveLeaveHeaderWrapSx: SxProps<Theme> = {
  mb: 0.5,
};

export const approveLeaveSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.75,
  color: (theme as AppTheme).app.dashboard.textMuted,
  maxWidth: 720,
});

export const approveLeaveCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  mb: 2,
};

export const approveLeaveIconSx: SxProps<Theme> = (theme) => ({
  width: 22,
  height: 22,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: (theme as AppTheme).app.dashboard.white95,
  background: alpha((theme as AppTheme).app.dashboard.accentPurple, 0.35),
  border: `1px solid ${alpha((theme as AppTheme).app.dashboard.accentPurple, 0.42)}`,
  fontSize: 11,
  fontWeight: 700,
  lineHeight: 1,
});

export const approveLeaveFilterGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr auto" },
  gap: 1.5,
  alignItems: "end",
};

export const approveLeaveStatusApprovedSx: SxProps<Theme> = (theme) => ({
  color: theme.palette.success.main,
  fontWeight: 600,
  fontSize: 13,
});

export const approveLeaveStatusRejectedSx: SxProps<Theme> = (theme) => ({
  color: theme.palette.error.main,
  fontWeight: 600,
  fontSize: 13,
});

export const approveLeaveModalBackdropSx: SxProps<Theme> = (theme) => ({
  position: "fixed",
  inset: 0,
  zIndex: 1500,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(180deg, ${alpha(theme.palette.common.black, 0.58)} 0%, ${alpha(theme.palette.common.black, 0.72)} 100%)`,
  p: 2,
});

export const approveLeaveModalCardSx: SxProps<Theme> = {
  width: "100%",
  maxWidth: 440,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  p: { xs: 3, sm: 3.5 },
  borderRadius: "18px",
};

export const approveLeaveModalIconWrapSx: SxProps<Theme> = (theme) => ({
  width: 102,
  height: 102,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `radial-gradient(ellipse 85% 85% at 50% 32%, ${alpha(theme.palette.common.white, 0.16)} 0%, ${alpha(
    theme.palette.common.white,
    0.04,
  )} 62%, ${alpha(theme.palette.common.white, 0)} 100%)`,
});

export const approveLeaveModalActionsSx: SxProps<Theme> = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
  gap: 1.5,
  mt: 1.5,
};
