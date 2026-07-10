"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { LoadingScreen, PermissionDeniedPanel } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { sessionExpiredLoginHref } from "@/lib/auth/session-expired-login";
import { PERMISSION_BUCKET_PAGE, toPermissionSet } from "@/lib/auth/permissions-model";
import { canAccessDashboardPath, getFirstAccessibleDashboardPath } from "@/lib/permissions";
import { DashboardSidebar, DashboardHeader, OperationalViewGate, ImpersonationBanner, SubscriptionCountdownBanner } from "@/components/layout/dashboard";
import { AgentDashboardProviders } from "@/components/notifications/AgentDashboardProviders";
import {
  dashboardChatWorkstationMainSx,
  dashboardMainGlassSx,
  dashboardMainScrollSx,
  dashboardMainTextSx,
} from "./dashboard.styles";
import { isDashboardChatWorkstationPath } from "@/features/chat-shared/utils/chat-workstation-path";
import { isDashboardAiTrainingStudioPath } from "@/features/ai-training/ai-training-studio-path";
import { useAgentInboxFocusMode } from "@/lib/hooks/chat/useAgentInboxFocusMode";
import { mainBackgroundGradient } from "@/theme/theme";
import { DashboardModuleVisitRecorder } from "./components/DashboardModuleVisitRecorder";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const {
    authGate,
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
  const agentInboxFocusMode = useAgentInboxFocusMode();
  const isDemoUser = user?.email?.trim().toLowerCase() === "demo@gmail.com";

  const pagePermissionSet = useMemo(
    () => toPermissionSet(permissionsByType?.[PERMISSION_BUCKET_PAGE]),
    [permissionsByType],
  );

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(sessionExpiredLoginHref());
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (authGate !== "blocked") return;
    router.replace(sessionExpiredLoginHref());
  }, [authGate, router]);

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
      isInternalUser: user?.userType === "Internal",
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
      isInternalUser: user?.userType === "Internal",
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
    user?.userType,
    router,
  ]);

  if (authGate === "loading" || isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (authGate === "blocked") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: (theme) =>
            (theme as { appBackground?: string }).appBackground ?? mainBackgroundGradient,
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return <LoadingScreen message="Redirecting to login..." />;
  }

  const chatWorkstation = isDashboardChatWorkstationPath(pathname);
  const aiTrainingStudio = isDashboardAiTrainingStudioPath(pathname);
  const immersiveWorkstation = chatWorkstation || aiTrainingStudio;
  const immersiveLayoutLocked = immersiveWorkstation || agentInboxFocusMode;

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
        <PermissionDeniedPanel
          title="No page access"
          description="You do not have access to this area. Ask an administrator to assign the matching page permission."
        />
      </Box>
    );
  }

  return (
    <AgentDashboardProviders>
    <DashboardModuleVisitRecorder />
    <Box
      sx={{
        display: "flex",
        boxSizing: "border-box",
        bgcolor: "transparent",
        background: (theme) =>
          (theme as { appBackground?: string }).appBackground ?? mainBackgroundGradient,
        width: "100%",
        maxWidth: "100vw",
        minWidth: 0,
        ...(immersiveLayoutLocked
          ? {
              minHeight: "100vh",
              height: "100vh",
              maxHeight: "100vh",
              overflow: "hidden",
              p: 0,
              gap: 0,
            }
          : {
              minHeight: "100vh",
              height: "100vh",
              maxHeight: "100vh",
              overflow: "hidden",
              p: { xs: 0, md: 2 },
              gap: { xs: 0, md: 2 },
            }),
      }}
    >
      {!agentInboxFocusMode ? (
        <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      ) : null}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {!agentInboxFocusMode ? (
          <Box sx={{ flexShrink: 0, position: "relative", zIndex: 2, isolation: "isolate" }}>
            <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
            <ImpersonationBanner />
            <SubscriptionCountdownBanner />
          </Box>
        ) : null}
        <Box
          component="main"
          sx={
            [
              immersiveWorkstation
                ? dashboardChatWorkstationMainSx
                : {
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    width: "100%",
                    overflow: "auto",
                    overflowX: "hidden",
                    overscrollBehavior: "contain",
                    boxSizing: "border-box",
                    position: "relative",
                    zIndex: 1,
                  },
              agentInboxFocusMode
                ? { mt: 0, height: "100%" }
                : immersiveWorkstation
                  ? null
                  : { pt: { xs: 1.5, md: 2 } },
              dashboardMainTextSx,
              agentInboxFocusMode ? {} : dashboardMainGlassSx,
              agentInboxFocusMode || immersiveWorkstation ? {} : dashboardMainScrollSx,
            ] as SxProps<Theme>
          }
        >
          <Box
            sx={
              immersiveWorkstation
                ? {
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }
                : {
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                  }
            }
          >
            <OperationalViewGate pathname={pathname}>{children}</OperationalViewGate>
          </Box>
        </Box>
      </Box>
    </Box>
    </AgentDashboardProviders>
  );
}
