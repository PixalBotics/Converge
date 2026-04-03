"use client";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { AppTheme } from "@/theme/theme";
import type { DepartmentPieChartProps } from "./DepartmentPieChart.types";
import { departmentPieChartRoot } from "./DepartmentPieChart.styles";

const DEFAULT_HEIGHT = 280;


type PieLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  name?: string;
  value?: number;
};

function renderOutsideLabel(
  props: PieLabelProps,
  format: (name: string, value: number) => string,
  labelFill: string
) {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, name, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 4) * cos;
  const sy = cy + (outerRadius + 4) * sin;
  const mx = cx + (outerRadius + 10) * cos;
  const my = cy + (outerRadius + 10) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 12;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";
  return (
    <g>
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={labelFill}
        fill="none"
        strokeWidth={0.8}
        opacity={0.7}
      />
      <text
        x={ex + (cos >= 0 ? 2 : -2)}
        y={ey}
        dy={4}
        textAnchor={textAnchor}
        fill={labelFill}
        fontSize={11}
        fontWeight={600}
      >
        {format(String(name ?? ""), Number(value ?? 0))}
      </text>
    </g>
  );
}

export function DepartmentPieChart({
  data,
  height = DEFAULT_HEIGHT,
  innerRadius = 60,
  outerRadius = 100,
  paddingAngle = 2,
  labelFormatter = (name, value) => `${value}% ${name}`,
  tooltipFormatter = (value) => `${Number(value)}%`,
}: DepartmentPieChartProps) {
  const theme = useTheme() as AppTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const d = theme.app.dashboard;
  const labelFill = d.chartTickFill;
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
            label={(props) =>
              renderOutsideLabel(props as PieLabelProps, (n, v) => labelFormatter(n, v), labelFill)
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: d.chartTooltipBg,
              border: `1px solid ${d.chartTooltipBorder}`,
              borderRadius: 8,
            }}
            labelStyle={{ color: d.chartTooltipLabel }}
            itemStyle={{ color: d.chartTooltipLabel }}
            formatter={(value: unknown) => [tooltipFormatter(Number(value)), ""]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
