import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const payToPlatformHeaderWrapSx: SxProps<Theme> = {
  mb: 0.5,
};

export const payToPlatformSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.75,
  color: (theme as AppTheme).app.dashboard.textMuted,
  maxWidth: 720,
});

export const payToPlatformStatsGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
  gap: 2,
  mt: 2.1,
};

export const payToPlatformStatCardSx: SxProps<Theme> = {
  p: { xs: 2, sm: 2.25 },
  display: "flex",
  flexDirection: "column",
  gap: 1.1,
  minHeight: 124,
  justifyContent: "space-between",
};

export const payToPlatformStatIconWrapSx = (tone: "blue" | "orange" | "rose"): SxProps<Theme> => (theme) => {
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

export const payToPlatformAmountSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.accentBlue,
  letterSpacing: "0.3px",
});

export const payToPlatformMetaSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
  display: "flex",
  alignItems: "center",
  gap: 0.5,
});

export const payToPlatformCardSx: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2, md: 2.5 },
  display: "flex",
  flexDirection: "column",
  gap: 1.75,
};

export const payToPlatformCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
};

export const payToPlatformGridThreeSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
  gap: 1.5,
  alignItems: "end",
};

export const payToPlatformUploadBoxSx: SxProps<Theme> = (theme) => ({
  width: "100%",
  borderRadius: 1.5,
  border: `1px dashed ${alpha((theme as AppTheme).app.dashboard.accentBlue, 0.6)}`,
  minHeight: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: 0.6,
  color: (theme as AppTheme).app.dashboard.textMuted,
  textAlign: "center",
});

export const payToPlatformActionsSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 1.25,
  flexWrap: "wrap",
};
