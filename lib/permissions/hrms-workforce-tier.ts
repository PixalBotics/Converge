import type { User } from "@/lib/auth/types";
import { hasAnyOperational } from "./access-helpers";
import { HRMS } from "./permission-constants";
import { OP } from "./operational-keys";

/** HRMS hierarchical workforce tier — permissions + `/auth/me` flags only (not JWT role label). */
export type HrmsWorkforceTier = "tenant" | "pool" | "department";

export type HrmsWorkforceTierInput = {
  hasOperational: (code: string) => boolean;
  isPlatformAdmin: boolean;
  user: User | null | undefined;
};

/** Parent company / tenant overseer tier. */
export function hasTenantWorkforceTier(input: HrmsWorkforceTierInput): boolean {
  const { isPlatformAdmin, hasOperational: h } = input;
  if (isPlatformAdmin) return true;
  if (h(HRMS.LEAVE_APPROVE_TENANT)) return true;
  return hasAnyOperational(h, [OP.company.view, OP.company.manage, OP.company.list]);
}

/** Pool head tier (`isPoolHead` flag or pool leave-approve permission). */
export function hasPoolWorkforceTier(input: HrmsWorkforceTierInput): boolean {
  const { user, hasOperational: h } = input;
  if (user?.isPoolHead === true) return true;
  return h(HRMS.LEAVE_APPROVE_POOL);
}

/** Department head tier (`isDepartmentHead` flag or department leave-approve permission). */
export function hasDepartmentWorkforceTier(input: HrmsWorkforceTierInput): boolean {
  const { user, hasOperational: h } = input;
  if (user?.isDepartmentHead === true) return true;
  return h(HRMS.LEAVE_APPROVE_DEPT);
}

/**
 * Resolve active workforce tier — highest wins:
 * tenant (company admin) → pool (pool head) → department (department head).
 */
export function resolveHrmsWorkforceTier(input: HrmsWorkforceTierInput): HrmsWorkforceTier | null {
  if (hasTenantWorkforceTier(input)) return "tenant";
  if (hasPoolWorkforceTier(input)) return "pool";
  if (hasDepartmentWorkforceTier(input)) return "department";
  if (input.hasOperational(HRMS.LEAVE_APPROVE)) return "pool";
  return null;
}

export function canAccessLeaveApprovalInbox(input: HrmsWorkforceTierInput): boolean {
  if (resolveHrmsWorkforceTier(input)) return true;
  return hasAnyOperational(input.hasOperational, [
    HRMS.LEAVE_APPROVE,
    HRMS.LEAVE_APPROVE_POOL,
    HRMS.LEAVE_APPROVE_DEPT,
    HRMS.LEAVE_APPROVE_TENANT,
    HRMS.LEAVE_VIEW,
  ]);
}
