"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { chatOpsConnectionPillSx } from "../styles/chat-operations.styles";


interface ConnectionStatusBarProps {
  connected: boolean;
  hasToken: boolean;
  /** Sidebar: pill only. Default: pill + caption. */
  compact?: boolean;
}

export function ConnectionStatusBar({
  connected,
  hasToken,
  compact = false,
}: ConnectionStatusBarProps) {
  const theme = useTheme() as AppTheme;

  if (!hasToken) {
    return (
      <Typography color="error.main" variant="medium" sx={{ fontSize: 12 }}>
        No session
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: compact ? 0 : 1 }}>
      <Box sx={chatOpsConnectionPillSx(connected)}>
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            bgcolor: connected ? theme.palette.success.main : theme.palette.error.main,
            boxShadow: connected
              ? `0 0 0 2px ${theme.palette.success.main}33`
              : undefined,
          }}
        />
        {connected ? "Live" : "Offline"}
      </Box>
      {!compact ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
          {connected ? "Realtime on" : "Reconnecting…"}
        </Typography>
      ) : null}
    </Box>
  );
}
