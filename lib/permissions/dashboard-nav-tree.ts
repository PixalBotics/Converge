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
  OP.chat.monitorInternalSupervisor,
] as const;

const CHAT_QA_OPERATIONAL_ANY = [
  OP.qa.chatReview,
  OP.qa.chatReviewMessage,
  OP.qa.chatReviewSession,
  OP.qa.chatAssign,
] as const;

function chatNavItem(
  permission: string,
  href: string,
  label: string,
  iconKey: DashboardNavItem["iconKey"],
  operationalAny?: readonly string[],
): DashboardNavItem {
  const item = toNavItem(permission as Parameters<typeof toNavItem>[0]);
  return {
    href,
    label,
    section: "activity",
    iconKey,
    permission,
    prefixMatch: true,
    ...(operationalAny?.length ? { operationalAny: [...operationalAny] } : {}),
    ...(item?.pathExcludes ? { pathExcludes: item.pathExcludes } : {}),
  };
}

const LIVE_CHAT_GROUP: DashboardNavItem = {
  href: "/dashboard/chat-operations",
  label: "Live chat",
  section: "activity",
  iconKey: "chat",
  permission: null,
  permissionsAny: [
    PAGE.CHAT_INBOX,
    PAGE.CHAT_MONITOR,
    PAGE.CHAT_QA,
    PAGE.CHAT_QA_ROSTER,
    PAGE.CHAT_REPORTS,
    PAGE.CHAT_WIDGET,
    PAGE.CHAT_CLOSE_POLICY,
    PAGE.CHAT_CANNED,
    PAGE.CHAT_INVOLVEMENT,
    PAGE.CHAT_INTERNAL_SUPERVISORS,
    PAGE.PHONE_NUMBER_SETUP,
  ],
  prefixMatch: true,
  children: [
    chatNavItem(PAGE.CHAT_INBOX, "/dashboard/chat-operations", "Agent inbox", "chat", [OP.chat.access]),
    chatNavItem(PAGE.CHAT_MONITOR, "/dashboard/chat-monitor", "Monitor", "chat", CHAT_MONITOR_OPERATIONAL_ANY),
    {
      href: "/dashboard/chat-transcripts",
      label: "Chat transcripts",
      section: "activity",
      iconKey: "chat",
      permission: null,
      permissionsAny: [PAGE.CHAT_MONITOR, PAGE.CHAT_QA],
      prefixMatch: true,
    },
    chatNavItem(PAGE.CHAT_QA, "/dashboard/qa/inbox", "QA inbox", "chat", CHAT_QA_OPERATIONAL_ANY),
    chatNavItem(PAGE.CHAT_QA_ROSTER, "/dashboard/qa/roster", "QA roster", "chat", [OP.qa.chatAssign]),
    {
      href: "/dashboard/qa/team-quality",
      label: "Team QA reports",
      section: "activity",
      iconKey: "chat",
      permission: null,
      permissionsAny: [PAGE.CHAT_REPORTS, PAGE.CHAT_MONITOR],
      prefixMatch: true,
    },
    chatNavItem(PAGE.CHAT_REPORTS, "/dashboard/chat-reports", "Reports", "reports", [OP.chat.reportView]),
    chatNavItem(PAGE.CHAT_REPORTS, "/dashboard/website-analytics", "Website analytics", "reports", [OP.chat.reportView]),
    chatNavItem(PAGE.CHAT_WIDGET, "/dashboard/chat-widget", "Widget", "chatWidget"),
    chatNavItem(
      PAGE.PHONE_NUMBER_SETUP,
      "/dashboard/phone-number-setup",
      "Phone / Text Us",
      "chatWidget",
      [OP.phoneNumberSetup.view],
    ),
    chatNavItem(PAGE.CHAT_CLOSE_POLICY, "/dashboard/chat-settings", "Settings", "chatWidget"),
    chatNavItem(PAGE.CHAT_CANNED, "/dashboard/chat-canned", "Canned messages", "chatWidget"),
    chatNavItem(PAGE.CHAT_INVOLVEMENT, "/dashboard/chat-involvement", "Involvement", "chatWidget"),
    chatNavItem(
      PAGE.CHAT_INTERNAL_SUPERVISORS,
      "/dashboard/chat-internal-supervisors",
      "Internal supervisors",
      "chatWidget",
    ),
  ],
};

