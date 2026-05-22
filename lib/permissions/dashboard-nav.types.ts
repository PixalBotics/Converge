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

export type PagePermission =
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
  | "page:email-template"
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
