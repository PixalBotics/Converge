import type { User } from "@/lib/auth/types";
import { resolveHrmsWorkforceTier } from "@/lib/permissions/hrms-workforce-tier";

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
  user: User | null | undefined;
  hasOperational: (code: string) => boolean;
};

/**
 * Permission + flag based attendance visibility (mirrors backend):
 * - pool head flag / LEAVE_APPROVE_POOL → pool members attendance
 * - department head flag / LEAVE_APPROVE_DEPT → pool heads in department
 * - tenant / company ops → department heads in company
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

  const tier = resolveHrmsWorkforceTier(input);

  if (tier === "tenant") {
    return {
      scope: "department_heads",
      canUseTeamMembers: false,
      canUsePoolHeads: false,
      canUseDepartmentHeads: true,
    };
  }

  if (tier === "pool") {
    return {
      scope: "team_members",
      canUseTeamMembers: true,
      canUsePoolHeads: false,
      canUseDepartmentHeads: false,
    };
  }

  if (tier === "department") {
    return {
      scope: "pool_heads",
      canUseTeamMembers: false,
      canUsePoolHeads: true,
      canUseDepartmentHeads: false,
    };
  }

  return denied;
}
