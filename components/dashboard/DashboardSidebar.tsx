"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import { Typography } from "@/components/common";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "@/lib/auth";
import { useDashboardAppearance } from "@/lib/dashboard-appearance/context";
import { resolveDashboardAppearance } from "@/lib/dashboard-appearance/resolve";
import { SIDEBAR_WIDTH_BY_PRESET, SIDEBAR_WIDTH_STANDARD } from "@/lib/dashboard-appearance/sidebarLayout";
import { glassChromeLayerSx } from "@/lib/dashboard-appearance/shellStyles";
import { logoSvg } from "@/assets";
import {
  SIDEBAR_WIDTH_COLLAPSED,
  navTextProps,
  sectionLabelSx,
  navItemSx,
  navItemCollapsedSx,
  sidebarInnerBaseSx,
  logoImgSx,
  closeButtonSx,
  listSx,
  listIconSelectedSx,
  listIconDefaultSx,
  listIconCollapsedSx,
  railOuterSx,
  backdropSx,
  mobileDrawerSx,
} from "./DashboardSidebar.styles";
import { AIManagementIcon } from "./icons/AIManagementIcon";
import { BillingIcon } from "./icons/BillingIcon";
import { ChatOperationsIcon } from "./icons/ChatOperationsIcon";
import { ChatWidgetIcon } from "./icons/ChatWidgetIcon";
import { DashboardGridIcon } from "./icons/DashboardGridIcon";
import { IntegrationsIcon } from "./icons/IntegrationsIcon";
import { OrganizationUserIcon } from "./icons/OrganizationUserIcon";
import { ReportsIcon } from "./icons/ReportsIcon";
import { SecurityIcon } from "./icons/SecurityIcon";
import { SettingsGearIcon } from "./icons/SettingsGearIcon";
import { SettingsIcon } from "./icons/SettingsIcon";
import { SupervisorIcon } from "./icons/SupervisorIcon";
import { WebsiteAssignIcon } from "./icons/WebsiteAssignIcon";
const SIDEBAR_COLLAPSED_KEY = "interchanges.sidebarCollapsed.v1";

type NavDef = { href: string; label: string; Icon: ElementType };

const MAIN_NAV: NavDef[] = [
  { href: "/dashboard", label: "Dashboard", Icon: DashboardGridIcon },
  { href: "/dashboard/overview", label: "Overview", Icon: OrganizationUserIcon },
  { href: "/dashboard/account-setup", label: "Account Setup", Icon: SettingsGearIcon },
  { href: "/dashboard/website-assigning", label: "Website assigning", Icon: WebsiteAssignIcon },
  { href: "/dashboard/roles", label: "Roles", Icon: OrganizationUserIcon },
  { href: "/dashboard/organization-user", label: "Organization user", Icon: OrganizationUserIcon },
  { href: "/dashboard/supervisor", label: "Supervisor", Icon: SupervisorIcon },
  { href: "/dashboard/chat-operations", label: "Chat Operations", Icon: ChatOperationsIcon },
  { href: "/dashboard/ai-management", label: "AI Management", Icon: AIManagementIcon },
  { href: "/dashboard/reports", label: "Reports", Icon: ReportsIcon },
  { href: "/dashboard/chat-widget", label: "Chat Widget", Icon: ChatWidgetIcon },
  { href: "/dashboard/integrations", label: "Integrations", Icon: IntegrationsIcon },
  { href: "/dashboard/billing", label: "Billing", Icon: BillingIcon },
  { href: "/dashboard/security", label: "Security", Icon: SecurityIcon },
];

