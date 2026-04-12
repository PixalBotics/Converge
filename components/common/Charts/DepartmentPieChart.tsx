"use client";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";
import type { DepartmentPieChartProps } from "./DepartmentPieChart.types";
import { departmentPieChartRoot } from "./DepartmentPieChart.styles";
import { useAppChartStyles } from "./useAppChartStyles";

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
  const chart = useAppChartStyles();
  const pieTooltip = chart.pie.tooltipContent;
  const { labelFill, labelLineStroke } = chart.pie;
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
            labelLine={{ stroke: labelLineStroke, strokeWidth: 1 }}
            label={(props: PieLabelRenderProps) => {
              const cx = Number(props.cx ?? 0);
              const cy = Number(props.cy ?? 0);
              const midAngle = Number(props.midAngle ?? 0);
              const ir = Number(props.innerRadius ?? 0);
              const or = Number(props.outerRadius ?? 0);
              const RADIAN = Math.PI / 180;
              const radius = ir + (or - ir) * 0.55;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              return (
                <text
                  x={x}
                  y={y}
                  fill={labelFill}
                  textAnchor={x > cx ? "start" : "end"}
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={500}
                >
                  {labelFormatter(String(props.name ?? ""), Number(props.value ?? 0))}
                </text>
              );
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={pieTooltip}
            formatter={(value: unknown) => [tooltipFormatter(Number(value)), ""]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
