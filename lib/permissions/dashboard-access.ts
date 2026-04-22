import {
  hasPagePermission,
  isRbacActive,
  PAGE_PERMISSION_DASHBOARD,
  PERMISSION_BUCKET_PAGE,
  toPermissionSet,
  type PermissionsByType,
} from "@/lib/auth/permissions-model";

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
  /**
   * `ROUTE_RULE_BY_PERMISSION` keeps the first row per `page:*` — this must be the HRMS shell so
   * `toNavItem("page:hrms")` and default landing do not point at `/dashboard/leave`.
   */
  { permission: "page:hrms", href: "/dashboard/hrms", iconKey: "hrms", prefixMatch: true },
  /** Leave / attendance screens share the same `page:hrms` bucket as the overview above. */
  { permission: "page:hrms", href: "/dashboard/attendance", iconKey: "leave", prefixMatch: true },
  { permission: "page:hrms", href: "/dashboard/attendance", iconKey: "reports", prefixMatch: true },
  {
    permission: "page:account-setup",
    href: "/dashboard/companies",
    iconKey: "resellers",
    label: "Reseller-Management",
    prefixMatch: true,
  },
  {
    permission: "page:account-setup",
    href: "/dashboard/account-setup",
    iconKey: "accountSetup",
    prefixMatch: true,
  },
  /** Same companies tree as account-setup; distinct page keys from the API. */
  {
    permission: "page:clients",
    href: "/dashboard/companies",
    iconKey: "clients",
    label: "Clients",
    prefixMatch: true,
  },
  {
    permission: "page:resellers",
    href: "/dashboard/companies",
    iconKey: "resellers",
    label: "Resellers",
    prefixMatch: true,
  },
  { permission: "page:users", href: "/dashboard/user-page", iconKey: "users", prefixMatch: true },
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
  { permission: "page:chat-widget", href: "/dashboard/chat-widget", iconKey: "chatWidget", prefixMatch: true },
  { permission: "page:crm-integration", href: "/dashboard/crm-integration", iconKey: "crmIntegration", prefixMatch: true },
  { permission: "page:distribution-setup", href: "/dashboard/distribution-setup", iconKey: "distributionSetup", prefixMatch: true },
  { permission: "page:ip-blocklist", href: "/dashboard/ip-block-list", iconKey: "ipBlocklist", prefixMatch: true },
  { permission: "page:licenses", href: "/dashboard/license-generate", iconKey: "licenses" },
  { permission: "page:reports", href: "/dashboard/reports", iconKey: "reports" },
  { permission: "page:billing", href: "/dashboard/billing", iconKey: "billing" },
  { permission: "page:settings", href: "/dashboard/settings", iconKey: "settings" },
  { permission: "page:smtp-email", href: "/dashboard/smtp-email-integration", iconKey: "smtpEmail", prefixMatch: true },
  { permission: "page:social-media", href: "/dashboard/integrations", iconKey: "socialMedia" },
  /** Alternate / legacy entry paths that share the same backend page permission. */
  { permission: "page:crm-integration", href: "/dashboard/crm-integrator", iconKey: "crmIntegration", prefixMatch: true },
  {
    permission: "page:distribution-setup",
    href: "/dashboard/phone-number-setup",
    iconKey: "distributionSetup",
    prefixMatch: true,
  },
  { permission: "page:dashboard", href: "/dashboard/company-admin-dashboard", iconKey: "dashboard", prefixMatch: true },
  { permission: "page:dashboard", href: "/dashboard/agent-dashboard", iconKey: "dashboard", prefixMatch: true },
  { permission: "page:dashboard", href: "/dashboard/supervisor-dashboard", iconKey: "dashboard", prefixMatch: true },
  { permission: "page:dashboard", href: "/dashboard/supper-dashboard", iconKey: "dashboard", prefixMatch: true },
  { permission: "page:dashboard", href: "/dashboard/qa-dashboard", iconKey: "dashboard", prefixMatch: true },
  { permission: "page:dashboard", href: "/dashboard/ai-management", iconKey: "dashboard", prefixMatch: true },
  { permission: "page:settings", href: "/dashboard/security", iconKey: "settings", prefixMatch: true },
  { permission: "page:users", href: "/dashboard/organization-user", iconKey: "users", prefixMatch: true },
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

