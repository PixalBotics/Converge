"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { iconSlotSx, type IconSizeKey, resolveIconPx } from "@/lib/design-system/icons";

export type IconSlotProps = {
  children: ReactNode;
  /** Outer hit target (px). Defaults to 24 (sidebar / inline). */
  slot?: number;
  /** Inner glyph (px or token). When set, slot defaults to `glyph + 8` unless `slot` is passed. */
  glyph?: number | IconSizeKey;
};

/**
 * Centers MUI (or custom) icons in a fixed box — prevents baseline drift and clipping in circles.
 */
export function IconSlot({ children, slot, glyph }: IconSlotProps) {
  const glyphPx =
    glyph == null ? undefined : typeof glyph === "number" ? glyph : resolveIconPx(glyph).width;
  const slotPx = slot ?? (glyphPx != null ? glyphPx + 8 : 24);

  return (
    <Box component="span" sx={iconSlotSx(slotPx)}>
      {children}
    </Box>
  );
}
