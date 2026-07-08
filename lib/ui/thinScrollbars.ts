import { alpha, type SxProps, type Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

/** Subtle thin scrollbar for dashboard scroll regions (no OS arrow buttons). */
export const thinScrollbarsSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  const isLight = theme.palette.mode === "light";
  const thumb = isLight
    ? alpha(app.text.primary, 0.22)
    : alpha(app.dashboard.white95, 0.28);
  const thumbHover = isLight
    ? alpha(app.text.primary, 0.36)
    : alpha(app.dashboard.white95, 0.42);

  return {
    scrollbarWidth: "thin",
    scrollbarColor: `${thumb} transparent`,
    "&::-webkit-scrollbar": { width: 6, height: 6 },
    "&::-webkit-scrollbar-track": { background: "transparent" },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: 999,
      backgroundColor: thumb,
      border: "2px solid transparent",
      backgroundClip: "padding-box",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: thumbHover,
    },
    "&::-webkit-scrollbar-button": {
      display: "none",
      width: 0,
      height: 0,
    },
    "&::-webkit-scrollbar-corner": { background: "transparent" },
  };
};
