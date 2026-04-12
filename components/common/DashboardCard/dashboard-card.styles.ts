import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

/** Border ring follows `theme.app.dashboard.cardBorder`; fill uses `cardBg`. */
export const dashboardCardStyles: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  const border = app.dashboard.cardBorder;
  const edgeMid = app.dashboard.overlayLight;
  return {
    background: app.dashboard.cardBg,
    backdropFilter: app.dashboard.cardBackdropBlur,
    WebkitBackdropFilter: app.dashboard.cardBackdropBlur,
    borderRadius: "9.32px",
    position: "relative",
    height: "100%",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      padding: "1.6px",
      borderRadius: "9.32px",
      background: `linear-gradient(173.83deg, ${border} 4.82%, ${edgeMid} 38.08%, ${edgeMid} 56.68%, ${border} 95.1%)`,
      WebkitMask:
        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
      pointerEvents: "none",
    },
  };
};
