import type { SxProps, Theme } from "@mui/material/styles";

/**
 * App-wide icon scale — single source of truth.
 * Use `iconGlyphSx(size)` on MUI `SvgIcon`; use `iconSlotSx(slot)` for centered hit targets.
 */
export const ICON_SIZE = {
  /** Dense table / compact buttons */
  sm: 18,
  /** Default: toolbars, modal dismiss, button startIcon */
  md: 20,
  /** Section titles, sidebar glyphs */
  lg: 24,
  /** Header chrome (bell, settings) */
  xl: 30,
} as const;

export type IconSizeKey = keyof typeof ICON_SIZE;

export function resolveIconPx(
  size?: number | IconSizeKey,
  width?: number,
  height?: number,
): { width: number; height: number } {
  const base =
    typeof size === "number" ? size : size != null ? ICON_SIZE[size] : ICON_SIZE.md;
  return {
    width: width ?? height ?? base,
    height: height ?? width ?? base,
  };
}

/**
 * Sizes a Material `SvgIcon` inside a flex/icon-button slot.
 * Do not use `inheritViewBox` — it causes optical drift when width/height change.
 */
export function iconGlyphSx(
  size: number | IconSizeKey = ICON_SIZE.md,
  extra?: SxProps<Theme>,
): SxProps<Theme> {
  const px = typeof size === "number" ? size : ICON_SIZE[size];
  const base: SxProps<Theme> = {
    width: px,
    height: px,
    fontSize: px,
    display: "block",
    lineHeight: 0,
    flexShrink: 0,
    boxSizing: "border-box",
  };
  return extra ? ([base, extra] as SxProps<Theme>) : base;
}

/** Fixed box that centers any child glyph (sidebar, modals, icon buttons). */
export function iconSlotSx(slotPx: number): SxProps<Theme> {
  return {
    width: slotPx,
    height: slotPx,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    lineHeight: 0,
    verticalAlign: "middle",
  };
}

/** Standard glyph size inside {@link ICON_SIZE} md toolbar chips (36×36). */
export const TOOLBAR_ICON_BUTTON_GLYPH = ICON_SIZE.md;

/** Modal / glass shell dismiss control */
export const MODAL_CLOSE_BUTTON_PX = 36;
export const MODAL_CLOSE_GLYPH_PX = ICON_SIZE.md;
