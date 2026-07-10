"use client";

import Box from "@mui/material/Box";
import { useAuth } from "@/lib/auth";
import { DASHBOARD_WIDGET } from "@/lib/permissions/dashboard-widget-permissions";
import { OP, hasAttendanceSelfOperational } from "@/lib/permissions";
import { DashboardAttendanceMetrics } from "./DashboardAttendanceMetrics";
import { DashboardMyLeave } from "./DashboardMyLeave";

export function DashboardPersonalSection() {
  const { hasOperational } = useAuth();

  const canViewAttendance =
    hasOperational(DASHBOARD_WIDGET.ATTENDANCE_SELF) &&
    (hasOperational(OP.hrms.attendance.selfView) ||
      hasAttendanceSelfOperational(hasOperational) ||
      hasOperational(OP.hrms.attendance.view));

  const canViewLeave = hasOperational(OP.hrms.leave.apply);

  if (!canViewAttendance && !canViewLeave) return null;

  return (
    <Box sx={{ mb: 3 }}>
      {canViewAttendance ? <DashboardAttendanceMetrics /> : null}
      {canViewLeave ? <DashboardMyLeave /> : null}
    </Box>
  );
}