/** First matching rule wins so one `page:*` can map to a primary nav href while extra path rules share the same permission. */
const ROUTE_RULE_BY_PERMISSION = new Map<PagePermission, RouteRule>(
  ROUTE_RULES.reduce((acc, rule) => {
    if (!acc.has(rule.permission)) acc.set(rule.permission, rule);
    return acc;
  }, new Map()),
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
  "page:shifts",
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

/** `page:account-setup` | `page:clients` | `page:resellers` share one nav group (same `/dashboard/companies` tree). */
const COMMERCIAL_PAGE_PERMISSIONS: readonly PagePermission[] = [
  "page:clients",
  "page:account-setup",
  "page:resellers",
];

function firstCommercialPageInNavOrder(): PagePermission | null {
  for (const p of PAGE_PERMISSION_ORDER) {
    if (COMMERCIAL_PAGE_PERMISSIONS.includes(p)) return p;
  }
  return null;
}

/** Backend `page:*` keys we recognize (for `/dashboard/{segment}` → `page:{segment}` fallback). */
const KNOWN_PAGE_PERMISSION_KEYS = new Set<string>([
  ...(PAGE_PERMISSION_ORDER as readonly string[]),
  "page:designations",
]);

/**
 * First path segment after `/dashboard/` maps to a page permission (`page:…`).
 * When the URL slug does not match the backend key (e.g. `user-page` vs `page:users`), use this map.
 */
const DASHBOARD_URL_SEGMENT_TO_PAGE: Readonly<Record<string, PagePermission>> = {
  hrms: "page:hrms",
  attendance: "page:hrms",
  leave: "page:hrms",
  "user-page": "page:users",
  companies: "page:account-setup",
  "account-setup": "page:account-setup",
  "website-assigning": "page:website-assignments",
  roles: "page:roles",
  departments: "page:departments",
  designations: "page:designations",
  pools: "page:pools",
  shifts: "page:shifts",
  "chat-operations": "page:chat",
  "chat-widget": "page:chat-widget",
  "crm-integration": "page:crm-integration",
  "crm-integrator": "page:crm-integration",
  "distribution-setup": "page:distribution-setup",
  "phone-number-setup": "page:distribution-setup",
  "ip-block-list": "page:ip-blocklist",
  "license-generate": "page:licenses",
  reports: "page:reports",
  billing: "page:billing",
  settings: "page:settings",
  "smtp-email-integration": "page:smtp-email",
  integrations: "page:social-media",
  "organization-user": "page:users",
  "company-admin-dashboard": "page:dashboard",
  "agent-dashboard": "page:dashboard",
  "supervisor-dashboard": "page:dashboard",
  "supper-dashboard": "page:dashboard",
  "qa-dashboard": "page:dashboard",
  "ai-management": "page:dashboard",
  security: "page:settings",
};

function getFirstDashboardPathSegment(pathname: string): string | null {
  const clean = pathname.split("?")[0]?.replace(/\/+$/, "") ?? "";
  const parts = clean.split("/").filter(Boolean);
  if (parts.length < 2 || parts[0] !== "dashboard") return null;
  return parts[1] ?? null;
}

/** Resolve required `page:*` from `/dashboard/{segment}/…` when no `ROUTE_RULES` row matched. */
function requiredPagePermissionFromDashboardSegment(segment: string): PagePermission {
  const mapped = DASHBOARD_URL_SEGMENT_TO_PAGE[segment];
  if (mapped) return mapped;
  const literal = `page:${segment}`;
  if (KNOWN_PAGE_PERMISSION_KEYS.has(literal)) {
    return literal as PagePermission;
  }
  return "page:dashboard";
}

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
      href: "/dashboard/hrms/pools",
      label: "Pools",
      section: "activity",
      iconKey: "pools",
      permission: "page:hrms",
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
    {
      href: "/dashboard/leave/approve-leave",
      label: "Approve Leave",
      section: "activity",
      iconKey: "leave",
      permission: "page:hrms",
    },
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
  if (permission === "page:pools") return [toNavItem("page:pools")!];
  if (permission === "page:shifts") return [SHIFTS_GROUP];
  if (COMMERCIAL_PAGE_PERMISSIONS.includes(permission)) {
    const first = firstCommercialPageInNavOrder();
    if (!first || permission !== first) return [];
    return [COMMERCIAL_ACCOUNT_GROUP];
  }
  const item = toNavItem(permission);
  return item ? [item] : [];
});

