import type { DashboardNavItem } from "./dashboard-nav.types";
import { OP } from "./operational-keys";
import { PAGE } from "./permission-constants";
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
  OP.chat.monitorInvolvement,
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
  permissionsAny: [PAGE.CHAT, PAGE.CHAT_WIDGET],
  children: [
    {
      ...toNavItem(PAGE.CHAT)!,
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
      permission: PAGE.CHAT,
      prefixMatch: true,
      operationalAny: [...CHAT_MONITOR_OPERATIONAL_ANY],
    },
    {
      href: "/dashboard/chat-qa",
      label: "QA inbox",
      section: "activity",
      iconKey: "chat",
      permission: PAGE.CHAT,
      prefixMatch: true,
      operationalAny: [...CHAT_QA_OPERATIONAL_ANY],
    },
    {
      href: "/dashboard/chat-reports",
      label: "Chat reports",
      section: "activity",
      iconKey: "reports",
      permission: PAGE.CHAT,
      prefixMatch: true,
      operationalAny: [OP.chat.reportView],
    },
    {
      ...toNavItem(PAGE.CHAT_WIDGET)!,
      label: "Widget",
      href: "/dashboard/chat-widget",
      prefixMatch: true,
    },
    {
      href: "/dashboard/chat-involvement",
      label: "Chat involvement",
      section: "activity",
      iconKey: "chatWidget",
      permission: PAGE.CHAT_WIDGET,
      prefixMatch: true,
    },
    {
      href: "/dashboard/chat-settings",
      label: "Canned messages",
      section: "activity",
      iconKey: "chatWidget",
      permission: PAGE.CHAT_WIDGET,
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

/** User Management → org structure (not under HRMS). */
const DEPARTMENTS_GROUP: DashboardNavItem = {
  href: "/dashboard/departments",
  label: "Departments",
  section: "activity",
  iconKey: "departments",
  permission: PAGE.DEPARTMENTS,
  prefixMatch: true,
  children: [
    { ...toNavItem(PAGE.DEPARTMENTS)!, label: "Department list" },
    {
      href: "/dashboard/designations",
      label: "Designations",
      section: "activity",
      iconKey: "designations",
      permission: PAGE.DEPARTMENTS,
      prefixMatch: true,
    },
    {
      href: "/dashboard/hrms/department-heads",
      label: "Department heads",
      section: "activity",
      iconKey: "departments",
      permission: PAGE.DEPARTMENTS,
      prefixMatch: true,
    },
  ],
};

const POOLS_GROUP: DashboardNavItem = {
  href: "/dashboard/pools",
  label: "Pools",
  section: "activity",
  iconKey: "pools",
  permission: null,
  permissionsAny: [PAGE.POOL, PAGE.POOLS],
  children: [
    {
      href: "/dashboard/pools",
      label: "Pool list",
      section: "activity",
      iconKey: "pools",
      permission: null,
      permissionsAny: [PAGE.POOL, PAGE.POOLS],
      prefixMatch: true,
    },
    {
      href: "/dashboard/hrms/pool-members",
      label: "Pool members",
      section: "activity",
      iconKey: "pools",
      permission: PAGE.POOL,
      prefixMatch: true,
    },
    {
      href: "/dashboard/hrms/pool-heads",
      label: "Pool heads",
      section: "activity",
      iconKey: "pools",
      permission: PAGE.POOL,
      prefixMatch: true,
    },
  ],
};

const SHIFTS_GROUP: DashboardNavItem = {
  href: "/dashboard/shifts",
  label: "Shifts",
  section: "activity",
  iconKey: "shifts",
  permission: PAGE.SHIFTS,
  prefixMatch: true,
  children: [
    { ...toNavItem(PAGE.SHIFTS)!, label: "Shift list", prefixMatch: false },
    {
      href: "/dashboard/shifts/department-shift",
      label: "Department shift",
      section: "activity",
      iconKey: "shifts",
      permission: PAGE.SHIFTS,
    },
    {
      href: "/dashboard/shifts/pool-shift",
      label: "Pool shift",
      section: "activity",
      iconKey: "shifts",
      permission: PAGE.SHIFTS,
    },
    {
      href: "/dashboard/shifts/user-shift",
      label: "User shift",
      section: "activity",
      iconKey: "shifts",
      permission: PAGE.SHIFTS,
    },
  ],
};

const WEBSITE_GROUP: DashboardNavItem = {
  href: "/dashboard/website-assigning",
  label: "Website",
  section: "activity",
  iconKey: "websiteAssignments",
  permission: null,
  permissionsAny: [PAGE.WEBSITE_ASSIGNMENTS],
  children: [
    {
      ...toNavItem(PAGE.WEBSITE_ASSIGNMENTS)!,
      label: "Website assign",
      prefixMatch: true,
      pathExcludes: ["/service-schedules", "/service-scheduling"],
    },
    {
      href: "/dashboard/website-assigning/service-schedules",
      label: "Service scheduling",
      section: "activity",
      iconKey: "websiteAssignments",
      permission: PAGE.WEBSITE_ASSIGNMENTS,
      prefixMatch: true,
      pathIncludes: "/service-scheduling",
    },
  ],
};

const USERS_GROUP: DashboardNavItem = {
  href: "/dashboard/user-page",
  label: "Users",
  section: "activity",
  iconKey: "users",
  permission: null,
  permissionsAny: [PAGE.USERS],
  children: [
    { ...toNavItem(PAGE.USERS)!, label: "User list", prefixMatch: false },
    {
      href: "/dashboard/user-page/permissions",
      label: "User permissions",
      section: "activity",
      iconKey: "users",
      permission: PAGE.USERS,
      prefixMatch: false,
    },
  ],
};

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

const AI_TRAINING_GROUP: DashboardNavItem = {
  href: "/dashboard/ai-training/assistant",
  label: "AI Training",
  section: "activity",
  iconKey: "aiTraining",
  permission: null,
  permissionsAny: ["page:chat-widget", "page:chat"],
  children: [
    {
      href: "/dashboard/ai-training/chatbot",
      label: "AI Chatbot",
      section: "activity",
      iconKey: "aiTraining",
      permission: "page:chat-widget",
      prefixMatch: false,
    },
    {
      href: "/dashboard/ai-training/assistant",
      label: "AI Assistant",
      section: "activity",
      iconKey: "aiTraining",
      permission: "page:chat",
      prefixMatch: false,
    },
  ],
};

const HRMS_GROUP: DashboardNavItem = {
  href: "/dashboard/hrms",
  label: "HRMS",
  section: "activity",
  iconKey: "hrms",
  permission: PAGE.HRMS,
  prefixMatch: true,
  children: [
    {
      href: "/dashboard/hrms",
      label: "Overview",
      section: "activity",
      iconKey: "hrms",
      permission: PAGE.HRMS,
      prefixMatch: false,
    },
    {
      href: "/dashboard/attendance/my-attendance",
      label: "My attendance",
      section: "activity",
      iconKey: "reports",
      permission: PAGE.HRMS,
    },
    {
      href: "/dashboard/attendance/team-attendance",
      label: "Team attendance",
      section: "activity",
      iconKey: "reports",
      permission: PAGE.HRMS,
      operationalAny: [OP.hrms.attendance.view],
    },
    {
      href: "/dashboard/attendance/mark-attendance",
      label: "Mark attendance",
      section: "activity",
      iconKey: "reports",
      permission: PAGE.HRMS,
    },
    {
      href: "/dashboard/leave/leave-type",
      label: "Leave type",
      section: "activity",
      iconKey: "leave",
      permission: PAGE.HRMS,
    },
    {
      href: "/dashboard/leave/apply-leave",
      label: "Apply leave",
      section: "activity",
      iconKey: "leave",
      permission: PAGE.HRMS,
    },
    {
      href: "/dashboard/leave/approval-inbox",
      label: "Approval inbox",
      section: "activity",
      iconKey: "leave",
      permission: PAGE.HRMS,
      operationalAny: [OP.hrms.leave.approve, OP.hrms.leave.approvePool, OP.hrms.leave.approveDepartment],
    },
    {
      href: "/dashboard/leave/leave-balance",
      label: "Leave balance",
      section: "activity",
      iconKey: "leave",
      permission: PAGE.HRMS,
    },
  ],
};

const EMAIL_GROUP: DashboardNavItem = {
  href: "/dashboard/email/setup/reseller",
  label: "Email Configuration",
  section: "activity",
  iconKey: "smtpEmail",
  permission: null,
  permissionsAny: ["page:smtp-email", "page:email-template", "page:email-agent-feedback"],
  prefixMatch: true,
  children: [
    {
      href: "/dashboard/email/setup/reseller",
      label: "Reseller mail",
      section: "activity",
      iconKey: "smtpEmail",
      permission: "page:smtp-email",
      prefixMatch: true,
    },
    {
      href: "/dashboard/email/setup/platform",
      label: "Platform mail",
      section: "activity",
      iconKey: "smtpEmail",
      permission: "page:smtp-email",
      internalOnly: true,
    },
    {
      href: "/dashboard/email/setup/assignment",
      label: "Use platform mail",
      section: "activity",
      iconKey: "smtpEmail",
      permission: "page:smtp-email",
      internalOnly: true,
    },
    {
      href: "/dashboard/email/design",
      label: "Email design",
      section: "activity",
      iconKey: "smtpEmail",
      permission: "page:email-template",
      prefixMatch: true,
      pathExcludes: ["/platform", "/assignment", "/editor"],
    },
    {
      href: "/dashboard/email/design/platform",
      label: "Platform design",
      section: "activity",
      iconKey: "smtpEmail",
      permission: "page:email-template",
      internalOnly: true,
    },
    {
      href: "/dashboard/email/design/assignment",
      label: "Use platform design",
      section: "activity",
      iconKey: "smtpEmail",
      permission: "page:email-template",
      internalOnly: true,
    },
    {
      href: "/dashboard/email/forms",
      label: "Email forms",
      section: "activity",
      iconKey: "smtpEmail",
      permission: "page:email-template",
      prefixMatch: true,
    },
    {
      href: "/dashboard/email/feedback",
      label: "Feedback",
      section: "activity",
      iconKey: "smtpEmail",
      permission: "page:email-agent-feedback",
      internalOnly: true,
    },
  ],
};

export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = PAGE_PERMISSION_ORDER.flatMap((permission) => {
  if (permission === "page:departments" || permission === "page:designations") {
    return permission === "page:departments" ? [DEPARTMENTS_GROUP] : [];
  }
  if (permission === "page:pool" || permission === "page:pools") {
    return permission === "page:pool" ? [POOLS_GROUP] : [];
  }
  if (permission === "page:website-assignments") return [WEBSITE_GROUP];
  if (permission === "page:users") return [USERS_GROUP];
  if (permission === "page:hrms") return [HRMS_GROUP];
  if (permission === "page:shifts") return [SHIFTS_GROUP];
  if (permission === "page:chat") return [CHAT_GROUP, AI_TRAINING_GROUP];
  if (permission === "page:chat-widget") {
    const widgetItem = toNavItem("page:chat-widget");
    return widgetItem ? [widgetItem] : [];
  }
  if (COMMERCIAL_PAGE_PERMISSIONS.includes(permission)) {
    const first = firstCommercialPageInNavOrder();
    if (!first || permission !== first) return [];
    return [COMMERCIAL_ACCOUNT_GROUP];
  }
  if (permission === "page:smtp-email") return [EMAIL_GROUP];
  if (permission === "page:email-template") return [];
  const item = toNavItem(permission);
  return item ? [item] : [];
});
