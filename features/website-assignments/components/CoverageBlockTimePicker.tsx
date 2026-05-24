"use client";

import Box from "@mui/material/Box";
import { Label, InputField, SegmentedControl } from "@/components/common";
import {
  coerceTimeHm24,
  fromTimeInputValue,
  hm24ToParts,
  setMeridiemOnHm24,
  toTimeInputValue,
  type Meridiem,
} from "../utils/schedule-time.utils";

type CoverageBlockTimePickerProps = {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (hm24: string) => void;
};

/** Matches InputField empty helper row so sibling columns align in a grid. */
const FIELD_HELPER_SPACER_SX = {
  minHeight: "1.25rem",
  mt: 0.75,
} as const;

export function CoverageBlockTimePicker({
  label,
  value,
  disabled = false,
  onChange,
}: CoverageBlockTimePickerProps) {
  const hm24 = coerceTimeHm24(value);
  const parts = hm24ToParts(hm24);
  const fieldId = label.replace(/\s+/g, "-").toLowerCase();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minWidth: 0 }}>
      <Label htmlFor={`${fieldId}-time`} variant="mediumLarge" sx={{ mb: 0.75 }}>
        {label}
      </Label>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        <InputField
          label=""
          type="time"
          dense
          inputProps={{ step: 60, "aria-label": `${label} time` }}
          value={toTimeInputValue(hm24)}
          disabled={disabled}
          onChange={(e) => onChange(fromTimeInputValue((e.target as HTMLInputElement).value))}
          sx={{
            flex: "1 1 140px",
            minWidth: 0,
            "& .MuiOutlinedInput-root": {
              minHeight: 44,
            },
            "& input[type='time']::-webkit-calendar-picker-indicator": {
              filter: "invert(0.85)",
              cursor: disabled ? "default" : "pointer",
            },
          }}
        />

        <Box
          sx={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            minWidth: 108,
          }}
        >
          <Label
            htmlFor={`${fieldId}-meridiem`}
            variant="mediumSmall"
            sx={{ mb: 0.5, textAlign: "center" }}
          >
            AM/PM
          </Label>
          <Box sx={{ opacity: disabled ? 0.55 : 1, pointerEvents: disabled ? "none" : "auto" }}>
            <SegmentedControl
              options={["AM", "PM"]}
              value={parts.meridiem}
              onChange={(v) => onChange(setMeridiemOnHm24(hm24, v as Meridiem))}
              size="small"
              sx={{
                width: "100%",
                "& .MuiToggleButton-root": {
                  flex: 1,
                  minHeight: 44,
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={FIELD_HELPER_SPACER_SX} aria-hidden />
    </Box>
  );
}
