"use client";

import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeRegistry } from "@/components/theme-registry";
import { GlassToastProvider } from "@/components/common";
import { QueryProvider } from "@/lib/hooks";
import { AuthProvider } from "@/lib/auth";
import { AppBoundaryProvider } from "./AppBoundaryProvider";
import { AppRouteSuspense } from "./AppRouteSuspense";
import { DevConsoleFilter } from "./DevConsoleFilter";
import { ReactErrorBoundary } from "./ReactErrorBoundary";

/**
 * Single client boundary for the root tree (MUI cache, theme, toasts, RQ, auth).
 * Keeps `app/layout.tsx` as a thin server entry.
 */
export function AppRootProviders({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <DevConsoleFilter />
      <ThemeRegistry>
        <GlassToastProvider>
          <QueryProvider>
            <AuthProvider>
              <AppBoundaryProvider>
                <ReactErrorBoundary>
                  <AppRouteSuspense>{children}</AppRouteSuspense>
                </ReactErrorBoundary>
              </AppBoundaryProvider>
            </AuthProvider>
          </QueryProvider>
        </GlassToastProvider>
      </ThemeRegistry>
    </AppRouterCacheProvider>
  );
}
