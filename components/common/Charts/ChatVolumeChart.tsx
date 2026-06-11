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
import type { ChatVolumeChartProps } from "./ChatVolumeChart.types";
import { chatVolumeChartRoot } from "./ChatVolumeChart.styles";
import { useAppChartStyles } from "./useAppChartStyles";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DEFAULT_HEIGHT = 220;
const MARGIN_DESKTOP = { top: 16, right: 16, left: 8, bottom: 8 };
const MARGIN_MOBILE = { top: 12, right: 8, left: 4, bottom: 4 };
const X_TICKS = [1, 2, 3, 4, 5, 6, 7];

export function ChatVolumeChart({
  data,
  height = DEFAULT_HEIGHT,
  yDomain = [50, 200],
  yTickFormatter = (v) => String(v),
  tooltipFormatter = (v) => String(v),
  tooltipLabelFormatter = (day) => DAY_LABELS[Number(day) - 1] ?? String(day),
}: ChatVolumeChartProps) {
  const theme = useTheme();
  const chart = useAppChartStyles().chatVolume;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const margin = isMobile ? MARGIN_MOBILE : MARGIN_DESKTOP;
  const tickFontSize = isMobile ? 10 : 12;
  const gradientId = "chatVolumeGradient";

  return (
    <div style={chatVolumeChartRoot(height)}>
      <ResponsiveContainer width="100%" height="100%" minHeight={160}>
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
          <CartesianGrid
            stroke={chart.grid.stroke}
            strokeOpacity={chart.grid.strokeOpacity}
            strokeDasharray="0"
            vertical={chart.grid.vertical}
          />
          <XAxis
            dataKey="day"
            axisLine={chart.xAxis.axisLine}
            tickLine={chart.xAxis.tickLine}
            tick={{
              ...chart.xAxis.tick,
              fontSize: tickFontSize,
            }}
            ticks={X_TICKS}
            tickFormatter={(day) => DAY_LABELS[Number(day) - 1] ?? String(day)}
          />
          <YAxis
            domain={yDomain}
            axisLine={chart.yAxis.axisLine}
            tickLine={chart.yAxis.tickLine}
            tick={{
              ...chart.yAxis.tick,
              fontSize: tickFontSize,
            }}
            tickFormatter={yTickFormatter}
            width={isMobile ? 28 : 36}
          />
          <Tooltip
            contentStyle={chart.tooltipContent}
            labelStyle={chart.tooltipLabel}
            itemStyle={chart.tooltipItem}
            formatter={(value: unknown) => [tooltipFormatter(Number(value)), "Chats"]}
            labelFormatter={(label) => {
              const safe =
                label !== undefined && label !== null
                  ? typeof label === "number"
                    ? label
                    : String(label)
                  : "";
              return tooltipLabelFormatter(safe);
            }}
            cursor={chart.cursor}
          />
          <Area
            type="monotone"
            dataKey="value"
            fill={`url(#${gradientId})`}
            stroke="none"
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={chart.line.stroke}
            strokeWidth={chart.line.strokeWidth}
            dot={chart.line.dot}
            activeDot={chart.line.activeDot}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
