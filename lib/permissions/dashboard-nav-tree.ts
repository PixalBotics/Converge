import type { DashboardNavItem } from "./dashboard-nav.types";
import { OP } from "./operational-keys";
import {
  COMMERCIAL_PAGE_PERMISSIONS,
  PAGE_PERMISSION_ORDER,
  firstCommercialPageInNavOrder,
  toNavItem,
} from "./dashboard-route-table";

const CHAT_MONITOR_OPERATIONAL_ANY = [
  OP.chat.audit,
  OP.chat.auditPlatform,
  OP.chat.monitorPool,
  OP.chat.monitorDepartment,
  OP.chat.monitorParentCompany,
] as const;

const CHAT_QA_OPERATIONAL_ANY = [
  OP.qa.chatReview,
  OP.qa.chatReviewMessage,
  OP.qa.chatReviewSession,
  OP.qa.chatAssign,
] as const;

const CHAT_GROUP: DashboardNavItem = {
  href: "/dashboard/chat-operations",
  label: "Live chat",
  section: "activity",
  iconKey: "chat",
  permission: null,
  permissionsAny: ["page:chat", "page:chat-widget"],
  children: [
    {
      ...toNavItem("page:chat")!,
      label: "Agent inbox",
      href: "/dashboard/chat-operations",
      prefixMatch: true,
      operationalAny: [OP.chat.access],
    },
    {
      href: "/dashboard/chat-monitor",
      label: "Monitor",
      section: "activity",
      iconKey: "chat",
      permission: "page:chat",
      prefixMatch: true,
      operationalAny: [...CHAT_MONITOR_OPERATIONAL_ANY],
    },
    {
      href: "/dashboard/chat-qa",
      label: "QA inbox",
      section: "activity",
      iconKey: "chat",
      permission: "page:chat",
      prefixMatch: true,
      operationalAny: [...CHAT_QA_OPERATIONAL_ANY],
    },
    {
      href: "/dashboard/chat-reports",
      label: "Chat reports",
      section: "activity",
      iconKey: "reports",
      permission: "page:chat",
      prefixMatch: true,
      operationalAny: [OP.chat.reportView],
    },
    {
      ...toNavItem("page:chat-widget")!,
      label: "Widget",
      href: "/dashboard/chat-widget",
      prefixMatch: true,
    },
    {
      href: "/dashboard/chat-settings",
      label: "Chat settings",
      section: "activity",
      iconKey: "chatWidget",
      permission: "page:chat-widget",
      prefixMatch: true,
    },
  ],
};

export const ALWAYS_VISIBLE_NAV_ITEMS: readonly DashboardNavItem[] = [
  {
    href: "/dashboard/theme",
    label: "theme",
    section: "footer",
    iconKey: "theme",
    permission: null,
  },
] as const;

const DEPARTMENTS_AND_DESIGNATIONS_GROUP: DashboardNavItem = {
  href: "/dashboard/departments",
  label: "Department",
  section: "activity",
  iconKey: "departments",
  permission: null,
  permissionsAny: ["page:departments", "page:designations"],
  children: [
    { ...toNavItem("page:departments")!, label: "Department List" },
    { ...toNavItem("page:designations")!, label: "Designation" },
  ],
};

const SHIFTS_GROUP: DashboardNavItem = {
  href: "/dashboard/shifts",
  label: "Shifts",
  section: "activity",
  iconKey: "shifts",
  permission: null,
  permissionsAny: ["page:shifts"],
  children: [
    { ...toNavItem("page:shifts")!, label: "Shift List", prefixMatch: false },
    {
      href: "/dashboard/shifts/department-shift",
      label: "Department Shift",
      section: "activity",
      iconKey: "shifts",
      permission: "page:shifts",
    },
    {
      href: "/dashboard/shifts/pool-shift",
      label: "Pool Shift",
      section: "activity",
      iconKey: "shifts",
      permission: "page:shifts",
    },
    {
      href: "/dashboard/shifts/user-shift",
      label: "User Shift",
      section: "activity",
      iconKey: "shifts",
      permission: "page:shifts",
    },
  ],
};

const WEBSITE_GROUP: DashboardNavItem = {
  href: "/dashboard/website-assigning",
  label: "Website",
  section: "activity",
  iconKey: "websiteAssignments",
  permission: null,
  permissionsAny: ["page:website-assignments"],
  children: [
    {
      ...toNavItem("page:website-assignments")!,
      label: "Website Assign",
      prefixMatch: false,
    },
  ],
};

