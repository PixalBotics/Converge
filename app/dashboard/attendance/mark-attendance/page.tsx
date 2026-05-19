"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { Typography, DashboardCard, Button, InputField } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesIconBox, rolesPageWrapper } from "../../roles/roles.styles";
import { pageWrapper } from "../../companies/overview.styles";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useAttendanceCheckInMutation, useAttendanceCheckOutMutation, useAttendanceMeQuery } from "@/lib/hooks/query";
import { isRecord, unwrapApiData } from "@/lib/utils/core";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions";
import NextLink from "next/link";
import {
  markAttendanceActionsSx,
  markAttendanceCardHeaderSx,
  markAttendanceFormGridSx,
  markAttendanceHeaderWrapSx,
  markAttendanceIconSx,
  markAttendanceSubtextSx,
} from "./mark-attendance.styles";

export default function MarkAttendancePage() {
  const { hasOperational } = useAuth();
  const canCheckIn = hasOperational(OP.hrms.attendance.checkIn);
  const canCheckOut = hasOperational(OP.hrms.attendance.checkOut);
  const [date] = useState(() => new Date().toISOString().slice(0, 10));
  const checkInMutation = useAttendanceCheckInMutation();
  const checkOutMutation = useAttendanceCheckOutMutation();
  const todayAttendanceQuery = useAttendanceMeQuery(
    { from: date, to: date, page: 1, limit: 1 },
    { enabled: Boolean(date.trim()) },
  );

  const hasOpenSession = useMemo(() => {
    const payload = unwrapApiData(todayAttendanceQuery.data);
    const source = Array.isArray(payload)
      ? payload
      : isRecord(payload) && Array.isArray(payload["items"])
        ? payload["items"]
        : [];
    if (!source.length) return false;
    const row = source.find((item) => isRecord(item)) as Record<string, unknown> | undefined;
    if (!row) return false;
    const checkInAt = typeof row["checkInAt"] === "string" ? row["checkInAt"].trim() : "";
    const checkOutAt = typeof row["checkOutAt"] === "string" ? row["checkOutAt"].trim() : "";
    const status = typeof row["status"] === "string" ? row["status"].trim().toLowerCase() : "";
    if (checkInAt && !checkOutAt) return true;
    if (status === "checked_in") return true;
    const segments = Array.isArray(row["segments"]) ? row["segments"] : [];
    const last = segments.length > 0 ? segments[segments.length - 1] : null;
    if (isRecord(last)) {
      const segIn = typeof last["checkInAt"] === "string" ? last["checkInAt"].trim() : "";
      const segOut = typeof last["checkOutAt"] === "string" ? last["checkOutAt"].trim() : "";
      if (segIn && !segOut) return true;
    }
    return false;
  }, [todayAttendanceQuery.data]);

  const handleCheckIn = () => {
    const d = date.trim();
    if (!d) {
      publishAppToast({ variant: "error", message: "Please select a date." });
      return;
    }
    checkInMutation.mutate(
      { date: d },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "Checked in." });
        },
        onError: (error) =>
          publishAppToast({
            variant: "error",
            message: extractApiErrorMessageForToast(error) ?? "Could not check in.",
          }),
      },
    );
  };

  const handleCheckOut = () => {
    const d = date.trim();
    if (!d) {
      publishAppToast({ variant: "error", message: "Please select a date." });
      return;
    }
    checkOutMutation.mutate(
      { date: d },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "Checked out." });
        },
        onError: (error) =>
          publishAppToast({
            variant: "error",
            message: extractApiErrorMessageForToast(error) ?? "Could not check out.",
          }),
      },
    );
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={markAttendanceHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Mark Attendance
        </Typography>
        <Typography variant="body2" sx={markAttendanceSubtextSx}>
          Check in/out for your own user (HRMS Attendance).
        </Typography>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={markAttendanceCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={markAttendanceIconSx} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Mark Attendance
          </Typography>
        </Box>

        <Box sx={markAttendanceFormGridSx}>
          <InputField
            label="Date"
            type="date"
            value={date}
            readOnly
            inputProps={{ readOnly: true }}
          />
        </Box>

        <Box sx={markAttendanceActionsSx}>
          <Button variant="secondary" component={NextLink} href="/dashboard/attendance/my-attendance">
            Back
          </Button>
          {canCheckIn ? (
            <Button
              variant="secondary"
              disabled={checkInMutation.isPending || checkOutMutation.isPending || todayAttendanceQuery.isFetching || hasOpenSession}
              onClick={handleCheckIn}
            >
              {checkInMutation.isPending ? "Checking in…" : "Check in"}
            </Button>
          ) : null}
          {hasOpenSession && canCheckOut ? (
            <Button
              variant="primary"
              sx={gradientPrimaryButtonSx}
              disabled={checkInMutation.isPending || checkOutMutation.isPending || todayAttendanceQuery.isFetching}
              onClick={handleCheckOut}
            >
              {checkOutMutation.isPending ? "Checking out…" : "Check out"}
            </Button>
          ) : null}
        </Box>
      </DashboardCard>
    </Box>
  );
}
