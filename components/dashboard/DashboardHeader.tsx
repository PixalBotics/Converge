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

const headerSx: SxProps<Theme> = {
  height: { xs: 72, sm: 88, md: 104 },
  px: { xs: 1.5, sm: 2, md: 3 },
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: { xs: 1, sm: 1.5, md: 3 },
  position: "relative",
  background: (theme) => (theme as Theme & { appBackground?: string }).appBackground ?? "radial-gradient(50% 50% at 50% 50%, #09013F 0%, #00011A 100%)",
  "&::after": {
    content: '""',
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "1px",
    background: "linear-gradient(90deg, #0F0747 0%, #0F0557 100%)",
  },
};

export default function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const theme = useTheme();
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
    user?.role === "admin"
      ? "Admin"
      : user?.role === "hr-admin"
        ? "HR Admin"
        : user?.role === "network-admin"
          ? "Network Admin"
          : user?.role === "manager"
            ? "Manager"
            : user?.role === "system-admin"
              ? "System Admin"
          : "User";

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
          bgcolor: "rgba(255,255,255,0.06)",
          border: "1px solid #181818",
          width: "100%",
        }}
      >
        <SearchIcon sx={{ fontSize: 20 }} />
        <InputBase
          placeholder="Search anything"
          sx={{ color: "white", "& input::placeholder": { opacity: 0.7 } }}
          fullWidth
        />
      </Box>
    ),
    []
  );

  return (
    <>
    <Box component="header" sx={headerSx}>
      {isMobile && onMenuClick && (
        <IconButton onClick={onMenuClick} sx={{ color: "rgba(255,255,255,0.9)", mr: 0.5 }} aria-label="Open menu">
          <MenuIcon />
        </IconButton>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, flexShrink: 0, minWidth: 0 }}>
        <Typography variant="medium" sx={{ color: "#FFFFFF80", fontSize: { xs: 12, md: 14 } }}>
          Dashboard
        </Typography>
        <Typography variant="boldLarge" color="white" sx={{ fontSize: { xs: 14, sm: 16, md: 18 }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
          sx={{ color: "rgba(255,255,255,0.9)" }}
          size="small"
          aria-label="Open search"
        >
          <SearchIcon sx={{ fontSize: 22 }} />
        </IconButton>
      )}
        <IconButton sx={{ color: "rgba(255,255,255,0.8)", display: { xs: "none", md: "inline-flex" }, border: "1px solid #181818" }} size="small" aria-label="Settings">
          <HeaderSettingsIcon />
        </IconButton>
        <IconButton sx={{ color: "rgba(255,255,255,0.8)", border: "1px solid #181818" }} size="small" aria-label="Notifications">
          <BellIcon />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 }, ml: { xs: 0, sm: 1 } }}>
          <Avatar
            sx={{
              width: { xs: 32, md: 40 },
              height: { xs: 32, md: 40 },
              bgcolor: "#3B82F6",
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
              <Typography variant="body2" fontWeight={600} color="white">
                {displayName.toUpperCase()}
              </Typography>
              <Typography variant="medium" color="rgba(255,255,255,0.6)">
                {roleLabel}
              </Typography>
            </Box>
            <KeyboardArrowDownIcon sx={{ color: "rgba(255,255,255,0.6)", fontSize: 20 }} />
          </Box>
          {isMobile && (
            <IconButton onClick={handleClick} sx={{ color: "rgba(255,255,255,0.9)", p: 0.5 }} aria-label="Account menu">
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
            bgcolor: "rgba(0,0,0,0.4)",
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
            background: "rgba(9, 1, 63, 0.95)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>{searchBarContent}</Box>
          <IconButton
            onClick={() => setMobileSearchOpen(false)}
            sx={{ color: "rgba(255,255,255,0.9)", flexShrink: 0 }}
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
        slotProps={{ paper: { sx: { bgcolor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", mt: 1.5 } } }}
      >
        <MenuItem onClick={handleLogout} sx={{ color: "white" }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.8)" }} />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
}
