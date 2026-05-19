"use client";

/**
 * Single module for shared app icons (MUI-based wrappers + sidebar map).
 * Import from `@/components/common/icons` everywhere.
 */

import type { ComponentType, ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import AccountBalanceWalletOutlined from "@mui/icons-material/AccountBalanceWalletOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";
import AddCircleOutlineOutlined from "@mui/icons-material/AddCircleOutlineOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import Diversity3Outlined from "@mui/icons-material/Diversity3Outlined";
import EventNoteOutlined from "@mui/icons-material/EventNoteOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import HubOutlined from "@mui/icons-material/HubOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import MailOutline from "@mui/icons-material/MailOutline";
import ManageAccountsOutlined from "@mui/icons-material/ManageAccountsOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import PaletteOutlined from "@mui/icons-material/PaletteOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import RemoveCircleOutlineOutlined from "@mui/icons-material/RemoveCircleOutlineOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import ShareOutlined from "@mui/icons-material/ShareOutlined";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import VpnKeyOutlined from "@mui/icons-material/VpnKeyOutlined";
import WidgetsOutlined from "@mui/icons-material/WidgetsOutlined";

import type { DashboardSidebarIconKey } from "@/lib/permissions";
import {
  ICON_SIZE,
  iconGlyphSx,
  iconSlotSx,
  resolveIconPx,
  type IconSizeKey,
} from "@/lib/design-system/icons";
import type { AppTheme } from "@/theme/theme";

export type AppIconSvgProps = {
  sx?: SxProps<Theme>;
  /** @deprecated Prefer `size` — kept for backward compatibility */
  width?: number;
  /** @deprecated Prefer `size` — kept for backward compatibility */
  height?: number;
  /** Token or px — default `md` (20) */
  size?: number | IconSizeKey;
};

function glyphProps({ sx, width, height, size }: AppIconSvgProps) {
  const { width: w, height: h } = resolveIconPx(size, width, height);
  return { sx: iconGlyphSx(Math.min(w, h), sx) };
}

type SidebarGlyph = ComponentType<SvgIconProps>;

/** Maps nav config keys → MUI icons (semantic, not pixel-identical to legacy art). */
export const SIDEBAR_ICON_BY_KEY = {
  accountSetup: ManageAccountsOutlined,
  billing: ReceiptLongOutlined,
  chat: ChatBubbleOutlineRounded,
  chatWidget: WidgetsOutlined,
  clients: BusinessOutlined,
  "Reseller-Management": StorefrontOutlined,
  crmIntegration: HubOutlined,
  dashboard: DashboardRounded,
  departments: AccountTreeOutlined,
  designations: BadgeOutlined,
  distributionSetup: ShareOutlined,
  hrms: GroupsOutlined,
  ipBlocklist: ShieldOutlined,
  leave: EventNoteOutlined,
  licenses: VpnKeyOutlined,
  pools: Diversity3Outlined,
  reports: BarChartOutlined,
  resellers: PaymentsOutlined,
  roles: AdminPanelSettingsOutlined,
  profile: PersonOutline,
  settings: SettingsOutlined,
  shifts: ScheduleOutlined,
  theme: PaletteOutlined,
  smtpEmail: MailOutline,
  socialMedia: SmartToyOutlined,
  users: PersonOutline,
  websiteAssignments: LanguageOutlined,
} satisfies Record<DashboardSidebarIconKey, SidebarGlyph>;

/** Wraps any MUI glyph in a fixed centered box (sidebar, toolbars, modals). */
export function SidebarNavIconSlot({ children }: { children: ReactNode }) {
  return (
    <Box component="span" sx={iconSlotSx(ICON_SIZE.lg)}>
      {children}
    </Box>
  );
}

/** Fixed slot + standard MUI viewBox — centered sidebar nav glyph. */
export function SidebarReactIcon({
  iconKey,
  size = ICON_SIZE.md,
}: {
  iconKey: DashboardSidebarIconKey;
  size?: number | IconSizeKey;
}) {
  const Icon = SIDEBAR_ICON_BY_KEY[iconKey] ?? DashboardRounded;
  return (
    <SidebarNavIconSlot>
      <Icon sx={iconGlyphSx(size)} />
    </SidebarNavIconSlot>
  );
}

export function SearchIcon(props: AppIconSvgProps) {
  const { sx } = glyphProps({ size: ICON_SIZE.lg, ...props });
  return <SearchOutlined sx={sx} />;
}

export function AddCircleIcon(props: AppIconSvgProps) {
  const { sx } = glyphProps({ size: ICON_SIZE.md, ...props });
  return <AddCircleOutlineOutlined sx={sx} />;
}

export function CloseCircleIcon(props: AppIconSvgProps) {
  const { sx } = glyphProps({ size: ICON_SIZE.md, ...props });
  return <CancelOutlined sx={sx} />;
}

export function BellIcon(props: AppIconSvgProps) {
  const { sx } = glyphProps({ size: ICON_SIZE.xl, ...props });
  return <NotificationsNoneOutlined sx={sx} />;
}

/** Header/settings control — MUI outlined gear. */
export function HeaderSettingsIcon(props: AppIconSvgProps) {
  const { sx } = glyphProps({ size: ICON_SIZE.xl, ...props });
  return <SettingsOutlined sx={sx} />;
}

/** Delete POC / destructive — uses `color="error"` from MUI/theme. */
export function DeleteCircleIcon(props: AppIconSvgProps) {
  const { width, height } = resolveIconPx(props.size ?? ICON_SIZE.xl, props.width, props.height);
  const { sx } = glyphProps({ ...props, width, height });
  return <RemoveCircleOutlineOutlined color="error" sx={sx} />;
}

/** “Chats by department” KPI tile — `theme.app` purple + badge. */
export function ChatsByDepartmentIcon({
  sx,
  width = 40,
  height = 40,
}: AppIconSvgProps) {
  const theme = useTheme() as AppTheme;
  const circleFill = theme.app.dashboard.blueTintBg;
  return (
    <Box component="span" display="inline-flex" sx={sx}>
      <Box
        sx={{
          width,
          height,
          borderRadius: "12px",
          bgcolor: theme.app.dashboard.chartPurple,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            bgcolor: circleFill,
            opacity: 0.95,
          }}
        />
        <Box
          component="span"
          sx={{
            position: "relative",
            zIndex: 1,
            color: theme.app.dashboard.white95,
            fontWeight: 700,
            fontSize: Math.max(14, Math.round((width ?? 40) * 0.42)),
            lineHeight: 1,
          }}
        >
          $
        </Box>
      </Box>
    </Box>
  );
}

/** Optional shorthand for monetary / billing analytics rows. */
export function DollarBadgeIcon(props: SvgIconProps) {
  return <AccountBalanceWalletOutlined {...props} />;
}
