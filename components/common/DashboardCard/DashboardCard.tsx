"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import type { DashboardCardProps } from "./DashboardCard.types";
import { dashboardCardStyles } from "./dashboard-card.styles";

export function DashboardCard({ children, sx, ...rest }: DashboardCardProps) {
  return (
    <Box sx={[dashboardCardStyles, ...(sx ? (Array.isArray(sx) ? sx : [sx]) : [])] as SxProps<Theme>} {...rest}>
      {children}
    </Box>
  );
}
