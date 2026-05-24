export type DashboardSidebarIconKey =
  | "accountSetup"
  | "billing"
  | "chat"
  | "chatWidget"
  | "aiTraining"
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

export type DashboardNavSection = "activity" | "footer";

export type DashboardNavItem = {
  href: string;
  label: string;
  section: DashboardNavSection;
  iconKey: DashboardSidebarIconKey;
  /** Backend PAGE permission, e.g. `page:users`. Null means always visible. */
  permission: string | null;
  /** Prefix match for dynamic routes such as `/dashboard/website-assigning/website/[websiteId]`. */
  prefixMatch?: boolean;
  /** Also highlight when pathname contains this substring (e.g. per-website scheduling editor). */
  pathIncludes?: string;
  /** With prefixMatch, do not highlight when pathname contains any of these substrings. */
  pathExcludes?: string[];
  /** Demo-only items (kept for existing seed/demo account behavior). */
  demoOnly?: boolean;
  /**
   * Parent row only: show when RBAC is on and the user has any of these page permissions.
   * Ignored when `permission` is set (flat items use `permission` only).
   */
  permissionsAny?: string[];
  /**
   * Child row only: show when user has any listed operational permission (OR).
   * Used for Chat Monitor under `page:chat` without a separate page key.
   */
  operationalAny?: string[];
  /** Hide from sidebar unless the signed-in user is platform internal staff. */
  internalOnly?: boolean;
  /** Nested links (e.g. Departments + Designations under one sidebar dropdown). */
  children?: DashboardNavItem[];
};

export type PagePermission =
  | "page:account-setup"
  | "page:billing"
  | "page:chat"
  | "page:chat-inbox"
  | "page:chat-monitor"
  | "page:chat-qa"
  | "page:chat-reports"
  | "page:chat-widget"
  | "page:chat-close-policy"
  | "page:chat-canned"
  | "page:chat-involvement"
  | "page:chat-qa-roster"
  | "page:ai-assistant"
  | "page:ai-chatbot"
  | "page:clients"
  | "page:crm-integration"
  | "page:dashboard"
  | "page:departments"
  | "page:designations"
  | "page:distribution-setup"
  | "page:hrms"
  | "page:ip-blocklist"
  | "page:licenses"
  | "page:pool"
  | "page:pools"
  | "page:reports"
  | "page:resellers"
  | "page:roles"
  | "page:settings"
  | "page:shifts"
  | "page:smtp-email"
  | "page:email-template"
  | "page:email-agent-feedback"
  | "page:social-media"
  | "page:users"
  | "page:website-assignments";

export type RouteRule = {
  permission: PagePermission;
  href: string;
  prefixMatch?: boolean;
  iconKey: DashboardSidebarIconKey;
  label?: string;
};
