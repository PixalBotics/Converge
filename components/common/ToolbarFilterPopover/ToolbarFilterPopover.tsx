"use client";

import { useId, useRef } from "react";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import type { SxProps, Theme } from "@mui/material/styles";
import { FilterButton } from "@/components/common/FilterButton/FilterButton";
import { dashboardFilterPopoverPaperSx } from "@/components/common/FilterButton/filter-popover.styles";

export type ToolbarFilterPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Highlights the trigger when filters are non-default (optional). */
  active?: boolean;
  children: React.ReactNode;
};

/**
 * Standard toolbar pattern: Filter opens a popover; keeps anchor + a11y wiring in one place.
 */
export function ToolbarFilterPopover({ open, onOpenChange, active, children }: ToolbarFilterPopoverProps) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();

  return (
    <>
      <Box ref={anchorRef} sx={{ display: "inline-flex", flexShrink: 0 }}>
        <FilterButton
          onClick={() => onOpenChange(!open)}
          active={open || Boolean(active)}
          aria-expanded={open}
          aria-controls={panelId}
        />
      </Box>
      <Popover
        id={panelId}
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => onOpenChange(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: [
              dashboardFilterPopoverPaperSx,
              {
                maxWidth: "min(calc(100vw - 24px), 420px)",
                width: "min(calc(100vw - 24px), 420px)",
              },
            ] as SxProps<Theme>,
          },
        }}
      >
        {children}
      </Popover>
    </>
  );
}
