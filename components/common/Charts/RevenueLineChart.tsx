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
import type { AppTheme } from "@/theme/theme";
import type { RevenueLineChartProps } from "./RevenueLineChart.types";
import { revenueLineChartRoot } from "./RevenueLineChart.styles";

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
  const theme = useTheme() as AppTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const d = theme.app.dashboard;
  const gradientId = "revenueGlow";
  const margin = isMobile ? MARGIN_MOBILE : MARGIN_DESKTOP;
  const tickFontSize = isMobile ? 10 : 12;
  const xTicks = isMobile ? X_TICKS_MOBILE : X_TICKS_DESKTOP;
  const activeDotR = isMobile ? 4 : 6;

  const gradientStops = [
    { offset: "0%", stopColor: d.chartAreaStopTop, stopOpacity: 1 },
    { offset: "50%", stopColor: d.chartAreaStopMid, stopOpacity: 1 },
    { offset: "100%", stopColor: d.chartAreaStopBottom, stopOpacity: 0 },
  ];

  return (
    <div style={revenueLineChartRoot(height)}>
      <ResponsiveContainer width="100%" height="100%" minHeight={180}>
        <LineChart data={data} margin={margin}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              {gradientStops.map((stop, i) => (
                <stop
                  key={i}
                  offset={stop.offset}
                  stopColor={stop.stopColor}
                  stopOpacity={stop.stopOpacity}
                />
              ))}
            </linearGradient>
          </defs>
          <CartesianGrid stroke={d.chartGridStroke} vertical={false} />
          <XAxis
            dataKey="day"
            stroke={d.chartAxisStroke}
            tick={{ fill: d.chartTickFill, fontSize: tickFontSize }}
            tickLine={false}
            axisLine={{ stroke: d.chartAxisStroke }}
            ticks={xTicks}
          />
          <YAxis
            stroke={d.chartAxisStroke}
            tick={{ fill: d.chartTickFill, fontSize: tickFontSize }}
            tickLine={false}
            axisLine={{ stroke: d.chartAxisStroke }}
            domain={yDomain}
            tickFormatter={yTickFormatter}
            width={isMobile ? 32 : 40}
          />
          <Tooltip
            contentStyle={{
              background: d.chartTooltipBg,
              border: `1px solid ${d.chartTooltipBorder}`,
              borderRadius: 12,
              boxShadow: "0px 2.55px 12.74px 0px rgba(0,0,0,0.12)",
            }}
            labelStyle={{ color: d.chartTooltipLabel, fontWeight: 600 }}
            itemStyle={{ color: d.chartTooltipLabel }}
            formatter={(value: unknown) => [tooltipFormatter(Number(value)), "Revenue"]}
            labelFormatter={(label) => {
              const safeLabel =
                label !== undefined && label !== null
                  ? typeof label === "number"
                    ? label
                    : String(label)
                  : "";
              return tooltipLabelFormatter(safeLabel);
            }}
            cursor={{ stroke: d.chartCursor, strokeDasharray: "4 4" }}
          />
          <Area type="monotone" dataKey="value" fill={`url(#${gradientId})`} stroke="none" />
          <Line
            type="monotone"
            dataKey="value"
            stroke={d.chartLinePrimary}
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: activeDotR,
              fill: d.cardBg,
              stroke: d.chartLinePrimary,
              strokeWidth: 2,
            }}
          />
          <Line
            type="monotone"
            dataKey="value2"
            stroke={d.chartLineSecondary}
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: activeDotR,
              fill: d.cardBg,
              stroke: d.chartLineSecondary,
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
