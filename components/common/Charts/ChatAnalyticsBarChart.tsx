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
  chatAnalyticsBarChartGrid,
  chatAnalyticsBarChartXAxis,
  chatAnalyticsBarChartYAxis,
  chatAnalyticsBarChartTooltipContent,
  chatAnalyticsBarChartTooltipItem,
  chatAnalyticsBarChartTooltipLabel,
  chatAnalyticsBarChartCursor,
  chatAnalyticsBarChartBar,
  chatAnalyticsBarChartGradientFirst,
  chatAnalyticsBarChartGradientSecond,
} from "./ChatAnalyticsBarChart.styles";

const DEFAULT_HEIGHT = 260;
const GRADIENT_FIRST_ID = "chatAnalyticsBarFirst";
const GRADIENT_SECOND_ID = "chatAnalyticsBarSecond";

const MARGIN_DESKTOP = { top: 24, right: 16, left: 8, bottom: 8 };
const MARGIN_MOBILE = { top: 16, right: 8, left: 4, bottom: 4 };

export function ChatAnalyticsBarChart({
  data,
  height = DEFAULT_HEIGHT,
  yDomain = [140000, 280000],
  yTickFormatter = (v) => `${v / 1000}M`,
  tooltipFormatter = (value) => `$${(value / 1000).toFixed(0)}k`,
}: ChatAnalyticsBarChartProps) {
  const theme = useTheme();
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
              <stop offset="0%" stopColor={chatAnalyticsBarChartGradientFirst.topColor} />
              <stop offset={chatAnalyticsBarChartGradientFirst.bottomOffset} stopColor={chatAnalyticsBarChartGradientFirst.bottomColor} />
            </linearGradient>
            <linearGradient
              id={GRADIENT_SECOND_ID}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor={chatAnalyticsBarChartGradientSecond.topColor} />
              <stop offset={chatAnalyticsBarChartGradientSecond.bottomOffset} stopColor={chatAnalyticsBarChartGradientSecond.bottomColor} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={chatAnalyticsBarChartGrid.stroke}
            strokeOpacity={chatAnalyticsBarChartGrid.strokeOpacity}
            strokeDasharray={chatAnalyticsBarChartGrid.strokeDasharray}
            vertical={chatAnalyticsBarChartGrid.vertical}
          />
          <XAxis
            dataKey="name"
            axisLine={chatAnalyticsBarChartXAxis.axisLine}
            tickLine={chatAnalyticsBarChartXAxis.tickLine}
            tick={{ ...chatAnalyticsBarChartXAxis.tick, fontSize: tickFontSize }}
            interval={0}
          />
          <YAxis
            domain={yDomain}
            axisLine={chatAnalyticsBarChartYAxis.axisLine}
            tickLine={chatAnalyticsBarChartYAxis.tickLine}
            tick={{ ...chatAnalyticsBarChartYAxis.tick, fontSize: tickFontSize }}
            tickFormatter={yTickFormatter}
            width={isMobile ? 28 : 36}
          />
          <Tooltip
            contentStyle={chatAnalyticsBarChartTooltipContent}
            cursor={chatAnalyticsBarChartCursor}
            formatter={(value: unknown) => [tooltipFormatter(Number(value)), ""]}
            itemStyle={chatAnalyticsBarChartTooltipItem}
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
