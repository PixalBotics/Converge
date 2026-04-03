"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { Typography, DashboardCard } from "@/components/common";
import type { AppTheme } from "@/theme/theme";

export interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  /** Value text colour. Default: theme `dashboard.metricValueDefault` (aligned with chart accent). */
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
  valueColor,
  subtitleColor,
  showTrendArrow = true,
}: MetricCardProps) {
  const th = useTheme() as AppTheme;
  const resolvedValueColor = valueColor ?? th.app.dashboard.metricValueDefault;
  const titleColor = th.app.text.secondary;
  const subtitleResolved = subtitleColor ?? th.app.text.or;

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
          color: th.app.text.primary,
          mb: 1.5,
        }}
      >
        {icon}
      </Box>
      {/* Title */}
      <Typography variant="body2" fontWeight={500} sx={{ mb: 0.75, color: titleColor }}>
        {title}
      </Typography>
      {/* Value — Box avoids MUI h4 / palette.primary overriding sx color */}
      <Box
        sx={(t) => ({
          ...t.typography.h4,
          fontWeight: 700,
          color: resolvedValueColor,
          lineHeight: 1.2,
          mb: subtitle ? 0.5 : 0,
        })}
      >
        {value}
      </Box>
      {/* Subtitle with optional trend arrow */}
      {subtitle && (
        <Typography
          variant="caption"
          component="span"
          sx={{
            color: subtitleResolved,
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
