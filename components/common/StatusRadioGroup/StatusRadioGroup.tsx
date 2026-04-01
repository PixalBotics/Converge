"use client";

import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";

export interface StatusRadioGroupProps {
  value: "Active" | "Inactive";
  onChange: (value: "Active" | "Inactive") => void;
}

export function StatusRadioGroup({ value, onChange }: StatusRadioGroupProps) {
  const theme = useTheme() as AppTheme;
  const activeColor = theme.app.dashboard.accentGreen;
  const mutedColor = theme.app.dashboard.textMuted;
  const activeBorder = theme.app.dashboard.radioActiveBorder;
  const inactiveBorder = theme.app.dashboard.radioInactiveBorder;
  const activeRing = theme.app.dashboard.radioActiveRing;

  return (
    <RadioGroup
      row
      value={value}
      onChange={(event) => onChange(event.target.value as "Active" | "Inactive")}
    >
      <FormControlLabel
        value="Active"
        control={
          <Radio
            disableRipple
            icon={
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "9999px",
                  border: `2px solid ${activeBorder}`,
                  bgcolor: "transparent",
                }}
              />
            }
            checkedIcon={
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "9999px",
                  bgcolor: activeColor,
                  boxShadow: `0 0 0 4px ${activeRing}`,
                }}
              />
            }
            sx={{ p: 0.5 }}
          />
        }
        label={
          <Typography variant="medium" sx={{ color: value === "Active" ? activeColor : mutedColor }}>
            Active
          </Typography>
        }
        sx={{ mr: 4, gap: 0.75, borderRadius: "10px" }}
      />
      <FormControlLabel
        value="Inactive"
        control={
          <Radio
            disableRipple
            icon={
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "9999px",
                  border: `2px solid ${inactiveBorder}`,
                  bgcolor: "transparent",
                }}
              />
            }
            checkedIcon={
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "9999px",
                  bgcolor: activeColor,
                  boxShadow: `0 0 0 4px ${activeRing}`,
                }}
              />
            }
            sx={{ p: 0.5 }}
          />
        }
        label={
          <Typography variant="medium" sx={{ color: value === "Inactive" ? activeColor : mutedColor }}>
            InActive
          </Typography>
        }
        sx={{ gap: 0.75, borderRadius: "10px" }}
      />
    </RadioGroup>
  );
}

