import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const pageWrapper: SxProps<Theme> = {
  maxWidth: 1600,
  mx: "auto",
};

export const headerRow: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: 3,
};

export const metricGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
  gap: { xs: 1.5, sm: 2 },
  mb: 2,
};

export const chartGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "1.5fr 1fr" },
  gap: { xs: 1.5, sm: 2 },
  mb: 2,
  "& > *": { minWidth: 0 },
};

export const lowerGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
  gap: { xs: 1.5, sm: 2 },
};

export const chartCard: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2, md: 2.5 },
  height: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
};

export const chartHeaderRow: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: 2,
  gap: 1,
};

export const chartTitleRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
};

export const chartIcon: SxProps<Theme> = {
  width: 30,
  height: 30,
  borderRadius: 1.25,
  background: "rgba(255,255,255,0.12)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

export const segmentedWrap: SxProps<Theme> = {
  "& .MuiButtonBase-root": {
    minWidth: "auto",
  },
};

export const approvalsList: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1.25,
};

export const approvalRow: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 1,
  py: 1.5,
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  "&:last-of-type": { borderBottom: "none" },
};

export const approvalActions: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 1,
};

export const approveButtonSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    borderRadius: "999px",
    py: 0.8,
    background: app.dashboard.gradientButton,
    color: app.dashboard.gradientButtonText,
    border: `1px solid ${app.dashboard.overlayBorder}`,
    "&:hover": {
      background: app.dashboard.gradientButton,
    },
  };
};

export const rejectButtonSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    borderRadius: "999px",
    py: 0.8,
    background: app.dashboard.overlayDarkStrong,
    color: app.text.primary,
    border: `1px solid ${app.dashboard.overlayBorder}`,
    "&:hover": {
      background: app.shadow.buttonHoverBg,
      borderColor: app.dashboard.overlayBorder,
    },
  };
};

export const statusPill = (bg: string, color: string, borderColor?: string): SxProps<Theme> => ({
  px: 1.5,
  py: 0.5,
  borderRadius: "999px",
  fontSize: 12,
  lineHeight: 1,
  fontWeight: 600,
  background: bg,
  color,
  border: `1px solid ${borderColor ?? "transparent"}`,
});

