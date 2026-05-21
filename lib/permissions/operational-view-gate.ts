import { PAGE_PERMISSION_DASHBOARD } from "@/lib/auth/permissions-model";
import { getDashboardPathPageRequirements } from "./dashboard-access";
import { OP } from "./operational-keys";

/**
 * Longest-prefix wins. Any one operational string grants “view” for that screen.
 * Paths not listed fall back to {@link PAGE_PERMISSION_TO_VIEW_ANY} via page requirements.
 */
const PREFIX_VIEW_RULES: readonly { prefix: string; anyOf: readonly string[] }[] = [
  {
    prefix: "/dashboard/chat-operations",
    anyOf: [OP.chat.access],
  },
  {
    prefix: "/dashboard/chat-monitor",
    anyOf: [
      OP.chat.audit,
      OP.chat.auditPlatform,
      OP.chat.monitorPool,
      OP.chat.monitorDepartment,
      OP.chat.monitorParentCompany,
    ],
  },
  {
    prefix: "/dashboard/chat-qa",
    anyOf: [
      OP.qa.chatReview,
      OP.qa.chatReviewMessage,
      OP.qa.chatReviewSession,
      OP.qa.chatAssign,
    ],
  },
  {
    prefix: "/dashboard/chat-reports",
    anyOf: [OP.chat.reportView],
  },
  {
    prefix: "/dashboard/chat-settings",
    anyOf: [OP.chatWidget.view, OP.chatWidget.update],
  },
  { prefix: "/dashboard/leave/leave-type", anyOf: [OP.hrms.leave.typeManage, OP.hrms.leave.view] },
  {
    prefix: "/dashboard/leave/approve-leave",
    anyOf: [
      OP.hrms.leave.approve,
      OP.hrms.leave.approveDepartment,
      OP.hrms.leave.approvePool,
      OP.hrms.leave.view,
    ],
  },
  {
    prefix: "/dashboard/leave/approval-inbox",
    anyOf: [
      OP.hrms.leave.approve,
      OP.hrms.leave.approveDepartment,
      OP.hrms.leave.approvePool,
      OP.hrms.leave.view,
    ],
  },
  {
    prefix: "/dashboard/leave/apply-leave",
    anyOf: [OP.hrms.leave.apply, OP.hrms.leave.selfView, OP.hrms.leave.view],
  },
  { prefix: "/dashboard/leave/leave-balance", anyOf: [OP.hrms.leave.selfView, OP.hrms.leave.view] },
  {
    prefix: "/dashboard/leave",
    anyOf: [
      OP.hrms.leave.view,
      OP.hrms.leave.selfView,
      OP.hrms.leave.apply,
      OP.hrms.leave.typeManage,
      OP.hrms.leave.approve,
      OP.hrms.leave.approveDepartment,
      OP.hrms.leave.approvePool,
    ],
  },
  {
    prefix: "/dashboard/attendance/mark-attendance",
    anyOf: [
      OP.hrms.attendance.view,
      OP.hrms.attendance.self,
      OP.hrms.attendance.selfView,
      OP.hrms.attendance.checkIn,
      OP.hrms.attendance.checkOut,
    ],
  },
  { prefix: "/dashboard/attendance/team-attendance", anyOf: [OP.hrms.attendance.view] },
  {
    prefix: "/dashboard/attendance/my-attendance",
    anyOf: [OP.hrms.attendance.selfView, OP.hrms.attendance.view],
  },
  {
    prefix: "/dashboard/attendance",
    anyOf: [
      OP.hrms.attendance.view,
      OP.hrms.attendance.selfView,
      OP.hrms.attendance.self,
      OP.hrms.attendance.checkIn,
      OP.hrms.attendance.checkOut,
    ],
  },
  {
    prefix: "/dashboard/hrms/pool-members",
    anyOf: [
      OP.hrms.pool.view,
      OP.hrms.org.poolManage,
      OP.hrms.org.manage,
      OP.hrms.pool.memberAdd,
      OP.hrms.pool.memberUpdate,
      OP.hrms.pool.memberRemove,
    ],
  },
  {
    prefix: "/dashboard/hrms/pools",
    anyOf: [
      OP.hrms.pool.view,
      OP.hrms.org.poolManage,
      OP.hrms.org.manage,
      OP.hrms.pool.memberAdd,
      OP.hrms.pool.memberUpdate,
      OP.hrms.pool.memberRemove,
    ],
  },
  {
    prefix: "/dashboard/hrms/pool-heads",
    anyOf: [
      OP.hrms.poolHead.view,
      OP.hrms.org.poolManage,
      OP.hrms.org.manage,
      OP.hrms.pool.view,
    ],
  },
  {
    prefix: "/dashboard/hrms/department-heads",
    anyOf: [
      OP.hrms.departmentHead.view,
      OP.hrms.org.departmentManage,
      OP.hrms.org.manage,
      OP.hrms.department.view,
    ],
  },
  {
    prefix: "/dashboard/hrms",
    anyOf: [
      OP.hrms.org.structureView,
      OP.hrms.leave.view,
      OP.hrms.pool.view,
      OP.hrms.department.view,
      OP.hrms.designation.view,
      OP.hrms.shift.view,
      OP.hrms.shiftAssignment.view,
      OP.hrms.poolHead.view,
      OP.hrms.departmentHead.view,
    ],
  },
  {
    prefix: "/dashboard/shifts/user-shift",
    anyOf: [
      OP.hrms.userShift.assign,
      OP.hrms.team.rosterView,
      OP.hrms.shiftAssignment.view,
      OP.hrms.shift.view,
    ],
  },
  {
    prefix: "/dashboard/shifts/department-shift",
    anyOf: [OP.hrms.shift.view, OP.hrms.shiftAssignment.view, OP.hrms.team.rosterView],
  },
  { prefix: "/dashboard/shifts/pool-shift", anyOf: [OP.hrms.shift.view, OP.hrms.shiftAssignment.view] },
  { prefix: "/dashboard/shifts", anyOf: [OP.hrms.shift.view, OP.hrms.shiftAssignment.view] },
  {
    prefix: "/dashboard/email/design",
    anyOf: [OP.emailTemplate.view, OP.emailTemplate.update, OP.emailTemplate.publish],
  },
  {
    prefix: "/dashboard/email/form",
    anyOf: [OP.emailTemplate.view, OP.smtpEmail.view],
  },
  {
    prefix: "/dashboard/email/connection",
    anyOf: [OP.smtpEmail.view, OP.smtpEmail.update, OP.smtpEmail.test],
  },
  {
    prefix: "/dashboard/email",
    anyOf: [
      OP.smtpEmail.view,
      OP.emailTemplate.view,
      OP.emailTemplate.update,
      OP.emailTemplate.publish,
    ],
  },
].sort((a, b) => b.prefix.length - a.prefix.length);

