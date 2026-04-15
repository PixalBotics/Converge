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
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { logoSvg } from "@/assets";
import { useAuth } from "@/lib/auth";
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
import { AIManagementIcon } from "./icons/AIManagementIcon";
import { BillingIcon } from "./icons/BillingIcon";
import { ChatOperationsIcon } from "./icons/ChatOperationsIcon";
import { DashboardGridIcon } from "./icons/DashboardGridIcon";
import { OrganizationUserIcon } from "./icons/OrganizationUserIcon";
import { ReportsIcon } from "./icons/ReportsIcon";
import { SecurityIcon } from "./icons/SecurityIcon";
import { SettingsGearIcon } from "./icons/SettingsGearIcon";
import { SettingsIcon } from "./icons/SettingsIcon";
import { SupervisorIcon } from "./icons/SupervisorIcon";
import { WebsiteAssignIcon } from "./icons/WebsiteAssignIcon";

export default function DashboardSidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const theme = useTheme() as AppTheme;
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isDemoUser = user?.email?.trim().toLowerCase() === "demo@gmail.com";
  const navTextProps = {
    ...navTypographyBase,
  };

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
        <ListItemButton
          component={Link}
          href="/dashboard"
          selected={pathname === "/dashboard"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard" ? listIconSelectedSx : listIconDefaultSx}>
            <DashboardGridIcon />
          </ListItemIcon>
          <ListItemText primary="dashboard" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/hrms"
          selected={pathname === "/dashboard/hrms"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/hrms" ? listIconSelectedSx : listIconDefaultSx}>
            <DashboardGridIcon />
          </ListItemIcon>
          <ListItemText primary="hrms" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/all-companies"
          selected={pathname === "/dashboard/all-companies"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/all-companies" ? listIconSelectedSx : listIconDefaultSx}>
            <OrganizationUserIcon />
          </ListItemIcon>
          <ListItemText primary="all-companies" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/user-page"
          selected={pathname === "/dashboard/user-page"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/user-page" ? listIconSelectedSx : listIconDefaultSx}>
            <OrganizationUserIcon />
          </ListItemIcon>
          <ListItemText primary="user-page" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        {isDemoUser && (
          <>
            <ListItemButton
              component={Link}
              href="/dashboard/agent-dashboard"
              selected={pathname === "/dashboard/agent-dashboard"}
              sx={navItemSx}
              onClick={() => !isDesktop && onClose?.()}
            >
              <ListItemIcon sx={pathname === "/dashboard/agent-dashboard" ? listIconSelectedSx : listIconDefaultSx}>
                <DashboardGridIcon />
              </ListItemIcon>
              <ListItemText primary="agent-dashboard" primaryTypographyProps={navTextProps} />
            </ListItemButton>
            <ListItemButton
              component={Link}
              href="/dashboard/qa-dashboard"
              selected={pathname === "/dashboard/qa-dashboard"}
              sx={navItemSx}
              onClick={() => !isDesktop && onClose?.()}
            >
              <ListItemIcon sx={pathname === "/dashboard/qa-dashboard" ? listIconSelectedSx : listIconDefaultSx}>
                <DashboardGridIcon />
              </ListItemIcon>
              <ListItemText primary="qa-dashboard" primaryTypographyProps={navTextProps} />
            </ListItemButton>
            <ListItemButton
              component={Link}
              href="/dashboard/supervisor-dashboard"
              selected={pathname === "/dashboard/supervisor-dashboard"}
              sx={navItemSx}
              onClick={() => !isDesktop && onClose?.()}
            >
              <ListItemIcon sx={pathname === "/dashboard/supervisor-dashboard" ? listIconSelectedSx : listIconDefaultSx}>
                <SupervisorIcon />
              </ListItemIcon>
              <ListItemText primary="supervisor-dashboard" primaryTypographyProps={navTextProps} />
            </ListItemButton>
            <ListItemButton
              component={Link}
              href="/dashboard/supper-dashboard"
              selected={pathname === "/dashboard/supper-dashboard"}
              sx={navItemSx}
              onClick={() => !isDesktop && onClose?.()}
            >
              <ListItemIcon sx={pathname === "/dashboard/supper-dashboard" ? listIconSelectedSx : listIconDefaultSx}>
                <DashboardGridIcon />
              </ListItemIcon>
              <ListItemText primary="supper-dashboard" primaryTypographyProps={navTextProps} />
            </ListItemButton>
          </>
        )}
        <ListItemButton
          component={Link}
          href="/dashboard/account-setup"
          selected={pathname === "/dashboard/account-setup"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/account-setup" ? listIconSelectedSx : listIconDefaultSx}>
            <SettingsGearIcon />
          </ListItemIcon>
          <ListItemText primary="account-setup" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/website-assigning"
          selected={pathname === "/dashboard/website-assigning" || pathname.startsWith("/dashboard/website-assigning/")}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/website-assigning" ? listIconSelectedSx : listIconDefaultSx}>
            <WebsiteAssignIcon />
          </ListItemIcon>
          <ListItemText primary="website-assigning" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/roles"
          selected={pathname === "/dashboard/roles"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/roles" ? listIconSelectedSx : listIconDefaultSx}>
            <OrganizationUserIcon />
          </ListItemIcon>
          <ListItemText primary="roles" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/organization-user"
          selected={pathname === "/dashboard/organization-user"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/organization-user" ? listIconSelectedSx : listIconDefaultSx}>
            <OrganizationUserIcon />
          </ListItemIcon>
          <ListItemText primary="organization-user" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/supervisor"
          selected={pathname === "/dashboard/supervisor"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/supervisor" ? listIconSelectedSx : listIconDefaultSx}>
            <SupervisorIcon />
          </ListItemIcon>
          <ListItemText primary="supervisor" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/chat-operations"
          selected={pathname === "/dashboard/chat-operations"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/chat-operations" ? listIconSelectedSx : listIconDefaultSx}>
            <ChatOperationsIcon />
          </ListItemIcon>
          <ListItemText primary="chat-operations" primaryTypographyProps={navTextProps} />
        </ListItemButton>

        <ListItemButton
          component={Link}
          href="/dashboard/ai-management"
          selected={pathname === "/dashboard/ai-management"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/ai-management" ? listIconSelectedSx : listIconDefaultSx}>
            <AIManagementIcon />
          </ListItemIcon>
          <ListItemText primary="ai-management" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/reports"
          selected={pathname === "/dashboard/reports"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/reports" ? listIconSelectedSx : listIconDefaultSx}>
            <ReportsIcon />
          </ListItemIcon>
          <ListItemText primary="reports" primaryTypographyProps={navTextProps} />
        </ListItemButton>

        <ListItemButton
          component={Link}
          href="/dashboard/billing"
          selected={pathname === "/dashboard/billing"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/billing" ? listIconSelectedSx : listIconDefaultSx}>
            <BillingIcon />
          </ListItemIcon>
          <ListItemText primary="billing" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/security"
          selected={pathname === "/dashboard/security"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/security" ? listIconSelectedSx : listIconDefaultSx}>
            <SecurityIcon />
          </ListItemIcon>
          <ListItemText primary="security" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/settings"
          selected={pathname === "/dashboard/settings"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/settings" ? listIconSelectedSx : listIconDefaultSx}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="settings" primaryTypographyProps={navTextProps} />
        </ListItemButton>
      </List>

      <Box sx={sidebarFooterSx}>
        <List dense sx={sidebarFooterListSx}>
          <ListItemButton
            component={Link}
            href="/dashboard/theme"
            selected={pathname === "/dashboard/theme"}
            sx={navItemSx}
            onClick={() => !isDesktop && onClose?.()}
          >
            <ListItemIcon sx={pathname === "/dashboard/theme" ? listIconSelectedSx : listIconDefaultSx}>
              <PaletteIcon sx={{ color: "inherit" }} />
            </ListItemIcon>
            <ListItemText primary="theme" primaryTypographyProps={navTextProps} />
          </ListItemButton>
          <ListItemButton
            component="button"
            type="button"
            sx={navItemSx}
            onClick={() => {
              if (!isDesktop) onClose?.();
              logout();
            }}
          >
            <ListItemIcon sx={listIconDefaultSx}>
              <LogoutIcon sx={{ color: "inherit" }} />
            </ListItemIcon>
            <ListItemText primary="Log out" primaryTypographyProps={navTextProps} />
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
