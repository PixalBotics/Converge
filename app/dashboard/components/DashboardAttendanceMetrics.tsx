"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import LoginOutlined from "@mui/icons-material/LoginOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import type { AppTheme } from "@/theme/theme";
import { MetricCard } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { DASHBOARD_WIDGET } from "@/lib/permissions/dashboard-widget-permissions";
import { OP, hasAttendanceSelfOperational } from "@/lib/permissions";
import { useTodayAttendanceRow } from "@/lib/hooks/query";
import { attendanceMetricsGrid } from "./dashboard-attendance-metrics.styles";

function formatTodayLabel(): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());
}

export function DashboardAttendanceMetrics() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();

  const canViewWidget = hasOperational(DASHBOARD_WIDGET.ATTENDANCE_SELF);

  const canFetchData =
    hasOperational(OP.hrms.attendance.selfView) ||
    hasAttendanceSelfOperational(hasOperational) ||
    hasOperational(OP.hrms.attendance.view);

  const canView = canViewWidget && canFetchData;

  const { headerTimes, dayState, isLoading } = useTodayAttendanceRow({ enabled: canView });

  if (!canView) return null;

  const todayLabel = formatTodayLabel();

  const checkInValue = headerTimes.checkIn ?? (isLoading ? "…" : "—");
  const checkOutValue =
    headerTimes.checkOut ?? (dayState.hasOpenSession ? "Active" : isLoading ? "…" : "—");

  const checkInSubtitle = isLoading
    ? "Loading today's attendance"
    : headerTimes.checkIn
      ? `Checked in · ${todayLabel}`
      : "Not checked in today";

  const checkOutSubtitle = isLoading
    ? "Loading today's attendance"
    : headerTimes.checkOut
      ? `Checked out · ${todayLabel}`
      : dayState.hasOpenSession
        ? "You're still checked in"
        : "Not checked out yet";

  return (
    <Box sx={attendanceMetricsGrid}>
      <MetricCard
        title="Check In"
        value={checkInValue}
        subtitle={checkInSubtitle}
        icon={<LoginOutlined sx={{ fontSize: 22 }} />}
        iconBgColor={theme.palette.success.main}
        valueColor="#86EFAC"
        showTrendArrow={false}
      />
      <MetricCard
        title="Check Out"
        value={checkOutValue}
        subtitle={checkOutSubtitle}
        icon={<LogoutOutlined sx={{ fontSize: 22 }} />}
        iconBgColor={theme.palette.warning.main}
        valueColor={dayState.hasOpenSession && !headerTimes.checkOut ? "#FCD34D" : "#FDBA74"}
        showTrendArrow={false}
      />
    </Box>
  );
}
