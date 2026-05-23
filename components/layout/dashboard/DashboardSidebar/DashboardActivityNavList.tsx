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
  navItemSx,
  listIconDefaultSx,
  listIconSelectedSx,
  navTypographyBase,
  sectionLabelSx,
  listSx,
} from "./styles/sidebar.styles";
import { sidebarNavLabel } from "./dashboard-sidebar.labels";
import { ActivityNavGroup } from "./ActivityNavGroup";

type NavTextProps = typeof navTypographyBase;

export function DashboardActivityNavList({
  activityItems,
  pathname,
  navTextProps,
  showActivityNavSkeleton,
  showNoModulesHint,
  isDesktop,
  onClose,
}: {
  activityItems: DashboardNavItem[];
  pathname: string;
  navTextProps: NavTextProps;
  showActivityNavSkeleton: boolean;
  showNoModulesHint: boolean;
  isDesktop: boolean;
  onClose?: () => void;
}) {
  const onNavigate = () => {
    if (!isDesktop) onClose?.();
  };

  return (
    <List dense={false} sx={listSx}>
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
                onNavigate={onNavigate}
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
              onClick={onNavigate}
            >
              <ListItemIcon sx={selected ? listIconSelectedSx : listIconDefaultSx}>
                <SidebarReactIcon iconKey={item.iconKey} />
              </ListItemIcon>
              <ListItemText primary={sidebarNavLabel(item.label)} primaryTypographyProps={navTextProps} />
            </ListItemButton>
          );
        })
      )}
    </List>
  );
}
