"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
};

function statusColors(status: string, theme: AppTheme) {
  const d = theme.app.dashboard;
  if (status === "paid") return { color: d.accentGreen, bg: d.successTintBg };
  if (status === "overdue") return { color: d.accentRed, bg: d.errorTintBg };
  if (status === "pending") return { color: d.accentOrange, bg: alpha(d.accentOrange, 0.12) };
  return { color: d.textMuted, bg: d.pillBg };
}

type Props = {
  status: string;
};

export function InvoiceStatusBadge({ status }: Props) {
  const theme = useTheme() as AppTheme;
  const normalized = status.trim().toLowerCase();
  const { color, bg } = statusColors(normalized, theme);

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1.25,
        py: 0.35,
        borderRadius: 999,
        bgcolor: bg,
        border: `1px solid ${alpha(color, 0.35)}`,
      }}
    >
      <Typography variant="caption" sx={{ color, fontWeight: 700, textTransform: "capitalize" }}>
        {STATUS_LABELS[normalized] ?? status}
      </Typography>
    </Box>
  );
}
