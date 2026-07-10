"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { daysUntilDate } from "@/lib/billing/days-until";

const STATUS_LABELS: Record<string, string> = {
  trial: "Trial",
  grace: "Grace period",
  active: "Live",
  suspended: "Suspended",
  cancelled: "Cancelled",
};

function statusColors(status: string, theme: AppTheme) {
  const d = theme.app.dashboard;
  if (status === "active") return { color: d.accentGreen, bg: d.successTintBg };
  if (status === "trial") return { color: d.accentPurple, bg: alpha(d.accentPurple, 0.12) };
  if (status === "grace") return { color: d.accentOrange, bg: alpha(d.accentOrange, 0.12) };
  if (status === "suspended") return { color: d.accentRed, bg: d.errorTintBg };
  return { color: d.textMuted, bg: d.pillBg };
}

type Props = {
  status: string;
  trialEndDate?: string | null;
  graceEndDate?: string | null;
};

export function WebsiteBillingStatusBadge({ status, trialEndDate, graceEndDate }: Props) {
  const theme = useTheme() as AppTheme;
  const normalized = status.trim().toLowerCase();
  const { color, bg } = statusColors(normalized, theme);
  const label = STATUS_LABELS[normalized] ?? status;

  let hint: string | null = null;
  if (normalized === "trial" && trialEndDate) {
    const days = daysUntilDate(trialEndDate);
    hint = days >= 0 ? `${days} day${days === 1 ? "" : "s"} left` : "Trial ended";
  } else if (normalized === "grace" && graceEndDate) {
    const days = daysUntilDate(graceEndDate);
    hint = days >= 0 ? `${days} day${days === 1 ? "" : "s"} until suspend` : "Grace ended";
  }

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          px: 1.25,
          py: 0.35,
          borderRadius: 999,
          bgcolor: bg,
        }}
      >
        <Typography variant="caption" fontWeight={700} sx={{ color, textTransform: "capitalize" }}>
          {label}
        </Typography>
      </Box>
      {hint ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}
