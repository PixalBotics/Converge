"use client";

import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export function EmailDesignSourceChip({ usesPlatformDefault }: { usesPlatformDefault: boolean }) {
  const theme = useTheme() as AppTheme;

  return (
    <Chip
      label={usesPlatformDefault ? "Platform default" : "Custom design"}
      size="small"
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 600,
        bgcolor: usesPlatformDefault
          ? `${theme.palette.info.main}22`
          : `${theme.palette.success.main}22`,
        color: usesPlatformDefault ? theme.palette.info.light : theme.palette.success.main,
      }}
    />
  );
}

export function EmailDesignPublishChip({
  status,
}: {
  status: "published" | "in_progress" | "not_started";
}) {
  const theme = useTheme() as AppTheme;

  const label =
    status === "published" ? "Published" : status === "in_progress" ? "In progress" : "Not started";

  const color =
    status === "published"
      ? theme.palette.success.main
      : status === "in_progress"
        ? theme.palette.warning.main
        : theme.app.dashboard.textMuted;

  const bg =
    status === "published"
      ? `${theme.palette.success.main}22`
      : status === "in_progress"
        ? `${theme.palette.warning.main}22`
        : "rgba(255,255,255,0.08)";

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 600,
        bgcolor: bg,
        color,
      }}
    />
  );
}
