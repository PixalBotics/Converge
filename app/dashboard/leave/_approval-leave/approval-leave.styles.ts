import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const approvalLeaveHeaderWrapSx: SxProps<Theme> = {
  mb: 0.5,
};

export const approvalLeaveSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.75,
  color: (theme as AppTheme).app.dashboard.textMuted,
  maxWidth: 720,
});

export const approvalLeaveCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  flexWrap: "wrap",
};

export const approvalLeaveTitleRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
};

export const approvalLeaveIconSx: SxProps<Theme> = (theme) => ({
  width: 28,
  height: 28,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: (theme as AppTheme).app.dashboard.white95,
  background: alpha((theme as AppTheme).app.dashboard.accentPurple, 0.35),
  border: `1px solid ${alpha((theme as AppTheme).app.dashboard.accentPurple, 0.4)}`,
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1,
});

export const approvalLeaveToolbarSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  flexWrap: "wrap",
  width: { xs: "100%", md: "auto" },
};

export const approvalLeaveSearchWrapSx: SxProps<Theme> = {
  minWidth: { xs: "100%", md: 260 },
  flex: { xs: "1 1 auto", md: "0 0 auto" },
};

export const approvalLeaveStatusSx: SxProps<Theme> = (theme) => ({
  color: theme.palette.success.main,
  fontWeight: 600,
  fontSize: 13,
});
