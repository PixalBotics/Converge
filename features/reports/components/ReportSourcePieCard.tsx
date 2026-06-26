"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import { useAppChartStyles } from "@/components/common/Charts/useAppChartStyles";
import { departmentPieChartRoot } from "@/components/common/Charts/DepartmentPieChart.styles";

const SOURCE_PIE_COLORS = ["#4472C4", "#C00000", "#843C0C", "#70AD47", "#FFC000", "#5B9BD5"] as const;

type SourceRow = { source: string; value: number; percentage: number };

type PieDatum = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

function toPieData(rows: SourceRow[]): PieDatum[] {
  return rows.map((row, index) => ({
    name: row.source,
    value: row.value,
    percentage: row.percentage,
    color: SOURCE_PIE_COLORS[index % SOURCE_PIE_COLORS.length],
  }));
}

export type ReportSourcePieCardProps = {
  title: string;
  icon: React.ReactNode;
  rows: SourceRow[];
};

export function ReportSourcePieCard({ title, icon, rows }: ReportSourcePieCardProps) {
  const theme = useTheme() as AppTheme;
  const chart = useAppChartStyles();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pieData = toPieData(rows);
  const innerR = isMobile ? 44 : 58;
  const outerR = isMobile ? 72 : 96;

  return (
    <DashboardCard sx={{ p: 2, height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 1.25,
            color: theme.app.dashboard.accentBlue,
            bgcolor: theme.app.dashboard.pillBg,
            border: `1px solid ${theme.app.dashboard.shellBorder}`,
          }}
        >
          {icon}
        </Box>
        <Typography fontWeight={700} sx={{ fontSize: 15 }}>
          {title}
        </Typography>
      </Box>

      {rows.length === 0 ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          No data for this period.
        </Typography>
      ) : (
        <>
          <div style={departmentPieChartRoot(260)}>
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerR}
                  outerRadius={outerR}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  labelLine={{ stroke: chart.pie.labelLineStroke, strokeWidth: 1 }}
                  label={(props: PieLabelRenderProps) => {
                    const datum = pieData[props.index ?? 0];
                    if (!datum || datum.percentage < 8) return null;
                    const cx = Number(props.cx ?? 0);
                    const cy = Number(props.cy ?? 0);
                    const midAngle = Number(props.midAngle ?? 0);
                    const ir = Number(props.innerRadius ?? 0);
                    const or = Number(props.outerRadius ?? 0);
                    const RADIAN = Math.PI / 180;
                    const radius = ir + (or - ir) * 0.58;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill={chart.pie.labelFill}
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        fontSize={11}
                        fontWeight={500}
                      >
                        {`${datum.percentage.toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={chart.pie.tooltipContent}
                  formatter={(value: unknown, _name, item) => {
                    const pct = (item?.payload as PieDatum | undefined)?.percentage;
                    const count = Number(value);
                    return [
                      `${count.toLocaleString()}${pct != null ? ` (${pct.toFixed(1)}%)` : ""}`,
                      String(item?.payload?.name ?? ""),
                    ];
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span style={{ color: theme.app.text.primary, fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
            {rows.map((row, index) => (
              <Box
                key={row.source}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  py: 0.35,
                  borderBottom: `1px solid ${theme.app.dashboard.shellBorder}`,
                  "&:last-child": { borderBottom: 0 },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      flexShrink: 0,
                      bgcolor: SOURCE_PIE_COLORS[index % SOURCE_PIE_COLORS.length],
                    }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 0 }} noWrap title={row.source}>
                    {row.source}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600} sx={{ flexShrink: 0 }}>
                  {row.value.toLocaleString()} ({row.percentage.toFixed(1)}%)
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </DashboardCard>
  );
}