/** When no prefix rule matched: one of these operational strings is enough to “view” that module. */
const PAGE_PERMISSION_TO_VIEW_ANY: Readonly<Record<string, readonly string[]>> = {
  "page:chat": [OP.chat.access],
  "page:chat-widget": [OP.chatWidget.view],
  "page:clients": [OP.company.view, OP.company.list, OP.company.detail, OP.accountSetup.view],
  "page:account-setup": [OP.accountSetup.view, OP.company.view, OP.company.list, OP.company.detail],
  "page:resellers": [OP.accountSetup.view, OP.company.view, OP.company.list, OP.company.detail],
  "page:users": [OP.user.view],
  "page:roles": [OP.client.permissions],
  "page:website-assignments": [OP.websiteAssignment.view, OP.website.assign],
  "page:departments": [
    OP.hrms.department.view,
    OP.hrms.org.departmentManage,
    OP.hrms.org.manage,
  ],
  "page:designations": [
    OP.hrms.designation.view,
    OP.hrms.org.designationManage,
    OP.hrms.org.manage,
  ],
  "page:pools": [OP.hrms.pool.view, OP.hrms.org.poolManage, OP.hrms.org.manage],
  "page:crm-integration": [OP.crmIntegration.view],
  "page:distribution-setup": [OP.distributionSetup.view],
  "page:ip-blocklist": [OP.ipBlocklist.view],
  "page:licenses": [OP.license.view, OP.license.generate, OP.license.admin],
  "page:reports": [OP.report.view],
  "page:billing": [OP.billing.view],
  "page:smtp-email": [OP.smtpEmail.view],
  "page:email-template": [OP.emailTemplate.view],
  "page:social-media": [OP.socialMedia.view],
};

function normalizePathname(pathname: string): string {
  const base = pathname.split("?")[0]?.trim() ?? "";
  if (!base || base === "/") return "/";
  return base.replace(/\/+$/, "") || "/";
}

function prefixRuleAnyOf(path: string): readonly string[] | null {
  for (const rule of PREFIX_VIEW_RULES) {
    if (path === rule.prefix || path.startsWith(`${rule.prefix}/`)) {
      return rule.anyOf;
    }
  }
  return null;
}

function unionViewOpsForPagePermissions(pageReqs: readonly string[]): readonly string[] | null {
  const out = new Set<string>();
  for (const p of pageReqs) {
    if (p === PAGE_PERMISSION_DASHBOARD) continue;
    const list = PAGE_PERMISSION_TO_VIEW_ANY[p];
    if (list?.length) list.forEach((x) => out.add(x));
  }
  return out.size > 0 ? [...out] : null;
}

/**
 * Returns operational permission strings; the user must have **at least one** (OR).
 * `null` means no operational “view” gate for this path (show content).
 */
export function getOperationalViewAnyOfForDashboardPath(pathname: string): readonly string[] | null {
  const path = normalizePathname(pathname);
  if (!path.startsWith("/dashboard")) return null;

  const fromPrefix = prefixRuleAnyOf(path);
  if (fromPrefix?.length) return fromPrefix;

  const pageReqs = getDashboardPathPageRequirements(path);
  if (!pageReqs?.length) return null;

  return unionViewOpsForPagePermissions(pageReqs);
}

export function userSatisfiesOperationalViewForDashboardPath(
  hasOperational: (permission: string) => boolean,
  pathname: string,
  hasPage?: (pagePermission: string) => boolean,
): boolean {
  const path = normalizePathname(pathname);

  /** Roles often grant `page:chat` without listing `chat:access` in OPERATIONAL — still show agent inbox. */
  if (
    (path === "/dashboard/chat-operations" || path.startsWith("/dashboard/chat-operations/")) &&
    hasPage?.("page:chat")
  ) {
    return true;
  }

  const anyOf = getOperationalViewAnyOfForDashboardPath(pathname);
  if (!anyOf?.length) return true;
  return anyOf.some((op) => hasOperational(op));
}
