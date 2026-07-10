/**
 * Dashboard home layout — change array order to move sections up or down.
 * Role permissions still control visibility; this only controls position.
 */

export type DashboardHomeSectionKey = "header" | "personal" | "overview" | "hrms";

/** Main `/dashboard` page blocks (top → bottom). */
export const DASHBOARD_HOME_SECTION_ORDER: readonly DashboardHomeSectionKey[] = [
  "header",
  "personal",
  "overview",
  "hrms",
];

export type DashboardOverviewSectionKey =
  | "platform"
  | "supervisor"
  | "company"
  | "qa"
  | "agent";

/** Chat / platform overview cards when multiple roles are assigned. */
export const DASHBOARD_OVERVIEW_SECTION_ORDER: readonly DashboardOverviewSectionKey[] = [
  "platform",
  "supervisor",
  "company",
  "qa",
  "agent",
];

export type SupervisorDashboardBlockKey =
  | "liveMetrics"
  | "agentLiveQa"
  | "liveChatMonitor"
  | "websiteTraffic";

/** Supervisor overview inner blocks (below date-range header). */
export const SUPERVISOR_DASHBOARD_BLOCK_ORDER: readonly SupervisorDashboardBlockKey[] = [
  "liveMetrics",
  "agentLiveQa",
  "liveChatMonitor",
  "websiteTraffic",
];
