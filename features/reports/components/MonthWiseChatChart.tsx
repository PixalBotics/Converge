"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import type { MonthWiseChatCountResponse } from "@/api/reports/reports.types";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function MonthWiseChatChart({ data }: { data: MonthWiseChatCountResponse }) {
  const theme = useTheme() as AppTheme;
  const { chart, reportMetadata } = data;

  const chartData = chart.categories.map((category, index) => {
    const point: Record<string, string | number> = { month: category };
    for (const series of chart.series) {
      point[series.key] = series.data[index] ?? 0;
    }
    return point;
  });

  return (
    <DashboardCard sx={{ p: 2 }}>
      <Typography fontWeight={700}>{reportMetadata.title}</Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 2 }}>
        {reportMetadata.companyName} — {reportMetadata.period.label}
      </Typography>
      <Box sx={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.app.dashboard.shellBorder} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              scale="log"
              domain={["auto", "auto"]}
              allowDataOverflow
              tick={{ fontSize: 12 }}
              label={{ value: chart.yAxis.title, angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
            />
            <Tooltip />
            <Legend />
            {chart.series.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.name}
                stroke={series.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
}
