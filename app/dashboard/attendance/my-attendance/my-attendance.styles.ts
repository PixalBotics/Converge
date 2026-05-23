import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const attendanceHeaderRowSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: { xs: "flex-start", md: "center" },
  gap: 1.25,
  flexWrap: "wrap",
  mb: 0.5,
};

export const attendanceSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.75,
  color: (theme as AppTheme).app.dashboard.textMuted,
});

export const attendanceHeaderActionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const attendanceDateButtonSx: SxProps<Theme> = (theme) => ({
  borderRadius: "9999px",
  px: 1.5,
  borderColor: alpha((theme as AppTheme).app.dashboard.white95, 0.28),
});

export const attendanceMarkButtonSx: SxProps<Theme> = (theme) => ({
  borderRadius: "9999px",
  px: 1.75,
  background: (theme as AppTheme).app.dashboard.gradientButton,
  color: (theme as AppTheme).app.dashboard.gradientButtonText,
  border: `1px solid ${(theme as AppTheme).app.dashboard.overlayBorder}`,
  boxShadow: "none",
  "&:hover": {
    background: (theme as AppTheme).app.dashboard.gradientButton,
    color: (theme as AppTheme).app.dashboard.gradientButtonText,
  },
});

export const attendanceCardTitleSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

export const attendanceStatusTextSx: SxProps<Theme> = {
  color: "#22c55e",
  fontWeight: 600,
};
