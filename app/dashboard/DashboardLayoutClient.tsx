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
import { DashboardSidebar, DashboardHeader, OperationalViewGate, ImpersonationBanner } from "@/components/layout/dashboard";
import { AgentDashboardProviders } from "@/components/notifications/AgentDashboardProviders";
import {
  dashboardChatWorkstationMainSx,
  dashboardMainGlassSx,
  dashboardMainTextSx,
} from "./dashboard.styles";
import { isDashboardChatWorkstationPath } from "@/features/chat-shared/utils/chat-workstation-path";
import { isDashboardAiTrainingStudioPath } from "@/features/ai-training/ai-training-studio-path";
import { useAgentInboxFocusMode } from "@/lib/hooks/chat/useAgentInboxFocusMode";
import { mainBackgroundGradient } from "@/theme/theme";

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
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        boxSizing: "border-box",
        bgcolor: "transparent",
        background: (theme) =>
          (theme as { appBackground?: string }).appBackground ?? mainBackgroundGradient,
        p: agentInboxFocusMode ? 0 : { xs: 0, md: 2 },
        gap: agentInboxFocusMode ? 0 : { xs: 0, md: 2 },
        height: immersiveLayoutLocked ? "100vh" : undefined,
        maxHeight: immersiveLayoutLocked ? "100vh" : undefined,
        overflow: immersiveLayoutLocked ? "hidden" : undefined,
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
          overflow: immersiveLayoutLocked ? "hidden" : undefined,
        }}
      >
        {!agentInboxFocusMode ? (
          <Box sx={{ flexShrink: 0 }}>
            <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
            <ImpersonationBanner />
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
                    overflow: "auto",
                    boxSizing: "border-box",
                  },
              agentInboxFocusMode ? { mt: 0, height: "100%" } : { mt: aiTrainingStudio ? 0 : "10px" },
              dashboardMainTextSx,
              agentInboxFocusMode ? {} : dashboardMainGlassSx,
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
                : undefined
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