const AI_MANAGEMENT_GROUP: DashboardNavItem = {
  href: "/dashboard/ai-training/assistant",
  label: "AI Management",
  section: "activity",
  iconKey: "aiTraining",
  permission: null,
  permissionsAny: [PAGE.AI_ASSISTANT, PAGE.AI_CHATBOT],
  prefixMatch: true,
  children: [
    chatNavItem(PAGE.AI_ASSISTANT, "/dashboard/ai-training/assistant", "AI Assistant", "aiTraining", [
      OP.aiAssistant.use,
      OP.aiAssistant.trainingView,
      OP.chat.access,
    ]),
    chatNavItem(PAGE.AI_CHATBOT, "/dashboard/ai-training/chatbot", "AI Chatbot", "aiTraining", [
      OP.aiChatbot.trainingView,
    ]),
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
  permissionsAny: [PAGE.WEBSITE_ASSIGNMENTS, "page:clients"],
  children: [
    {
      ...toNavItem(PAGE.WEBSITE_ASSIGNMENTS)!,
      label: "Website assign",
      prefixMatch: true,
      pathExcludes: ["/service-schedules", "/service-scheduling", "/inquire-topics", "/dashboard/websites"],
    },
    {
      href: "/dashboard/websites",
      label: "Website directory",
      section: "activity",
      iconKey: "websiteAssignments",
      permission: "page:clients",
      prefixMatch: false,
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
    {
      href: "/dashboard/website-assigning/inquire-topics",
      label: "Inquire topics",
      section: "activity",
      iconKey: "websiteAssignments",
      permission: PAGE.WEBSITE_ASSIGNMENTS,
      prefixMatch: true,
      pathIncludes: "/inquire-topics",
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
    {
      href: "/dashboard/user-page/poc-list",
      label: "POC list",
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
      label: "Attendance",
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

const REPORTS_GROUP: DashboardNavItem = {
  href: "/dashboard/reports",
  label: "Reports",
  section: "activity",
  iconKey: "reports",
  permission: "page:reports",
  prefixMatch: true,
  operationalAny: [OP.report.view],
  children: [
    {
      href: "/dashboard/reports",
      label: "Generate Reports",
      section: "activity",
      iconKey: "reports",
      permission: "page:reports",
      prefixMatch: false,
      operationalAny: [OP.report.view],
    },
    {
      href: "/dashboard/reports/configuration",
      label: "Reports Configuration",
      section: "activity",
      iconKey: "reports",
      permission: "page:reports",
      prefixMatch: true,
      operationalAny: [OP.report.view],
    },
  ],
};

const SETTINGS_GROUP: DashboardNavItem = {
  href: "/dashboard/settings",
  label: "Settings",
  section: "activity",
  iconKey: "settings",
  permission: null,
  permissionsAny: ["page:settings", "page:observability:logs"],
  prefixMatch: true,
  children: [
    {
      href: "/dashboard/settings",
      label: "Overview",
      section: "activity",
      iconKey: "settings",
      permission: "page:settings",
      prefixMatch: false,
    },
    {
      href: "/dashboard/settings/profile",
      label: "Profile",
      section: "activity",
      iconKey: "settings",
      permission: "page:settings",
      prefixMatch: false,
    },
    {
      href: "/dashboard/settings/logs",
      label: "System logs",
      section: "activity",
      iconKey: "settings",
      permission: "page:observability:logs",
      internalOnly: true,
      prefixMatch: true,
    },
    {
      href: "/dashboard/security",
      label: "Security",
      section: "activity",
      iconKey: "settings",
      permission: "page:settings",
      prefixMatch: true,
    },
  ],
};

const EMAIL_GROUP: DashboardNavItem = {
  href: "/dashboard/email/setup/reseller",
  label: "Email Configuration",
  section: "activity",
  iconKey: "smtpEmail",
  permission: null,
  permissionsAny: ["page:smtp-email", "page:email-template"],
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
      href: "/dashboard/email/forms",
      label: "Email forms",
      section: "activity",
      iconKey: "smtpEmail",
      permission: "page:email-template",
      prefixMatch: true,
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
  if (
    permission === "page:chat-inbox" ||
    permission === "page:chat-monitor" ||
    permission === "page:chat-qa" ||
    permission === "page:chat-qa-roster" ||
    permission === "page:chat-reports" ||
    permission === "page:chat-widget" ||
    permission === "page:chat-close-policy" ||
    permission === "page:chat-canned" ||
    permission === "page:chat-involvement" ||
    permission === "page:chat-internal-supervisors" ||
    permission === "page:phone-number-setup"
  ) {
    return permission === "page:chat-inbox" ? [LIVE_CHAT_GROUP] : [];
  }
  if (permission === "page:ai-assistant" || permission === "page:ai-chatbot") {
    return permission === "page:ai-assistant" ? [AI_MANAGEMENT_GROUP] : [];
  }
  if (COMMERCIAL_PAGE_PERMISSIONS.includes(permission)) {
    const first = firstCommercialPageInNavOrder();
    if (!first || permission !== first) return [];
    return [COMMERCIAL_ACCOUNT_GROUP];
  }
  if (permission === "page:smtp-email" || permission === "page:email-template") {
    return [EMAIL_GROUP];
  }
  if (permission === "page:email-agent-feedback") {
    const item = toNavItem(permission);
    return item ? [item] : [];
  }
  if (permission === "page:settings" || permission === "page:observability:logs") {
    return permission === "page:settings" ? [SETTINGS_GROUP] : [];
  }
  if (permission === "page:reports") return [REPORTS_GROUP];
  const item = toNavItem(permission);
  return item ? [item] : [];
});
