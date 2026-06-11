"use client";

import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { SearchIcon } from "@/components/common/icons";
import type { AppTheme } from "@/theme/theme";

export function DashboardHeaderSearchBar({ theme }: { theme: AppTheme }) {
  const app = theme.app;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 1,
        borderRadius: "44px",
        bgcolor: app.dashboard.overlayLight,
        border: `1px solid ${app.dashboard.searchChromeBorder}`,
        width: "100%",
      }}
    >
      <SearchIcon sx={{ fontSize: 20 }} />
      <InputBase
        placeholder="Search anything"
        sx={{
          color: app.text.primary,
          "& input::placeholder": { color: app.text.iconMuted, opacity: 1 },
        }}
        fullWidth
      />
    </Box>
  );
}
