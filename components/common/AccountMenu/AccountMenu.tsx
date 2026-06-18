"use client";

import { useCallback, useEffect, useMemo } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Login as LoginIcon,
  LoginOutlined as LoginOutlinedIcon,
  LogoutOutlined as LogoutOutlinedIcon,
  FreeBreakfastOutlined as FreeBreakfastOutlinedIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
} from "@mui/icons-material";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { AccountMenuProps } from "./AccountMenu.types";
import {
  AccountMenuIconWrap,
  accountMenuBreakIconWrapSx,
  accountMenuCheckIconWrapSx,
  accountMenuRowSx,
} from "./AccountMenu.styled";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions";
import {
  useAttendanceBreakInMutation,
  useAttendanceBreakOutMutation,
  useAttendanceCheckInMutation,
  useAttendanceCheckOutMutation,
  useAttendanceMeQuery,
} from "@/lib/hooks/query";
import { isRecord, unwrapApiData } from "@/lib/utils/core";
import { parseAttendanceDayState } from "@/lib/utils/hrms/attendance-display";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";

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

export function AccountMenu({
  anchorEl,
  open,
  onClose,
  isImpersonating,
  onLoginAsAdmin,
}: AccountMenuProps) {
  const theme = useTheme() as AppTheme;
  const app = theme.app;
  const blur = String(app.dashboard.cardBackdropBlur ?? "").trim();
  const rowSx = accountMenuRowSx(theme);
  const { hasOperational, refreshProfile } = useAuth();

  useEffect(() => {
    if (!open) return;
    void refreshProfile();
  }, [open, refreshProfile]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const canCheckIn =
    hasOperational(OP.hrms.attendance.checkIn) || hasOperational(OP.hrms.attendance.self);
  const canCheckOut =
    hasOperational(OP.hrms.attendance.checkOut) || hasOperational(OP.hrms.attendance.self);
  const canBreakIn =
    hasOperational(OP.hrms.attendance.breakIn) || hasOperational(OP.hrms.attendance.self);
  const canBreakOut =
    hasOperational(OP.hrms.attendance.breakOut) || hasOperational(OP.hrms.attendance.self);

  const todayAttendanceQuery = useAttendanceMeQuery(
    { from: today, to: today, page: 1, limit: 1 },
    { enabled: open },
  );
  const checkInMutation = useAttendanceCheckInMutation();
  const checkOutMutation = useAttendanceCheckOutMutation();
  const breakInMutation = useAttendanceBreakInMutation();
  const breakOutMutation = useAttendanceBreakOutMutation();

  const dayState = useMemo(
    () => parseAttendanceDayState(firstTodayRow(todayAttendanceQuery.data) ?? {}),
    [todayAttendanceQuery.data],
  );

  const isAttendanceBusy =
    checkInMutation.isPending ||
    checkOutMutation.isPending ||
    breakInMutation.isPending ||
    breakOutMutation.isPending ||
    todayAttendanceQuery.isFetching;

  const mutateWithToast = useCallback(
    (
      mutate: (body: { date: string }, opts: { onSuccess: () => void; onError: (e: unknown) => void }) => void,
      successMessage: string,
      errorFallback: string,
    ) => {
      mutate(
        { date: today },
        {
          onSuccess: () => publishAppToast({ variant: "success", message: successMessage }),
          onError: (error) =>
            publishAppToast({
              variant: "error",
              message: extractApiErrorMessageForToast(error) ?? errorFallback,
            }),
        },
      );
    },
    [today],
  );

  const handleCheckToggle = useCallback(() => {
    if (dayState.hasOpenSession) {
      if (!canCheckOut || isAttendanceBusy) return;
      mutateWithToast(checkOutMutation.mutate, "Checked out.", "Could not check out.");
      return;
    }
    if (!canCheckIn || isAttendanceBusy) return;
    mutateWithToast(checkInMutation.mutate, "Checked in.", "Could not check in.");
  }, [
    canCheckIn,
    canCheckOut,
    checkInMutation.mutate,
    checkOutMutation.mutate,
    dayState.hasOpenSession,
    isAttendanceBusy,
    mutateWithToast,
  ]);

  const handleBreakToggle = useCallback(() => {
    if (!dayState.hasOpenSession || isAttendanceBusy) return;
    if (dayState.isOnBreak) {
      if (!canBreakOut) return;
      mutateWithToast(breakOutMutation.mutate, "Break ended.", "Could not end break.");
      return;
    }
    if (!canBreakIn) return;
    mutateWithToast(breakInMutation.mutate, "Break started.", "Could not start break.");
  }, [
    breakInMutation.mutate,
    breakOutMutation.mutate,
    canBreakIn,
    canBreakOut,
    dayState.hasOpenSession,
    dayState.isOnBreak,
    isAttendanceBusy,
    mutateWithToast,
  ]);

  const checkLabel = useMemo(() => {
    if (checkInMutation.isPending) return "Checking in…";
    if (checkOutMutation.isPending) return "Checking out…";
    return dayState.hasOpenSession ? "Check-out" : "Check-in";
  }, [checkInMutation.isPending, checkOutMutation.isPending, dayState.hasOpenSession]);

  const breakLabel = useMemo(() => {
    if (breakInMutation.isPending) return "Starting break…";
    if (breakOutMutation.isPending) return "Ending break…";
    return dayState.isOnBreak ? "Break-out" : "Break-in";
  }, [breakInMutation.isPending, breakOutMutation.isPending, dayState.isOnBreak]);

  const showCheckRow = canCheckIn || canCheckOut;
  const showBreakRow = canBreakIn || canBreakOut;

  const paperSx = useMemo(
    () => ({
      mt: 1.5,
      minWidth: 260,
      py: 1,
      px: 0.5,
      borderRadius: 2.5,
      bgcolor: app.dashboard.menuSurfaceBg,
      border: `1px solid ${app.dashboard.cardBorder}`,
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 20px 56px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 16px 40px rgba(15,23,42,0.14)",
      overflow: "hidden",
      ...(blur && blur !== "none"
        ? { backdropFilter: blur, WebkitBackdropFilter: blur }
        : {}),
    }),
    [app.dashboard.cardBorder, app.dashboard.menuSurfaceBg, theme.palette.mode, blur],
  );

  const signOutRowSx = {
    ...rowSx,
    "&:hover, &.Mui-focusVisible": {
      bgcolor: alpha(app.dashboard.accentRed, theme.palette.mode === "dark" ? 0.18 : 0.12),
      color: app.dashboard.accentRedLight,
    },
  };

  const checkDisabled =
    isAttendanceBusy ||
    (dayState.hasOpenSession ? !canCheckOut : !canCheckIn);

  const breakDisabled =
    isAttendanceBusy ||
    !dayState.hasOpenSession ||
    (dayState.isOnBreak ? !canBreakOut : !canBreakIn);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: { sx: paperSx, elevation: 0 },
        list: { sx: { py: 0 } },
      }}
      disableScrollLock
    >
      {showCheckRow ? (
        <MenuItem onClick={handleCheckToggle} disabled={checkDisabled} disableRipple sx={rowSx}>
          <AccountMenuIconWrap sx={accountMenuCheckIconWrapSx(theme)}>
            {dayState.hasOpenSession ? (
              <LogoutOutlinedIcon sx={{ fontSize: 20, display: "block", lineHeight: 0 }} />
            ) : (
              <LoginOutlinedIcon sx={{ fontSize: 20, display: "block", lineHeight: 0 }} />
            )}
          </AccountMenuIconWrap>
          <Typography variant="body2" fontWeight={600} sx={{ color: app.text.primary }}>
            {checkLabel}
          </Typography>
        </MenuItem>
      ) : null}
      {showBreakRow ? (
        <MenuItem onClick={handleBreakToggle} disabled={breakDisabled} disableRipple sx={rowSx}>
          <AccountMenuIconWrap sx={accountMenuBreakIconWrapSx(theme)}>
            {dayState.isOnBreak ? (
              <PlayCircleOutlineIcon sx={{ fontSize: 20, display: "block", lineHeight: 0 }} />
            ) : (
              <FreeBreakfastOutlinedIcon sx={{ fontSize: 20, display: "block", lineHeight: 0 }} />
            )}
          </AccountMenuIconWrap>
          <Typography variant="body2" fontWeight={600} sx={{ color: app.text.primary }}>
            {breakLabel}
          </Typography>
        </MenuItem>
      ) : null}
      {isImpersonating && (showCheckRow || showBreakRow) ? (
        <Divider sx={{ my: 0.75, borderColor: app.dashboard.shellBorder, opacity: 0.85 }} />
      ) : null}
      {isImpersonating ? (
        <MenuItem onClick={onLoginAsAdmin} disableRipple sx={signOutRowSx}>
          <AccountMenuIconWrap
            sx={{
              borderColor: alpha(app.dashboard.accentRed, 0.45),
              color: app.dashboard.accentRedLight,
              bgcolor: alpha(app.dashboard.accentRed, theme.palette.mode === "dark" ? 0.12 : 0.08),
            }}
          >
            <LoginIcon sx={{ fontSize: 20 }} />
          </AccountMenuIconWrap>
          <Typography variant="body2" fontWeight={600} sx={{ color: "inherit" }}>
            Login As Admin
          </Typography>
        </MenuItem>
      ) : null}
    </Menu>
  );
}
