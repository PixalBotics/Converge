"use client";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { DepartmentPieChartProps } from "./DepartmentPieChart.types";
import {
  departmentPieChartRoot,
  departmentPieChartTooltipContent,
} from "./DepartmentPieChart.styles";

const DEFAULT_HEIGHT = 280;

export function DepartmentPieChart({
  data,
  height = DEFAULT_HEIGHT,
  innerRadius = 60,
  outerRadius = 100,
  paddingAngle = 2,
  labelFormatter = (name, value) => `${value}% ${name}`,
  tooltipFormatter = (value) => `${Number(value)}%`,
}: DepartmentPieChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const innerR = isMobile ? 40 : innerRadius;
  const outerR = isMobile ? 70 : outerRadius;

  return (
    <div style={departmentPieChartRoot(height)}>
      <ResponsiveContainer width="100%" height="100%" minHeight={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerR}
            outerRadius={outerR}
            paddingAngle={paddingAngle}
            dataKey="value"
            label={({ name, value }) => labelFormatter(name ?? "", Number(value ?? 0))}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={departmentPieChartTooltipContent}
            formatter={(value: unknown) => [tooltipFormatter(Number(value)), ""]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
