"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Checkbox, Typography } from "@/components/common";
import { WEEKDAY_CODES, type WeekdayCode } from "../utils/schedule-weekday.utils";

export function ServiceWeekdayPicker({
  value,
  disabled,
  onChange,
}: {
  value: WeekdayCode[];
  disabled?: boolean;
  onChange: (days: WeekdayCode[]) => void;
}) {
  const theme = useTheme() as AppTheme;

  const toggle = (day: WeekdayCode) => {
    if (disabled) return;
    const has = value.includes(day);
    onChange(has ? value.filter((d) => d !== day) : [...value, day]);
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
      {WEEKDAY_CODES.map((day) => {
        const checked = value.includes(day);
        return (
          <Box
            key={day}
            component="label"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.25,
              py: 0.5,
              borderRadius: 1.5,
              border: `1px solid ${checked ? theme.palette.primary.main : theme.app.dashboard.cardBorder}`,
              bgcolor: checked ? `${theme.palette.primary.main}18` : "rgba(255,255,255,0.02)",
              cursor: disabled ? "default" : "pointer",
              userSelect: "none",
            }}
          >
            <Checkbox checked={checked} disabled={disabled} onChange={() => toggle(day)} />
            <Typography variant="caption" fontWeight={checked ? 700 : 500}>
              {day}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
