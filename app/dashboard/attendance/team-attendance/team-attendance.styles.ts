import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const teamAttendanceHeaderRowSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: { xs: "flex-start", md: "center" },
  gap: 1.25,
  flexWrap: "wrap",
  mb: 0.5,
};

export const teamAttendanceSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.75,
  color: (theme as AppTheme).app.dashboard.textMuted,
});

export const teamAttendanceHeaderActionsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const teamAttendanceMiniActionSx: SxProps<Theme> = {
  borderRadius: "9999px",
  px: 1.4,
  whiteSpace: "nowrap",
};

export const teamAttendanceMiniActionThemedSx: SxProps<Theme> = (theme) => ({
  borderRadius: "9999px",
  px: 1.4,
  whiteSpace: "nowrap",
  color: (theme as AppTheme).app.dashboard.white95,
  border: `1px solid ${(theme as AppTheme).app.dashboard.overlayBorder}`,
  backgroundColor: (theme as AppTheme).app.dashboard.overlayLight,
  "&:hover": {
    backgroundColor: (theme as AppTheme).app.dashboard.overlayMedium,
    borderColor: (theme as AppTheme).app.dashboard.overlayBorder,
  },
});

export const teamAttendanceSendSelectedButtonSx: SxProps<Theme> = (theme) => ({
  borderRadius: "9999px",
  px: 1.4,
  whiteSpace: "nowrap",
  color: (theme as AppTheme).app.dashboard.white95,
  border: `1px solid ${(theme as AppTheme).app.dashboard.overlayBorder}`,
  backgroundColor: (theme as AppTheme).app.dashboard.overlayLight,
  "&:hover": {
    backgroundColor: (theme as AppTheme).app.dashboard.overlayMedium,
    borderColor: (theme as AppTheme).app.dashboard.overlayBorder,
  },
});

export const teamAttendanceGenerateLicenseButtonSx: SxProps<Theme> = (theme) => ({
  borderRadius: "9999px",
  px: 1.4,
  whiteSpace: "nowrap",
  background: (theme as AppTheme).app.dashboard.gradientButton,
  color: (theme as AppTheme).app.dashboard.gradientButtonText,
  border: `1px solid ${(theme as AppTheme).app.dashboard.overlayBorder}`,
  boxShadow: "none",
  "&:hover": {
    background: (theme as AppTheme).app.dashboard.gradientButton,
    color: (theme as AppTheme).app.dashboard.gradientButtonText,
  },
});

export const teamAttendanceFilterGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) 180px",
  },
  gap: 1.5,
  alignItems: "end",
};

export const teamAttendanceDateRangeFieldSx: SxProps<Theme> = {
  "& .MuiFormHelperText-root": {
    display: "none",
    margin: 0,
    minHeight: 0,
  },
};

export const teamAttendanceApplyButtonSx: SxProps<Theme> = (theme) => ({
  height: 44,
  width: "100%",
  minWidth: 0,
  borderRadius: "9999px",
  whiteSpace: "nowrap",
  background: (theme as AppTheme).app.dashboard.gradientButton,
  color: (theme as AppTheme).app.dashboard.gradientButtonText,
  border: `1px solid ${(theme as AppTheme).app.dashboard.overlayBorder}`,
  boxShadow: "none",
  "&:hover": {
    background: (theme as AppTheme).app.dashboard.gradientButton,
    color: (theme as AppTheme).app.dashboard.gradientButtonText,
  },
});

export const teamAttendanceCardTitleSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

export const teamAttendanceStatusTextSx: SxProps<Theme> = {
  color: "#22c55e",
  fontWeight: 600,
};
