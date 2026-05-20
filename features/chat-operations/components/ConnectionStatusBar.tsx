"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { chatOpsConnectionPillSx } from "../styles/chat-operations.styles";

const QUEUE_POLL_SEC = 12;

interface ConnectionStatusBarProps {
  connected: boolean;
  hasToken: boolean;
}

export function ConnectionStatusBar({ connected, hasToken }: ConnectionStatusBarProps) {
  const theme = useTheme() as AppTheme;

  if (!hasToken) {
    return (
      <Typography color="error.main" variant="medium" sx={{ fontSize: 13 }}>
        Session token unavailable
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <Box sx={chatOpsConnectionPillSx(connected)}>
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            bgcolor: connected ? theme.palette.success.main : theme.palette.error.main,
          }}
        />
        {connected ? "Live" : "Offline"}
      </Box>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
        {connected ? `Queue refreshes every ${QUEUE_POLL_SEC}s` : "Reconnecting…"}
      </Typography>
    </Box>
  );
}
