import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const pageRoot: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2.2,
};

export const headerRow: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 1,
  flexWrap: "wrap",
};

export const headerActions: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  flexWrap: "wrap",
};

export const metricsGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    xl: "repeat(3, minmax(0, 1fr))",
  },
  gap: 2,
};

export const cardPadding: SxProps<Theme> = { p: 2 };

export const cardHeaderRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  flexWrap: "wrap",
  mb: 1.5,
};

export const cardActionsWrap: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  width: { xs: "100%", md: "auto" },
};

export const searchWrap: SxProps<Theme> = {
  flex: 1,
  minWidth: { xs: 0, md: 220 },
};

export const queueAgentCell: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.2,
};

export const queueAgentAvatar = (theme: AppTheme): SxProps<Theme> => ({
  width: 24,
  height: 24,
  bgcolor: theme.app.dashboard.buttonIndigo,
});

export const queueDepartmentPill: SxProps<Theme> = {
  px: 1.1,
  py: 0.3,
  borderRadius: "9999px",
  fontSize: "0.7rem",
  fontWeight: 600,
  bgcolor: "rgba(59,130,246,0.2)",
  color: "#7DD3FC",
  border: "1px solid rgba(59,130,246,0.3)",
};

export const queueDurationWrap: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.6,
};

export const queueDurationIcon: SxProps<Theme> = {
  fontSize: 14,
  color: "rgba(255,255,255,0.7)",
};

export const queueDurationText: SxProps<Theme> = {
  color: "rgba(255,255,255,0.85)",
};

export const queuePriorityPill: SxProps<Theme> = {
  px: 1.1,
  py: 0.25,
  borderRadius: "9999px",
  fontSize: "0.7rem",
  fontWeight: 600,
  bgcolor: "rgba(239,68,68,0.2)",
  color: "#FCA5A5",
  border: "1px solid rgba(239,68,68,0.35)",
};

export const paginationRow: SxProps<Theme> = {
  mt: 1.5,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  flexWrap: "wrap",
};
