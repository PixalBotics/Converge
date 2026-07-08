"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { PaymentSetupTone } from "@/lib/billing/stripe-setup-status";

type Props = {
  label: string;
  ok: boolean;
  tone?: PaymentSetupTone;
  sx?: object;
};

export function StripeStatusBadge({ label, ok, tone, sx }: Props) {
  const theme = useTheme() as AppTheme;
  const app = theme.app.dashboard;
  const resolvedTone: PaymentSetupTone = tone ?? (ok ? "success" : "warning");
  const color =
    resolvedTone === "success" ? app.accentGreen : app.accentOrange;
  const bg =
    resolvedTone === "success" ? app.successTintBg : alpha(app.accentOrange, 0.12);

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.35,
        py: 0.55,
        borderRadius: 999,
        bgcolor: bg,
        border: `1px solid ${alpha(color, 0.28)}`,
        boxShadow: "none",
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: color,
          flexShrink: 0,
        }}
      />
      <Typography
        variant="caption"
        sx={{
          color,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: 0.15,
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
