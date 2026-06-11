"use client";

import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export function EmailStatusChip({
  active,
  activeLabel = "Active",
  inactiveLabel = "Paused",
}: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  const theme = useTheme() as AppTheme;
  return (
    <Chip
      label={active ? activeLabel : inactiveLabel}
      size="small"
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0,
        display: "inline-flex",
        maxWidth: "100%",
        bgcolor: active
          ? `${theme.palette.success.main}22`
          : "rgba(255,255,255,0.08)",
        color: active ? theme.palette.success.main : theme.app.dashboard.textMuted,
      }}
    />
  );
}
