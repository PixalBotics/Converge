import { PAGE_ACCESS_ALL } from "@/lib/auth/permissions-model";

export type DashboardSidebarIconKey =
  | "accountSetup"
  | "billing"
  | "chat"
  | "chatWidget"
  | "clients"
  | "Reseller-Management"
  | "crmIntegration"
  | "dashboard"
  | "departments"
  | "designations"
  | "distributionSetup"
  | "hrms"
  | "ipBlocklist"
  | "licenses"
  | "leave"
  | "pools"
  | "reports"
  | "resellers"
  | "roles"
  | "settings"
  | "shifts"
  | "profile"
  | "theme"
  | "smtpEmail"
  | "socialMedia"
  | "users"
  | "websiteAssignments";

type DashboardNavSection = "activity" | "footer";

export type DashboardNavItem = {
  href: string;
  label: string;
  section: DashboardNavSection;
  iconKey: DashboardSidebarIconKey;
  /** Backend PAGE permission, e.g. `page:users`. Null means always visible. */
  permission: string | null;
  /** Prefix match for dynamic routes such as `/dashboard/website-assigning/website/[websiteId]`. */
  prefixMatch?: boolean;
  /** Demo-only items (kept for existing seed/demo account behavior). */
  demoOnly?: boolean;
  /**
   * Parent row only: show when RBAC is on and the user has any of these page permissions.
   * Ignored when `permission` is set (flat items use `permission` only).
   */
  permissionsAny?: string[];
  /** Nested links (e.g. Departments + Designations under one sidebar dropdown). */
  children?: DashboardNavItem[];
};

type PagePermission =
  | "page:account-setup"
  | "page:billing"
  | "page:chat"
  | "page:chat-widget"
  | "page:clients"
  | "page:crm-integration"
  | "page:dashboard"
  | "page:departments"
  | "page:designations"
  | "page:distribution-setup"
  | "page:hrms"
  | "page:ip-blocklist"
  | "page:licenses"
  | "page:pools"
  | "page:reports"
  | "page:resellers"
  | "page:roles"
  | "page:settings"
  | "page:shifts"
  | "page:smtp-email"
  | "page:social-media"
  | "page:users"
  | "page:website-assignments";

type RouteRule = {
  permission: PagePermission;
  href: string;
  prefixMatch?: boolean;
  iconKey: DashboardSidebarIconKey;
  label?: string;
};

/**
 * Single source of truth: backend page permission -> frontend route + icon.
 * Labels are derived directly from permission (e.g. `page:account-setup` => `account-setup`).
 */
const ROUTE_RULES: readonly RouteRule[] = [
  { permission: "page:dashboard", href: "/dashboard", iconKey: "dashboard" },
  { permission: "page:hrms", href: "/dashboard/hrms", iconKey: "hrms" },
  {
    permission: "page:account-setup",
    href: "/dashboard/companies",
    iconKey: "resellers",
    label: "Reseller-Management",
    prefixMatch: true,
  },
  { permission: "page:users", href: "/dashboard/user-page", iconKey: "users" },
 // { permission: "page:account-setup", href: "/dashboard/account-setup", iconKey: "accountSetup" },
  { permission: "page:website-assignments", href: "/dashboard/website-assigning", iconKey: "websiteAssignments", prefixMatch: true },
  { permission: "page:roles", href: "/dashboard/roles", iconKey: "roles" },
  { permission: "page:departments", href: "/dashboard/departments", iconKey: "departments" },
  {
    permission: "page:designations",
    href: "/dashboard/designations",
    iconKey: "designations",
    label: "Designations",
  },
  { permission: "page:pools", href: "/dashboard/pools", iconKey: "pools", label: "Pools" },
  { permission: "page:shifts", href: "/dashboard/shifts", iconKey: "shifts", label: "Shifts", prefixMatch: true },
  { permission: "page:chat", href: "/dashboard/chat-operations", iconKey: "chat" },
  { permission: "page:chat-widget", href: "/dashboard/chat-widget", iconKey: "chatWidget" },
  { permission: "page:crm-integration", href: "/dashboard/crm-integration", iconKey: "crmIntegration", prefixMatch: true },
  { permission: "page:distribution-setup", href: "/dashboard/distribution-setup", iconKey: "distributionSetup", prefixMatch: true },
  { permission: "page:ip-blocklist", href: "/dashboard/ip-block-list", iconKey: "ipBlocklist", prefixMatch: true },
  { permission: "page:licenses", href: "/dashboard/license-generate", iconKey: "licenses" },
  { permission: "page:reports", href: "/dashboard/reports", iconKey: "reports" },
  { permission: "page:billing", href: "/dashboard/billing", iconKey: "billing" },
  { permission: "page:settings", href: "/dashboard/settings", iconKey: "settings" },
  { permission: "page:smtp-email", href: "/dashboard/smtp-email-integration", iconKey: "smtpEmail", prefixMatch: true },
  { permission: "page:social-media", href: "/dashboard/integrations", iconKey: "socialMedia" },
];

