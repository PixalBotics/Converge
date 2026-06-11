"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  HRMS_DEFAULT_WORKING_DAYS_MASK,
  clampWorkingDaysMask,
  formatWorkingDaysMaskHuman,
  toggleDayInWorkingDaysMask,
} from "@/lib/utils/hrms";

const DAYS: { bit: number; letter: string; full: string }[] = [
  { bit: 0, letter: "M", full: "Monday" },
  { bit: 1, letter: "T", full: "Tuesday" },
  { bit: 2, letter: "W", full: "Wednesday" },
  { bit: 3, letter: "T", full: "Thursday" },
  { bit: 4, letter: "F", full: "Friday" },
  { bit: 5, letter: "S", full: "Saturday" },
  { bit: 6, letter: "S", full: "Sunday" },
];

export type WorkingWeekDayTogglesProps = {
  value: number;
  onChange: (mask: number) => void;
  disabled?: boolean;
  /** Screen-reader label for the toggle group. */
  ariaLabel?: string;
};

export function WorkingWeekDayToggles({
  value,
  onChange,
  disabled,
  ariaLabel = "Working days of the week",
}: WorkingWeekDayTogglesProps) {
  const theme = useTheme() as AppTheme;
  const mask = clampWorkingDaysMask(value);
  const summary = formatWorkingDaysMaskHuman(mask);
  const accent = theme.app.dashboard.accentBlue;
  const muted = theme.app.dashboard.textMuted;

  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${alpha(theme.app.dashboard.white95, 0.12)}`,
        background: `linear-gradient(145deg, ${alpha(theme.app.dashboard.white95, 0.07)} 0%, ${alpha(theme.app.dashboard.white95, 0.02)} 100%)`,
        boxShadow: `inset 0 1px 0 ${alpha(theme.app.dashboard.white95, 0.06)}`,
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 1, mb: 1.25 }}>
        <Box>
          <Typography variant="medium" color="white" sx={{ fontWeight: 600, letterSpacing: "0.02em" }}>
            Working week
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 0.35, color: muted, lineHeight: 1.45, maxWidth: 420 }}>
            Tap days to include or exclude. Attendance uses this pattern with the shift timezone.
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontSize: 10,
            color: alpha(theme.app.dashboard.white95, 0.45),
          }}
        >
          Mon → Sun
        </Typography>
      </Box>

      <Box
        role="group"
        aria-label={ariaLabel}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: { xs: 0.5, sm: 0.75 },
          mb: 1.25,
        }}
      >
        {DAYS.map((d, idx) => {
          const on = (mask & (1 << d.bit)) !== 0;
          const label = `${d.full} — ${on ? "working day" : "off day"}`;
          return (
            <Tooltip key={`${d.bit}-${idx}`} title={label} placement="top" arrow>
              <span>
                <Button
                  type="button"
                  variant="outlined"
                  disabled={disabled}
                  aria-pressed={on}
                  aria-label={label}
                  onClick={() => onChange(toggleDayInWorkingDaysMask(mask, d.bit))}
                  sx={{
                    width: "100%",
                    minWidth: 0,
                    px: 0,
                    py: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.25,
                    borderRadius: 2,
                    textTransform: "none",
                    borderWidth: 1,
                    borderColor: on ? alpha(accent, 0.75) : alpha(theme.app.dashboard.white95, 0.14),
                    color: on ? theme.app.dashboard.white95 : muted,
                    bgcolor: on ? alpha(accent, 0.22) : alpha(theme.app.dashboard.white95, 0.03),
                    boxShadow: on ? `0 0 0 1px ${alpha(accent, 0.25)}, 0 4px 14px ${alpha(accent, 0.12)}` : "none",
                    transition: "border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease, color 160ms ease",
                    "&:hover": {
                      borderColor: alpha(accent, 0.55),
                      bgcolor: on ? alpha(accent, 0.28) : alpha(theme.app.dashboard.white95, 0.06),
                    },
                  }}
                >
                  <Box component="span" sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1 }}>
                    {d.letter}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: on ? alpha(theme.app.dashboard.white95, 0.75) : alpha(muted, 0.95),
                    }}
                  >
                    {d.full.slice(0, 3)}
                  </Box>
                </Button>
              </span>
            </Tooltip>
          );
        })}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          pt: 1.25,
          borderTop: `1px solid ${alpha(theme.app.dashboard.white95, 0.08)}`,
        }}
      >
        <Typography variant="caption" sx={{ color: muted, lineHeight: 1.5, flex: "1 1 200px" }}>
          <Box component="span" sx={{ color: alpha(theme.app.dashboard.white95, 0.55), fontWeight: 600 }}>
            Active days:{" "}
          </Box>
          {summary}
        </Typography>
        <Button
          type="button"
          variant="outlined"
          size="small"
          disabled={disabled}
          onClick={() => onChange(HRMS_DEFAULT_WORKING_DAYS_MASK)}
          sx={{
            flexShrink: 0,
            color: alpha(accent, 0.95),
            fontSize: 12,
            fontWeight: 600,
            px: 1,
            py: 0.5,
            borderRadius: 1.5,
            "&:hover": { bgcolor: alpha(accent, 0.12) },
          }}
        >
          Mon–Fri preset
        </Button>
      </Box>
    </Box>
  );
}
