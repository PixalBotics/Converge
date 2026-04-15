"use client";

import { useCallback, useState } from "react";
import Box from "@mui/material/Box";

/** Discord-style panel (matches theme swatch chrome) */
const TOOLTIP_BG = "#36393f";

export type HoverTooltipProps = {
  /** e.g. preset label — shown in the tooltip */
  label: string;
  children: React.ReactNode;
  /** When false, wrapper shrinks to the child (e.g. compact swatch row). Grid swatches use default true. */
  fullWidth?: boolean;
};

/**
 * Hover-only label above the child; dark bubble without arrow.
 */
export function HoverTooltip({ label, children, fullWidth = true }: HoverTooltipProps) {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  return (
    <Box
      onMouseEnter={show}
      onMouseLeave={hide}
      sx={{
        position: "relative",
        width: fullWidth ? "100%" : "fit-content",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {children}
      {open ? (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            left: "50%",
            bottom: "100%",
            transform: "translateX(-50%)",
            mb: "6px",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              position: "relative",
              px: 1.5,
              py: 1,
              borderRadius: "9px",
              bgcolor: TOOLTIP_BG,
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 13,
              lineHeight: 1.25,
              fontFamily: '"Inter", "Manrope", sans-serif',
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
            }}
          >
            {label}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
