import type { User } from "@/lib/auth/types";
import {
  canAccessLeaveApprovalInbox,
  resolveHrmsWorkforceTier,
} from "@/lib/permissions/hrms-workforce-tier";

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
  user: User | null | undefined;
};

/** One queue tab per login — highest applicable tier wins (permissions + flags). */
export function resolveApprovalInboxAccess(input: ResolveApprovalInboxAccessInput): ApprovalInboxAccess {
  const denied: ApprovalInboxAccess = {
    queue: null,
    canUsePoolQueue: false,
    canUseDepartmentQueue: false,
    canUseTenantQueue: false,
  };

  if (!canAccessLeaveApprovalInbox(input)) return denied;

  const tier = resolveHrmsWorkforceTier(input);

  if (tier === "tenant") {
    return {
      queue: "tenant",
      canUsePoolQueue: false,
      canUseDepartmentQueue: false,
      canUseTenantQueue: true,
    };
  }

  if (tier === "pool") {
    return {
      queue: "pool",
      canUsePoolQueue: true,
      canUseDepartmentQueue: false,
      canUseTenantQueue: false,
    };
  }

  if (tier === "department") {
    return {
      queue: "department",
      canUsePoolQueue: false,
      canUseDepartmentQueue: true,
      canUseTenantQueue: false,
    };
  }

  return denied;
}
