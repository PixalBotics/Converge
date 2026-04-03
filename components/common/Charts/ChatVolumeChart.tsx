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
import {
  chatVolumeChartRoot,
  chatVolumeChartGrid,
  chatVolumeChartXAxis,
  chatVolumeChartYAxis,
  chatVolumeChartTooltipContent,
  chatVolumeChartTooltipLabel,
  chatVolumeChartTooltipItem,
  chatVolumeChartCursor,
  chatVolumeChartGradientStops,
  chatVolumeChartLine,
} from "./ChatVolumeChart.styles";

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
              {chatVolumeChartGradientStops.map((stop, i) => (
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
            stroke={chatVolumeChartGrid.stroke}
            strokeOpacity={chatVolumeChartGrid.strokeOpacity}
            strokeDasharray="0"
            vertical={chatVolumeChartGrid.vertical}
          />
          <XAxis
            dataKey="day"
            axisLine={chatVolumeChartXAxis.axisLine}
            tickLine={chatVolumeChartXAxis.tickLine}
            tick={{
              ...chatVolumeChartXAxis.tick,
              fontSize: tickFontSize,
            }}
            ticks={X_TICKS}
            tickFormatter={(day) => DAY_LABELS[Number(day) - 1] ?? String(day)}
          />
          <YAxis
            domain={yDomain}
            axisLine={chatVolumeChartYAxis.axisLine}
            tickLine={chatVolumeChartYAxis.tickLine}
            tick={{
              ...chatVolumeChartYAxis.tick,
              fontSize: tickFontSize,
            }}
            tickFormatter={yTickFormatter}
            width={isMobile ? 28 : 36}
          />
          <Tooltip
            contentStyle={chatVolumeChartTooltipContent}
            labelStyle={chatVolumeChartTooltipLabel}
            itemStyle={chatVolumeChartTooltipItem}
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
            cursor={chatVolumeChartCursor}
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
            stroke={chatVolumeChartLine.stroke}
            strokeWidth={chatVolumeChartLine.strokeWidth}
            dot={chatVolumeChartLine.dot}
            activeDot={chatVolumeChartLine.activeDot}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
