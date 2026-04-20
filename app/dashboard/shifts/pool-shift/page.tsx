"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { Typography, DashboardCard, Button, SelectField } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesIconBox, rolesPageWrapper } from "../../roles/roles.styles";
import { pageWrapper } from "../../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import {
  poolShiftActionsSx,
  poolShiftCardHeaderSx,
  poolShiftFormGridSx,
  poolShiftHeaderWrapSx,
  poolShiftIconSx,
  poolShiftSubtextSx,
} from "./pool-shift.styles";

const POOL_OPTIONS = [
  { label: "Food", value: "food" },
  { label: "Operations Pool", value: "operations-pool" },
  { label: "Support Pool", value: "support-pool" },
];

const SHIFT_OPTIONS = [
  { label: "Assign Department Head", value: "" },
  { label: "Morning Shift", value: "morning" },
  { label: "Evening Shift", value: "evening" },
  { label: "Night Shift", value: "night" },
];

export default function PoolShiftPage() {
  const [pool, setPool] = useState("food");
  const [shift, setShift] = useState("");

  const handleCancel = () => {
    setPool("food");
    setShift("");
  };

  const handleAssign = () => {
    if (!pool) {
      publishAppToast({ variant: "error", message: "Please select a pool." });
      return;
    }
    if (!shift) {
      publishAppToast({ variant: "error", message: "Please select a shift." });
      return;
    }
    publishAppToast({ variant: "success", message: "Pool shift assigned successfully." });
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={poolShiftHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          User Shift Assignment
        </Typography>
        <Typography variant="body2" sx={poolShiftSubtextSx}>
          Generate and distribute licenses to client companies
        </Typography>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={poolShiftCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={poolShiftIconSx} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Pool Shift Assignment
          </Typography>
        </Box>

        <Box sx={poolShiftFormGridSx}>
          <SelectField label="Pool" value={pool} onChange={setPool} options={POOL_OPTIONS} />
          <SelectField label="Shift" value={shift} onChange={setShift} options={SHIFT_OPTIONS} />
        </Box>

        <Box sx={poolShiftActionsSx}>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={handleAssign}>
            Pool Shift Assignment
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
