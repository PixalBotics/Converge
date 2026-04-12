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
import { revenueLineChartRoot } from "./RevenueLineChart.styles";
import { useAppChartStyles } from "./useAppChartStyles";

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
  const chart = useAppChartStyles().revenue;
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
              {chart.gradientStops.map((stop, i) => (
                <stop
                  key={i}
                  offset={stop.offset}
                  stopColor={stop.stopColor}
                  stopOpacity={stop.stopOpacity}
                />
              ))}
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chart.gridStroke} vertical={false} />
          <XAxis
            dataKey="day"
            stroke={chart.xAxis.stroke}
            tick={{ ...chart.xAxis.tick, fontSize: tickFontSize }}
            tickLine={chart.xAxis.tickLine}
            axisLine={chart.xAxis.axisLine}
            ticks={xTicks}
          />
          <YAxis
            stroke={chart.yAxis.stroke}
            tick={{ ...chart.yAxis.tick, fontSize: tickFontSize }}
            tickLine={chart.yAxis.tickLine}
            axisLine={chart.yAxis.axisLine}
            domain={yDomain}
            tickFormatter={yTickFormatter}
            width={isMobile ? 32 : 40}
          />
          <Tooltip
            contentStyle={chart.tooltipContent}
            labelStyle={chart.tooltipLabel}
            itemStyle={chart.tooltipItem}
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
            cursor={chart.cursor}
          />
          <Area type="monotone" dataKey="value" fill={`url(#${gradientId})`} stroke="none" />
          <Line
            type="monotone"
            dataKey="value"
            stroke={chart.line1.stroke}
            strokeWidth={chart.line1.strokeWidth}
            dot={chart.line1.dot}
            activeDot={{ ...chart.line1.activeDot, r: activeDotR }}
          />
          <Line
            type="monotone"
            dataKey="value2"
            stroke={chart.line2.stroke}
            strokeWidth={chart.line2.strokeWidth}
            dot={chart.line2.dot}
            activeDot={{ ...chart.line2.activeDot, r: activeDotR }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
