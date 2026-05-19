"use client";

import { LoadingScreen } from "@/components/common";

/** Shown while Next.js resolves async dashboard segment (pairs with layout `Suspense`). */
export function DashboardRouteFallback() {
  return <LoadingScreen message="Loading…" embedded />;
}
