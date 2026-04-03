"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { DashboardCardProps } from "./DashboardCard.types";

export function DashboardCard({ children, sx = {}, ...rest }: DashboardCardProps) {
  const th = useTheme() as AppTheme;

  const baseSx: SxProps<Theme> = {
    background: th.app.dashboard.cardBg,
    backdropFilter: "blur(24px) saturate(155%)",
    borderRadius: "12px",
    position: "relative",
    height: "100%",
    border: `1px solid ${th.app.dashboard.cardBorder}`,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
  };

  return (
    <Box sx={[baseSx, sx] as SxProps<Theme>} {...rest}>
      {children}
    </Box>
  );
}
