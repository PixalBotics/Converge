"use client";

import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export function ClosePolicyStatusChip({
  enabled,
  subEnabled,
}: {
  enabled: boolean;
  /** When policy is on but a subsection (visitor idle / agent) is off */
  subEnabled?: boolean;
}) {
  const theme = useTheme() as AppTheme;

  if (!enabled) {
    return (
      <Chip
        label="Off"
        size="small"
        sx={{
          height: 22,
          fontSize: 11,
          fontWeight: 600,
          bgcolor: "rgba(255,255,255,0.08)",
          color: theme.app.dashboard.textMuted,
        }}
      />
    );
  }

  if (subEnabled === false) {
    return (
      <Chip
        label="Paused"
        size="small"
        sx={{
          height: 22,
          fontSize: 11,
          fontWeight: 600,
          bgcolor: alpha(theme.palette.warning.main, 0.15),
          color: theme.palette.warning.light,
        }}
      />
    );
  }

  return (
    <Chip
      label="On"
      size="small"
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 600,
        bgcolor: alpha(theme.palette.success.main, 0.18),
        color: theme.palette.success.main,
      }}
    />
  );
}
