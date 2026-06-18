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
import {
  useAttendanceBreakInMutation,
  useAttendanceBreakOutMutation,
  useAttendanceCheckInMutation,
  useAttendanceCheckOutMutation,
  useAttendanceMeQuery,
} from "@/lib/hooks/query";
import { isRecord, unwrapApiData } from "@/lib/utils/core";
import {
  formatAttendanceStatus,
  formatBreakSummary,
  parseAttendanceDayState,
} from "@/lib/utils/hrms/attendance-display";
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

function firstTodayRow(data: unknown): Record<string, unknown> | null {
  const payload = unwrapApiData(data);
  const source = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload["items"])
      ? payload["items"]
      : [];
  const row = source.find((item) => isRecord(item));
  return row && isRecord(row) ? row : null;
}

export default function MarkAttendancePage() {
  const { hasOperational } = useAuth();
  const canCheckIn =
    hasOperational(OP.hrms.attendance.checkIn) || hasOperational(OP.hrms.attendance.self);
  const canCheckOut =
    hasOperational(OP.hrms.attendance.checkOut) || hasOperational(OP.hrms.attendance.self);
  const canBreakIn =
    hasOperational(OP.hrms.attendance.breakIn) || hasOperational(OP.hrms.attendance.self);
  const canBreakOut =
    hasOperational(OP.hrms.attendance.breakOut) || hasOperational(OP.hrms.attendance.self);
  const [date] = useState(() => new Date().toISOString().slice(0, 10));
  const checkInMutation = useAttendanceCheckInMutation();
  const checkOutMutation = useAttendanceCheckOutMutation();
  const breakInMutation = useAttendanceBreakInMutation();
  const breakOutMutation = useAttendanceBreakOutMutation();
  const todayAttendanceQuery = useAttendanceMeQuery(
    { from: date, to: date, page: 1, limit: 1 },
    { enabled: Boolean(date.trim()) },
  );

  const dayState = useMemo(
    () => parseAttendanceDayState(firstTodayRow(todayAttendanceQuery.data) ?? {}),
    [todayAttendanceQuery.data],
  );

  const statusLabel = useMemo(() => {
    const row = firstTodayRow(todayAttendanceQuery.data);
    const raw = row && typeof row["status"] === "string" ? row["status"] : "";
    if (raw.trim()) return formatAttendanceStatus(raw);
    if (dayState.isOnBreak) return "On break";
    if (dayState.hasOpenSession) return "Checked in";
    return "Not checked in";
  }, [todayAttendanceQuery.data, dayState.isOnBreak, dayState.hasOpenSession]);

  const breakSummary = useMemo(
    () =>
      formatBreakSummary(
        dayState.breakMinutesTaken,
        dayState.breakMinutesAllowed,
        dayState.overBreakMinutes,
      ),
    [dayState.breakMinutesTaken, dayState.breakMinutesAllowed, dayState.overBreakMinutes],
  );

  const isBusy =
    checkInMutation.isPending ||
    checkOutMutation.isPending ||
    breakInMutation.isPending ||
    breakOutMutation.isPending ||
    todayAttendanceQuery.isFetching;

  const mutateWithToast = (
    mutate: (opts: { onSuccess: () => void; onError: (e: unknown) => void }) => void,
    successMessage: string,
    errorFallback: string,
  ) => {
    mutate({
      onSuccess: () => publishAppToast({ variant: "success", message: successMessage }),
      onError: (error) =>
        publishAppToast({
          variant: "error",
          message: extractApiErrorMessageForToast(error) ?? errorFallback,
        }),
    });
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={markAttendanceHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Mark Attendance
        </Typography>
        <Typography variant="body2" sx={markAttendanceSubtextSx}>
          Check in/out and manage breaks for today (shift timezone).
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
          <InputField label="Status" value={statusLabel} readOnly inputProps={{ readOnly: true }} />
          <InputField label="Break today" value={breakSummary} readOnly inputProps={{ readOnly: true }} />
        </Box>

        <Box sx={markAttendanceActionsSx}>
          <Button variant="secondary" component={NextLink} href="/dashboard/attendance/my-attendance">
            Back
          </Button>
          {canCheckIn ? (
            <Button
              variant="secondary"
              disabled={isBusy || dayState.hasOpenSession}
              onClick={() =>
                mutateWithToast(
                  (opts) => checkInMutation.mutate(undefined, opts),
                  "Checked in.",
                  "Could not check in.",
                )
              }
            >
              {checkInMutation.isPending ? "Checking in…" : "Check in"}
            </Button>
          ) : null}
          {dayState.hasOpenSession && !dayState.isOnBreak && canBreakIn ? (
            <Button
              variant="secondary"
              disabled={isBusy}
              onClick={() =>
                mutateWithToast(
                  (opts) => breakInMutation.mutate(undefined, opts),
                  "Break started.",
                  "Could not start break.",
                )
              }
            >
              {breakInMutation.isPending ? "Starting break…" : "Start break"}
            </Button>
          ) : null}
          {dayState.hasOpenSession && dayState.isOnBreak && canBreakOut ? (
            <Button
              variant="secondary"
              disabled={isBusy}
              onClick={() =>
                mutateWithToast(
                  (opts) => breakOutMutation.mutate(undefined, opts),
                  "Break ended.",
                  "Could not end break.",
                )
              }
            >
              {breakOutMutation.isPending ? "Ending break…" : "End break"}
            </Button>
          ) : null}
          {dayState.hasOpenSession && canCheckOut ? (
            <Button
              variant="primary"
              sx={gradientPrimaryButtonSx}
              disabled={isBusy}
              onClick={() =>
                mutateWithToast(
                  (opts) => checkOutMutation.mutate(undefined, opts),
                  "Checked out.",
                  "Could not check out.",
                )
              }
            >
              {checkOutMutation.isPending ? "Checking out…" : "Check out"}
            </Button>
          ) : null}
        </Box>
      </DashboardCard>
    </Box>
  );
}
