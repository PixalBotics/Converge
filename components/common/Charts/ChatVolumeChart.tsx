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
import type { ChatVolumeChartProps } from "./ChatVolumeChart.types";
import { chatVolumeChartRoot } from "./ChatVolumeChart.styles";

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
  const theme = useTheme() as AppTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const d = theme.app.dashboard;
  const margin = isMobile ? MARGIN_MOBILE : MARGIN_DESKTOP;
  const tickFontSize = isMobile ? 10 : 12;
  const gradientId = "chatVolumeGradient";

  const gradientStops = [
    { offset: "0%", stopColor: d.chartAreaStopTop, stopOpacity: 1 },
    { offset: "55%", stopColor: d.chartAreaStopMid, stopOpacity: 1 },
    { offset: "100%", stopColor: d.chartAreaStopBottom, stopOpacity: 0 },
  ];

  const lineStroke = d.chartLinePrimary;
  const dotFill = d.cardBg;

  return (
    <div style={chatVolumeChartRoot(height)}>
      <ResponsiveContainer width="100%" height="100%" minHeight={160}>
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
            tickLine={false}
            axisLine={{ stroke: d.chartAxisStroke }}
            tick={{ fill: d.chartTickFill, fontSize: tickFontSize }}
            ticks={X_TICKS}
            tickFormatter={(day) => DAY_LABELS[Number(day) - 1] ?? String(day)}
          />
          <YAxis
            domain={yDomain}
            stroke={d.chartAxisStroke}
            tickLine={false}
            axisLine={{ stroke: d.chartAxisStroke }}
            tick={{ fill: d.chartTickFill, fontSize: tickFontSize }}
            tickFormatter={yTickFormatter}
            width={isMobile ? 28 : 36}
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
            cursor={{ stroke: d.chartCursor, strokeDasharray: "4 4" }}
          />
          <Area type="monotone" dataKey="value" fill={`url(#${gradientId})`} stroke="none" />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineStroke}
            strokeWidth={2.5}
            dot={{
              r: 4,
              fill: dotFill,
              stroke: lineStroke,
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: dotFill,
              stroke: lineStroke,
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
