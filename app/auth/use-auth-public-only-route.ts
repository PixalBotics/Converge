"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { APP_PATHS, useAuth } from "@/lib/auth";

/**
 * Public auth routes: if a session already exists, redirect to the app shell.
 *
 * @returns `true` while auth is resolving or while a redirect is in progress — callers should
 *   render a lightweight placeholder (e.g. `AuthInlineLoading`) instead of the form.
 */
export function useAuthPublicOnlyRoute(): boolean {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) router.replace(APP_PATHS.dashboard);
  }, [isAuthenticated, isLoading, router]);

  return isLoading || isAuthenticated;
}
