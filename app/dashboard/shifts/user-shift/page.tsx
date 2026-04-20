"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import {
  Typography,
  DashboardCard,
  Button,
  SelectField,
  InputField,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesIconBox, rolesPageWrapper } from "../../roles/roles.styles";
import { pageWrapper } from "../../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import {
  userShiftActionsSx,
  userShiftCardHeaderSx,
  userShiftFormGridSx,
  userShiftHeaderWrapSx,
  userShiftIconSx,
  userShiftSubtextSx,
} from "./user-shift.styles";

const USER_OPTIONS = [
  { label: "Food", value: "food" },
  { label: "Raja Saif", value: "raja-saif" },
  { label: "Awais Khan", value: "awais-khan" },
];

const SHIFT_OPTIONS = [
  { label: "Assign Department Head", value: "" },
  { label: "Morning Shift", value: "morning" },
  { label: "Evening Shift", value: "evening" },
  { label: "Night Shift", value: "night" },
];

export default function UserShiftPage() {
  const [user, setUser] = useState("food");
  const [shift, setShift] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleCancel = () => {
    setUser("food");
    setShift("");
    setStartDate("");
    setEndDate("");
  };

  const handleAssign = () => {
    if (!user) {
      publishAppToast({ variant: "error", message: "Please select a user." });
      return;
    }
    if (!shift) {
      publishAppToast({ variant: "error", message: "Please select a shift." });
      return;
    }
    if (!startDate.trim()) {
      publishAppToast({ variant: "error", message: "Please enter a start date." });
      return;
    }
    if (!endDate.trim()) {
      publishAppToast({ variant: "error", message: "Please enter an end date." });
      return;
    }
    publishAppToast({ variant: "success", message: "User shift assigned successfully." });
  };

  return (
    <Box sx={pageWrapper}>
      <Box sx={rolesPageWrapper}>
        <Box sx={userShiftHeaderWrapSx}>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            User Shift Assignment
          </Typography>
          <Typography variant="body2" sx={userShiftSubtextSx}>
            Generate and distribute licenses to client companies
          </Typography>
        </Box>

        <DashboardCard sx={rolesCard}>
          <Box sx={userShiftCardHeaderSx}>
            <Box sx={rolesIconBox}>
              <AttachMoneyIcon sx={userShiftIconSx} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              User Shift Assignment
            </Typography>
          </Box>

          <Box sx={userShiftFormGridSx}>
            <SelectField
              label="User"
              value={user}
              onChange={setUser}
              options={USER_OPTIONS}
            />
            <SelectField
              label="Shift"
              value={shift}
              onChange={setShift}
              options={SHIFT_OPTIONS}
            />
            <InputField
              label="Start Date"
              placeholder="Food"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <InputField
              label="End Date"
              placeholder="Assign Department Head"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Box>

          <Box sx={userShiftActionsSx}>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={handleAssign}>
              User Shift Assignment
            </Button>
          </Box>
        </DashboardCard>
      </Box>
    </Box>
  );
}
