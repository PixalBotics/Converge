"use client";

import Box from "@mui/material/Box";
import { Typography, DashboardCard } from "@/components/common";

export interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  /** Value text color (e.g. card-specific accent). Default: #6769E9 */
  valueColor?: string;
  /** Subtitle color (e.g. "#EF4444" for alert). Default: grey */
  subtitleColor?: string;
  /** Show green trend arrow before subtitle. Default: true */
  showTrendArrow?: boolean;
}

function TrendArrowUp() {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        mr: 0.5,
        verticalAlign: "middle",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 9V3M6 3L3 6M6 3L9 6"
          stroke="#22C55E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor,
  valueColor = "#6769E9",
  subtitleColor,
  showTrendArrow = true,
}: MetricCardProps) {
  return (
    <DashboardCard sx={{ p: 2.5 }}>
      {/* Icon top-left */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          bgcolor: iconBgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          mb: 1.5,
        }}
      >
        {icon}
      </Box>
      {/* Title */}
      <Typography variant="body2" color="rgba(255,255,255,0.9)" fontWeight={500} sx={{ mb: 0.75 }}>
        {title}
      </Typography>
      {/* Value - large, accent color */}
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{ color: valueColor, lineHeight: 1.2, mb: subtitle ? 0.5 : 0 }}
      >
        {value}
      </Typography>
      {/* Subtitle with optional trend arrow */}
      {subtitle && (
        <Typography
          variant="caption"
          component="span"
          sx={{
            color: subtitleColor ?? "rgba(255,255,255,0.55)",
            display: "inline-flex",
            alignItems: "center",
            fontSize: "0.75rem",
          }}
        >
          {showTrendArrow && <TrendArrowUp />}
          {subtitle}
        </Typography>
      )}
    </DashboardCard>
  );
}
