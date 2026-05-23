import { PAGE_PERMISSION_DASHBOARD } from "@/lib/auth/permissions-model";
import { getDashboardPathPageRequirements } from "./dashboard-access";
import { hasAnyOperational } from "./access-helpers";
import { HRMS, HRMS_LEAVE_APPROVE_ANY, HRMS_WORKFORCE_VIEW_ANY, ORG, PAGE } from "./permission-constants";
import { OP } from "./operational-keys";

/**
 * Longest-prefix wins. Any one operational string grants “view” for that screen.
 * Org routes use {@link ORG}; workforce HRMS uses {@link HRMS}. `page:chat` does not imply org.
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
  {
    prefix: "/dashboard/website-assigning",
    anyOf: [OP.websiteAssignment.view, OP.website.assign],
  },
  {
    prefix: "/dashboard/departments",
    anyOf: [...ORG.DEPT_VIEW, ...ORG.DEPT_MANAGE, ...ORG.ORG_MANAGE, ...ORG.STRUCTURE_VIEW],
  },
  {
    prefix: "/dashboard/designations",
    anyOf: [...ORG.DESIGNATION_VIEW, ...ORG.DESIGNATION_MANAGE, ...ORG.ORG_MANAGE],
  },
  {
    prefix: "/dashboard/pools",
    anyOf: [
      ...ORG.POOL_VIEW,
      ...ORG.POOL_MANAGE,
      ...ORG.ORG_MANAGE,
      ...ORG.POOL_MEMBER_ADD,
      ...ORG.POOL_MEMBER_UPDATE,
      ...ORG.POOL_MEMBER_REMOVE,
    ],
  },
  {
    prefix: "/dashboard/hrms/pool-members",
    anyOf: [
      ...ORG.POOL_VIEW,
      ...ORG.POOL_MANAGE,
      ...ORG.ORG_MANAGE,
      ...ORG.POOL_MEMBER_ADD,
      ...ORG.POOL_MEMBER_UPDATE,
      ...ORG.POOL_MEMBER_REMOVE,
    ],
  },
  {
    prefix: "/dashboard/hrms/pool-heads",
    anyOf: [...ORG.POOL_HEAD_VIEW, ...ORG.POOL_MANAGE, ...ORG.ORG_MANAGE, ...ORG.POOL_VIEW],
  },
  {
    prefix: "/dashboard/hrms/department-heads",
    anyOf: [...ORG.DEPT_VIEW, ...ORG.DEPT_MANAGE, ...ORG.ORG_MANAGE],
  },
  { prefix: "/dashboard/leave/leave-type", anyOf: [HRMS.LEAVE_TYPE_MANAGE, HRMS.LEAVE_VIEW, OP.hrms.leave.typeManage] },
  {
    prefix: "/dashboard/leave/approve-leave",
    anyOf: [...HRMS_LEAVE_APPROVE_ANY, OP.hrms.leave.approve, OP.hrms.leave.approveDepartment, OP.hrms.leave.approvePool],
  },
  {
    prefix: "/dashboard/leave/approval-inbox",
    anyOf: [...HRMS_LEAVE_APPROVE_ANY, OP.hrms.leave.approve, OP.hrms.leave.approveDepartment, OP.hrms.leave.approvePool],
  },
  {
    prefix: "/dashboard/leave/apply-leave",
    anyOf: [HRMS.LEAVE_APPLY, HRMS.LEAVE_SELF_VIEW, HRMS.LEAVE_VIEW, OP.hrms.leave.apply],
  },
  {
    prefix: "/dashboard/leave/leave-balance",
    anyOf: [HRMS.LEAVE_SELF_VIEW, HRMS.LEAVE_VIEW, OP.hrms.leave.selfView],
  },
  {
    prefix: "/dashboard/leave",
    anyOf: [
      HRMS.LEAVE_VIEW,
      HRMS.LEAVE_SELF_VIEW,
      HRMS.LEAVE_APPLY,
      HRMS.LEAVE_TYPE_MANAGE,
      ...HRMS_LEAVE_APPROVE_ANY,
      OP.hrms.leave.view,
    ],
  },
  {
    prefix: "/dashboard/attendance/mark-attendance",
    anyOf: [
      HRMS.ATTENDANCE_VIEW,
      HRMS.ATTENDANCE_SELF,
      HRMS.ATTENDANCE_SELF_VIEW,
      HRMS.ATTENDANCE_CHECKIN,
      HRMS.ATTENDANCE_CHECKOUT,
      OP.hrms.attendance.view,
      OP.hrms.attendance.self,
    ],
  },
  { prefix: "/dashboard/attendance/team-attendance", anyOf: [HRMS.ATTENDANCE_VIEW, OP.hrms.attendance.view] },
  {
    prefix: "/dashboard/attendance/my-attendance",
    anyOf: [HRMS.ATTENDANCE_SELF_VIEW, HRMS.ATTENDANCE_VIEW, OP.hrms.attendance.selfView],
  },
  {
    prefix: "/dashboard/attendance",
    anyOf: [
      HRMS.ATTENDANCE_VIEW,
      HRMS.ATTENDANCE_SELF_VIEW,
      HRMS.ATTENDANCE_SELF,
      HRMS.ATTENDANCE_CHECKIN,
      HRMS.ATTENDANCE_CHECKOUT,
      OP.hrms.attendance.view,
    ],
  },
  {
    prefix: "/dashboard/hrms",
    anyOf: [...HRMS_WORKFORCE_VIEW_ANY],
  },
  {
    prefix: "/dashboard/shifts/user-shift",
    anyOf: [
      HRMS.USER_SHIFT_ASSIGN,
      HRMS.TEAM_ROSTER_VIEW,
      HRMS.SHIFT_VIEW,
      OP.hrms.userShift.assign,
      OP.hrms.shift.view,
    ],
  },
  {
    prefix: "/dashboard/shifts/department-shift",
    anyOf: [HRMS.SHIFT_VIEW, OP.hrms.shift.view, OP.hrms.shiftAssignment.view],
  },
  { prefix: "/dashboard/shifts/pool-shift", anyOf: [HRMS.SHIFT_VIEW, OP.hrms.shift.view] },
  { prefix: "/dashboard/shifts", anyOf: [HRMS.SHIFT_VIEW, OP.hrms.shift.view, OP.hrms.shiftAssignment.view] },
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

const PAGE_PERMISSION_TO_VIEW_ANY: Readonly<Record<string, readonly string[]>> = {
  [PAGE.CHAT]: [OP.chat.access],
  [PAGE.CHAT_WIDGET]: [OP.chatWidget.view],
  "page:clients": [OP.company.view, OP.company.list, OP.company.detail, OP.accountSetup.view],
  "page:account-setup": [OP.accountSetup.view, OP.company.view, OP.company.list, OP.company.detail],
  "page:resellers": [OP.accountSetup.view, OP.company.view, OP.company.list, OP.company.detail],
  [PAGE.USERS]: [OP.user.view],
  [PAGE.ROLES]: [OP.client.permissions],
  [PAGE.WEBSITE_ASSIGNMENTS]: [OP.websiteAssignment.view, OP.website.assign],
  [PAGE.DEPARTMENTS]: [...ORG.DEPT_VIEW, ...ORG.DEPT_MANAGE, ...ORG.ORG_MANAGE],
  [PAGE.DESIGNATIONS]: [...ORG.DESIGNATION_VIEW, ...ORG.DESIGNATION_MANAGE, ...ORG.ORG_MANAGE],
  [PAGE.POOL]: [...ORG.POOL_VIEW, ...ORG.POOL_MANAGE, ...ORG.ORG_MANAGE],
  "page:pools": [...ORG.POOL_VIEW, ...ORG.POOL_MANAGE, ...ORG.ORG_MANAGE],
  [PAGE.HRMS]: [...HRMS_WORKFORCE_VIEW_ANY],
  [PAGE.SHIFTS]: [HRMS.SHIFT_VIEW, OP.hrms.shift.view],
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
): boolean {
  const anyOf = getOperationalViewAnyOfForDashboardPath(pathname);
  if (!anyOf?.length) return true;
  return hasAnyOperational(hasOperational, anyOf);
}