export default function DashboardSidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const pathname = usePathname();
  const { appearance } = useDashboardAppearance();
  const shellAppearance = useMemo(() => resolveDashboardAppearance(appearance), [appearance]);
  const sidebarContentWidth = SIDEBAR_WIDTH_BY_PRESET[appearance.sidebarWidth];
  const { logout } = useAuth();

  const [railCollapsed, setRailCollapsed] = useState(false);
  const [railReady, setRailReady] = useState(false);

  useEffect(() => {
    try {
      setRailCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
    } finally {
      setRailReady(true);
    }
  }, []);

  useEffect(() => {
    if (!railReady || !isDesktop) return;
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, railCollapsed ? "1" : "0");
  }, [railCollapsed, railReady, isDesktop]);

  const collapsed = isDesktop && railCollapsed;
  const railW = collapsed ? SIDEBAR_WIDTH_COLLAPSED : sidebarContentWidth;

  const navPrimaryTypography = {
    ...navTextProps,
    color: shellAppearance.accents.navItemHex,
  };

  const navItemSxLive = {
    ...navItemSx,
    ...(collapsed ? navItemCollapsedSx : {}),
    "&.Mui-selected .MuiListItemIcon-root": {
      color: shellAppearance.accents.navActiveIconHex,
    },
  } as SxProps<Theme>;

  const itemIconSx = useCallback(
    (href: string): SxProps<Theme> =>
      pathname === href
        ? {
            ...(collapsed ? listIconCollapsedSx : listIconSelectedSx),
            color: shellAppearance.accents.navActiveIconHex,
          }
        : {
            ...(collapsed ? listIconCollapsedSx : listIconDefaultSx),
            color: alpha(shellAppearance.accents.navItemHex, 0.78),
          },
    [shellAppearance.accents.navActiveIconHex, shellAppearance.accents.navItemHex, collapsed, pathname]
  );

  const logoutRowSx = {
    ...navItemSx,
    ...(collapsed ? navItemCollapsedSx : {}),
  } as SxProps<Theme>;

  const handleLogout = useCallback(() => {
    logout();
    onClose?.();
  }, [logout, onClose]);

  const subtleLine = "1px solid rgba(255,255,255,0.08)";

  const sidebarGlassSx = {
    ...sidebarInnerBaseSx,
    width: railW,
    flex: 1,
    maxHeight: { md: "calc(100vh - 32px)" },
    ...glassChromeLayerSx(appearance.sidebarChrome, {
      surround: true,
      /** Tight radius reads more “product UI” than a large floating pill */
      borderRadius: isDesktop ? 6 : "0 6px 6px 0",
    }),
  };

  const sidebarContent = (
    <Box sx={sidebarGlassSx}>
      {/* Brand */}
      <Box
        sx={{
          width: "100%",
          minHeight: collapsed ? 64 : 88,
          px: collapsed ? 1 : 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 1,
          flexShrink: 0,
          borderBottom: subtleLine,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, overflow: "hidden" }}>
          <Box component="img" src={logoSvg} alt="Interchanges" sx={{ ...logoImgSx, height: collapsed ? 32 : 36 }} />
          {!collapsed && (
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: -0.02,
                color: shellAppearance.accents.navLabelHex,
                whiteSpace: "nowrap",
              }}
            >
              Interchanges
            </Typography>
          )}
        </Box>
        {!isDesktop && onClose && (
          <IconButton onClick={onClose} sx={closeButtonSx} aria-label="Close menu" size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <List dense sx={listSx} component="nav">
        {!collapsed && <Typography sx={{ ...sectionLabelSx, px: 2, pt: 1.5, pb: 0.5 }}>Menu</Typography>}

        {MAIN_NAV.map(({ href, label, Icon }) => (
          <ListItemButton
            key={href}
            component={Link}
            href={href}
            selected={pathname === href}
            sx={navItemSxLive}
            onClick={() => !isDesktop && onClose?.()}
          >
            <ListItemIcon sx={itemIconSx(href)}>
              <Icon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary={label} primaryTypographyProps={navPrimaryTypography} />}
          </ListItemButton>
        ))}
      </List>

      {/* Footer: Settings + Log out + collapse toggle */}
      <Box
        sx={{
          flexShrink: 0,
          borderTop: subtleLine,
          pt: 0.5,
          pb: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
        }}
      >
        <ListItemButton
          component={Link}
          href="/dashboard/settings"
          selected={pathname === "/dashboard/settings"}
          sx={navItemSxLive}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={itemIconSx("/dashboard/settings")}>
            <SettingsIcon />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Settings" primaryTypographyProps={navPrimaryTypography} />}
        </ListItemButton>
        <ListItemButton onClick={handleLogout} sx={logoutRowSx} selected={false}>
          <ListItemIcon
            sx={{
              ...(collapsed ? listIconCollapsedSx : listIconDefaultSx),
              color: alpha(shellAppearance.accents.navItemHex, 0.78),
            }}
          >
            <LogoutIcon sx={{ fontSize: 22 }} />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary="Log out"
              primaryTypographyProps={{ ...navPrimaryTypography, color: alpha(shellAppearance.accents.navItemHex, 0.9) }}
            />
          )}
        </ListItemButton>

        {isDesktop && (
          <IconButton
            onClick={() => setRailCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            sx={{
              mx: 1,
              mt: 0.5,
              borderRadius: 0.5,
              color: alpha("#fff", 0.55),
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              "&:hover": { background: "rgba(255,255,255,0.08)" },
            }}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>
    </Box>
  );

  if (isDesktop) {
    return <Box sx={railOuterSx(railW)}>{sidebarContent}</Box>;
  }

  return (
    <>
      <Box onClick={onClose} sx={{ ...backdropSx, display: open ? "block" : "none" }} aria-hidden />
      <Box
        sx={{
          ...mobileDrawerSx,
          width: sidebarContentWidth,
          top: 16,
          height: "calc(100vh - 32px)",
          borderRadius: "0 6px 6px 0",
          transform: open ? "translateX(0)" : "translateX(-105%)",
          boxShadow: open ? "24px 0 48px rgba(0,0,0,0.45)" : "none",
          transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {sidebarContent}
      </Box>
    </>
  );
}

export { SIDEBAR_WIDTH_STANDARD as SIDEBAR_WIDTH };
