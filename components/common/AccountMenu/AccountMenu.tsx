"use client";

import { useMemo } from "react";
import Link from "next/link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonOutline as PersonOutlineIcon,
  PaletteOutlined as PaletteOutlinedIcon,
} from "@mui/icons-material";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { AccountMenuProps } from "./AccountMenu.types";
import {
  AccountMenuIconWrap,
  accountMenuProfileIconWrapSx,
  accountMenuRowSx,
  accountMenuThemeIconWrapSx,
} from "./AccountMenu.styled";

const defaultProfileHref = "/dashboard/settings?tab=profile";
const defaultThemeHref = "/dashboard/theme";

export function AccountMenu({
  anchorEl,
  open,
  onClose,
  isImpersonating,
  onLogout,
  onLoginAsAdmin,
  profileHref = defaultProfileHref,
  themeHref = defaultThemeHref,
}: AccountMenuProps) {
  const theme = useTheme() as AppTheme;
  const app = theme.app;
  const blur = String(app.dashboard.cardBackdropBlur ?? "").trim();
  const rowSx = accountMenuRowSx(theme);

  const paperSx = useMemo(
    () => ({
      mt: 1.5,
      minWidth: 260,
      py: 1,
      px: 0.5,
      borderRadius: 2.5,
      bgcolor: app.dashboard.menuSurfaceBg,
      border: `1px solid ${app.dashboard.cardBorder}`,
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 20px 56px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 16px 40px rgba(15,23,42,0.14)",
      overflow: "hidden",
      ...(blur && blur !== "none"
        ? { backdropFilter: blur, WebkitBackdropFilter: blur }
        : {}),
    }),
    [app.dashboard.cardBorder, app.dashboard.menuSurfaceBg, theme.palette.mode, blur],
  );

  const signOutRowSx = {
    ...rowSx,
    "&:hover, &.Mui-focusVisible": {
      bgcolor: alpha(app.dashboard.accentRed, theme.palette.mode === "dark" ? 0.18 : 0.12),
      color: app.dashboard.accentRedLight,
    },
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: { sx: paperSx, elevation: 0 },
        list: { sx: { py: 0 } },
      }}
      disableScrollLock
    >
      <MenuItem component={Link} href={profileHref} onClick={onClose} disableRipple sx={rowSx}>
        <AccountMenuIconWrap sx={accountMenuProfileIconWrapSx(theme)}>
          <PersonOutlineIcon sx={{ fontSize: 20, color: "inherit", display: "block", lineHeight: 0 }} />
        </AccountMenuIconWrap>
        <Typography variant="body2" fontWeight={600} sx={{ color: app.text.primary }}>
          Profile
        </Typography>
      </MenuItem>
      <MenuItem component={Link} href={themeHref} onClick={onClose} disableRipple sx={rowSx}>
        <AccountMenuIconWrap sx={accountMenuThemeIconWrapSx(theme)}>
          <PaletteOutlinedIcon sx={{ fontSize: 20, color: "inherit", display: "block", lineHeight: 0 }} />
        </AccountMenuIconWrap>
        <Typography variant="body2" fontWeight={600} sx={{ color: app.text.primary }}>
          Theme
        </Typography>
      </MenuItem>
      <Divider sx={{ my: 0.75, borderColor: app.dashboard.shellBorder, opacity: 0.85 }} />
      <MenuItem onClick={isImpersonating ? onLoginAsAdmin : onLogout} disableRipple sx={signOutRowSx}>
        <AccountMenuIconWrap
          sx={{
            borderColor: alpha(app.dashboard.accentRed, 0.45),
            color: app.dashboard.accentRedLight,
            bgcolor: alpha(app.dashboard.accentRed, theme.palette.mode === "dark" ? 0.12 : 0.08),
          }}
        >
          {isImpersonating ? <LoginIcon sx={{ fontSize: 20 }} /> : <LogoutIcon sx={{ fontSize: 20 }} />}
        </AccountMenuIconWrap>
        <Typography variant="body2" fontWeight={600} sx={{ color: "inherit" }}>
          {isImpersonating ? "Login As Admin" : "Sign Out"}
        </Typography>
      </MenuItem>
    </Menu>
  );
}