export function isNavPathSelected(pathname: string, href: string, prefixMatch?: boolean): boolean {
  if (prefixMatch) return pathname === href || pathname.startsWith(`${href}/`);
  return pathname === href;
}

export function getVisibleDashboardNavItems(opts: {
  section: DashboardNavSection;
  rbacEnabled: boolean;
  pagePermissionSet: Set<string>;
  isDemoUser: boolean;
  /** When true with RBAC on, show the full module tree (same as RBAC off) — aligned with `useAuth().hasPage` bypass. */
  isPlatformAdmin?: boolean;
}): DashboardNavItem[] {
  const rbacFiltersNav = opts.rbacEnabled && !opts.isPlatformAdmin;
  const permissionDriven = rbacFiltersNav
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
      if (!rbacFiltersNav) return true;
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

/** Depth-first sidebar order: parent-only hrefs (e.g. group rows) are skipped when they have children. */
function collectNavLeafHrefsInOrder(items: DashboardNavItem[]): string[] {
  const out: string[] = [];
  for (const item of items) {
    if (item.children?.length) {
      out.push(...collectNavLeafHrefsInOrder(item.children));
    } else if (item.href?.trim()) {
      out.push(item.href);
    }
  }
  return out;
}

const PAGE_PERMISSION_ORDER_INDEX: ReadonlyMap<string, number> = new Map(
  PAGE_PERMISSION_ORDER.map((p, i) => [p, i]),
);

function sortPagePermissionsByNavOrder(perms: readonly string[]): string[] {
  return [...perms].sort(
    (a, b) =>
      (PAGE_PERMISSION_ORDER_INDEX.get(a) ?? Number.POSITIVE_INFINITY) -
      (PAGE_PERMISSION_ORDER_INDEX.get(b) ?? Number.POSITIVE_INFINITY),
  );
}

/**
 * Backend `page:*` keys that grant access to this pathname (OR semantics when multiple).
 * `null` means no page gate (always allowed under RBAC).
 */
export function getDashboardPathPageRequirements(pathname: string): readonly string[] | null {
  if (!pathname.startsWith("/dashboard")) return null;

  const publicRule = ALWAYS_VISIBLE_NAV_ITEMS.find((item) =>
    isNavPathSelected(pathname, item.href, item.prefixMatch),
  );
  if (publicRule) {
    return null;
  }

  const matches = ROUTE_RULES.filter((rule) => isNavPathSelected(pathname, rule.href, rule.prefixMatch));
  if (matches.length > 0) {
    const maxLen = Math.max(...matches.map((m) => m.href.length));
    const atMax = matches.filter((m) => m.href.length === maxLen);
    return sortPagePermissionsByNavOrder([...new Set(atMax.map((m) => m.permission))]);
  }
  /** Convention: permission follows the first segment after `/dashboard/` (see `DASHBOARD_URL_SEGMENT_TO_PAGE`). */
  const segment = getFirstDashboardPathSegment(pathname);
  if (!segment) {
    return [PAGE_PERMISSION_DASHBOARD];
  }
  return [requiredPagePermissionFromDashboardSegment(segment)];
}

/**
 * Primary `page:*` for this path (for logging / legacy callers). When several permissions
 * suffice (e.g. `/dashboard/companies`), returns the earliest in sidebar priority order.
 */
export function getRequiredPagePermission(pathname: string): string | null {
  const reqs = getDashboardPathPageRequirements(pathname);
  if (!reqs?.length) return null;
  return reqs[0] ?? null;
}

export function canAccessDashboardPath(opts: {
  pathname: string;
  rbacEnabled: boolean;
  pagePermissionSet: Set<string>;
  /** Matches `useAuth().hasPage` — full dashboard routes without enumerating `page:*` in the token. */
  isPlatformAdmin?: boolean;
}): boolean {
  if (!opts.rbacEnabled) return true;
  if (opts.isPlatformAdmin) return true;
  const reqs = getDashboardPathPageRequirements(opts.pathname);
  if (!reqs?.length) return true;
  return reqs.some((r) => hasPagePermission(opts.pagePermissionSet, r));
}

/**
 * `/dashboard` is intentionally passable for every session (`hasPagePermission` treats `page:dashboard`
 * as the shell). For post-auth / “first module” redirects, prefer a concrete feature route when one exists.
 */
const DASHBOARD_ROOT_PATH = "/dashboard";

function deprioritizeDashboardShell(hrefs: readonly string[]): string[] {
  const rest: string[] = [];
  const shell: string[] = [];
  const seen = new Set<string>();
  for (const href of hrefs) {
    const key = href.split("?")[0]?.replace(/\/+$/, "") || DASHBOARD_ROOT_PATH;
    if (seen.has(key)) continue;
    seen.add(key);
    if (key === DASHBOARD_ROOT_PATH) shell.push(href);
    else rest.push(href);
  }
  return [...rest, ...shell];
}

/** Preferred redirect target when current path is blocked or after sign-in. */
export function getFirstAccessibleDashboardPath(opts: {
  rbacEnabled: boolean;
  pagePermissionSet: Set<string>;
  isDemoUser: boolean;
  isPlatformAdmin?: boolean;
}): string | null {
  const visible = getVisibleDashboardNavItems({
    section: "activity",
    rbacEnabled: opts.rbacEnabled,
    pagePermissionSet: opts.pagePermissionSet,
    isDemoUser: opts.isDemoUser,
    isPlatformAdmin: opts.isPlatformAdmin,
  });
  const candidates = deprioritizeDashboardShell(collectNavLeafHrefsInOrder(visible));
  for (const href of candidates) {
    if (
      canAccessDashboardPath({
        pathname: href,
        rbacEnabled: opts.rbacEnabled,
        pagePermissionSet: opts.pagePermissionSet,
        isPlatformAdmin: opts.isPlatformAdmin,
      })
    ) {
      return href;
    }
  }
  return null;
}

/**
 * Safe target after login / session restore while permissions hydrate.
 * Uses `/dashboard` until RBAC data is stable, then the first accessible module in nav order.
 */
export function resolvePostAuthDashboardHref(opts: {
  rbacEnabled: boolean;
  permissionsSyncing: boolean;
  pagePermissionSet: Set<string>;
  isPlatformAdmin: boolean;
  isDemoUser: boolean;
}): string {
  if (!opts.rbacEnabled || opts.permissionsSyncing) return DASHBOARD_ROOT_PATH;
  return (
    getFirstAccessibleDashboardPath({
      rbacEnabled: true,
      pagePermissionSet: opts.pagePermissionSet,
      isDemoUser: opts.isDemoUser,
      isPlatformAdmin: opts.isPlatformAdmin,
    }) ?? DASHBOARD_ROOT_PATH
  );
}

/**
 * Resolves the first dashboard module the user may open once permissions are known.
 * Call when `permissionsSyncing` is false (or to intentionally ignore a syncing flag).
 */
export function resolveDashboardLandingHref(opts: {
  permissionsByType: PermissionsByType | undefined;
  isPlatformAdmin: boolean;
  isDemoUser: boolean;
}): string {
  const rbacEnabled = isRbacActive(opts.permissionsByType);
  const pagePermissionSet = toPermissionSet(opts.permissionsByType?.[PERMISSION_BUCKET_PAGE]);
  return resolvePostAuthDashboardHref({
    rbacEnabled,
    permissionsSyncing: false,
    pagePermissionSet,
    isPlatformAdmin: opts.isPlatformAdmin,
    isDemoUser: opts.isDemoUser,
  });
}

/** Backward-compatible helper name used by older auth exports. */
export function getAccessibleDashboardHref(
  pagePermissionSet: Set<string>,
  opts?: { isPlatformAdmin?: boolean },
): string | null {
  return getFirstAccessibleDashboardPath({
    rbacEnabled: true,
    pagePermissionSet,
    isDemoUser: false,
    isPlatformAdmin: opts?.isPlatformAdmin,
  });
}
