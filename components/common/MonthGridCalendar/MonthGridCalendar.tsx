"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, dataTableActionButton, Typography } from "@/components/common";
import { isCalendarWorkingDayForMask } from "@/lib/utils/shift-working-days";
import type { MonthGridCalendarProps } from "./MonthGridCalendar.types";

export function MonthGridCalendar({
  monthLabel,
  onPrevMonth,
  onNextMonth,
  onToday,
  cells,
  todayIso,
  events,
  onPickDate,
  renderEmpty,
}: MonthGridCalendarProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small" sx={dataTableActionButton} aria-label="Previous month" onClick={onPrevMonth}>
            <ArrowBackIosNewIcon fontSize="inherit" />
          </IconButton>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            {monthLabel}
          </Typography>
          <IconButton size="small" sx={dataTableActionButton} aria-label="Next month" onClick={onNextMonth}>
            <ArrowForwardIosIcon fontSize="inherit" />
          </IconButton>
        </Box>
        <Button variant="secondary" onClick={onToday}>
          Today
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1.5 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
          <Typography key={w} variant="caption" sx={{ color: theme.app.dashboard.textMuted, textAlign: "center" }}>
            {w}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
        {cells.map((cell) => {
          const matches = events.filter(
            (e) =>
              e.fromIso &&
              e.toIso &&
              cell.iso >= e.fromIso &&
              cell.iso <= e.toIso,
          );
          const first = matches[0];
          const extraCount = Math.max(0, matches.length - 1);
          const isToday = cell.iso === todayIso;
          const tz = first?.shiftTimeZone?.trim() ?? "";
          const wm = first?.effectiveWorkingDaysMask;
          const weeklyOff =
            first &&
            tz &&
            wm != null &&
            wm >= 1 &&
            wm <= 127 &&
            isCalendarWorkingDayForMask(cell.iso, wm, tz) === false;

          return (
            <Box
              key={cell.iso}
              onClick={() => onPickDate(cell.iso)}
              sx={{
                cursor: "pointer",
                borderRadius: 2,
                border: `1px solid ${
                  isToday
                    ? theme.app.dashboard.accentBlue
                    : weeklyOff
                      ? alpha(theme.app.dashboard.white95, 0.06)
                      : alpha(theme.app.dashboard.white95, 0.08)
                }`,
                background: weeklyOff
                  ? `linear-gradient(160deg, ${alpha(theme.app.dashboard.white95, 0.04)} 0%, ${alpha("#64748b", 0.08)} 100%)`
                  : cell.inMonth
                    ? alpha(theme.app.dashboard.white95, 0.02)
                    : alpha(theme.app.dashboard.white95, 0.01),
                px: 1,
                py: 1,
                minHeight: 72,
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
                transition: "border-color 160ms ease, background 160ms ease",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: cell.inMonth ? "white" : theme.app.dashboard.textMuted,
                  fontWeight: isToday ? 700 : 500,
                }}
              >
                {cell.day}
              </Typography>

              {first ? (
                <Box
                  sx={{
                    mt: "auto",
                    borderRadius: 999,
                    px: 1,
                    py: 0.25,
                    fontSize: 11,
                    fontWeight: weeklyOff ? 700 : 500,
                    letterSpacing: weeklyOff ? "0.06em" : undefined,
                    textTransform: weeklyOff ? "uppercase" : undefined,
                    lineHeight: 1.4,
                    width: "fit-content",
                    color: weeklyOff ? alpha(theme.app.dashboard.textMuted, 0.95) : "white",
                    background: weeklyOff ? alpha("#64748b", 0.2) : "rgba(91, 142, 255, 0.25)",
                    border: weeklyOff
                      ? `1px solid ${alpha("#94a3b8", 0.35)}`
                      : "1px solid rgba(91, 142, 255, 0.45)",
                    boxShadow: weeklyOff ? `inset 0 1px 0 ${alpha(theme.app.dashboard.white95, 0.06)}` : undefined,
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={
                    weeklyOff
                      ? `Off day (weekly schedule) — ${first.title ?? first.label}`
                      : (first.title ?? first.label)
                  }
                >
                  {weeklyOff ? "Off" : first.label}
                  {extraCount > 0 ? ` +${extraCount}` : ""}
                </Box>
              ) : renderEmpty ? (
                renderEmpty()
              ) : (
                <Typography variant="caption" sx={{ mt: "auto", color: theme.app.dashboard.textMuted }}>
                  —
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

