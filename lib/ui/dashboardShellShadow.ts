import type { Theme } from "@mui/material/styles";

/** Floating sidebar elevation — softer on light canvases. */
export function dashboardShellElevatedShadow(theme: Theme): string {
  return theme.palette.mode === "light"
    ? "0 4px 20px rgba(15, 23, 42, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.72)"
    : "0 8px 32px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06)";
}

/** Header shell — inset highlight only so drop shadow does not bleed onto scrolling main. */
export function dashboardShellHeaderShadow(theme: Theme): string {
  return theme.palette.mode === "light"
    ? "inset 0 1px 0 rgba(255, 255, 255, 0.72)"
    : "inset 0 1px 0 rgba(255, 255, 255, 0.06)";
}