const ALWAYS_VISIBLE_NAV_ITEMS: readonly DashboardNavItem[] = [
  {
    href: "/dashboard/theme",
    label: "theme",
    section: "footer",
    iconKey: "theme",
    permission: null,
  },
] as const;

const ROUTE_RULE_BY_PERMISSION = new Map<PagePermission, RouteRule>(
  ROUTE_RULES.map((rule) => [rule.permission, rule]),
);

const PAGE_PERMISSION_ORDER: readonly PagePermission[] = [
  "page:dashboard",
  "page:hrms",
  "page:clients",
  "page:users",
  "page:account-setup",
  "page:website-assignments",
  "page:roles",
  "page:departments",
  "page:pools",
  "page:chat",
  "page:chat-widget",
  "page:crm-integration",
  "page:distribution-setup",
  "page:ip-blocklist",
  "page:licenses",
  "page:reports",
  "page:billing",
  "page:settings",
  "page:smtp-email",
  "page:social-media",
  "page:resellers",
] as const;

function permissionToLabel(permission: PagePermission): string {
  return permission.replace(/^page:/, "");
}

function toNavItem(permission: PagePermission): DashboardNavItem | null {
  const rule = ROUTE_RULE_BY_PERMISSION.get(permission);
  if (!rule) return null; // permission exists but frontend route not implemented yet
  return {
    href: rule.href,
    label: rule.label ?? permissionToLabel(permission),
    section: "activity",
    iconKey: rule.iconKey,
    permission,
    prefixMatch: rule.prefixMatch,
  };
}

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

const ATTENDANCE_GROUP: DashboardNavItem = {
  href: "/dashboard/attendance/my-attendance",
  label: "Attendance",
  section: "activity",
  iconKey: "reports",
  permission: null,
  children: [
    {
      href: "/dashboard/attendance/my-attendance",
      label: "My Attendance",
      section: "activity",
      iconKey: "reports",
      permission: null,
    },
    {
      href: "/dashboard/attendance/team-attendance",
      label: "Team Attendance",
      section: "activity",
      iconKey: "reports",
      permission: null,
    },
  ],
};

