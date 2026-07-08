"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

type Props = {
  periodStart: string | null | undefined;
  periodEnd: string | null | undefined;
};

/** Two-line period cell — avoids cramped single-line date ranges in tables. */
export function InvoicePeriodCell({ periodStart, periodEnd }: Props) {
  const theme = useTheme() as AppTheme;

  if (!periodStart && !periodEnd) {
    return (
      <Box component="span" sx={{ color: theme.app.dashboard.textMuted }}>
        —
      </Box>
    );
  }

  if (periodStart && periodEnd) {
    const start = new Date(`${periodStart}T00:00:00Z`);
    const end = new Date(`${periodEnd}T00:00:00Z`);
    const sameMonth =
      start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth();

    if (sameMonth) {
      const monthYear = start.toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
      return (
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            flexDirection: "column",
            gap: 0.15,
            color: theme.app.dashboard.textMuted,
            lineHeight: 1.35,
            whiteSpace: "normal",
          }}
        >
          <Box component="span" sx={{ fontWeight: 600, color: theme.app.text.primary }}>
            {monthYear}
          </Box>
          <Box component="span">
            {start.getUTCDate()} – {end.getUTCDate()}
          </Box>
        </Box>
      );
    }
  }

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 0.15,
        color: theme.app.dashboard.textMuted,
        lineHeight: 1.35,
        whiteSpace: "normal",
      }}
    >
      {periodStart ? <Box component="span">From {periodStart}</Box> : null}
      {periodEnd ? <Box component="span">To {periodEnd}</Box> : null}
    </Box>
  );
}
