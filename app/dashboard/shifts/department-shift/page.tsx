"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  Typography,
  DashboardCard,
  Button,
  SelectField,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesIconBox, rolesPageWrapper } from "../../roles/roles.styles";
import { pageWrapper } from "../../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import {
  departmentShiftActionsSx,
  departmentShiftCardHeaderSx,
  departmentShiftFormGridSx,
  departmentShiftHeaderWrapSx,
  departmentShiftIconSx,
  departmentShiftSubtextSx,
} from "./department-shift.styles";

const DEPARTMENT_OPTIONS = [
  { label: "Select department", value: "" },
  { label: "Food", value: "food" },
  { label: "Operations", value: "operations" },
  { label: "Customer Support", value: "support" },
];

const SHIFT_OPTIONS = [
  { label: "Assign Department Head", value: "" },
  { label: "Morning Shift", value: "morning" },
  { label: "Evening Shift", value: "evening" },
  { label: "Night Shift", value: "night" },
];

export default function DepartmentShiftPage() {
  const [department, setDepartment] = useState("");
  const [shift, setShift] = useState("");

  const handleCancel = () => {
    setDepartment("");
    setShift("");
  };

  const handleAssign = () => {
    if (!department) {
      publishAppToast({ variant: "error", message: "Please select a department." });
      return;
    }
    if (!shift) {
      publishAppToast({ variant: "error", message: "Please select a shift." });
      return;
    }
    publishAppToast({ variant: "success", message: "Department shift assigned successfully." });
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={departmentShiftHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Department Shift Assignment
        </Typography>
        <Typography variant="body2" sx={departmentShiftSubtextSx}>
          Generate and distribute licenses to client companies
        </Typography>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={departmentShiftCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={departmentShiftIconSx} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Department Shift Assignment
          </Typography>
        </Box>

        <Box sx={departmentShiftFormGridSx}>
          <SelectField
            label="Department"
            value={department}
            onChange={setDepartment}
            options={DEPARTMENT_OPTIONS}
          />
          <SelectField
            label="Assign Shift"
            value={shift}
            onChange={setShift}
            options={SHIFT_OPTIONS}
          />
        </Box>

        <Box sx={departmentShiftActionsSx}>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={handleAssign}>
            Shift Assignment
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
