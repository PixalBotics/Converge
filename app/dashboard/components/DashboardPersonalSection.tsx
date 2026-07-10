"use client";

import Box from "@mui/material/Box";
import { useAuth } from "@/lib/auth";
import { OP, hasAttendanceSelfOperational } from "@/lib/permissions";
import { DashboardAttendanceMetrics } from "./DashboardAttendanceMetrics";
import { DashboardMyLeave } from "./DashboardMyLeave";
import { dashboardPersonalStack } from "../dashboard.styles";

export function DashboardPersonalSection() {
  const { hasOperational } = useAuth();

  const canViewAttendance =
    hasOperational(OP.hrms.attendance.selfView) ||
    hasAttendanceSelfOperational(hasOperational) ||
    hasOperational(OP.hrms.attendance.view);

  const canViewLeave = hasOperational(OP.hrms.leave.apply);

  if (!canViewAttendance && !canViewLeave) return null;

  return (
    <Box sx={dashboardPersonalStack}>
      {canViewAttendance ? <DashboardAttendanceMetrics /> : null}
      {canViewLeave ? <DashboardMyLeave /> : null}
    </Box>
  );
}
