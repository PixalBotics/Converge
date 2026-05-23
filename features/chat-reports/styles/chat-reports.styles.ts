import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { chatOpsPageWrapper } from "@/features/chat-operations/styles/chat-operations.styles";

export { chatOpsPageWrapper as chatReportsPageWrapper };

export const chatReportsKpiGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(2, 1fr)",
    sm: "repeat(3, 1fr)",
    lg: "repeat(6, 1fr)",
  },
  gap: 1.5,
  mb: 2,
};

export const chatReportsKpiCardSx: SxProps<Theme> = (theme) => {
  const d = (theme as AppTheme).app.dashboard;
  const isLight = theme.palette.mode === "light";
  const glassFill = isLight ? "rgba(255, 255, 255, 0.16)" : "rgba(8, 12, 22, 0.18)";
  return {
    p: 1.5,
    borderRadius: 2,
    border: `1px solid ${alpha(d.cardBorder, 0.45)}`,
    backgroundColor: glassFill,
    backgroundImage:
      "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
    backdropFilter: d.cardBackdropBlur,
    WebkitBackdropFilter: d.cardBackdropBlur,
  };
};

export const chatReportsSectionSx: SxProps<Theme> = {
  mb: 3,
};
