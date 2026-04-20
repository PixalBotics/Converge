"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { Typography, DashboardCard, Button, InputField, Calendar } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesIconBox, rolesPageWrapper } from "../../roles/roles.styles";
import { pageWrapper } from "../../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import {
  applyLeaveActionsSx,
  applyLeaveCardHeaderSx,
  applyLeaveFormGridSx,
  applyLeaveHeaderWrapSx,
  applyLeaveIconSx,
  applyLeaveSubtextSx,
} from "./apply-leave.styles";

export default function ApplyLeavePage() {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleCancel = () => {
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const handleSubmit = () => {
    if (!leaveType.trim()) {
      publishAppToast({ variant: "error", message: "Please enter leave type." });
      return;
    }
    if (!startDate.trim()) {
      publishAppToast({ variant: "error", message: "Please enter start date." });
      return;
    }
    if (!endDate.trim()) {
      publishAppToast({ variant: "error", message: "Please enter end date." });
      return;
    }
    if (!reason.trim()) {
      publishAppToast({ variant: "error", message: "Please enter reason." });
      return;
    }
    publishAppToast({ variant: "success", message: "Leave applied successfully." });
    handleCancel();
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={applyLeaveHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Apply Leave (Employee)
        </Typography>
        <Typography variant="body2" sx={applyLeaveSubtextSx}>
          Generate and distribute licenses to client companies
        </Typography>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={applyLeaveCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={applyLeaveIconSx} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Apply Leave (Employee)
          </Typography>
        </Box>

        <Box sx={applyLeaveFormGridSx}>
          <InputField
            label="Leave Type"
            placeholder="Food"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          />
          <Calendar
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
          />
          <Calendar
            label="End Date"
            value={endDate}
            min={startDate || undefined}
            onChange={setEndDate}
          />
          <InputField
            label="Reason (Textarea)"
            placeholder="Assign Department Head"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Box>

        <Box sx={applyLeaveActionsSx}>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
