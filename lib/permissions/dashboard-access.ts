import { PAGE_ACCESS_ALL } from "@/lib/auth/permissions-model";

export type DashboardSidebarIconKey =
  | "accountSetup"
  | "billing"
  | "chat"
  | "chatWidget"
  | "Reseller-Management"
  | "crmIntegration"
  | "dashboard"
  | "departments"
  | "distributionSetup"
  | "hrms"
  | "ipBlocklist"
  | "licenses"
  | "reports"
  | "resellers"
  | "roles"
  | "settings"
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
  /** Prefix match for dynamic routes such as `/dashboard/website-assigning/[userId]`. */
  prefixMatch?: boolean;
  /** Demo-only items (kept for existing seed/demo account behavior). */
  demoOnly?: boolean;
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
  | "page:distribution-setup"
  | "page:hrms"
  | "page:ip-blocklist"
  | "page:licenses"
  | "page:reports"
  | "page:resellers"
  | "page:roles"
  | "page:settings"
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
    href: "/dashboard/all-companies",
    iconKey: "resellers",
    label: "Reseller-Management",
  },
  { permission: "page:users", href: "/dashboard/user-page", iconKey: "users" },
 // { permission: "page:account-setup", href: "/dashboard/account-setup", iconKey: "accountSetup" },
  { permission: "page:website-assignments", href: "/dashboard/website-assigning", iconKey: "websiteAssignments", prefixMatch: true },
  { permission: "page:roles", href: "/dashboard/roles", iconKey: "roles" },
  { permission: "page:departments", href: "/dashboard/organization-user", iconKey: "departments" },
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

export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = PAGE_PERMISSION_ORDER.map(toNavItem).filter(
  (item): item is DashboardNavItem => !!item,
);

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
        if (!item.permission) return true;
        return hasPagePermission(opts.pagePermissionSet, item.permission);
      })
    : DASHBOARD_NAV_ITEMS;

  const withAlwaysVisible = [
    ...permissionDriven,
    ...ALWAYS_VISIBLE_NAV_ITEMS.filter((item) => item.section === opts.section),
  ];

  const dedupedByHref = Array.from(new Map(withAlwaysVisible.map((item) => [item.href, item])).values());

  return dedupedByHref.filter((item) => {
    if (item.section !== opts.section) return false;
    if (item.demoOnly && !opts.isDemoUser) return false;
    return true;
  });
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
  return visible[0]?.href ?? null;
}

/** Backward-compatible helper name used by older auth exports. */
export function getAccessibleDashboardHref(pagePermissionSet: Set<string>): string | null {
  return getFirstAccessibleDashboardPath({
    rbacEnabled: true,
    pagePermissionSet,
    isDemoUser: false,
  });
}
