"use client";

import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Typography } from "@/components/common";

export interface StatusRadioGroupProps {
  value: "Active" | "Inactive";
  onChange: (value: "Active" | "Inactive") => void;
}

export function StatusRadioGroup({ value, onChange }: StatusRadioGroupProps) {
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
                  border: "2px solid rgba(34,197,94,0.6)",
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
                  bgcolor: "#22C55E",
                  boxShadow: "0 0 0 4px rgba(34,197,94,0.35)",
                }}
              />
            }
            sx={{ p: 0.5 }}
          />
        }
        label={
          <Typography variant="medium" color="white">
            Active
          </Typography>
        }
        sx={{ mr: 4 }}
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
                  border: "2px solid rgba(148,163,184,0.6)",
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
                  bgcolor: "#22C55E",
                  boxShadow: "0 0 0 4px rgba(34,197,94,0.35)",
                }}
              />
            }
            sx={{ p: 0.5 }}
          />
        }
        label={
          <Typography
            variant="medium"
            color={value === "Inactive" ? "white" : "rgba(148,163,184,0.9)"}
          >
            InActive
          </Typography>
        }
      />
    </RadioGroup>
  );
}

