"use client";

import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeRegistry } from "@/components/theme-registry";
import { GlassToastProvider } from "@/components/common";
import { QueryProvider } from "@/lib/hooks";
import { AuthProvider } from "@/lib/auth";

/**
 * Single client boundary for the root tree (MUI cache, theme, toasts, RQ, auth).
 * Keeps `app/layout.tsx` as a thin server entry.
 */
export function AppRootProviders({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeRegistry>
        <GlassToastProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </GlassToastProvider>
      </ThemeRegistry>
    </AppRouterCacheProvider>
  );
}
