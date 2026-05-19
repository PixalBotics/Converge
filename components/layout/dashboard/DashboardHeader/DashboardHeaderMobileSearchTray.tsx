"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Close as CloseIcon } from "@mui/icons-material";
import type { AppTheme } from "@/theme/theme";
import { DashboardHeaderSearchBar } from "./DashboardHeaderSearchBar";

export function DashboardHeaderMobileSearchTray({
  theme,
  open,
  onClose,
}: {
  theme: AppTheme;
  open: boolean;
  onClose: () => void;
}) {
  const app = theme.app;
  return (
    <>
      <Box
        onClick={onClose}
        sx={{
          display: open ? "block" : "none",
          position: "fixed",
          inset: 0,
          zIndex: 1300,
          bgcolor: app.dashboard.mobileSearchBackdrop,
        }}
        aria-hidden
      />
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1301,
          p: 2,
          pt: 2.5,
          display: open ? "flex" : "none",
          alignItems: "center",
          gap: 1,
          background: app.dashboard.mobileSearchBarBg,
          boxShadow: app.dashboard.mobileSearchBarShadow,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <DashboardHeaderSearchBar theme={theme} />
        </Box>
        <IconButton onClick={onClose} sx={{ color: app.dashboard.white90, flexShrink: 0 }} aria-label="Close search">
          <CloseIcon />
        </IconButton>
      </Box>
    </>
  );
}
