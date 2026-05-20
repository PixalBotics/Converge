"use client";

import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

/** Discord-style bubble (matches dashboard swatch chrome). */
const TOOLTIP_BG = "#36393f";

export type HoverTooltipProps = {
  /** e.g. preset label — shown in the tooltip */
  label: string;
  children: React.ReactNode;
  /** When false, wrapper shrinks to the child (e.g. compact swatch row). Grid swatches use default true. */
  fullWidth?: boolean;
};

/**
 * Label on hover — uses MUI `Tooltip` + portaled Popper so labels are not clipped by
 * `overflow: auto` scroll regions (e.g. dashboard main). `preventOverflow` keeps copy on-screen.
 */
export function HoverTooltip({ label, children, fullWidth = true }: HoverTooltipProps) {
  return (
    <Tooltip
      title={label}
      placement="top"
      describeChild
      enterDelay={200}
      enterNextDelay={200}
      slotProps={{
        popper: {
          disablePortal: false,
          sx: { zIndex: (t) => t.zIndex.tooltip },
          modifiers: [
            { name: "offset", options: { offset: [0, -8] } },
            {
              name: "preventOverflow",
              enabled: true,
              options: {
                padding: 8,
                altAxis: true,
                tether: false,
                boundary: "viewport",
              },
            },
            { name: "flip", enabled: true },
          ],
        },
        tooltip: {
          sx: {
            bgcolor: TOOLTIP_BG,
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 13,
            lineHeight: 1.25,
            fontFamily: '"Inter", "Manrope", sans-serif',
            whiteSpace: "nowrap",
            maxWidth: "min(320px, calc(100vw - 16px))",
            px: 1.5,
            py: 1,
            borderRadius: "9px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
          },
        },
      }}
    >
      <Box
        component="span"
        sx={{
          width: fullWidth ? "100%" : "fit-content",
          display: "inline-flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "visible",
          lineHeight: 0,
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}