const USERS_GROUP: DashboardNavItem = {
  href: "/dashboard/user-page",
  label: "Users",
  section: "activity",
  iconKey: "users",
  permission: null,
  permissionsAny: ["page:users"],
  children: [
    { ...toNavItem("page:users")!, label: "User List", prefixMatch: false },
    {
      href: "/dashboard/user-page/permissions",
      label: "User Permissions",
      section: "activity",
      iconKey: "users",
      permission: "page:users",
      prefixMatch: false,
    },
  ],
};

/** One sidebar row for account-setup + clients + resellers API keys (same app route). */
const COMMERCIAL_ACCOUNT_GROUP: DashboardNavItem = {
  href: "/dashboard/companies",
  label: "Clients & resellers",
  section: "activity",
  iconKey: "clients",
  permission: null,
  permissionsAny: ["page:account-setup", "page:clients", "page:resellers"],
  children: [
    {
      href: "/dashboard/companies",
      label: "Companies",
      section: "activity",
      iconKey: "Reseller-Management",
      permission: null,
      prefixMatch: true,
    },
  ],
};

const HRMS_GROUP: DashboardNavItem = {
  href: "/dashboard/hrms",
  label: "HRMS",
  section: "activity",
  iconKey: "hrms",
  permission: null,
  permissionsAny: ["page:hrms"],
  children: [
    {
      ...toNavItem("page:hrms")!,
      href: "/dashboard/hrms",
      label: "Overview",
      prefixMatch: false,
    },
    {
      href: "/dashboard/hrms/pool-members",
      label: "Pool members",
      section: "activity",
      iconKey: "pools",
      permission: "page:hrms",
    },
    {
      href: "/dashboard/hrms/pool-heads",
      label: "Pool Heads",
      section: "activity",
      iconKey: "hrms",
      permission: "page:hrms",
    },
    {
      href: "/dashboard/hrms/department-heads",
      label: "Department Heads",
      section: "activity",
      iconKey: "hrms",
      permission: "page:hrms",
    },
    {
      href: "/dashboard/attendance/my-attendance",
      label: "My Attendance",
      section: "activity",
      iconKey: "reports",
      permission: "page:hrms",
    },
    {
      href: "/dashboard/attendance/team-attendance",
      label: "Team Attendance",
      section: "activity",
      iconKey: "reports",
      permission: "page:hrms",
    },
    {
      href: "/dashboard/attendance/mark-attendance",
      label: "Mark Attendance",
      section: "activity",
      iconKey: "reports",
      permission: "page:hrms",
    },
    {
      href: "/dashboard/leave/leave-type",
      label: "Leave Type",
      section: "activity",
      iconKey: "leave",
      permission: "page:hrms",
    },
    {
      href: "/dashboard/leave/apply-leave",
      label: "Apply Leave",
      section: "activity",
      iconKey: "leave",
      permission: "page:hrms",
    },
    {
      href: "/dashboard/leave/approval-inbox",
      label: "Approval Inbox",
      section: "activity",
      iconKey: "leave",
      permission: "page:hrms",
    },
    /* Sidebar: Approve Leave hidden for now — restore child linking to /dashboard/leave/approve-leave */
    {
      href: "/dashboard/leave/leave-balance",
      label: "Leave Balance",
      section: "activity",
      iconKey: "leave",
      permission: "page:hrms",
    },
  ],
};

export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = PAGE_PERMISSION_ORDER.flatMap((permission) => {
  if (permission === "page:departments") return [DEPARTMENTS_AND_DESIGNATIONS_GROUP];
  if (permission === "page:website-assignments") return [WEBSITE_GROUP];
  if (permission === "page:users") return [USERS_GROUP];
  if (permission === "page:hrms") return [HRMS_GROUP];
  if (permission === "page:chat") return [CHAT_GROUP];
  if (permission === "page:chat-widget") return [];
  if (permission === "page:pools") return [];
  if (permission === "page:shifts") return [SHIFTS_GROUP];
  if (COMMERCIAL_PAGE_PERMISSIONS.includes(permission)) {
    const first = firstCommercialPageInNavOrder();
    if (!first || permission !== first) return [];
    return [COMMERCIAL_ACCOUNT_GROUP];
  }
  const item = toNavItem(permission);
  return item ? [item] : [];
});
