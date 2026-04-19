"use client";

import type { IconType } from "react-icons";
import {
  RiDashboardLine,
  RiMessage3Line,
  RiBarChartGroupedLine,
  RiPaletteLine,
  RiSettings5Line,
  RiMailSendLine,
  RiGlobalLine,
  RiFlowChart,
  RiUser3Line,
  RiBookletLine,
  RiShieldKeyholeLine,
  RiBuilding2Line,
  RiBriefcase4Line,
  RiFileList3Line,
  RiPriceTag3Line,
  RiGroup2Line,
  RiTimeLine,
} from "react-icons/ri";
import { MdOutlineManageAccounts } from "react-icons/md";
import { FaRegBuilding, FaRegUser, FaMoneyCheckDollar } from "react-icons/fa6";
import { TbUsersGroup, TbSettingsCog, TbHierarchy3, TbRobot } from "react-icons/tb";
import { LuShieldCheck, LuLayoutPanelLeft, LuUsersRound, LuNetwork, LuFileBadge2 } from "react-icons/lu";
import type { DashboardSidebarIconKey } from "@/lib/permissions";

const ICON_BY_KEY: Record<DashboardSidebarIconKey, IconType> = {
  accountSetup: MdOutlineManageAccounts,
  billing: FaMoneyCheckDollar,
  chat: RiMessage3Line,
  chatWidget: LuLayoutPanelLeft,
  "Reseller-Management": RiBriefcase4Line,
  clients: FaRegBuilding,
  crmIntegration: RiFlowChart,
  hrms: TbUsersGroup,
  dashboard: RiDashboardLine,
  departments: TbHierarchy3,
  designations: RiPriceTag3Line,
  distributionSetup: LuNetwork,
  ipBlocklist: RiShieldKeyholeLine,
  licenses: RiFileList3Line,
  pools: RiGroup2Line,
  reports: RiBarChartGroupedLine,
  resellers: RiBriefcase4Line,
  roles: LuFileBadge2,
  profile: RiUser3Line,
  settings: RiSettings5Line,
  shifts: RiTimeLine,
  theme: RiPaletteLine,
  smtpEmail: RiMailSendLine,
  socialMedia: TbRobot,
  users: RiUser3Line,
  websiteAssignments: RiBookletLine,
};

export function SidebarReactIcon({ iconKey, size = 18 }: { iconKey: DashboardSidebarIconKey; size?: number }) {
  const Icon = ICON_BY_KEY[iconKey] ?? RiDashboardLine;
  return <Icon size={size} />;
}
