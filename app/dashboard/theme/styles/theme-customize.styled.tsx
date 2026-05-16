"use client";

/**
 * MUI `styled` primitives for `/dashboard/theme` — pairs with `theme-customize.styles.ts` (sx factories).
 */

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { resolveSx } from "@/utils/resolveSx";
import {
  colorThemesGridSx,
  defaultThemeRowSx,
  defaultThemeSwatchesRowSx,
  pickerInnerSx,
  pickerTriggerSx,
  swatchButtonSx,
  themePageRootSx,
} from "./theme-customize.styles";

function flatSx(sx: Parameters<typeof resolveSx>[0], theme: Theme): Record<string, unknown> {
  return resolveSx(sx, theme) as Record<string, unknown>;
}

/** Page shell for Customize appearance — spacing + max-width rhythm. */
export const ThemeCustomizeRoot = styled(Box)(({ theme }) => ({
  ...flatSx(themePageRootSx, theme),
}));

export const ThemeCustomizeDefaultRow = styled(Box)(({ theme }) => ({
  ...flatSx(defaultThemeRowSx, theme),
}));

export const ThemeCustomizeSwatchesRow = styled(Box)(({ theme }) => ({
  ...flatSx(defaultThemeSwatchesRowSx, theme),
}));

export const ThemeCustomizeColorGrid = styled(Box)(({ theme }) => ({
  ...flatSx(colorThemesGridSx, theme),
}));

export type ThemeColorPickerTriggerProps = {
  /** Transient — not forwarded to DOM. */
  $selected: boolean;
};

/** Custom accent ring trigger (conic border + focus ring). */
export const ThemeColorPickerTrigger = styled("button", {
  shouldForwardProp: (prop) => prop !== "$selected",
})<ThemeColorPickerTriggerProps>(({ theme, $selected }) => ({
  ...(pickerTriggerSx(theme, $selected) as object),
}));

export type ThemeColorPickerInnerProps = {
  $hex: string;
};

export const ThemeColorPickerInner = styled(Box, {
  shouldForwardProp: (prop) => prop !== "$hex",
})<ThemeColorPickerInnerProps>(({ theme, $hex }) => ({
  ...(pickerInnerSx(theme, $hex) as object),
}));

export type ThemeSwatchButtonRootProps = {
  $selected: boolean;
  $shape: "tile" | "circle";
  $compact?: boolean;
};

export const ThemeSwatchButtonRoot = styled("button", {
  shouldForwardProp: (prop) => !["$selected", "$shape", "$compact"].includes(String(prop)),
})<ThemeSwatchButtonRootProps>(({ theme, $selected, $shape, $compact }) => ({
  ...(swatchButtonSx(theme as AppTheme, {
    shape: $shape,
    selected: $selected,
    compact: $compact,
  }) as object),
}));
