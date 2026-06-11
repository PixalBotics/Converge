"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { resolveDashboardLandingHref } from "@/lib/permissions";

/**
 * Public auth routes: if a session already exists, redirect to the app shell.
 *
 * @returns `true` while auth is resolving or while a redirect is in progress — callers should
 *   render a lightweight placeholder (e.g. `AuthInlineLoading`) instead of the form.
 */
export function useAuthPublicOnlyRoute(): boolean {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading,
    user,
    permissionsByType,
    permissionsSyncing,
    isPlatformAdmin,
  } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;
    if (permissionsSyncing) return;
    const isDemoUser = user?.email?.trim().toLowerCase() === "demo@gmail.com";
    router.replace(
      resolveDashboardLandingHref({
        permissionsByType,
        isPlatformAdmin,
        isDemoUser: Boolean(isDemoUser),
      }),
    );
  }, [
    isAuthenticated,
    isLoading,
    permissionsSyncing,
    permissionsByType,
    isPlatformAdmin,
    user,
    router,
  ]);

  return isLoading || isAuthenticated;
}
