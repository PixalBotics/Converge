import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const leaveTypeHeaderWrapSx: SxProps<Theme> = {
  mb: 0.5,
};

export const leaveTypeSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.75,
  color: (theme as AppTheme).app.dashboard.textMuted,
  maxWidth: 720,
});

export const leaveTypeCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  mb: 2.5,
};

export const leaveTypeIconSx: SxProps<Theme> = (theme) => ({
  fontSize: 20,
  color: (theme as AppTheme).app.dashboard.white95,
});

export const leaveTypeFormGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
  gap: 2,
  mb: 2.5,
};

export const leaveTypeActionsSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 1.5,
  flexWrap: "wrap",
};
