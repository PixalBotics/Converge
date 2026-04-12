import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

/** Outlined pill + `pillBg` — same chrome as `FilterButton` (table toolbars, Apply Filter, etc.). */
export const filterChromeButtonSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    borderRadius: "9999px",
    px: 2.5,
    py: 1.5,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    borderColor: app.dashboard.cardBorder,
    color: app.text.primary,
    backgroundColor: app.dashboard.pillBg,
    "&:hover": {
      backgroundColor: app.dashboard.pillActive,
      borderColor: app.dashboard.overlayBorder,
    },
  };
};
