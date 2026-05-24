"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";

export function ChatSettingsSectionLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 0, flex: 1 }}>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
        Per-website rules for auto-close, visitor nudges, agent no-response, and supervisor close.
      </Typography>
      {children}
    </Box>
  );
}
