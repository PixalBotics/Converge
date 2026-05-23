import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

/**
 * Popover paper for table/toolbar filters — matches dashboard glass cards (fill + blur + border; flat shadow).
 */
export const dashboardFilterPopoverPaperSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  const isLight = theme.palette.mode === "light";
  const glassFill = isLight ? "rgba(255, 255, 255, 0.16)" : "rgba(8, 12, 22, 0.18)";
  const blur = app.dashboard.cardBackdropBlur;
  return {
    mt: 1,
    p: 0,
    maxWidth: "min(calc(100vw - 24px), 400px)",
    width: "min(calc(100vw - 24px), 400px)",
    borderRadius: "12px",
    overflow: "hidden",
    color: app.text.primary,
    backgroundColor: glassFill,
    backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
    backdropFilter: blur,
    WebkitBackdropFilter: blur,
    border: `1px solid ${app.dashboard.cardBorder}`,
    boxShadow: app.dashboard.cardGlassShadow,
  };
};
