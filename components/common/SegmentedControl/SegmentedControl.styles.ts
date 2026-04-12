import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

type App = AppTheme["app"];

/** Pill toggle — container + inactive use muted text; selected uses accent-aware `navActiveBg`. */
export function getSegmentedControlDefaultSx(app: App): SxProps<Theme> {
  return {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "53.51px",
    p: 0.5,
    background: app.dashboard.pillBg,
    border: `0.51px solid ${app.dashboard.cardBorder}`,
    "& .MuiToggleButtonGroup-grouped": {
      border: "none",
      borderRadius: "53.51px",
      textTransform: "none",
      padding: "6px 18px",
      fontSize: 13,
      color: app.dashboard.textMuted,
      "&:not(:first-of-type)": { marginLeft: 2 },
      "&.Mui-selected": {
        bgcolor: app.dashboard.navActiveBg,
        color: app.text.primary,
        fontWeight: 600,
        border: `0.51px solid ${app.dashboard.overlayBorder}`,
        boxShadow: `0 6px 20px rgba(0, 0, 0, 0.28)`,
        "&:hover": { bgcolor: app.dashboard.navActiveBg },
      },
    },
  };
}

/** Secondary: selected pill uses `pillActive` (e.g. Chat Analytics). */
export function getSegmentedControlSecondarySx(app: App): SxProps<Theme> {
  return {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "53.51px",
    p: 0.5,
    background: app.dashboard.pillBg,
    border: `0.51px solid ${app.dashboard.cardBorder}`,
    "& .MuiToggleButtonGroup-grouped": {
      border: "none",
      borderRadius: "53.51px",
      textTransform: "none",
      padding: "6px 18px",
      fontSize: 13,
      color: app.dashboard.textMuted,
      "&:not(:first-of-type)": { marginLeft: 2 },
      "&.Mui-selected": {
        bgcolor: app.dashboard.pillActive,
        color: app.text.primary,
        fontWeight: 600,
        border: `0.51px solid ${app.dashboard.overlayBorder}`,
        boxShadow: `0 6px 18px rgba(0, 0, 0, 0.22)`,
        "&:hover": { bgcolor: app.dashboard.pillActive },
      },
    },
  };
}
