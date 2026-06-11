"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeRegistry } from "@/components/theme-registry";
import { GlassToastProvider } from "@/components/common";
import { QueryProvider } from "@/lib/hooks";
import { AuthProvider, isEmbedAppPath } from "@/lib/auth";
import { AppBoundaryProvider } from "./AppBoundaryProvider";
import { AppRouteSuspense } from "./AppRouteSuspense";
import { DevConsoleFilter } from "./DevConsoleFilter";
import { ReactErrorBoundary } from "./ReactErrorBoundary";

/**
 * Embed iframe: no dashboard auth, cookies, or session sync — visitor widget JWT only.
 */
function EmbedAppProviders({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui-embed" }}>
      <DevConsoleFilter />
      <ThemeRegistry>
        <GlassToastProvider>
          <ReactErrorBoundary>
            <AppRouteSuspense>{children}</AppRouteSuspense>
          </ReactErrorBoundary>
        </GlassToastProvider>
      </ThemeRegistry>
    </AppRouterCacheProvider>
  );
}

function DashboardAppProviders({ children }: { children: ReactNode }) {
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

/**
 * Root providers: dashboard routes get auth; `/embed/*` is isolated for visitor widget runtime.
 */
export function AppRootProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isEmbedAppPath(pathname ?? "")) {
    return <EmbedAppProviders>{children}</EmbedAppProviders>;
  }
  return <DashboardAppProviders>{children}</DashboardAppProviders>;
}
