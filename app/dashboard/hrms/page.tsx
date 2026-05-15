"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  PendingActions as PendingActionsIcon,
} from "@mui/icons-material";
import { MetricCard } from "@/components/layout/dashboard";
import {
  Typography,
  Dropdown,
  DashboardCard,
  SegmentedControl,
  ChatAnalyticsBarChart,
  ChatVolumeChart,
  Button,
} from "@/components/common";
import {
  pageWrapper,
  headerRow,
  metricGrid,
  chartGrid,
  lowerGrid,
  chartCard,
  chartHeaderRow,
  chartTitleRow,
  chartIcon,
  segmentedWrap,
  approvalsList,
  approvalRow,
  approvalActions,
  approveButtonSx,
  rejectButtonSx,
  statusPill,
} from "./hrms.styles";
import { last30DaysButton } from "../dashboard.styles";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions";

const DATE_RANGE_OPTIONS = ["Last 7 Days", "Last 30 Days", "Last 90 Days"];

const departmentPerformanceData = [
  { name: "Mon", value: 58, fill: "first" as const },
  { name: "Tue", value: 38, fill: "second" as const },
  { name: "Wed", value: 55, fill: "first" as const },
  { name: "Thu", value: 82, fill: "second" as const },
  { name: "Fri", value: 105, fill: "second" as const },
  { name: "Sat", value: 67, fill: "first" as const },
  { name: "Sun", value: 45, fill: "second" as const },
];

const attendanceTrendData = [
  { day: 1, value: 85 },
  { day: 2, value: 104 },
  { day: 3, value: 92 },
  { day: 4, value: 128 },
  { day: 5, value: 119 },
  { day: 6, value: 140 },
  { day: 7, value: 101 },
];

const attendanceList = [
  { name: "John Doe", time: "9:01 AM", status: "Present", bg: "rgba(34,197,94,0.22)", text: "#22C55E", border: "rgba(34,197,94,0.45)" },
  { name: "Sarah Smith", time: "9:16 AM", status: "Present", bg: "rgba(34,197,94,0.22)", text: "#22C55E", border: "rgba(34,197,94,0.45)" },
  { name: "Mike Johnson", time: "10:36 AM", status: "Late", bg: "rgba(249,115,22,0.24)", text: "#FB923C", border: "rgba(249,115,22,0.45)" },
  { name: "Emily Davis", time: "9:05 AM", status: "Present", bg: "rgba(34,197,94,0.22)", text: "#22C55E", border: "rgba(34,197,94,0.45)" },
  { name: "Luke Anderson", time: "10:12 AM", status: "Late", bg: "rgba(249,115,22,0.24)", text: "#FB923C", border: "rgba(249,115,22,0.45)" },
];

const pendingApprovals = [
  { name: "Alex Brown", leave: "Sick Leave", days: "3 days", status: "Pending" },
  { name: "Jessica Wilson", leave: "Sick Leave", days: "1 day", status: "Pending" },
  { name: "Michael Clark", leave: "Annual Leave", days: "2 days", status: "Pending" },
];

