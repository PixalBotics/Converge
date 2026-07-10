"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { resolveVisitedNavItemHref } from "@/lib/dashboard/dashboard-module-visits";
import { useDashboardActivityNavItems } from "@/lib/hooks/useDashboardActivityNavItems";
import { useDashboardModuleVisits } from "@/lib/hooks/useDashboardModuleVisits";

/** Records top-level module visits while the user navigates the dashboard shell. */
export function DashboardModuleVisitRecorder() {
  const pathname = usePathname();
  const navItems = useDashboardActivityNavItems();
  const { markVisited } = useDashboardModuleVisits();

  const items = useMemo(() => navItems, [navItems]);

  useEffect(() => {
    if (!pathname?.startsWith("/dashboard")) return;
    const href = resolveVisitedNavItemHref(pathname, items);
    if (href) markVisited(href);
  }, [pathname, items, markVisited]);

  return null;
}
