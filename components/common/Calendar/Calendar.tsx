"use client";

import Box from "@mui/material/Box";
import { CalendarMonth as CalendarMonthIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Label } from "@/components/common/Label";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import {
  applyOutlineFieldCursorPosition,
  resetOutlineFieldCursorPosition,
} from "@/components/common/InputField/outlineFieldCursor";
import { resolveSx } from "@/utils/resolveSx";
import type { CalendarProps } from "./Calendar.types";
import { calendarFieldStyles } from "./Calendar.styles";

export function Calendar({
  label,
  value,
  onChange,
  name,
  id,
  min,
  max,
  fullWidth = true,
  sx,
}: CalendarProps) {
  const theme = useTheme();
  const fieldId = id ?? name ?? label.toLowerCase().replace(/\s+/g, "-");

  const pickerValue = value ? dayjs(value) : null;

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <Label htmlFor={fieldId} variant="mediumLarge" sx={{ mb: 0.75 }}>
        {label}
      </Label>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={pickerValue}
          onChange={(date) => onChange(date ? date.format("YYYY-MM-DD") : "")}
          format="DD MMM YYYY"
          minDate={min ? dayjs(min) : undefined}
          maxDate={max ? dayjs(max) : undefined}
          slots={{
            openPickerIcon: CalendarMonthIcon,
          }}
          slotProps={{
            textField: {
              id: fieldId,
              name,
              fullWidth,
              variant: "outlined",
              onMouseMove: applyOutlineFieldCursorPosition,
              onMouseLeave: resetOutlineFieldCursorPosition,
              sx: [
                textFieldStyles(theme),
                calendarFieldStyles(theme),
                ...(sx ? [resolveSx(sx, theme)] : []),
              ] as SxProps<Theme>,
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}
