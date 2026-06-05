"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";
import { Typography } from "@/components/common";
import { SidebarReactIcon } from "@/components/common/icons";
import { isNavPathSelected, type DashboardNavItem } from "@/lib/permissions";
import {
  collapsedNavItemSx,
  navItemSx,
  listIconDefaultSx,
  listIconSelectedSx,
  navTypographyBase,
  sectionDividerSx,
  sectionLabelSx,
  listSx,
} from "./styles/sidebar.styles";
import { sidebarNavLabel } from "./dashboard-sidebar.labels";
import { ActivityNavGroup } from "./ActivityNavGroup";
import { SidebarNavTooltip } from "./SidebarNavTooltip";
import { mergeSx } from "@/lib/mui/merge-sx";
import { shouldCollapseSidebarForNavHref } from "./sidebar-collapse-on-nav";

type NavTextProps = typeof navTypographyBase;

export function DashboardActivityNavList({
  activityItems,
  pathname,
  navTextProps,
  showActivityNavSkeleton,
  showNoModulesHint,
  isDesktop,
  collapsed = false,
  onCollapseSidebar,
  onClose,
}: {
  activityItems: DashboardNavItem[];
  pathname: string;
  navTextProps: NavTextProps;
  showActivityNavSkeleton: boolean;
  showNoModulesHint: boolean;
  isDesktop: boolean;
  collapsed?: boolean;
  onCollapseSidebar?: () => void;
  onClose?: () => void;
}) {
  const onNavigate = (href?: string) => {
    if (href && shouldCollapseSidebarForNavHref(href)) {
      onCollapseSidebar?.();
    }
    if (!isDesktop) onClose?.();
  };

  return (
    <List dense={false} sx={listSx}>
      {collapsed ? (
        <Box sx={sectionDividerSx} aria-hidden />
      ) : (
        <Typography sx={sectionLabelSx}>ACTIVITY</Typography>
      )}
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
      ) : showNoModulesHint && !collapsed ? (
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
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            );
          }
          const selected = isNavPathSelected(pathname, item.href, item.prefixMatch);
          const label = sidebarNavLabel(item.label);
          return (
            <SidebarNavTooltip key={item.href} collapsed={collapsed} title={label}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={selected}
                sx={mergeSx(navItemSx, collapsed ? collapsedNavItemSx : undefined)}
                onClick={() => onNavigate(item.href)}
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
        })
      )}
    </List>
  );
}
