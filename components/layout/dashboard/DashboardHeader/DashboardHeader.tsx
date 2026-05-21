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
import { HeaderSettingsIcon, SearchIcon } from "@/components/common/icons";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { createDashboardHeaderShellSx, dashboardHeaderCircleIconButtonSx } from "./styles/shell.styles";
import { dashboardFirstWord, dashboardRoleLabel, dashboardUserInitials } from "./dashboard-header.labels";
import { DashboardHeaderSearchBar } from "./DashboardHeaderSearchBar";
import { DashboardHeaderMobileSearchTray } from "./DashboardHeaderMobileSearchTray";
import { NotificationsBellDrawer } from "@/components/notifications/NotificationsBellDrawer";

export default function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const theme = useTheme() as AppTheme;
  const app = theme.app;

  const headerSx = useMemo<SxProps<Theme>>(
    () => createDashboardHeaderShellSx(theme),
    [theme, app.dashboard.shellBorder, app.dashboard.shellRadius, app.dashboard.headerBackdropBlur],
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout, isImpersonating, revertImpersonation } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const open = Boolean(anchorEl);

  const displayName = user?.displayName ?? "User";
  const initials = useMemo(() => dashboardUserInitials(displayName), [displayName]);
  const roleLabel = useMemo(() => dashboardRoleLabel(user ?? null), [user]);
  const welcomeName = useMemo(() => dashboardFirstWord(displayName), [displayName]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleClose();
    logout();
  };
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
            gap: { xs: 0.25, sm: 1.5 },
            flex: 1,
            minWidth: 0,
            justifyContent: "flex-end",
          }}
        >
          {!isMobile && (
            <Box sx={{ width: { md: 230, lg: 400 }, flexShrink: 0 }}>
              <Box sx={{ width: "100%" }}>
                <DashboardHeaderSearchBar theme={theme} />
              </Box>
            </Box>
          )}
          {isMobile && (
            <IconButton
              onClick={() => setMobileSearchOpen(true)}
              sx={{ color: app.dashboard.white90 }}
              size="small"
              aria-label="Open search"
            >
              <SearchIcon sx={{ fontSize: 22 }} />
            </IconButton>
          )}
          <IconButton
            sx={
              [
                dashboardHeaderCircleIconButtonSx(app),
                { display: { xs: "none", md: "inline-flex" } },
              ] as SxProps<Theme>
            }
            aria-label="Settings"
          >
            <HeaderSettingsIcon width={22} height={22} />
          </IconButton>
          <NotificationsBellDrawer />
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 }, ml: { xs: 0, sm: 1 } }}>
            <Avatar
              sx={{
                width: { xs: 32, md: 40 },
                height: { xs: 32, md: 40 },
                bgcolor: app.dashboard.accentBlue,
                fontSize: "0.9rem",
              }}
            >
              {initials}
            </Avatar>
            <Box
              component="button"
              type="button"
              onClick={handleClick}
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 0.5,
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 0,
                textAlign: "left",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: app.text.primary }}>
                  {displayName.toUpperCase()}
                </Typography>
                <Typography variant="medium" sx={{ color: app.dashboard.white60 }}>
                  {roleLabel}
                </Typography>
              </Box>
              <KeyboardArrowDownIcon sx={{ color: app.dashboard.white60, fontSize: 20 }} />
            </Box>
            {isMobile && (
              <IconButton onClick={handleClick} sx={{ color: app.dashboard.white90, p: 0.5 }} aria-label="Account menu">
                <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      {isMobile && (
        <DashboardHeaderMobileSearchTray
          theme={theme}
          open={mobileSearchOpen}
          onClose={() => setMobileSearchOpen(false)}
        />
      )}

      <AccountMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        isImpersonating={isImpersonating}
        onLogout={handleLogout}
        onLoginAsAdmin={handleLoginAsAdmin}
      />
    </>
  );
}
