"use client";

import Box from "@mui/material/Box";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { PayPageShell } from "@/features/billing/PayPageShell";
import { payStatusCardSx } from "@/features/billing/pay-page.styles";

export default function PayCancelledPage() {
  const theme = useTheme() as AppTheme;

  return (
    <PayPageShell title="Payment cancelled">
      <Box sx={payStatusCardSx("pending")}>
        <CancelOutlined sx={{ fontSize: 56, color: theme.palette.warning.main, mb: 2 }} />
        <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 1 }}>
          Payment cancelled
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.app.dashboard.textMuted, mb: 3, lineHeight: 1.6, maxWidth: 420, mx: "auto" }}
        >
          No charge was made. Return to your invoice link and try again when you are ready.
        </Typography>
        <Button variant="secondary" onClick={() => window.history.back()}>
          Go back
        </Button>
      </Box>
    </PayPageShell>
  );
}
