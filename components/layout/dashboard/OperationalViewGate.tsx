"use client";

import { useAuth } from "@/lib/auth";
import { userSatisfiesOperationalViewForDashboardPath } from "@/lib/permissions";
import { PermissionDeniedPanel } from "@/components/common/PermissionDeniedPanel";

type OperationalViewGateProps = {
  pathname: string;
  children: React.ReactNode;
};

/**
 * When RBAC is on, requires at least one operational “view” (or module-specific) permission
 * for the current dashboard path; otherwise shows a single clear message instead of empty tables.
 */
export function OperationalViewGate({ pathname, children }: OperationalViewGateProps) {
  const { rbacEnabled, permissionsSyncing, hasOperational, isPlatformAdmin } = useAuth();

  if (!rbacEnabled || permissionsSyncing || isPlatformAdmin) {
    return children;
  }

  if (userSatisfiesOperationalViewForDashboardPath(hasOperational, pathname)) {
    return children;
  }

  return <PermissionDeniedPanel />;
}
