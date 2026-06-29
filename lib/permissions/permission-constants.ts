/**
 * Shared page + operational permission codes (Converge SaaS).
 * Backend expands implied codes on `/auth/me` — UI mirrors page AND (operational OR).
 */

export const PAGE = {
  DASHBOARD: "page:dashboard",
  USERS: "page:users",
  DEPARTMENTS: "page:departments",
  DESIGNATIONS: "page:designations",
  POOL: "page:pool",
  /** Legacy plural slug — treat same as {@link PAGE.POOL}. */
  POOLS: "page:pools",
  HRMS: "page:hrms",
  SHIFTS: "page:shifts",
  /** Legacy umbrella — backend expands to granular chat pages. */
  CHAT: "page:chat",
  CHAT_INBOX: "page:chat-inbox",
  CHAT_MONITOR: "page:chat-monitor",
  CHAT_QA: "page:chat-qa",
  CHAT_REPORTS: "page:chat-reports",
  CHAT_WIDGET: "page:chat-widget",
  CHAT_CLOSE_POLICY: "page:chat-close-policy",
  CHAT_CANNED: "page:chat-canned",
  CHAT_INVOLVEMENT: "page:chat-involvement",
  CHAT_INTERNAL_SUPERVISORS: "page:chat-internal-supervisors",
  CHAT_QA_ROSTER: "page:chat-qa-roster",
  PHONE_NUMBER_SETUP: "page:phone-number-setup",
  AI_ASSISTANT: "page:ai-assistant",
  AI_CHATBOT: "page:ai-chatbot",
  AI_COPILOT: "page:ai-copilot",
  AI_PLATFORM: "page:ai-platform",
  ROLES: "page:roles",
  WEBSITE_ASSIGNMENTS: "page:website-assignments",
  SETTINGS: "page:settings",
  OBSERVABILITY_LOGS: "page:observability:logs",
} as const;

/** Org structure operational codes (`hrms:*` namespace). */
export const ORG = {
  DEPT_MANAGE: ["hrms:org:department:manage"] as const,
  DESIGNATION_MANAGE: ["hrms:org:designation:manage"] as const,
  POOL_MANAGE: ["hrms:org:pool:manage"] as const,
  ORG_MANAGE: ["hrms:org:manage"] as const,
  STRUCTURE_VIEW: ["hrms:org:structure:view"] as const,
  DEPT_VIEW: ["hrms:department:view"] as const,
  DESIGNATION_VIEW: ["hrms:designation:view"] as const,
  POOL_VIEW: ["hrms:pool:view"] as const,
  POOL_HEAD_VIEW: ["hrms:pool-head:view"] as const,
  POOL_MEMBER_ADD: ["hrms:pool:member:add"] as const,
  POOL_MEMBER_UPDATE: ["hrms:pool:member:update"] as const,
  POOL_MEMBER_REMOVE: ["hrms:pool:member:remove"] as const,
} as const;

/** HRMS workforce only (not org admin). */
export const HRMS = {
  ATTENDANCE_CHECKIN: "hrms:attendance:checkin",
  ATTENDANCE_CHECKOUT: "hrms:attendance:checkout",
  ATTENDANCE_BREAKIN: "hrms:attendance:breakin",
  ATTENDANCE_BREAKOUT: "hrms:attendance:breakout",
  ATTENDANCE_SELF: "hrms:attendance:self",
  ATTENDANCE_SELF_VIEW: "hrms:attendance:self:view",
  ATTENDANCE_VIEW: "hrms:attendance:view",
  LEAVE_APPLY: "hrms:leave:apply",
  LEAVE_SELF_VIEW: "hrms:leave:self:view",
  LEAVE_VIEW: "hrms:leave:view",
  LEAVE_APPROVE: "hrms:leave:approve",
  LEAVE_APPROVE_POOL: "hrms:leave:approve:pool",
  LEAVE_APPROVE_DEPT: "hrms:leave:approve:department",
  LEAVE_APPROVE_TENANT: "hrms:leave:approve:tenant",
  LEAVE_TYPE_MANAGE: "hrms:leave:type:manage",
  SHIFT_VIEW: "hrms:shift:view",
  SHIFT_CREATE: "hrms:shift:create",
  SHIFT_UPDATE: "hrms:shift:update",
  SHIFT_DELETE: "hrms:shift:delete",
  USER_SHIFT_ASSIGN: "hrms:user-shift:assign",
  TEAM_ROSTER_VIEW: "hrms:team:roster:view",
} as const;

export const HRMS_LEAVE_APPROVE_ANY = [
  HRMS.LEAVE_APPROVE,
  HRMS.LEAVE_APPROVE_POOL,
  HRMS.LEAVE_APPROVE_DEPT,
  HRMS.LEAVE_APPROVE_TENANT,
  HRMS.LEAVE_VIEW,
] as const;

export const HRMS_WORKFORCE_VIEW_ANY = [
  HRMS.ATTENDANCE_VIEW,
  HRMS.ATTENDANCE_SELF_VIEW,
  HRMS.ATTENDANCE_SELF,
  HRMS.ATTENDANCE_CHECKIN,
  HRMS.ATTENDANCE_CHECKOUT,
  HRMS.LEAVE_VIEW,
  HRMS.LEAVE_SELF_VIEW,
  HRMS.LEAVE_APPLY,
  HRMS.LEAVE_TYPE_MANAGE,
  ...HRMS_LEAVE_APPROVE_ANY,
  HRMS.SHIFT_VIEW,
  HRMS.USER_SHIFT_ASSIGN,
  HRMS.TEAM_ROSTER_VIEW,
] as const;

/** Flatten permission bundles for `hasAnyOperational`. */
export function flattenPermissionCodes(
  codes: readonly string[] | readonly (readonly string[])[],
): string[] {
  const out: string[] = [];
  for (const entry of codes) {
    if (typeof entry === "string") out.push(entry);
    else out.push(...entry);
  }
  return out;
}
