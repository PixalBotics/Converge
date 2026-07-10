"use client";

import { useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import {
  LoginOutlined as LoginOutlinedIcon,
  LogoutOutlined as LogoutOutlinedIcon,
} from "@mui/icons-material";
import { Button } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP, hasAttendanceSelfOperational } from "@/lib/permissions";
import {
  useAttendanceCheckInMutation,
  useAttendanceCheckOutMutation,
  useTodayAttendanceRow,
} from "@/lib/hooks/query";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";

export function DashboardHeaderCheckInButton() {
  const { hasOperational } = useAuth();

  const canCheckIn =
    hasOperational(OP.hrms.attendance.checkIn) || hasAttendanceSelfOperational(hasOperational);
  const canCheckOut =
    hasOperational(OP.hrms.attendance.checkOut) || hasAttendanceSelfOperational(hasOperational);
  const show = canCheckIn || canCheckOut;

  const { dayState, isLoading } = useTodayAttendanceRow({ enabled: show });
  const checkInMutation = useAttendanceCheckInMutation();
  const checkOutMutation = useAttendanceCheckOutMutation();

  const isBusy =
    checkInMutation.isPending || checkOutMutation.isPending || isLoading;

  const mutateWithToast = useCallback(
    (
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
    },
    [],
  );

  const handleClick = useCallback(() => {
    if (dayState.hasOpenSession) {
      if (!canCheckOut || isBusy) return;
      mutateWithToast(
        (opts) => checkOutMutation.mutate(undefined, opts),
        "Checked out.",
        "Could not check out.",
      );
      return;
    }
    if (!canCheckIn || isBusy) return;
    mutateWithToast(
      (opts) => checkInMutation.mutate(undefined, opts),
      "Checked in.",
      "Could not check in.",
    );
  }, [
    canCheckIn,
    canCheckOut,
    checkInMutation,
    checkOutMutation,
    dayState.hasOpenSession,
    isBusy,
    mutateWithToast,
  ]);

  const label = useMemo(() => {
    if (checkInMutation.isPending) return "Checking in…";
    if (checkOutMutation.isPending) return "Checking out…";
    return dayState.hasOpenSession ? "Check-out" : "Check-in";
  }, [checkInMutation.isPending, checkOutMutation.isPending, dayState.hasOpenSession]);

  const shortLabel = useMemo(() => {
    if (checkInMutation.isPending) return "…";
    if (checkOutMutation.isPending) return "…";
    return dayState.hasOpenSession ? "Out" : "In";
  }, [checkInMutation.isPending, checkOutMutation.isPending, dayState.hasOpenSession]);

  const disabled = isBusy || (dayState.hasOpenSession ? !canCheckOut : !canCheckIn);

  if (!show) return null;

  const Icon = dayState.hasOpenSession ? LogoutOutlinedIcon : LoginOutlinedIcon;

  return (
    <Button
      variant="secondary"
      size="compact"
      disabled={disabled}
      onClick={handleClick}
      startIcon={<Icon />}
      aria-label={label}
      sx={{
        minWidth: { xs: 40, sm: 112 },
        px: { xs: 1, sm: "18px" },
        flexShrink: 0,
      }}
    >
      <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
        {label}
      </Box>
      <Box component="span" sx={{ display: { xs: "inline", sm: "none" }, fontSize: 13 }}>
        {shortLabel}
      </Box>
    </Button>
  );
}
