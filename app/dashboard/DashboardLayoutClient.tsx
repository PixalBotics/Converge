"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import type { SxProps, Theme } from "@mui/material/styles";
import { LoadingScreen } from "@/components/common";
import { AUTH_PATHS, useAuth } from "@/lib/auth";
import { PERMISSION_BUCKET_PAGE, toPermissionSet } from "@/lib/auth/permissions-model";
import { canAccessDashboardPath, getFirstAccessibleDashboardPath } from "@/lib/permissions";
import { DashboardSidebar, DashboardHeader, OperationalViewGate } from "@/components/dashboard";
import { dashboardMainGlassSx, dashboardMainTextSx } from "./dashboard.styles";
import { mainBackgroundGradient } from "@/theme/theme";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const {
    isAuthenticated,
    isLoading,
    rbacEnabled,
    permissionsByType,
    permissionsSyncing,
    user,
    isPlatformAdmin,
  } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routeAccessBlocked, setRouteAccessBlocked] = useState(false);
  const isDemoUser = user?.email?.trim().toLowerCase() === "demo@gmail.com";

  const pagePermissionSet = useMemo(
    () => toPermissionSet(permissionsByType?.[PERMISSION_BUCKET_PAGE]),
    [permissionsByType],
  );

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.replace(AUTH_PATHS.login);
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !rbacEnabled) {
      setRouteAccessBlocked(false);
      return;
    }
    /** Avoid redirecting with stale/empty page perms while `/auth/me` merge is in flight. */
    if (permissionsSyncing) {
      setRouteAccessBlocked(false);
      return;
    }
    const canAccess = canAccessDashboardPath({
      pathname,
      rbacEnabled,
      pagePermissionSet,
      isPlatformAdmin,
    });
    if (canAccess) {
      setRouteAccessBlocked(false);
      return;
    }
    const fallback = getFirstAccessibleDashboardPath({
      rbacEnabled,
      pagePermissionSet,
      isDemoUser,
      isPlatformAdmin,
    });
    if (fallback && fallback !== pathname) {
      setRouteAccessBlocked(false);
      router.replace(fallback);
      return;
    }
    setRouteAccessBlocked(true);
  }, [
    isLoading,
    isAuthenticated,
    rbacEnabled,
    permissionsSyncing,
    pathname,
    pagePermissionSet,
    isDemoUser,
    isPlatformAdmin,
    router,
  ]);

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen message="Redirecting to login..." />;
  }

  if (routeAccessBlocked) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          background: (theme) =>
            (theme as { appBackground?: string }).appBackground ?? mainBackgroundGradient,
        }}
      >
        <Alert severity="warning" sx={{ maxWidth: 480 }}>
          You do not have access to this area. Ask an administrator to assign the matching page permission.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        boxSizing: "border-box",
        bgcolor: "transparent",
        background: (theme) =>
          (theme as { appBackground?: string }).appBackground ?? mainBackgroundGradient,
        p: { xs: 0, md: 2 },
        gap: { xs: 0, md: 2 },
      }}
    >
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <Box
          component="main"
          sx={
            [
              {
                flex: 1,
                py: { xs: 2, sm: 3 },
                px: { xs: 1.5, sm: 2, md: 0 },
                overflow: "auto",
              },
              dashboardMainTextSx,
              dashboardMainGlassSx,
            ] as SxProps<Theme>
          }
        >
          <OperationalViewGate pathname={pathname}>{children}</OperationalViewGate>
        </Box>
      </Box>
    </Box>
  );
}
