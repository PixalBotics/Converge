"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Typography } from "@/components/common";
import type { AppTheme } from "@/theme/theme";
import { useDashboardAppearance } from "@/lib/dashboard-appearance/context";
import { glassChromeLayerSx } from "@/lib/dashboard-appearance/shellStyles";
import {
  headerBaseSx,
  headerDividerSx,
  searchShellSx,
  toolbarIconSx,
  userCapsuleSx,
} from "./DashboardHeader.styles";
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
  Settings as SettingsMenuIcon,
} from "@mui/icons-material";
import { useAuth } from "@/lib/auth";
import { SearchIcon } from "./icons/SearchIcon";
import { BellIcon } from "./icons/BellIcon";
import { HeaderSettingsIcon } from "./icons/HeaderSettingsIcon";
import type { SxProps, Theme } from "@mui/material/styles";

/** RGB for focus ring (matches default indigo primary) */
const PRIMARY_FOCUS_RGB = "99, 102, 241";

export default function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const theme = useTheme() as AppTheme;
  const { appearance } = useDashboardAppearance();
  const headerSxLive: SxProps<Theme> = {
    ...headerBaseSx,
    ...glassChromeLayerSx(appearance.headerChrome, { borderBottom: true }),
    width: "100%",
  };
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const open = Boolean(anchorEl);
  const b = appearance.accents.searchBorderOpacity;

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
  const roleLabel = user?.role === "admin" ? "Admin" : "User";

  const searchBarContent = useMemo(
    () => (
      <Box
        sx={searchShellSx(
          appearance.accents.searchFillOpacity,
          appearance.accents.searchBorderOpacity,
          PRIMARY_FOCUS_RGB
        )}
      >
        <SearchIcon sx={{ fontSize: 20, color: theme.app.text.iconMuted, flexShrink: 0 }} />
        <InputBase
          placeholder="Search anything…"
          sx={{
            flex: 1,
            minWidth: 0,
            color: theme.app.text.primary,
            fontSize: "0.9375rem",
            "& input": { py: 0.25, letterSpacing: "0.01em" },
            "& input::placeholder": { color: theme.app.text.placeholder, opacity: 1 },
          }}
          fullWidth
        />
      </Box>
    ),
    [
      appearance.accents.searchBorderOpacity,
      appearance.accents.searchFillOpacity,
      theme.app.text.iconMuted,
      theme.app.text.placeholder,
      theme.app.text.primary,
    ]
  );

  return (
    <>
      <Box component="header" sx={headerSxLive}>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.75 }, minWidth: 0, flexShrink: 0 }}>
          {isMobile && onMenuClick && (
            <IconButton
              onClick={onMenuClick}
              sx={toolbarIconSx(theme, b)}
              aria-label="Open menu"
            >
              <MenuIcon sx={{ fontSize: 22 }} />
            </IconButton>
          )}
          <Box sx={{ display: "flex", gap: 1.5, minWidth: 0, alignItems: "center" }}>
            <Box
              aria-hidden
              sx={{
                width: 4,
                height: 32,
                borderRadius: "4px",
                flexShrink: 0,
                display: { xs: "none", sm: "block" },
                background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
              }}
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.2, minWidth: 0 }}>
              <Typography
                variant="medium"
                sx={{
                  color: theme.app.text.secondary,
                  fontSize: { xs: 10, md: 11 },
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  opacity: 0.88,
                }}
              >
                Dashboard
              </Typography>
              <Typography
                variant="boldLarge"
                sx={{
                  fontSize: { xs: 15, sm: 16, md: 17 },
                  fontWeight: 700,
                  letterSpacing: -0.03,
                  lineHeight: 1.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: theme.app.text.primary,
                }}
              >
                Welcome back, {displayName.split(" ")[0]}
              </Typography>
            </Box>
          </Box>
        </Box>

        {!isMobile ? (
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              justifyContent: "center",
              px: { md: 1.5, lg: 2.5 },
            }}
          >
            <Box sx={{ width: "100%", maxWidth: { md: 380, lg: 460, xl: 520 } }}>{searchBarContent}</Box>
          </Box>
        ) : null}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.75, sm: 1.25, md: 1.5 },
            flexShrink: 0,
          }}
        >
          {isMobile && (
            <IconButton
              onClick={() => setMobileSearchOpen(true)}
              sx={toolbarIconSx(theme, b)}
              aria-label="Open search"
            >
              <SearchIcon sx={{ fontSize: 21 }} />
            </IconButton>
          )}

          <Divider orientation="vertical" flexItem sx={headerDividerSx} />

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 0.75 } }}>
            <IconButton
              component={Link}
              href="/dashboard/settings"
              sx={toolbarIconSx(theme, b, { hideBelow: "md" })}
              aria-label="Theme & settings"
            >
              <HeaderSettingsIcon />
            </IconButton>
            <IconButton sx={toolbarIconSx(theme, b)} aria-label="Notifications">
              <BellIcon />
            </IconButton>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={handleClick}
            sx={{
              ...userCapsuleSx(theme, b),
              cursor: "pointer",
              font: "inherit",
              ml: { xs: 0, sm: 0.25 },
              outline: "none",
              "&:focus-visible": {
                outline: `2px solid rgba(${PRIMARY_FOCUS_RGB},0.55)`,
                outlineOffset: 3,
              },
            }}
            aria-expanded={open}
            aria-haspopup="true"
          >
            <Avatar
              sx={{
                width: { xs: 36, md: 42 },
                height: { xs: 36, md: 42 },
                fontSize: { xs: "0.8rem", md: "0.875rem" },
                fontWeight: 700,
                color: theme.app.text.primary,
                border: "2px solid rgba(255,255,255,0.2)",
                background: `linear-gradient(145deg, #818CF8 0%, ${theme.palette.primary.main} 42%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: `0 4px 16px rgba(99, 102, 241, 0.45)`,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "left", minWidth: 0, pr: 0.25 }}>
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: theme.app.text.primary,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: { sm: 120, md: 168 },
                }}
              >
                {displayName}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  color: theme.app.text.secondary,
                  fontWeight: 600,
                  mt: 0.15,
                  letterSpacing: "0.02em",
                }}
              >
                {roleLabel}
              </Typography>
            </Box>
            <KeyboardArrowDownIcon
              sx={{
                color: theme.app.text.secondary,
                fontSize: 22,
                display: { xs: "none", sm: "block" },
                flexShrink: 0,
                opacity: 0.85,
              }}
            />
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
              bgcolor: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
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
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              ...glassChromeLayerSx(
                { ...appearance.headerChrome, fillOpacity: Math.min(0.72, appearance.headerChrome.fillOpacity + 0.16) },
                { borderBottom: true }
              ),
              boxShadow: "0 20px 48px rgba(0,0,0,0.4)",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>{searchBarContent}</Box>
            <IconButton onClick={() => setMobileSearchOpen(false)} sx={toolbarIconSx(theme, b)} aria-label="Close search">
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
              mt: 1.25,
              minWidth: 212,
              overflow: "hidden",
              borderRadius: "14px",
              bgcolor: theme.app.dashboard.cardBg,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 24px 56px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)"
                  : "0 20px 48px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
            },
          },
        }}
      >
        <MenuItem
          component={Link}
          href="/dashboard/settings"
          onClick={handleClose}
          sx={{ py: 1.25, gap: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <SettingsMenuIcon fontSize="small" sx={{ color: "text.secondary" }} />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ py: 1.25, gap: 1 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <LogoutIcon fontSize="small" sx={{ color: "text.secondary" }} />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
}
