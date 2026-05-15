"use client";

import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { useAuth } from "@/lib/auth";
import { userSatisfiesOperationalViewForDashboardPath } from "@/lib/permissions";

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

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 640 }}>
      <Alert severity="warning" variant="outlined">
        You do not have view permission for this area. Ask an administrator to assign the right operational
        permission for this screen.
      </Alert>
    </Box>
  );
}
