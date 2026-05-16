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
import type { AppTheme } from "@/theme/theme";

export type AppIconSvgProps = {
  sx?: SxProps<Theme>;
  width?: number;
  height?: number;
};

function sizedIconSx(
  width: number,
  height: number,
  sx?: SxProps<Theme>,
): SxProps<Theme> {
  const base: SxProps<Theme> = {
    width,
    height,
    fontSize: Math.min(width, height),
    display: "block",
    lineHeight: 0,
    flexShrink: 0,
    boxSizing: "border-box",
  };
  return sx ? ([base, sx] as SxProps<Theme>) : base;
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

const SIDEBAR_ICON_SLOT_PX = 24;

/** Wraps any MUI glyph in the same fixed box used beside sidebar labels (logout/login, etc.). */
export function SidebarNavIconSlot({ children }: { children: ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        width: SIDEBAR_ICON_SLOT_PX,
        height: SIDEBAR_ICON_SLOT_PX,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        lineHeight: 0,
        verticalAlign: "middle",
      }}
    >
      {children}
    </Box>
  );
}

/** Fixed slot + default viewBox — avoids dense-nav optical drift from `inheritViewBox` in a narrow column. */
export function SidebarReactIcon({
  iconKey,
  size = 20,
}: {
  iconKey: DashboardSidebarIconKey;
  size?: number;
}) {
  const Icon = SIDEBAR_ICON_BY_KEY[iconKey] ?? DashboardRounded;
  return (
    <SidebarNavIconSlot>
      <Icon sx={sizedIconSx(size, size)} />
    </SidebarNavIconSlot>
  );
}

export function SearchIcon({ sx, width = 24, height = 24 }: AppIconSvgProps) {
  return (
    <SearchOutlined
      sx={sizedIconSx(width, height, sx)}
      inheritViewBox
    />
  );
}

export function AddCircleIcon({ sx, width = 20, height = 20 }: AppIconSvgProps) {
  return (
    <AddCircleOutlineOutlined
      sx={sizedIconSx(width, height, sx)}
      inheritViewBox
    />
  );
}

export function CloseCircleIcon({ sx, width = 18, height = 18 }: AppIconSvgProps) {
  return (
    <CancelOutlined
      sx={sizedIconSx(width, height, sx)}
      inheritViewBox
    />
  );
}

export function BellIcon({ sx, width = 30, height = 30 }: AppIconSvgProps) {
  return (
    <NotificationsNoneOutlined
      sx={sizedIconSx(width, height, sx)}
      inheritViewBox
    />
  );
}

/** Header/settings control — MUI outlined gear. */
export function HeaderSettingsIcon({
  sx,
  width = 30,
  height = 30,
}: AppIconSvgProps) {
  return (
    <SettingsOutlined sx={sizedIconSx(width, height, sx)} inheritViewBox />
  );
}

/** Delete POC / destructive — uses `color="error"` from MUI/theme. */
export function DeleteCircleIcon({
  sx,
  width = 43,
  height = 43,
}: AppIconSvgProps) {
  return (
    <RemoveCircleOutlineOutlined
      color="error"
      sx={sizedIconSx(width, height, sx)}
      inheritViewBox
    />
  );
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
            fontSize: Math.max(14, Math.round(width * 0.42)),
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
