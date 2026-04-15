"use client";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { ChatAnalyticsBarChartProps } from "./ChatAnalyticsBarChart.types";
import {
  chatAnalyticsBarChartRoot,
  chatAnalyticsBarChartCursor,
  chatAnalyticsBarChartTooltipLabel,
} from "./ChatAnalyticsBarChart.styles";
import { useAppChartStyles } from "./useAppChartStyles";

const DEFAULT_HEIGHT = 260;
const GRADIENT_FIRST_ID = "chatAnalyticsBarFirst";
const GRADIENT_SECOND_ID = "chatAnalyticsBarSecond";

const MARGIN_DESKTOP = { top: 20, right: 16, left: 8, bottom: 2 };
const MARGIN_MOBILE = { top: 16, right: 8, left: 4, bottom: 2 };

export function ChatAnalyticsBarChart({
  data,
  height = DEFAULT_HEIGHT,
  yDomain = [140000, 280000],
  yTickFormatter = (v) => `${v / 1000}M`,
  tooltipFormatter = (value) => `$${(value / 1000).toFixed(0)}k`,
}: ChatAnalyticsBarChartProps) {
  const theme = useTheme();
  const chart = useAppChartStyles().chatBar;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const margin = isMobile ? MARGIN_MOBILE : MARGIN_DESKTOP;
  const tickFontSize = isMobile ? 10 : 12;
  const maxBarSize = isMobile ? 28 : 48;
  const radius: [number, number, number, number] = isMobile ? [4, 4, 0, 0] : [6, 6, 0, 0];

  return (
    <div style={chatAnalyticsBarChartRoot(height)}>
      <ResponsiveContainer width="100%" height="100%" minHeight={160}>
        <BarChart data={data} margin={margin}>
          <defs>
            <linearGradient
              id={GRADIENT_FIRST_ID}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor={chart.gradientFirst.topColor} />
              <stop offset={chart.gradientFirst.bottomOffset} stopColor={chart.gradientFirst.bottomColor} />
            </linearGradient>
            <linearGradient
              id={GRADIENT_SECOND_ID}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor={chart.gradientSecond.topColor} />
              <stop offset={chart.gradientSecond.bottomOffset} stopColor={chart.gradientSecond.bottomColor} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={chart.grid.stroke}
            strokeOpacity={chart.grid.strokeOpacity}
            strokeDasharray={chart.grid.strokeDasharray}
            vertical={chart.grid.vertical}
          />
          <XAxis
            dataKey="name"
            axisLine={chart.xAxis.axisLine}
            tickLine={chart.xAxis.tickLine}
            tick={{ ...chart.xAxis.tick, fontSize: tickFontSize }}
            interval={0}
          />
          <YAxis
            domain={yDomain}
            axisLine={chart.yAxis.axisLine}
            tickLine={chart.yAxis.tickLine}
            tick={{ ...chart.yAxis.tick, fontSize: tickFontSize }}
            tickFormatter={yTickFormatter}
            width={isMobile ? 28 : 36}
          />
          <Tooltip
            contentStyle={chart.tooltipContent}
            cursor={chatAnalyticsBarChartCursor}
            formatter={(value: unknown) => [tooltipFormatter(Number(value)), ""]}
            itemStyle={chart.tooltipItem}
            labelStyle={chatAnalyticsBarChartTooltipLabel}
          />
          <Bar dataKey="value" radius={radius} maxBarSize={maxBarSize}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.fill === "first"
                    ? `url(#${GRADIENT_FIRST_ID})`
                    : `url(#${GRADIENT_SECOND_ID})`
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
