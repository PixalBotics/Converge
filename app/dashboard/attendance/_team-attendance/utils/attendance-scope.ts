import type { User } from "@/lib/auth/types";
import { HRMS, hasAnyOperational } from "@/lib/permissions";
import { OP } from "@/lib/permissions/operational-keys";

export type TeamAttendanceScope = "team_members" | "pool_heads" | "department_heads";

export type TeamAttendanceAccess = {
  scope: TeamAttendanceScope | null;
  canUseTeamMembers: boolean;
  canUsePoolHeads: boolean;
  canUseDepartmentHeads: boolean;
};

type ResolveTeamAttendanceAccessInput = {
  hasAttendanceView: boolean;
  isPlatformAdmin: boolean;
  isDepartmentHead: boolean;
  user: User | null | undefined;
  hasOperational: (code: string) => boolean;
};

/** Parent-company / tenant overseer (not a pool or department head). */
function isCompanyAdminTier(input: ResolveTeamAttendanceAccessInput): boolean {
  const { isPlatformAdmin, isDepartmentHead, user, hasOperational: h } = input;
  if (isPlatformAdmin) return true;
  if (user?.isPoolHead || isDepartmentHead) return false;

  const hasCompanyOps = hasAnyOperational(h, [
    OP.company.view,
    OP.company.manage,
    OP.company.list,
  ]);
  const isParentCompanyAdmin =
    Boolean(user?.parentCompanyId?.trim()) &&
    (user?.role === "admin" || user?.role === "hr-admin" || hasCompanyOps);

  return isParentCompanyAdmin;
}

/**
 * Match backend attendance visibility:
 * - pool head / manager → GET /hrms/pool-heads/attendance (pool members)
 * - department head → GET /hrms/department-heads/attendance (pool heads in dept)
 * - company admin → department heads roster via scoped user attendance
 */
export function resolveTeamAttendanceAccess(
  input: ResolveTeamAttendanceAccessInput,
): TeamAttendanceAccess {
  const denied: TeamAttendanceAccess = {
    scope: null,
    canUseTeamMembers: false,
    canUsePoolHeads: false,
    canUseDepartmentHeads: false,
  };

  if (!input.hasAttendanceView) return denied;

  const { isDepartmentHead, user } = input;

  if (isCompanyAdminTier(input)) {
    return {
      scope: "department_heads",
      canUseTeamMembers: false,
      canUsePoolHeads: false,
      canUseDepartmentHeads: true,
    };
  }

  // Pool head / manager outranks department-head tier (managers often carry dept permissions too).
  if (user?.isPoolHead === true || user?.role === "manager") {
    return {
      scope: "team_members",
      canUseTeamMembers: true,
      canUsePoolHeads: false,
      canUseDepartmentHeads: false,
    };
  }

  if (isDepartmentHead) {
    return {
      scope: "pool_heads",
      canUseTeamMembers: false,
      canUsePoolHeads: true,
      canUseDepartmentHeads: false,
    };
  }

  return {
    scope: "team_members",
    canUseTeamMembers: true,
    canUsePoolHeads: false,
    canUseDepartmentHeads: false,
  };
}
