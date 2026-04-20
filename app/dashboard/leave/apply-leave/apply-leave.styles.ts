import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const applyLeaveHeaderWrapSx: SxProps<Theme> = {
  mb: 0.5,
};

export const applyLeaveSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.75,
  color: (theme as AppTheme).app.dashboard.textMuted,
  maxWidth: 720,
});

export const applyLeaveCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  mb: 2.5,
};

export const applyLeaveIconSx: SxProps<Theme> = (theme) => ({
  fontSize: 20,
  color: (theme as AppTheme).app.dashboard.white95,
});

export const applyLeaveFormGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
  gap: 2,
  mb: 2.5,
};

export const applyLeaveActionsSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 1.5,
  flexWrap: "wrap",
};
