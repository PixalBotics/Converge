"use client";

import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Typography } from "@/components/common";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import {
  Menu as MenuIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useAuth } from "@/lib/auth";
import { SearchIcon } from "./icons/SearchIcon";
import { BellIcon } from "./icons/BellIcon";
import { HeaderSettingsIcon } from "./icons/HeaderSettingsIcon";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { mainBackgroundGradient } from "@/theme/theme";

export default function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const theme = useTheme() as AppTheme;
  const app = theme.app;

  const headerSx = useMemo<SxProps<Theme>>(
    () => ({
      height: { xs: 72, sm: 88, md: 104 },
      px: { xs: 1.5, sm: 2, md: 3 },
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: { xs: 1, sm: 1.5, md: 3 },
      position: "relative",
      boxSizing: "border-box",
      overflow: "hidden",
      borderRadius: { xs: 0, md: app.dashboard.shellRadius },
      border: { xs: "none", md: `1px solid ${app.dashboard.shellBorder}` },
      mb: { xs: 0, md: 2 },
      boxShadow: {
        md: "0 8px 32px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
      },
      background: (t) => {
        const a = (t as AppTheme).app;
        const hb = a.dashboard.headerBackdropBlur;
        if (hb && hb !== "none") {
          return a.dashboard.headerBg;
        }
        return (t as Theme & { appBackground?: string }).appBackground ?? mainBackgroundGradient;
      },
      backdropFilter:
        app.dashboard.headerBackdropBlur && app.dashboard.headerBackdropBlur !== "none"
          ? app.dashboard.headerBackdropBlur
          : undefined,
      WebkitBackdropFilter:
        app.dashboard.headerBackdropBlur && app.dashboard.headerBackdropBlur !== "none"
          ? app.dashboard.headerBackdropBlur
          : undefined,
      "&::after": {
        content: '""',
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "1px",
        backgroundColor: app.dashboard.shellBorder,
      },
    }),
    [
      app.dashboard.shellBorder,
      app.dashboard.shellRadius,
      app.dashboard.headerBackdropBlur,
    ]
  );
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleClose();
    logout();
  };

  const displayName = user?.displayName ?? "User";
  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    [displayName]
  );
  const roleLabel =
    user?.roleLabel ??
    (user?.role === "admin"
      ? "Admin"
      : user?.role === "hr-admin"
        ? "HR Admin"
        : user?.role === "network-admin"
          ? "Network Admin"
          : user?.role === "manager"
            ? "Manager"
            : "User");

  const searchBarContent = useMemo(
    () => (
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
    ),
    [app.dashboard.overlayLight, app.dashboard.searchChromeBorder, app.text.primary, app.text.iconMuted]
  );

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
          Welcome back, {displayName.split(" ")[0]} 
          {/* 👋 */}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.25, sm: 1.5 }, flex: 1, minWidth: 0, justifyContent: "flex-end" }}>
      {!isMobile && (
        <Box sx={{ width: { md: 230, lg: 400 }, flexShrink: 0 }}>
          <Box sx={{ width: "100%" }}>{searchBarContent}</Box>
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
          sx={{
            color: app.dashboard.white80,
            display: { xs: "none", md: "inline-flex" },
            border: `1px solid ${app.dashboard.searchChromeBorder}`,
          }}
          size="small"
          aria-label="Settings"
        >
          <HeaderSettingsIcon />
        </IconButton>
        <IconButton
          sx={{ color: app.dashboard.white80, border: `1px solid ${app.dashboard.searchChromeBorder}` }}
          size="small"
          aria-label="Notifications"
        >
          <BellIcon />
        </IconButton>
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
      <>
        <Box
          onClick={() => setMobileSearchOpen(false)}
          sx={{
            display: mobileSearchOpen ? "block" : "none",
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
            display: mobileSearchOpen ? "flex" : "none",
            alignItems: "center",
            gap: 1,
            background: app.dashboard.mobileSearchBarBg,
            boxShadow: app.dashboard.mobileSearchBarShadow,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>{searchBarContent}</Box>
          <IconButton
            onClick={() => setMobileSearchOpen(false)}
            sx={{ color: app.dashboard.white90, flexShrink: 0 }}
            aria-label="Close search"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </>
    )}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: app.dashboard.menuSurfaceBg,
              border: `1px solid ${app.dashboard.cardBorder}`,
              mt: 1.5,
            },
          },
        }}
      >
        <MenuItem onClick={handleLogout} sx={{ color: app.text.primary }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: app.dashboard.white80 }} />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
}
