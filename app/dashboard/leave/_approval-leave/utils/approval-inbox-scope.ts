import type { User } from "@/lib/auth/types";
import { HRMS, hasAnyOperational } from "@/lib/permissions";
import { OP } from "@/lib/permissions/operational-keys";

export type ApprovalInboxQueue = "pool" | "department" | "tenant";

export type ApprovalInboxAccess = {
  queue: ApprovalInboxQueue | null;
  canUsePoolQueue: boolean;
  canUseDepartmentQueue: boolean;
  canUseTenantQueue: boolean;
};

type ResolveApprovalInboxAccessInput = {
  hasOperational: (code: string) => boolean;
  isPlatformAdmin: boolean;
  isDepartmentHead: boolean;
  user: User | null | undefined;
};

function isPoolHeadOrManager(user: User | null | undefined): boolean {
  return user?.isPoolHead === true || user?.role === "manager";
}

/** Parent company / tenant approver — not acting as pool or department head. */
function isParentCompanyAdminTier(input: ResolveApprovalInboxAccessInput): boolean {
  const { isPlatformAdmin, user, hasOperational: h, isDepartmentHead } = input;
  if (isPlatformAdmin) return true;
  if (isPoolHeadOrManager(user) || isDepartmentHead) return false;

  const hasTenantLeave = h(HRMS.LEAVE_APPROVE_TENANT);
  const hasCompanyOps = hasAnyOperational(h, [OP.company.view, OP.company.manage, OP.company.list]);
  const isParentCompanyAdmin =
    Boolean(user?.parentCompanyId?.trim()) &&
    (user?.role === "admin" || user?.role === "hr-admin" || hasCompanyOps);

  return hasTenantLeave || isParentCompanyAdmin;
}

function canViewApprovalInbox(input: ResolveApprovalInboxAccessInput): boolean {
  const { hasOperational: h, user, isDepartmentHead } = input;

  if (isPoolHeadOrManager(user) || isDepartmentHead) return true;

  return hasAnyOperational(h, [
    HRMS.LEAVE_APPROVE_POOL,
    HRMS.LEAVE_APPROVE_DEPT,
    HRMS.LEAVE_APPROVE_TENANT,
    HRMS.LEAVE_APPROVE,
    HRMS.LEAVE_VIEW,
  ]);
}

/** One queue tab per login — highest applicable tier wins. */
export function resolveApprovalInboxAccess(input: ResolveApprovalInboxAccessInput): ApprovalInboxAccess {
  const denied: ApprovalInboxAccess = {
    queue: null,
    canUsePoolQueue: false,
    canUseDepartmentQueue: false,
    canUseTenantQueue: false,
  };

  if (!canViewApprovalInbox(input)) return denied;

  const { hasOperational: h, isDepartmentHead } = input;

  if (isParentCompanyAdminTier(input)) {
    return {
      queue: "tenant",
      canUsePoolQueue: false,
      canUseDepartmentQueue: false,
      canUseTenantQueue: true,
    };
  }

  // Pool head / manager outranks department-head tier (managers often carry dept permissions too).
  if (isPoolHeadOrManager(input.user) || h(HRMS.LEAVE_APPROVE_POOL)) {
    return {
      queue: "pool",
      canUsePoolQueue: true,
      canUseDepartmentQueue: false,
      canUseTenantQueue: false,
    };
  }

  if (isDepartmentHead || h(HRMS.LEAVE_APPROVE_DEPT)) {
    return {
      queue: "department",
      canUsePoolQueue: false,
      canUseDepartmentQueue: true,
      canUseTenantQueue: false,
    };
  }

  if (h(HRMS.LEAVE_APPROVE)) {
    return {
      queue: "pool",
      canUsePoolQueue: true,
      canUseDepartmentQueue: false,
      canUseTenantQueue: false,
    };
  }

  return denied;
}
