import type { DashboardNavItem, PagePermission, RouteRule } from "./dashboard-nav.types";

/**
 * Single source of truth: backend page permission -> frontend route + icon.
 * Labels are derived directly from permission (e.g. `page:account-setup` => `account-setup`).
 */
export const ROUTE_RULES: readonly RouteRule[] = [
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
  {
    permission: "page:website-assignments",
    href: "/dashboard/website-assigning",
    iconKey: "websiteAssignments",
    prefixMatch: true,
  },
  {
    permission: "page:clients",
    href: "/dashboard/websites",
    iconKey: "websiteAssignments",
    label: "Website directory",
    prefixMatch: false,
  },
  { permission: "page:roles", href: "/dashboard/roles", iconKey: "roles" },
  { permission: "page:departments", href: "/dashboard/departments", iconKey: "departments" },
  {
    permission: "page:designations",
    href: "/dashboard/designations",
    iconKey: "designations",
    label: "Designations",
  },
  { permission: "page:pool", href: "/dashboard/pools", iconKey: "pools", label: "Pools", prefixMatch: true },
  { permission: "page:pools", href: "/dashboard/pools", iconKey: "pools", label: "Pools", prefixMatch: true },
  {
    permission: "page:pool",
    href: "/dashboard/hrms/pool-members",
    iconKey: "pools",
    label: "Pool members",
    prefixMatch: true,
  },
  {
    permission: "page:pool",
    href: "/dashboard/hrms/pool-heads",
    iconKey: "pools",
    label: "Pool heads",
    prefixMatch: true,
  },
  {
    permission: "page:departments",
    href: "/dashboard/hrms/department-heads",
    iconKey: "departments",
    label: "Department heads",
    prefixMatch: true,
  },
  { permission: "page:shifts", href: "/dashboard/shifts", iconKey: "shifts", label: "Shifts", prefixMatch: true },
  { permission: "page:chat-inbox", href: "/dashboard/chat-operations", iconKey: "chat", label: "Agent inbox", prefixMatch: true },
  { permission: "page:chat-monitor", href: "/dashboard/chat-monitor", iconKey: "chat", label: "Monitor", prefixMatch: true },
  {
    permission: "page:chat-monitor",
    href: "/dashboard/chat-transcripts",
    iconKey: "chat",
    label: "Chat transcripts",
    prefixMatch: true,
  },
  {
    permission: "page:chat-qa",
    href: "/dashboard/chat-transcripts",
    iconKey: "chat",
    label: "Chat transcripts",
    prefixMatch: true,
  },
  { permission: "page:chat-qa", href: "/dashboard/qa/inbox", iconKey: "chat", label: "QA inbox", prefixMatch: true },
  {
    permission: "page:chat-reports",
    href: "/dashboard/chat-reports",
    iconKey: "reports",
    label: "Chat reports",
    prefixMatch: true,
  },
  {
    permission: "page:chat-reports",
    href: "/dashboard/website-analytics",
    iconKey: "reports",
    label: "Website analytics",
    prefixMatch: true,
  },
  { permission: "page:chat-widget", href: "/dashboard/chat-widget", iconKey: "chatWidget", label: "Widget", prefixMatch: true },
  {
    permission: "page:chat-close-policy",
    href: "/dashboard/chat-settings",
    iconKey: "chatWidget",
    label: "Chat settings",
    prefixMatch: true,
  },
  {
    permission: "page:chat-canned",
    href: "/dashboard/chat-canned",
    iconKey: "chatWidget",
    label: "Canned messages",
    prefixMatch: true,
  },
  {
    permission: "page:chat-involvement",
    href: "/dashboard/chat-involvement",
    iconKey: "chatWidget",
    label: "Chat involvement",
    prefixMatch: true,
  },
  {
    permission: "page:chat-qa-roster",
    href: "/dashboard/qa/roster",
    iconKey: "chat",
    label: "QA roster",
    prefixMatch: true,
  },
  {
    permission: "page:ai-assistant",
    href: "/dashboard/ai-training/assistant",
    iconKey: "aiTraining",
    label: "AI Assistant",
    prefixMatch: true,
  },
  {
    permission: "page:chat-inbox",
    href: "/dashboard/ai-training/assistant",
    iconKey: "aiTraining",
    label: "AI Assistant",
    prefixMatch: true,
  },
  {
    permission: "page:ai-chatbot",
    href: "/dashboard/ai-training/chatbot",
    iconKey: "aiTraining",
    label: "AI Chatbot",
    prefixMatch: true,
  },
  { permission: "page:crm-integration", href: "/dashboard/crm-integration", iconKey: "crmIntegration", prefixMatch: true },
  {
    permission: "page:distribution-setup",
    href: "/dashboard/distribution-setup",
    iconKey: "distributionSetup",
    prefixMatch: true,
  },
  { permission: "page:ip-blocklist", href: "/dashboard/ip-block-list", iconKey: "ipBlocklist", prefixMatch: true },
  { permission: "page:licenses", href: "/dashboard/license-generate", iconKey: "licenses" },
  { permission: "page:reports", href: "/dashboard/reports", iconKey: "reports", prefixMatch: true },
  { permission: "page:billing", href: "/dashboard/billing", iconKey: "billing" },
  { permission: "page:settings", href: "/dashboard/settings", iconKey: "settings" },
  {
    permission: "page:observability:logs",
    href: "/dashboard/settings/logs",
    iconKey: "settings",
    label: "System logs",
    prefixMatch: true,
  },
  {
    permission: "page:email-template",
    href: "/dashboard/email",
    iconKey: "smtpEmail",
    prefixMatch: true,
  },
  {
    permission: "page:email-template",
    href: "/dashboard/email/design",
    iconKey: "smtpEmail",
    prefixMatch: true,
  },
  {
    permission: "page:email-template",
    href: "/dashboard/email/forms",
    iconKey: "smtpEmail",
    prefixMatch: true,
  },
  {
    permission: "page:email-agent-feedback",
    href: "/dashboard/email/feedback",
    iconKey: "smtpEmail",
  },
  {
    permission: "page:smtp-email",
    href: "/dashboard/email",
    iconKey: "smtpEmail",
    label: "Email Configuration",
    prefixMatch: true,
  },
  { permission: "page:smtp-email", href: "/dashboard/email/setup", iconKey: "smtpEmail", prefixMatch: true },
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

/** First matching rule wins so one `page:*` can map to a primary nav href while extra path rules share the same permission. */
export const ROUTE_RULE_BY_PERMISSION = new Map<PagePermission, RouteRule>(
  ROUTE_RULES.reduce((acc, rule) => {
    if (!acc.has(rule.permission)) acc.set(rule.permission, rule);
    return acc;
  }, new Map()),
);

export const PAGE_PERMISSION_ORDER: readonly PagePermission[] = [
  "page:dashboard",
  "page:hrms",
  "page:clients",
  "page:users",
  "page:account-setup",
  "page:website-assignments",
  "page:roles",
  "page:departments",
  "page:designations",
  "page:pool",
  "page:pools",
  "page:shifts",
  "page:chat-inbox",
  "page:chat-monitor",
  "page:chat-qa",
  "page:chat-reports",
  "page:chat-widget",
  "page:chat-close-policy",
  "page:chat-canned",
  "page:chat-involvement",
  "page:chat-qa-roster",
  "page:ai-assistant",
  "page:ai-chatbot",
  "page:crm-integration",
  "page:distribution-setup",
  "page:ip-blocklist",
  "page:licenses",
  "page:reports",
  "page:billing",
  "page:settings",
  "page:observability:logs",
  "page:smtp-email",
  "page:email-template",
  "page:email-agent-feedback",
  "page:social-media",
  "page:resellers",
] as const;

/** `page:account-setup` | `page:clients` | `page:resellers` share one nav group (same `/dashboard/companies` tree). */
export const COMMERCIAL_PAGE_PERMISSIONS: readonly PagePermission[] = [
  "page:clients",
  "page:account-setup",
  "page:resellers",
];

export function firstCommercialPageInNavOrder(): PagePermission | null {
  for (const p of PAGE_PERMISSION_ORDER) {
    if (COMMERCIAL_PAGE_PERMISSIONS.includes(p)) return p;
  }
  return null;
}

/** Backend `page:*` keys we recognize (for `/dashboard/{segment}` → `page:{segment}` fallback). */
const KNOWN_PAGE_PERMISSION_KEYS = new Set<string>([
  ...(PAGE_PERMISSION_ORDER as readonly string[]),
  "page:designations",
  "page:pool",
  "page:observability:logs",
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
  websites: "page:clients",
  roles: "page:roles",
  departments: "page:departments",
  designations: "page:designations",
  pools: "page:pool",
  shifts: "page:shifts",
  "chat-operations": "page:chat-inbox",
  "chat-monitor": "page:chat-monitor",
  "chat-transcripts": "page:chat-monitor",
  qa: "page:chat-qa",
  "chat-qa": "page:chat-qa",
  "chat-reports": "page:chat-reports",
  "chat-widget": "page:chat-widget",
  "chat-settings": "page:chat-close-policy",
  "chat-canned": "page:chat-canned",
  "chat-involvement": "page:chat-involvement",
  "ai-training": "page:ai-assistant",
  "crm-integration": "page:crm-integration",
  "crm-integrator": "page:crm-integration",
  "distribution-setup": "page:distribution-setup",
  "phone-number-setup": "page:distribution-setup",
  "ip-block-list": "page:ip-blocklist",
  "license-generate": "page:licenses",
  reports: "page:reports",
  billing: "page:billing",
  settings: "page:settings",
  email: "page:smtp-email",
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

export function getFirstDashboardPathSegment(pathname: string): string | null {
  const clean = pathname.split("?")[0]?.replace(/\/+$/, "") ?? "";
  const parts = clean.split("/").filter(Boolean);
  if (parts.length < 2 || parts[0] !== "dashboard") return null;
  return parts[1] ?? null;
}

/** Resolve required `page:*` from `/dashboard/{segment}/…` when no `ROUTE_RULES` row matched. */
export function requiredPagePermissionFromDashboardSegment(segment: string): PagePermission {
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

export function toNavItem(permission: PagePermission): DashboardNavItem | null {
  const rule = ROUTE_RULE_BY_PERMISSION.get(permission);
  if (!rule) return null;
  return {
    href: rule.href,
    label: rule.label ?? permissionToLabel(permission),
    section: "activity",
    iconKey: rule.iconKey,
    permission,
    prefixMatch: rule.prefixMatch,
  };
}
