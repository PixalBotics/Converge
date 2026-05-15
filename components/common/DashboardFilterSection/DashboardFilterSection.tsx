"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  dashboardFilterActionsRowSx,
  dashboardFilterPrimarySlotSx,
  dashboardFilterSectionRootSx,
  dashboardFilterToolbarRowSx,
  dashboardSectionTitleRowSx,
} from "@/lib/design-system";

export type DashboardFilterSectionProps = {
  /** Left cluster (icon tile + heading) rendered above the filter row when provided. */
  titleSlot?: ReactNode;
  /** Search / primary field — grows on wide screens (`flex: 1`). */
  primarySlot?: ReactNode;
  /** Filter chips / `FilterButton` / date fields. */
  filterSlot?: ReactNode;
  /** Right-aligned CTAs (Add / Export). */
  actionSlot?: ReactNode;
  /** Full-width auxiliary row under the toolbar (bulk actions, badges). */
  belowSlot?: ReactNode;
  sx?: SxProps<Theme>;
};

/**
 * Standard dashboard card toolbar: responsive filter row wired to theme tokens (`theme.app`).
 * Keeps spacing and breakpoints consistent across HRMS / companies / pools / etc.
 */
export function DashboardFilterSection({
  titleSlot,
  primarySlot,
  filterSlot,
  actionSlot,
  belowSlot,
  sx,
}: DashboardFilterSectionProps) {
  const hasTitle = Boolean(titleSlot);
  const hasToolbarBits = Boolean(primarySlot ?? filterSlot ?? actionSlot);

  return (
    <Box sx={[dashboardFilterSectionRootSx, ...(sx ? [sx] : [])] as SxProps<Theme>}>
      {hasTitle ? <Box sx={dashboardSectionTitleRowSx}>{titleSlot}</Box> : null}

      {hasToolbarBits ? (
        <Box sx={dashboardFilterToolbarRowSx}>
          {primarySlot ? <Box sx={dashboardFilterPrimarySlotSx}>{primarySlot}</Box> : null}
          {filterSlot || actionSlot ? (
            <Box
              sx={
                [
                  dashboardFilterActionsRowSx,
                  ...(primarySlot
                    ? []
                    : [{ width: "100%" as const, justifyContent: { xs: "flex-start", sm: "flex-end" } }]),
                ] as SxProps<Theme>
              }
            >
              {filterSlot}
              {actionSlot}
            </Box>
          ) : null}
        </Box>
      ) : null}

      {belowSlot}
    </Box>
  );
}
