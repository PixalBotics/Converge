import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

/** Border ring follows `theme.app.dashboard.cardBorder`; fill uses `cardBg`. */
export const dashboardCardStyles: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  const border = app.dashboard.cardBorder;
  const edgeMid = app.dashboard.overlayLight;
  const rimHighlight = "rgba(255, 255, 255, 0.32)";
  return {
    background: app.dashboard.cardBg,
    backdropFilter: app.dashboard.cardBackdropBlur,
    WebkitBackdropFilter: app.dashboard.cardBackdropBlur,
    borderRadius: "9.32px",
    position: "relative",
    height: "100%",
    overflow: "hidden",
    isolation: "isolate",
    boxShadow: app.dashboard.cardGlassShadow,
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
