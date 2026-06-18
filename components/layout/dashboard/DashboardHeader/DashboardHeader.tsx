"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Typography, AccountMenu } from "@/components/common";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import {
  Menu as MenuIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import { useAuth } from "@/lib/auth";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { createDashboardHeaderShellSx } from "./styles/shell.styles";
import { dashboardFirstWord, dashboardRoleLabel, dashboardUserInitials } from "./dashboard-header.labels";
import { NotificationsBellDrawer } from "@/components/notifications/NotificationsBellDrawer";

export default function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const theme = useTheme() as AppTheme;
  const app = theme.app;

  const headerSx = useMemo<SxProps<Theme>>(
    () => createDashboardHeaderShellSx(theme),
    [theme],
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, isImpersonating, revertImpersonation } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const displayName = user?.displayName ?? "User";
  const initials = useMemo(() => dashboardUserInitials(displayName), [displayName]);
  const roleLabel = useMemo(() => dashboardRoleLabel(user ?? null), [user]);
  const welcomeName = useMemo(() => dashboardFirstWord(displayName), [displayName]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLoginAsAdmin = () => {
    handleClose();
    void revertImpersonation();
  };

  return (
    <>
      <Box component="header" sx={headerSx}>
        {isMobile && onMenuClick && (
          <IconButton onClick={onMenuClick} sx={{ color: app.dashboard.white90, mr: 0.5 }} aria-label="Open menu">
            <MenuIcon />
          </IconButton>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, flexShrink: 0, minWidth: 0 }}>
          <Typography variant="medium" sx={{ color: app.dashboard.textSubtleMuted, fontSize: { xs: 12, md: 14 } }}>
            Dashboard
          </Typography>
          <Typography
            variant="boldLarge"
            sx={{
              color: app.text.primary,
              fontSize: { xs: 14, sm: 16, md: 18 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Welcome back, {welcomeName}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.75, sm: 1.25 },
            flex: 1,
            minWidth: 0,
            justifyContent: "flex-end",
          }}
        >
          <NotificationsBellDrawer />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.75, sm: 1.25 },
              minWidth: 0,
              pl: { xs: 0, sm: 0.25 },
            }}
          >
            <Box
              component="button"
              type="button"
              onClick={handleClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 0.75 },
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 0,
                textAlign: "left",
                minWidth: 0,
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 32, md: 40 },
                  height: { xs: 32, md: 40 },
                  bgcolor: app.dashboard.accentBlue,
                  fontSize: "0.9rem",
                  flexShrink: 0,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0, display: { xs: "none", sm: "block" } }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    color: app.text.primary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: { sm: 120, md: 160 },
                  }}
                >
                  {displayName.toUpperCase()}
                </Typography>
                <Typography variant="medium" sx={{ color: app.dashboard.white60 }}>
                  {roleLabel}
                </Typography>
              </Box>
              <KeyboardArrowDownIcon
                sx={{ color: app.dashboard.white60, fontSize: 20, flexShrink: 0 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <AccountMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        isImpersonating={isImpersonating}
        onLoginAsAdmin={handleLoginAsAdmin}
      />
    </>
  );
}
