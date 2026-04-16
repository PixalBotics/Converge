"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import { Typography } from "@/components/common";
import {
  Close as CloseIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import { logoSvg } from "@/assets";
import { useAuth } from "@/lib/auth";
import { PERMISSION_BUCKET_PAGE } from "@/lib/auth/permissions-model";
import {
  SIDEBAR_WIDTH,
  navTypographyBase,
  sectionLabelSx,
  navItemSx,
  sidebarInnerSx,
  headerBoxSx,
  logoImgSx,
  closeButtonSx,
  listSx,
  sidebarFooterSx,
  sidebarFooterListSx,
  listIconSelectedSx,
  listIconDefaultSx,
  desktopWrapperSx,
  mobileDrawerBackdropSx,
  mobileDrawerPaperSx,
} from "./DashboardSidebar.styles";
import type { AppTheme } from "@/theme/theme";
import {
  getVisibleDashboardNavItems,
  isNavPathSelected,
} from "@/lib/permissions";
import { SidebarReactIcon } from "./icons/SidebarReactIcon";

export default function DashboardSidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const theme = useTheme() as AppTheme;
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const pathname = usePathname();
  const { user, logout, isImpersonating, revertImpersonation, rbacEnabled, permissionsByType } = useAuth();
  const isDemoUser = user?.email?.trim().toLowerCase() === "demo@gmail.com";
  const navTextProps = {
    ...navTypographyBase,
  };
  const pagePermissionSet = new Set(permissionsByType?.[PERMISSION_BUCKET_PAGE] ?? []);
  const activityItems = getVisibleDashboardNavItems({
    section: "activity",
    rbacEnabled,
    pagePermissionSet,
    isDemoUser,
  });
  const footerItems = getVisibleDashboardNavItems({
    section: "footer",
    rbacEnabled,
    pagePermissionSet,
    isDemoUser,
  });

  const sidebarContent = (
    <Box sx={sidebarInnerSx}>
      <Box sx={headerBoxSx}>
        <Box
          component="img"
          src={logoSvg}
          alt="Interchanges"
          sx={logoImgSx}
        />
        {!isDesktop && onClose && (
          <IconButton onClick={onClose} sx={closeButtonSx} aria-label="Close menu" size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <List dense sx={listSx}>
        <Typography sx={sectionLabelSx}>ACTIVITY</Typography>
        {activityItems.map((item) => {
          const selected = isNavPathSelected(pathname, item.href, item.prefixMatch);
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={selected}
              sx={navItemSx}
              onClick={() => !isDesktop && onClose?.()}
            >
              <ListItemIcon sx={selected ? listIconSelectedSx : listIconDefaultSx}>
                <SidebarReactIcon iconKey={item.iconKey} />
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={navTextProps} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={sidebarFooterSx}>
        <List dense sx={sidebarFooterListSx}>
          {footerItems.map((item) => {
            const selected = pathname === item.href;
            return (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                selected={selected}
                sx={navItemSx}
                onClick={() => !isDesktop && onClose?.()}
              >
                <ListItemIcon sx={selected ? listIconSelectedSx : listIconDefaultSx}>
                  <SidebarReactIcon iconKey={item.iconKey} />
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={navTextProps} />
              </ListItemButton>
            );
          })}
          <ListItemButton
            component="button"
            type="button"
            sx={navItemSx}
            selected={isImpersonating}
            onClick={() => {
              if (!isDesktop) onClose?.();
              if (isImpersonating) {
                void revertImpersonation();
                return;
              }
              logout();
            }}
          >
            <ListItemIcon sx={listIconDefaultSx}>
              {isImpersonating ? <LoginIcon sx={{ color: "inherit" }} /> : <LogoutIcon sx={{ color: "inherit" }} />}
            </ListItemIcon>
            <ListItemText
              primary={isImpersonating ? "Login As Admin" : "Log out"}
              primaryTypographyProps={navTextProps}
            />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );

  if (isDesktop) {
    return <Box sx={desktopWrapperSx}>{sidebarContent}</Box>;
  }

  return (
    <Drawer
      anchor="left"
      variant="temporary"
      open={open}
      onClose={() => onClose?.()}
      elevation={0}
      slotProps={{
        paper: {
          elevation: 0,
          sx: mobileDrawerPaperSx,
        },
        backdrop: {
          sx: mobileDrawerBackdropSx,
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      {sidebarContent}
    </Drawer>
  );
}

export { SIDEBAR_WIDTH };
