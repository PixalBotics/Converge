"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, dataTableActionButton, Typography } from "@/components/common";
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

          return (
            <Box
              key={cell.iso}
              onClick={() => onPickDate(cell.iso)}
              sx={{
                cursor: "pointer",
                borderRadius: 2,
                border: `1px solid ${isToday ? theme.app.dashboard.accentBlue : "rgba(255,255,255,0.08)"}`,
                background: cell.inMonth ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)",
                px: 1,
                py: 1,
                minHeight: 72,
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
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
                    fontSize: 12,
                    lineHeight: 1.4,
                    width: "fit-content",
                    color: "white",
                    background: "rgba(91, 142, 255, 0.25)",
                    border: "1px solid rgba(91, 142, 255, 0.45)",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={first.title ?? first.label}
                >
                  {first.label}
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

