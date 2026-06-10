"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Popover from "@mui/material/Popover";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { SidebarReactIcon } from "@/components/common/icons";
import { isNavPathSelected, type DashboardNavItem } from "@/lib/permissions";
import {
  collapsedNavItemSx,
  navItemSx,
  listIconDefaultSx,
  listIconSelectedSx,
  navTypographyBase,
} from "./styles/sidebar.styles";
import { sidebarNavLabel } from "./dashboard-sidebar.labels";
import { NavItemBadge } from "./NavItemBadge";
import { SidebarNavTooltip } from "./SidebarNavTooltip";
import { mergeSx } from "@/lib/mui/merge-sx";

type NavTextProps = typeof navTypographyBase;

export function ActivityNavGroup({
  item,
  pathname,
  navTextProps,
  collapsed = false,
  onNavigate,
}: {
  item: DashboardNavItem;
  pathname: string;
  navTextProps: NavTextProps;
  collapsed?: boolean;
  onNavigate: (href?: string) => void;
}) {
  const children = item.children ?? [];
  const navExtras = (ch: DashboardNavItem) => ({
    pathIncludes: ch.pathIncludes,
    pathExcludes: ch.pathExcludes,
  });
  const isChildActive = children.some((ch) =>
    isNavPathSelected(pathname, ch.href, ch.prefixMatch, navExtras(ch)),
  );
  const [open, setOpen] = useState(isChildActive);
  const [flyoutAnchor, setFlyoutAnchor] = useState<HTMLElement | null>(null);
  const groupLabel = sidebarNavLabel(item.label);
  const nestedNavItemSx = (theme: Theme): SystemStyleObject<Theme> => ({
    ...(navItemSx as (t: Theme) => SystemStyleObject<Theme>)(theme),
    pl: collapsed ? "calc(12px)" : 5,
  });

  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  const childLinks = children.map((ch) => {
    const selected = isNavPathSelected(pathname, ch.href, ch.prefixMatch, navExtras(ch));
    return (
      <ListItemButton
        key={ch.href}
        component={Link}
        href={ch.href}
        selected={selected}
        sx={nestedNavItemSx}
        onClick={() => {
          setFlyoutAnchor(null);
          onNavigate(ch.href);
        }}
      >
        <ListItemIcon sx={selected ? listIconSelectedSx : listIconDefaultSx}>
          <SidebarReactIcon iconKey={ch.iconKey} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {sidebarNavLabel(ch.label)}
              <NavItemBadge href={ch.href} />
            </Box>
          }
          primaryTypographyProps={navTextProps}
        />
      </ListItemButton>
    );
  });

  if (collapsed) {
    return (
      <>
        <SidebarNavTooltip collapsed title={groupLabel}>
          <ListItemButton
            selected={isChildActive}
            sx={mergeSx(navItemSx, collapsedNavItemSx)}
            aria-expanded={Boolean(flyoutAnchor)}
            onClick={(e) => setFlyoutAnchor(e.currentTarget)}
          >
            <ListItemIcon sx={isChildActive ? listIconSelectedSx : listIconDefaultSx}>
              <SidebarReactIcon iconKey={item.iconKey} />
            </ListItemIcon>
          </ListItemButton>
        </SidebarNavTooltip>
        <Popover
          open={Boolean(flyoutAnchor)}
          anchorEl={flyoutAnchor}
          onClose={() => setFlyoutAnchor(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{
            paper: {
              elevation: 8,
              sx: { minWidth: 220, py: 0.5 },
            },
          }}
        >
          <List component="div" disablePadding dense={false}>
            {childLinks}
          </List>
        </Popover>
      </>
    );
  }

  return (
    <>
      <ListItemButton onClick={() => setOpen((v) => !v)} sx={navItemSx} aria-expanded={open}>
        <ListItemIcon sx={listIconDefaultSx}>
          <SidebarReactIcon iconKey={item.iconKey} />
        </ListItemIcon>
        <ListItemText primary={groupLabel} primaryTypographyProps={navTextProps} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", color: "inherit", lineHeight: 0, flexShrink: 0 }}>
          {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </Box>
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {childLinks}
        </List>
      </Collapse>
    </>
  );
}
