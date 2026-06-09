"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import { ChevronLeft, ChevronRight, Close as CloseIcon } from "@mui/icons-material";
import { logoSvg } from "@/assets";
import { useAuth } from "@/lib/auth";
import {
  PERMISSION_BUCKET_OPERATIONAL,
  PERMISSION_BUCKET_PAGE,
  toPermissionSet,
} from "@/lib/auth/permissions-model";
import { getVisibleDashboardNavItems } from "@/lib/permissions";
import type { AppTheme } from "@/theme/theme";
import { mergeSx } from "@/lib/mui/merge-sx";
import {
  navTypographyBase,
  sidebarInnerSx,
  headerBoxSx,
  logoImgSx,
  closeButtonSx,
  collapsedHeaderBoxSx,
  desktopWrapperSx,
  mobileDrawerBackdropSx,
  mobileDrawerPaperSx,
  sidebarCollapseToggleSx,
} from "./styles/sidebar.styles";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "dashboard-sidebar-collapsed";
import { DashboardActivityNavList } from "./DashboardActivityNavList";
import { DashboardSidebarFooter } from "./DashboardSidebarFooter";

export default function DashboardSidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const theme = useTheme() as AppTheme;
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "1");
    } catch {
      setCollapsed(false);
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const collapseSidebar = useCallback(() => {
    if (!isDesktop) return;
    setCollapsed(true);
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, [isDesktop]);

  const railCollapsed = isDesktop && collapsed;
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
  const operationalPermissionSet = toPermissionSet(
    permissionsByType?.[PERMISSION_BUCKET_OPERATIONAL],
  );
  const pagePermsRaw = permissionsByType?.[PERMISSION_BUCKET_PAGE];

  const activityItems = getVisibleDashboardNavItems({
    section: "activity",
    rbacEnabled,
    pagePermissionSet,
    operationalPermissionSet,
    isDemoUser,
    isPlatformAdmin,
    isInternalUser: user?.userType === "Internal",
    isPoolHead: user?.isPoolHead === true,
  });
  const footerItems = getVisibleDashboardNavItems({
    section: "footer",
    rbacEnabled,
    pagePermissionSet,
    operationalPermissionSet,
    isDemoUser,
    isPlatformAdmin,
    isInternalUser: user?.userType === "Internal",
    isPoolHead: user?.isPoolHead === true,
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
    <Box sx={mergeSx(sidebarInnerSx(railCollapsed), { position: "relative" })}>
      <Box sx={mergeSx(headerBoxSx, railCollapsed ? collapsedHeaderBoxSx : undefined)}>
        {!railCollapsed ? (
          <Box component="img" src={logoSvg} alt="Interchanges" sx={logoImgSx} />
        ) : null}
        {isDesktop ? (
          <IconButton
            onClick={toggleCollapsed}
            sx={sidebarCollapseToggleSx(railCollapsed)}
            aria-label={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            size="small"
          >
            {railCollapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        ) : null}
        {!isDesktop && onClose ? (
          <IconButton onClick={onClose} sx={closeButtonSx} aria-label="Close menu" size="small">
            <CloseIcon />
          </IconButton>
        ) : null}
      </Box>

      <DashboardActivityNavList
        activityItems={activityItems}
        pathname={pathname}
        navTextProps={navTextProps}
        showActivityNavSkeleton={showActivityNavSkeleton}
        showNoModulesHint={showNoModulesHint}
        isDesktop={isDesktop}
        collapsed={railCollapsed}
        onCollapseSidebar={collapseSidebar}
        onClose={onClose}
      />

      <DashboardSidebarFooter
        footerItems={footerItems}
        pathname={pathname}
        navTextProps={navTextProps}
        isDesktop={isDesktop}
        collapsed={railCollapsed}
        onClose={onClose}
        isImpersonating={isImpersonating}
        revertImpersonation={revertImpersonation}
        logout={logout}
      />
    </Box>
  );

  if (isDesktop) {
    return <Box sx={desktopWrapperSx(railCollapsed)}>{sidebarContent}</Box>;
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
