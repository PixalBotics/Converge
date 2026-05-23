import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

/**
 * Selection chrome that stays inside the element box (safe inside `overflow: auto` regions).
 * Prefer this over large outer `box-shadow` rings that get clipped by scroll containers.
 */
export function selectionOutlineCss(theme: Theme, selected: boolean) {
  if (!selected) return {};
  const app = (theme as AppTheme).app;
  return {
    outline: `2px solid ${alpha(app.text.primary, 0.9)}`,
    outlineOffset: 3,
  } as const;
}

/** Circular swatch / picker — compact halo; keep padding on the parent grid so this is not clipped. */
export function selectionCircleShadow(theme: Theme): string {
  const app = (theme as AppTheme).app;
  const p = theme.palette.primary.main;
  return `0 0 0 2px ${alpha(app.text.primary, 0.92)}, 0 0 0 4px ${alpha(p, 0.95)}, 0 6px 16px ${alpha(
    theme.palette.common.black,
    0.32,
  )}`;
}

/** Minimum inset on grids/rows that host selectable circles with {@link selectionCircleShadow}. */
export const selectionHaloSafePaddingPx = 8;
