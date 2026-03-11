"use client";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { RevenueLineChartProps } from "./RevenueLineChart.types";
import {
  revenueLineChartRoot,
  revenueLineChartGrid,
  revenueLineChartXAxis,
  revenueLineChartYAxis,
  revenueLineChartTooltipContent,
  revenueLineChartTooltipLabel,
  revenueLineChartTooltipItem,
  revenueLineChartCursor,
  revenueLineChartGradientStops,
  revenueLineChartLine1,
  revenueLineChartLine2,
} from "./RevenueLineChart.styles";

const DEFAULT_HEIGHT = 280;
const MARGIN_DESKTOP = { top: 10, right: 10, left: 0, bottom: 0 };
const MARGIN_MOBILE = { top: 8, right: 8, left: 0, bottom: 0 };
const X_TICKS_DESKTOP = [1, 5, 10, 15, 20, 25, 30] as number[];
const X_TICKS_MOBILE = [1, 10, 20, 30] as number[];

export function RevenueLineChart({
  data,
  height = DEFAULT_HEIGHT,
  yDomain = [140, 260],
  yTickFormatter = (v) => `${v}M`,
  tooltipFormatter = (value) =>
    `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`,
  tooltipLabelFormatter = (day) => `${Number(day)} April, 2026`,
}: RevenueLineChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const gradientId = "revenueGlow";
  const margin = isMobile ? MARGIN_MOBILE : MARGIN_DESKTOP;
  const tickFontSize = isMobile ? 10 : 12;
  const xTicks = isMobile ? X_TICKS_MOBILE : X_TICKS_DESKTOP;
  const activeDotR = isMobile ? 4 : 6;

  return (
    <div style={revenueLineChartRoot(height)}>
      <ResponsiveContainer width="100%" height="100%" minHeight={180}>
        <LineChart data={data} margin={margin}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              {revenueLineChartGradientStops.map((stop, i) => (
                <stop
                  key={i}
                  offset={stop.offset}
                  stopColor={stop.stopColor}
                  stopOpacity={stop.stopOpacity}
                />
              ))}
            </linearGradient>
          </defs>
          <CartesianGrid stroke={revenueLineChartGrid.stroke} vertical={false} />
          <XAxis
            dataKey="day"
            stroke={revenueLineChartXAxis.stroke}
            tick={{ ...revenueLineChartXAxis.tick, fontSize: tickFontSize }}
            tickLine={revenueLineChartXAxis.tickLine}
            axisLine={revenueLineChartXAxis.axisLine}
            ticks={xTicks}
          />
          <YAxis
            stroke={revenueLineChartYAxis.stroke}
            tick={{ ...revenueLineChartYAxis.tick, fontSize: tickFontSize }}
            tickLine={revenueLineChartYAxis.tickLine}
            axisLine={revenueLineChartYAxis.axisLine}
            domain={yDomain}
            tickFormatter={yTickFormatter}
            width={isMobile ? 32 : 40}
          />
          <Tooltip
            contentStyle={revenueLineChartTooltipContent}
            labelStyle={revenueLineChartTooltipLabel}
            itemStyle={revenueLineChartTooltipItem}
            formatter={(value: unknown) => [tooltipFormatter(Number(value)), "Revenue"]}
            labelFormatter={tooltipLabelFormatter}
            cursor={revenueLineChartCursor}
          />
          <Area type="monotone" dataKey="value" fill={`url(#${gradientId})`} stroke="none" />
          <Line
            type="monotone"
            dataKey="value"
            stroke={revenueLineChartLine1.stroke}
            strokeWidth={revenueLineChartLine1.strokeWidth}
            dot={revenueLineChartLine1.dot}
            activeDot={{ ...revenueLineChartLine1.activeDot, r: activeDotR }}
          />
          <Line
            type="monotone"
            dataKey="value2"
            stroke={revenueLineChartLine2.stroke}
            strokeWidth={revenueLineChartLine2.strokeWidth}
            dot={revenueLineChartLine2.dot}
            activeDot={{ ...revenueLineChartLine2.activeDot, r: activeDotR }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
