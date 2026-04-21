"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import List from "@mui/material/List";
import Skeleton from "@mui/material/Skeleton";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import { Typography } from "@/components/common";
import {
  Close as CloseIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import { logoSvg } from "@/assets";
import { useAuth } from "@/lib/auth";
import { PERMISSION_BUCKET_PAGE, toPermissionSet } from "@/lib/auth/permissions-model";
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
  type DashboardNavItem,
} from "@/lib/permissions";
import { SidebarReactIcon } from "./icons/SidebarReactIcon";

function ActivityNavGroup({
  item,
  pathname,
  navTextProps,
  onNavigate,
}: {
  item: DashboardNavItem;
  pathname: string;
  navTextProps: typeof navTypographyBase;
  onNavigate: () => void;
}) {
  const children = item.children ?? [];
  const isChildActive = children.some((ch) => isNavPathSelected(pathname, ch.href, ch.prefixMatch));
  const [open, setOpen] = useState(isChildActive);
  const nestedNavItemSx = (theme: Theme): SystemStyleObject<Theme> => ({
    ...(navItemSx as (t: Theme) => SystemStyleObject<Theme>)(theme),
    pl: 5,
  });

  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  return (
    <>
      <ListItemButton
        onClick={() => setOpen((v) => !v)}
        sx={navItemSx}
        aria-expanded={open}
      >
        <ListItemIcon sx={listIconDefaultSx}>
          <SidebarReactIcon iconKey={item.iconKey} />
        </ListItemIcon>
        <ListItemText primary={item.label} primaryTypographyProps={navTextProps} />
        <Box sx={{ display: "flex", alignItems: "center", color: "inherit" }}>
          {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </Box>
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {children.map((ch) => {
            const selected = isNavPathSelected(pathname, ch.href, ch.prefixMatch);
            return (
              <ListItemButton
                key={ch.href}
                component={Link}
                href={ch.href}
                selected={selected}
                sx={nestedNavItemSx}
                onClick={onNavigate}
              >
                <ListItemIcon sx={selected ? listIconSelectedSx : listIconDefaultSx}>
                  <SidebarReactIcon iconKey={ch.iconKey} />
                </ListItemIcon>
                <ListItemText primary={ch.label} primaryTypographyProps={navTextProps} />
              </ListItemButton>
            );
          })}
        </List>
      </Collapse>
    </>
  );
}

export default function DashboardSidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const theme = useTheme() as AppTheme;
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const pathname = usePathname();
  const {
    user,
    logout,
    isImpersonating,
    revertImpersonation,
    rbacEnabled,
    permissionsByType,
    permissionsSyncing,
    isPlatformAdmin,
  } = useAuth();
  const isDemoUser = user?.email?.trim().toLowerCase() === "demo@gmail.com";
  const navTextProps = {
    ...navTypographyBase,
  };
  const pagePermissionSet = toPermissionSet(permissionsByType?.[PERMISSION_BUCKET_PAGE]);
  const pagePermsRaw = permissionsByType?.[PERMISSION_BUCKET_PAGE];

  const activityItems = getVisibleDashboardNavItems({
    section: "activity",
    rbacEnabled,
    pagePermissionSet,
    isDemoUser,
    isPlatformAdmin,
  });
  const footerItems = getVisibleDashboardNavItems({
    section: "footer",
    rbacEnabled,
    pagePermissionSet,
    isDemoUser,
    isPlatformAdmin,
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.log("[DashboardSidebar] PAGE permissions for nav", {
      pageCountInSet: pagePermissionSet.size,
      pageKeysSorted: [...pagePermissionSet].sort(),
      rawPageArrayFromAuth: pagePermsRaw ?? null,
      rawPageArrayLength: pagePermsRaw?.length ?? 0,
      rbacEnabled,
      permissionsSyncing,
      isPlatformAdmin,
      visibleActivityNavRows: activityItems.length,
      visibleFooterNavRows: footerItems.length,
    });
  }, [
    pagePermissionSet,
    pagePermsRaw,
    rbacEnabled,
    permissionsSyncing,
    isPlatformAdmin,
    activityItems.length,
    footerItems.length,
  ]);

  const showActivityNavSkeleton = permissionsSyncing;
  const showNoModulesHint =
    rbacEnabled && !permissionsSyncing && activityItems.length === 0 && Boolean(user);

  const sidebarContent = (
    <Box sx={{ ...sidebarInnerSx, position: "relative" }}>
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
        {showActivityNavSkeleton ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, py: 0.5, px: 0.5 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={`nav-skel-${i}`}
                variant="rounded"
                height={40}
                animation="wave"
                sx={{
                  bgcolor: "rgba(255,255,255,0.06)",
                  borderRadius: 1,
                }}
              />
            ))}
          </Box>
        ) : showNoModulesHint ? (
          <Typography
            variant="body2"
            sx={{
              px: 1.5,
              py: 2,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.5,
              fontSize: 13,
            }}
          >
            No navigation modules are assigned to this account yet. Ask an administrator to grant page permissions.
          </Typography>
        ) : (
          activityItems.map((item) => {
            if (item.children?.length) {
              return (
                <ActivityNavGroup
                  key={`group:${item.label}`}
                  item={item}
                  pathname={pathname}
                  navTextProps={navTextProps}
                  onNavigate={() => !isDesktop && onClose?.()}
                />
              );
            }
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
          })
        )}
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
