"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import { Typography } from "@/components/common";
import { Close as CloseIcon } from "@mui/icons-material";
import { logoSvg } from "@/assets";
import {
  SIDEBAR_WIDTH,
  navTextProps,
  sectionLabelSx,
  navItemSx,
  sidebarInnerSx,
  headerBoxSx,
  logoImgSx,
  closeButtonSx,
  listSx,
  listIconSelectedSx,
  listIconDefaultSx,
  desktopWrapperSx,
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

export default function DashboardSidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const pathname = usePathname();

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
          <ListItemText primary="Dashboard" primaryTypographyProps={navTextProps} />
        </ListItemButton>
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
          <ListItemText primary="Account Setup" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/website-assigning"
          selected={pathname === "/dashboard/website-assigning"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/website-assigning" ? listIconSelectedSx : listIconDefaultSx}>
            <WebsiteAssignIcon />
          </ListItemIcon>
          <ListItemText primary="Website assigning" primaryTypographyProps={navTextProps} />
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
          <ListItemText primary="Roles" primaryTypographyProps={navTextProps} />
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
          <ListItemText primary="Organization user" primaryTypographyProps={navTextProps} />
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
          <ListItemText primary="Supervisor" primaryTypographyProps={navTextProps} />
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
          <ListItemText primary="Chat Operations" primaryTypographyProps={navTextProps} />
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
          <ListItemText primary="AI Management" primaryTypographyProps={navTextProps} />
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
          <ListItemText primary="Reports" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/chat-widget"
          selected={pathname === "/dashboard/chat-widget"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/chat-widget" ? listIconSelectedSx : listIconDefaultSx}>
            <ChatWidgetIcon />
          </ListItemIcon>
          <ListItemText primary="Chat Widget" primaryTypographyProps={navTextProps} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href="/dashboard/integrations"
          selected={pathname === "/dashboard/integrations"}
          sx={navItemSx}
          onClick={() => !isDesktop && onClose?.()}
        >
          <ListItemIcon sx={pathname === "/dashboard/integrations" ? listIconSelectedSx : listIconDefaultSx}>
            <IntegrationsIcon />
          </ListItemIcon>
          <ListItemText primary="Integrations" primaryTypographyProps={navTextProps} />
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
          <ListItemText primary="Billing" primaryTypographyProps={navTextProps} />
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
          <ListItemText primary="Security" primaryTypographyProps={navTextProps} />
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
          <ListItemText primary="Settings" primaryTypographyProps={navTextProps} />
        </ListItemButton>
      </List>
    </Box>
  );

  if (isDesktop) {
    return <Box sx={desktopWrapperSx}>{sidebarContent}</Box>;
  }

  return (
    <>
      <Box
        onClick={onClose}
        sx={{ ...backdropSx, display: open ? "block" : "none" }}
        aria-hidden
      />
      <Box
        sx={{
          ...mobileDrawerSx,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          boxShadow: open ? "4px 0 24px rgba(0,0,0,0.3)" : "none",
        }}
      >
        {sidebarContent}
      </Box>
    </>
  );
}

export { SIDEBAR_WIDTH };
