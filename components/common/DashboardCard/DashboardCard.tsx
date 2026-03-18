"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import type { DashboardCardProps } from "./DashboardCard.types";
import { dashboardCardStyles } from "./dashboard-card.styles";

export function DashboardCard({ children, sx = {}, ...rest }: DashboardCardProps) {
  const mergedSx = { ...dashboardCardStyles, ...sx } as SxProps<Theme>;
  return (
    <Box sx={mergedSx} {...rest}>
      {children}
    </Box>
  );
}
