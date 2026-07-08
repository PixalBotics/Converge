"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";

type Props = {
  currency: string;
  used: number;
  limit: number | null;
};

export function BillingLimitMeter({ currency, used, limit }: Props) {
  const theme = useTheme() as AppTheme;
  const app = theme.app;
  const hasCap = limit != null && limit > 0;
  const over = hasCap && used > limit;
  const pct = hasCap ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const barColor = over
    ? app.dashboard.accentRed
    : pct >= 85
      ? app.dashboard.accentOrange
      : app.dashboard.accentGreen;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.75, gap: 1 }}>
        <Typography variant="body2" fontWeight={700} sx={{ color: app.text.primary }}>
          Monthly billing cap
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ color: over ? app.dashboard.accentRed : app.text.primary }}>
          {currency} {used.toFixed(2)}
          {hasCap ? ` / ${currency} ${limit.toFixed(2)}` : " · No cap set"}
        </Typography>
      </Box>
      {hasCap ? (
        <Box
          sx={{
            height: 8,
            borderRadius: 999,
            bgcolor: alpha(app.dashboard.cardBorder, 0.35),
            overflow: "hidden",
            mb: 0.75,
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 999,
              bgcolor: barColor,
              transition: "width 0.25s ease",
            }}
          />
        </Box>
      ) : null}
      <Typography variant="caption" sx={{ color: app.dashboard.textMuted, lineHeight: 1.5, display: "block" }}>
        {hasCap
          ? "Maximum combined website charges for this parent in the selected billing period."
          : "Set a monthly cap to track this parent's budget target."}
      </Typography>
    </Box>
  );
}
