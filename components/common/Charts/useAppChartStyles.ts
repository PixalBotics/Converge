"use client";

import { useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import type { CSSProperties } from "react";
import type { AppTheme } from "@/theme/theme";

/** Recharts colors derived from dynamic `theme.app` + `theme.appBackground`. */
export function useAppChartStyles() {
  const theme = useTheme() as AppTheme;

  return useMemo(() => {
    const { app } = theme;
    const bg = theme.appBackground;
    const tick = app.dashboard.textMuted95;
    const axis = app.dashboard.cardBorder;
    const grid = app.border.divider;
    const primaryText = app.text.primary;
    const accent = app.dashboard.accentBlue;
    const accent2 = app.dashboard.accentPurple;
    const barBottom = app.dashboard.pillBg;
    const subtleLine = app.dashboard.overlayBorder;

    return {
      revenue: {
        gridStroke: grid,
        xAxis: {
          stroke: tick,
          tick: { fill: tick, fontSize: 12 },
          tickLine: false,
          axisLine: { stroke: axis },
        },
        yAxis: {
          stroke: tick,
          tick: { fill: tick, fontSize: 12 },
          tickLine: false,
          axisLine: { stroke: axis },
        },
        tooltipContent: {
          background: bg,
          boxShadow: "none",
          border: `0.51px solid ${app.dashboard.cardBorder}`,
          borderRadius: 12,
        } satisfies CSSProperties,
        tooltipLabel: { color: primaryText, fontWeight: 600 } satisfies CSSProperties,
        tooltipItem: { color: primaryText } satisfies CSSProperties,
        cursor: { stroke: tick, strokeDasharray: "4 4" },
        gradientStops: [
          { offset: "0%", stopColor: accent, stopOpacity: 0.22 },
          { offset: "50%", stopColor: accent2, stopOpacity: 0.12 },
          { offset: "100%", stopColor: accent2, stopOpacity: 0 },
        ] as const,
        line1: {
          stroke: primaryText,
          strokeWidth: 2,
          dot: false,
          activeDot: {
            r: 6,
            fill: app.dashboard.pillBg,
            stroke: primaryText,
            strokeWidth: 2,
          },
        },
        line2: {
          stroke: accent,
          strokeWidth: 2,
          dot: false,
          activeDot: {
            r: 6,
            fill: app.dashboard.pillBg,
            stroke: accent,
            strokeWidth: 2,
          },
        },
      },
      chatBar: {
        grid: {
          stroke: grid,
          strokeOpacity: 1,
          strokeDasharray: "0",
          vertical: false,
        },
        xAxis: {
          axisLine: { stroke: axis },
          tickLine: false,
          tick: { fill: tick, fontSize: 12 },
        },
        yAxis: {
          axisLine: { stroke: axis },
          tickLine: false,
          tick: { fill: tick, fontSize: 12 },
        },
        tooltipContent: {
          background: bg,
          border: `1px solid ${app.dashboard.cardBorder}`,
          borderRadius: 10,
          boxShadow: "none",
          color: primaryText,
          padding: "4px 10px",
          fontWeight: 500,
          lineHeight: 1.3,
        } satisfies CSSProperties,
        tooltipLabel: { color: primaryText, fontWeight: 600 } satisfies CSSProperties,
        tooltipItem: { color: primaryText, padding: 0 } satisfies CSSProperties,
        gradientFirst: {
          topColor: app.dashboard.accentPinkLight,
          bottomColor: barBottom,
          bottomOffset: "100%",
        },
        gradientSecond: {
          topColor: app.dashboard.accentGreenLight,
          bottomColor: barBottom,
          bottomOffset: "88.89%",
        },
      },
      chatVolume: {
        grid: {
          stroke: grid,
          strokeOpacity: 1,
          vertical: false,
        },
        xAxis: {
          stroke: tick,
          tick: { fill: tick, fontSize: 12 },
          tickLine: false,
          axisLine: { stroke: axis },
        },
        yAxis: {
          stroke: tick,
          tick: { fill: tick, fontSize: 12 },
          tickLine: false,
          axisLine: { stroke: axis },
        },
        tooltipContent: {
          background: bg,
          boxShadow: "none",
          border: `0.51px solid ${app.dashboard.cardBorder}`,
          borderRadius: 12,
        } satisfies CSSProperties,
        tooltipLabel: { color: primaryText, fontWeight: 600 } satisfies CSSProperties,
        tooltipItem: { color: primaryText } satisfies CSSProperties,
        cursor: { stroke: subtleLine, strokeDasharray: "4 4" },
        line: {
          stroke: accent,
          strokeWidth: 2.62,
          dot: {
            r: 4,
            fill: accent,
            stroke: primaryText,
            strokeWidth: 1,
          },
          activeDot: {
            r: 6,
            fill: accent,
            stroke: primaryText,
            strokeWidth: 1,
          },
        },
        gradientStops: [
          { offset: "0%", stopColor: accent, stopOpacity: 0.35 },
          { offset: "100%", stopColor: accent, stopOpacity: 0 },
        ] as const,
      },
      pie: {
        tooltipContent: {
          backgroundColor: app.dashboard.menuSurfaceBg,
          border: `1px solid ${app.dashboard.cardBorder}`,
          borderRadius: 8,
          color: primaryText,
        } satisfies CSSProperties,
        labelFill: primaryText,
        labelLineStroke: app.dashboard.textMuted,
      },
    };
  }, [theme]);
}
