"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { RiInboxArchiveLine } from "react-icons/ri";
import { Typography } from "@/components/common";
import type { AppTheme } from "@/theme/theme";

export function EmptyUsersState({ title = "No users found" }: { title?: string }) {
  const theme = useTheme() as AppTheme;
  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.25,
        borderRadius: 3,
        border: `1px dashed ${theme.app.dashboard.cardBorder}`,
        bgcolor: theme.app.dashboard.overlayLight,
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: theme.app.dashboard.pillBg,
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
        }}
      >
        <RiInboxArchiveLine size={24} color={theme.app.dashboard.textMuted} />
      </Box>
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary }}>
        {title}
      </Typography>
      <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
        Try a different filter or clear search to view all users.
      </Typography>
    </Box>
  );
}