export default function HrmsDashboardPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canManageLeaveApprovals =
    hasOperational(OP.hrms.leave.approve) ||
    hasOperational(OP.hrms.leave.view) ||
    hasOperational(OP.hrms.leave.approvePool) ||
    hasOperational(OP.hrms.leave.approveDepartment);
  const [dateRange, setDateRange] = useState("Last 30 Days");

  return (
    <Box sx={pageWrapper}>
      <Box sx={headerRow}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Overview
        </Typography>
        <Dropdown
          id="date-range-hrms"
          options={DATE_RANGE_OPTIONS}
          value={dateRange}
          onChange={setDateRange}
          buttonSx={last30DaysButton}
          endIcon="▾"
        />
      </Box>

      <Box sx={metricGrid}>
        <MetricCard
          title="Today Attendance Status"
          value="23,0989"
          subtitle="Out of 35 total agents"
          icon={<BarChartIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          valueColor={theme.app.dashboard.accentCyan}
        />
        <MetricCard
          title="Pending Leave Requests"
          value="89"
          subtitle="Average 2.5 per agent"
          icon={<BarChartIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentOrange}
          valueColor={theme.app.dashboard.accentOrange}
        />
        <MetricCard
          title="Total Employees"
          value="1m 24s"
          subtitle="Longest wait: 3m 12s"
          icon={<BarChartIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentPurple}
          valueColor={theme.app.dashboard.accentPurple}
        />
        <MetricCard
          title="Upcoming Leaves"
          value="4 Critical"
          subtitle="Requires immediate attention"
          icon={<BarChartIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentPink}
          valueColor={theme.app.dashboard.accentPink}
          subtitleColor={theme.app.dashboard.accentPink}
        />
      </Box>

      <Box sx={chartGrid}>
        <DashboardCard sx={chartCard}>
          <Box sx={chartHeaderRow}>
            <Box sx={chartTitleRow}>
              <Box sx={chartIcon}>
                <BarChartIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="subtitle1" color="white" fontWeight={600}>
                Department Performance
              </Typography>
            </Box>
            <Box sx={segmentedWrap}>
              <SegmentedControl
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "week", label: "last 7 Days" },
                ]}
                value="week"
                onChange={() => {}}
              />
            </Box>
          </Box>
          <Box sx={{ minHeight: 320 }}>
            <ChatAnalyticsBarChart
              data={departmentPerformanceData}
              height={320}
              yDomain={[0, 120]}
              yTickFormatter={(v) => String(v)}
              tooltipFormatter={(v) => `$${v}k`}
            />
          </Box>
        </DashboardCard>

        <DashboardCard sx={chartCard}>
          <Box sx={chartHeaderRow}>
            <Box sx={chartTitleRow}>
              <Box sx={chartIcon}>
                <TimelineIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="subtitle1" color="white" fontWeight={600}>
                Attendance Trend
              </Typography>
            </Box>
          </Box>
          <Box sx={{ minHeight: 320 }}>
            <ChatVolumeChart
              data={attendanceTrendData}
              height={320}
              yDomain={[60, 160]}
              yTickFormatter={(v) => String(v)}
              tooltipFormatter={(v) => `${v}`}
            />
          </Box>
        </DashboardCard>
      </Box>

      <Box sx={lowerGrid}>
        <DashboardCard sx={chartCard}>
          <Box sx={chartHeaderRow}>
            <Box sx={chartTitleRow}>
              <Box sx={chartIcon}>
                <TimelineIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="subtitle1" color="white" fontWeight={600}>
                Attendance Log
              </Typography>
            </Box>
          </Box>

          <Box sx={approvalsList}>
            {attendanceList.map((entry) => (
              <Box key={`${entry.name}-${entry.time}`} sx={approvalRow}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                  <Box>
                    <Typography variant="body2" color="white" fontWeight={600}>
                      {entry.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.app.dashboard.white60 }}>
                      {entry.time}
                    </Typography>
                  </Box>
                  <Box sx={statusPill(entry.bg, entry.text, entry.border)}>
                    {entry.status}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </DashboardCard>

        <DashboardCard sx={chartCard}>
          <Box sx={chartHeaderRow}>
            <Box sx={chartTitleRow}>
              <Box sx={chartIcon}>
                <PendingActionsIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="subtitle1" color="white" fontWeight={600}>
                Pending Approvals
              </Typography>
            </Box>
          </Box>

          <Box sx={approvalsList}>
            {pendingApprovals.map((entry) => (
              <Box key={`${entry.name}-${entry.leave}`} sx={approvalRow}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                  <Box>
                    <Typography variant="body2" color="white" fontWeight={600}>
                      {entry.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.app.dashboard.white60 }}>
                      {entry.leave} - {entry.days}
                    </Typography>
                  </Box>
                  <Box sx={statusPill("rgba(245,158,11,0.24)", "#FBBF24", "rgba(245,158,11,0.45)")}>
                    {entry.status}
                  </Box>
                </Box>
                <Box sx={approvalActions}>
                  <Button variant="primary" sx={approveButtonSx} disabled={!canManageLeaveApprovals}>
                    Approve
                  </Button>
                  <Button variant="outlined" sx={rejectButtonSx} disabled={!canManageLeaveApprovals}>
                    Reject
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </DashboardCard>
      </Box>
    </Box>
  );
}

