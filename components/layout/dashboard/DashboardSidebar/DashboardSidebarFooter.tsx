"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Logout as LogoutIcon, Login as LoginIcon } from "@mui/icons-material";
import { SidebarNavIconSlot, SidebarReactIcon } from "@/components/common/icons";
import type { DashboardNavItem } from "@/lib/permissions";
import {
  collapsedNavItemSx,
  navItemSx,
  listIconDefaultSx,
  listIconSelectedSx,
  sidebarFooterSx,
  sidebarFooterListSx,
  navTypographyBase,
} from "./styles/sidebar.styles";
import { sidebarNavLabel } from "./dashboard-sidebar.labels";
import { SidebarNavTooltip } from "./SidebarNavTooltip";
import { mergeSx } from "@/lib/mui/merge-sx";

type NavTextProps = typeof navTypographyBase;

export function DashboardSidebarFooter({
  footerItems,
  pathname,
  navTextProps,
  isDesktop,
  collapsed = false,
  onClose,
  isImpersonating,
  revertImpersonation,
  logout,
}: {
  footerItems: DashboardNavItem[];
  pathname: string;
  navTextProps: NavTextProps;
  isDesktop: boolean;
  collapsed?: boolean;
  onClose?: () => void;
  isImpersonating: boolean;
  revertImpersonation: () => void | Promise<void> | Promise<boolean>;
  logout: () => void;
}) {
  const onNavigate = () => {
    if (!isDesktop) onClose?.();
  };

  return (
    <Box sx={sidebarFooterSx}>
      <List dense={false} sx={sidebarFooterListSx}>
        {footerItems.map((item) => {
          const selected = pathname === item.href;
          const label = sidebarNavLabel(item.label);
          return (
            <SidebarNavTooltip key={item.href} collapsed={collapsed} title={label}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={selected}
                sx={mergeSx(navItemSx, collapsed ? collapsedNavItemSx : undefined)}
                onClick={onNavigate}
              >
                <ListItemIcon sx={selected ? listIconSelectedSx : listIconDefaultSx}>
                  <SidebarReactIcon iconKey={item.iconKey} />
                </ListItemIcon>
                {!collapsed ? (
                  <ListItemText primary={label} primaryTypographyProps={navTextProps} />
                ) : null}
              </ListItemButton>
            </SidebarNavTooltip>
          );
        })}
        <SidebarNavTooltip
          collapsed={collapsed}
          title={isImpersonating ? "Login As Admin" : "Log out"}
        >
          <ListItemButton
            component="button"
            type="button"
            sx={mergeSx(navItemSx, collapsed ? collapsedNavItemSx : undefined)}
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
              <SidebarNavIconSlot>
                {isImpersonating ? (
                  <LoginIcon sx={{ fontSize: 20, width: 20, height: 20, display: "block", lineHeight: 0, color: "inherit" }} />
                ) : (
                  <LogoutIcon sx={{ fontSize: 20, width: 20, height: 20, display: "block", lineHeight: 0, color: "inherit" }} />
                )}
              </SidebarNavIconSlot>
            </ListItemIcon>
            {!collapsed ? (
              <ListItemText
                primary={isImpersonating ? "Login As Admin" : "Log out"}
                primaryTypographyProps={navTextProps}
              />
            ) : null}
          </ListItemButton>
        </SidebarNavTooltip>
      </List>
    </Box>
  );
}
