"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { Typography, DashboardCard, Button, InputField } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesIconBox, rolesPageWrapper } from "../../roles/roles.styles";
import { pageWrapper } from "../../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import { useAttendanceCheckInMutation, useAttendanceCheckOutMutation } from "@/lib/hooks/query";
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
  const [checkedIn, setCheckedIn] = useState(false);
  const checkInMutation = useAttendanceCheckInMutation();
  const checkOutMutation = useAttendanceCheckOutMutation();

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
          setCheckedIn(true);
          publishAppToast({ variant: "success", message: "Checked in." });
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not check in." }),
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
          setCheckedIn(false);
          publishAppToast({ variant: "success", message: "Checked out." });
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not check out." }),
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
              disabled={checkInMutation.isPending || checkOutMutation.isPending}
              onClick={handleCheckIn}
            >
              {checkInMutation.isPending ? "Checking in…" : "Check in"}
            </Button>
          ) : null}
          {checkedIn && canCheckOut ? (
            <Button
              variant="primary"
              sx={gradientPrimaryButtonSx}
              disabled={checkInMutation.isPending || checkOutMutation.isPending}
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