const LEAVE_GROUP: DashboardNavItem = {
  href: "/dashboard/leave/leave-type",
  label: "Leave",
  section: "activity",
  iconKey: "leave",
  permission: null,
  children: [
    {
      href: "/dashboard/leave/leave-type",
      label: "Leave Type",
      section: "activity",
      iconKey: "leave",
      permission: null,
    },
    {
      href: "/dashboard/leave/apply-leave",
      label: "Apply Leave",
      section: "activity",
      iconKey: "leave",
      permission: null,
    },
    {
      href: "/dashboard/leave/approval-inbox",
      label: "Approval Inbox",
      section: "activity",
      iconKey: "leave",
      permission: null,
    },
    {
      href: "/dashboard/leave/approve-leave",
      label: "Approve Leave",
      section: "activity",
      iconKey: "leave",
      permission: null,
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

const HRMS_GROUP: DashboardNavItem = {
  href: "/dashboard/hrms",
  label: "HRMS",
  section: "activity",
  iconKey: "hrms",
  permission: null,
  permissionsAny: ["page:hrms"],
  children: [
    { ...toNavItem("page:hrms")!, label: "Overview", prefixMatch: false },
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
  ],
};

export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = PAGE_PERMISSION_ORDER.flatMap((permission) => {
  if (permission === "page:departments") return [DEPARTMENTS_AND_DESIGNATIONS_GROUP];
  if (permission === "page:website-assignments") return [WEBSITE_GROUP];
  if (permission === "page:users") return [USERS_GROUP];
  if (permission === "page:hrms") return [HRMS_GROUP];
  if (permission === "page:pools") return [toNavItem("page:pools")!, SHIFTS_GROUP, ATTENDANCE_GROUP, LEAVE_GROUP];
  const item = toNavItem(permission);
  return item ? [item] : [];
});

function hasPagePermission(pagePermissionSet: Set<string>, required: string): boolean {
  return pagePermissionSet.has(PAGE_ACCESS_ALL) || pagePermissionSet.has(required);
}

export function isNavPathSelected(pathname: string, href: string, prefixMatch?: boolean): boolean {
  if (prefixMatch) return pathname === href || pathname.startsWith(`${href}/`);
  return pathname === href;
}

export function getVisibleDashboardNavItems(opts: {
  section: DashboardNavSection;
  rbacEnabled: boolean;
  pagePermissionSet: Set<string>;
  isDemoUser: boolean;
}): DashboardNavItem[] {
  const permissionDriven = opts.rbacEnabled
    ? DASHBOARD_NAV_ITEMS.filter((item) => {
        if (item.children?.length) {
          const any = item.permissionsAny;
          if (any?.length) {
            return any.some((p) => hasPagePermission(opts.pagePermissionSet, p));
          }
          return true;
        }
        if (!item.permission) return true;
        return hasPagePermission(opts.pagePermissionSet, item.permission);
      })
    : DASHBOARD_NAV_ITEMS;

  const withFilteredChildren = permissionDriven.map((item) => {
    if (!item.children?.length) return item;
    const children = item.children.filter((ch) => {
      if (!opts.rbacEnabled) return true;
      if (!ch.permission) return true;
      return hasPagePermission(opts.pagePermissionSet, ch.permission);
    });
    return { ...item, children };
  });

  const withAlwaysVisible = [
    ...withFilteredChildren,
    ...ALWAYS_VISIBLE_NAV_ITEMS.filter((item) => item.section === opts.section),
  ];

  const dedupedByHref = Array.from(new Map(withAlwaysVisible.map((item) => [item.href, item])).values());

  return dedupedByHref.filter((item) => {
    if (item.section !== opts.section) return false;
    if (item.demoOnly && !opts.isDemoUser) return false;
    if (item.children?.length === 0) return false;
    return true;
  });
}

function firstLeafHref(item: DashboardNavItem): string | null {
  if (item.children?.length) {
    for (const ch of item.children) {
      const h = firstLeafHref(ch);
      if (h) return h;
    }
    return null;
  }
  return item.href;
}

export function getRequiredPagePermission(pathname: string): string | null {
  if (!pathname.startsWith("/dashboard")) return null;

  const publicRule = ALWAYS_VISIBLE_NAV_ITEMS.find((item) =>
    isNavPathSelected(pathname, item.href, item.prefixMatch),
  );
  if (publicRule) {
    return null;
  }

  const sorted = [...ROUTE_RULES].sort((a, b) => b.href.length - a.href.length);
  for (const item of sorted) {
    if (isNavPathSelected(pathname, item.href, item.prefixMatch)) {
      return item.permission;
    }
  }
  // Unmapped dashboard child routes are not blocked by frontend.
  return pathname === "/dashboard" ? "page:dashboard" : null;
}

export function canAccessDashboardPath(opts: {
  pathname: string;
  rbacEnabled: boolean;
  pagePermissionSet: Set<string>;
}): boolean {
  if (!opts.rbacEnabled) return true;
  const required = getRequiredPagePermission(opts.pathname);
  if (!required) return true;
  return hasPagePermission(opts.pagePermissionSet, required);
}

/** Preferred redirect target when current path is blocked. */
export function getFirstAccessibleDashboardPath(opts: {
  rbacEnabled: boolean;
  pagePermissionSet: Set<string>;
  isDemoUser: boolean;
}): string | null {
  const visible = getVisibleDashboardNavItems({
    section: "activity",
    rbacEnabled: opts.rbacEnabled,
    pagePermissionSet: opts.pagePermissionSet,
    isDemoUser: opts.isDemoUser,
  });
  for (const item of visible) {
    const href = firstLeafHref(item);
    if (href) return href;
  }
  return null;
}

/** Backward-compatible helper name used by older auth exports. */
export function getAccessibleDashboardHref(pagePermissionSet: Set<string>): string | null {
  return getFirstAccessibleDashboardPath({
    rbacEnabled: true,
    pagePermissionSet,
    isDemoUser: false,
  });
}
