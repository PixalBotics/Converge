import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

/** Border ring follows `theme.app.dashboard.cardBorder`; fill uses `cardBg`. */
export const dashboardCardStyles: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  const isLight = theme.palette.mode === "light";
  const border = app.dashboard.cardBorder;
  const edgeMid = app.dashboard.overlayLight;
  const rimHighlight = isLight ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.32)";
  const resolvedBlur = app.dashboard.cardBackdropBlur;
  const glassFill = isLight ? "rgba(255, 255, 255, 0.16)" : "rgba(8, 12, 22, 0.18)";
  const cardShadow = isLight
    ? "0 2px 8px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)"
    : app.dashboard.cardGlassShadow;
  return {
    backgroundColor: glassFill,
    backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
    backdropFilter: resolvedBlur,
    WebkitBackdropFilter: resolvedBlur,
    borderRadius: "9.32px",
    position: "relative",
    height: "100%",
    overflow: "hidden",
    isolation: "isolate",
    boxShadow: cardShadow,
    "& > *": {
      position: "relative",
      zIndex: 1,
    },
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      zIndex: 0,
      padding: "1px",
      borderRadius: "9.32px",
      background: `linear-gradient(168deg, ${rimHighlight} 0%, ${border} 18%, ${edgeMid} 42%, ${edgeMid} 58%, ${border} 82%, rgba(255,255,255,0.06) 100%)`,
      WebkitMask:
        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
      pointerEvents: "none",
    },
  };
};
