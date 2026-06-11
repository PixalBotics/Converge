"use client";

import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

/** Reminds editors that the right-hand preview is draft until publish. */
export function WidgetPublishStatusChip({ published }: { published?: boolean }) {
  const theme = useTheme() as AppTheme;
  if (published) {
    return (
      <Chip
        size="small"
        label="Published — embed matches last publish"
        sx={{
          mb: 1,
          bgcolor: "rgba(34,197,94,0.15)",
          color: theme.palette.success.light,
          fontWeight: 600,
        }}
      />
    );
  }
  return (
    <Chip
      size="small"
      label="Offline — Go live when ready"
      sx={{
        mb: 1,
        bgcolor: "rgba(251,191,36,0.12)",
        color: theme.palette.warning.light,
        fontWeight: 600,
      }}
    />
  );
}
