import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Resolves MUI `sx` prop when it is a function of theme.
 * Use in components that merge custom `sx` with theme-dependent styles so callers
 * can pass either a style object or (theme) => style object without type casts.
 */
export function resolveSx(
  sx: SxProps<Theme> | undefined,
  theme: Theme
): SxProps<Theme> {
  if (sx == null) return {};
  if (typeof sx === "function") return (sx as (t: Theme) => SxProps<Theme>)(theme);
  return sx;
}
