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
import {
  markAttendanceActionsSx,
  markAttendanceCardHeaderSx,
  markAttendanceFormGridSx,
  markAttendanceHeaderWrapSx,
  markAttendanceIconSx,
  markAttendanceSubtextSx,
} from "./mark-attendance.styles";

export default function MarkAttendancePage() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleCancel = () => {
    setCheckIn("");
    setCheckOut("");
  };

  const handleMarkAttendance = () => {
    if (!checkIn.trim()) {
      publishAppToast({ variant: "error", message: "Please enter check-in time." });
      return;
    }
    if (!checkOut.trim()) {
      publishAppToast({ variant: "error", message: "Please enter check-out time." });
      return;
    }
    publishAppToast({ variant: "success", message: "Attendance marked successfully." });
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={markAttendanceHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Mark Attendance
        </Typography>
        <Typography variant="body2" sx={markAttendanceSubtextSx}>
          Generate and distribute licenses to client companies
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
            label="Check-in"
            placeholder="Food"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
          <InputField
            label="Check-out"
            placeholder="Assign Department Head"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </Box>

        <Box sx={markAttendanceActionsSx}>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={handleMarkAttendance}>
            Mark Attendance
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
