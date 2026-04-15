"use client";

import Box from "@mui/material/Box";
import { getLuminance, lighten, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography, DashboardCard } from "@/components/common";

export interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  /** Value text color (e.g. card-specific accent). Default: theme primary (accent). */
  valueColor?: string;
  /** Subtitle color (e.g. error for alert). Default: theme `dashboard.white60`. */
  subtitleColor?: string;
  /** Show green trend arrow before subtitle. Default: true */
  showTrendArrow?: boolean;
}

/** Dark cards: custom/dark accents (e.g. forest green) must not match near-black text. */
function readableMetricValueColor(theme: AppTheme, color: string): string {
  if (theme.palette.mode !== "dark") return color;
  try {
    const lum = getLuminance(color);
    if (lum < 0.45) return lighten(color, 0.42);
  } catch {
    /* invalid color string */
  }
  return color;
}

function TrendArrowUp({ strokeColor }: { strokeColor: string }) {
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
          stroke={strokeColor}
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
  const theme = useTheme() as AppTheme;
  const app = theme.app;
  const rawValueColor = valueColor ?? theme.palette.primary.main;
  const resolvedValueColor = readableMetricValueColor(theme, rawValueColor);
  const resolvedSubtitleColor = subtitleColor ?? app.dashboard.white60;

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
          color: app.dashboard.gradientButtonText,
          mb: 1.5,
        }}
      >
        {icon}
      </Box>
      {/* Title */}
      <Typography variant="body2" fontWeight={500} sx={{ mb: 0.75, color: app.dashboard.white90 }}>
        {title}
      </Typography>
      {/* Value - large, accent color */}
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{ color: resolvedValueColor, lineHeight: 1.2, mb: subtitle ? 0.5 : 0 }}
      >
        {value}
      </Typography>
      {/* Subtitle with optional trend arrow */}
      {subtitle && (
        <Typography
          variant="caption"
          component="span"
          sx={{
            color: resolvedSubtitleColor,
            display: "inline-flex",
            alignItems: "center",
            fontSize: "0.75rem",
          }}
        >
          {showTrendArrow && <TrendArrowUp strokeColor={app.dashboard.accentGreen} />}
          {subtitle}
        </Typography>
      )}
    </DashboardCard>
  );
}
