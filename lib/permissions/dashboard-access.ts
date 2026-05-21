import {
  hasPagePermission,
  isRbacActive,
  PAGE_PERMISSION_DASHBOARD,
  PERMISSION_BUCKET_PAGE,
  toPermissionSet,
  type PermissionsByType,
} from "@/lib/auth/permissions-model";
import type { DashboardNavItem, DashboardNavSection } from "./dashboard-nav.types";
import {
  getFirstDashboardPathSegment,
  PAGE_PERMISSION_ORDER,
  requiredPagePermissionFromDashboardSegment,
  ROUTE_RULES,
} from "./dashboard-route-table";
import { ALWAYS_VISIBLE_NAV_ITEMS, DASHBOARD_NAV_ITEMS } from "./dashboard-nav-tree";

export function isNavPathSelected(pathname: string, href: string, prefixMatch?: boolean): boolean {
  if (prefixMatch) return pathname === href || pathname.startsWith(`${href}/`);
  return pathname === href;
}

export function getVisibleDashboardNavItems(opts: {
  section: DashboardNavSection;
  rbacEnabled: boolean;
  pagePermissionSet: Set<string>;
  operationalPermissionSet?: Set<string>;
  isDemoUser: boolean;
  /** When true with RBAC on, show the full module tree (same as RBAC off) — aligned with `useAuth().hasPage` bypass. */
  isPlatformAdmin?: boolean;
}): DashboardNavItem[] {
  const rbacFiltersNav = opts.rbacEnabled && !opts.isPlatformAdmin;
  const permissionDriven = rbacFiltersNav
    ? DASHBOARD_NAV_ITEMS.filter((item) => {
        if (item.children?.length) {
          const any = item.permissionsAny;
          if (any?.length) {
            return any.some((p) => hasPagePermission(opts.pagePermissionSet, p));
          }
          return true;
        }
        if (!item.permission) return true;
        return hasPagePermission(opts.pagePermissionSet, item.permission);
      })
    : DASHBOARD_NAV_ITEMS;

  const withFilteredChildren = permissionDriven.map((item) => {
    if (!item.children?.length) return item;
    const children = item.children.filter((ch) => {
      if (!rbacFiltersNav) return true;
      if (ch.operationalAny?.length) {
        const ops = opts.operationalPermissionSet;
        if (!ops?.size) return false;
        return ch.operationalAny.some((p) => ops.has(p));
      }
      if (!ch.permission) return true;
      return hasPagePermission(opts.pagePermissionSet, ch.permission);
    });
    return { ...item, children };
  });

  const withAlwaysVisible = [
    ...withFilteredChildren,
    ...ALWAYS_VISIBLE_NAV_ITEMS.filter((item) => item.section === opts.section),
  ];

  const dedupedByHref = Array.from(new Map(withAlwaysVisible.map((item) => [item.href, item])).values());

  return dedupedByHref.filter((item) => {
    if (item.section !== opts.section) return false;
    if (item.demoOnly && !opts.isDemoUser) return false;
    if (item.children?.length === 0) return false;
    return true;
  });
}

/** Depth-first sidebar order: parent-only hrefs (e.g. group rows) are skipped when they have children. */
function collectNavLeafHrefsInOrder(items: DashboardNavItem[]): string[] {
  const out: string[] = [];
  for (const item of items) {
    if (item.children?.length) {
      out.push(...collectNavLeafHrefsInOrder(item.children));
    } else if (item.href?.trim()) {
      out.push(item.href);
    }
  }
  return out;
}

const PAGE_PERMISSION_ORDER_INDEX: ReadonlyMap<string, number> = new Map(
  PAGE_PERMISSION_ORDER.map((p, i) => [p, i]),
);

function sortPagePermissionsByNavOrder(perms: readonly string[]): string[] {
  return [...perms].sort(
    (a, b) =>
      (PAGE_PERMISSION_ORDER_INDEX.get(a) ?? Number.POSITIVE_INFINITY) -
      (PAGE_PERMISSION_ORDER_INDEX.get(b) ?? Number.POSITIVE_INFINITY),
  );
}

/**
 * Backend `page:*` keys that grant access to this pathname (OR semantics when multiple).
 * `null` means no page gate (always allowed under RBAC).
 */
export function getDashboardPathPageRequirements(pathname: string): readonly string[] | null {
  if (!pathname.startsWith("/dashboard")) return null;

  const publicRule = ALWAYS_VISIBLE_NAV_ITEMS.find((item) =>
    isNavPathSelected(pathname, item.href, item.prefixMatch),
  );
  if (publicRule) {
    return null;
  }

  const matches = ROUTE_RULES.filter((rule) => isNavPathSelected(pathname, rule.href, rule.prefixMatch));
  if (matches.length > 0) {
    const maxLen = Math.max(...matches.map((m) => m.href.length));
    const atMax = matches.filter((m) => m.href.length === maxLen);
    return sortPagePermissionsByNavOrder([...new Set(atMax.map((m) => m.permission))]);
  }
  const segment = getFirstDashboardPathSegment(pathname);
  if (!segment) {
    return [PAGE_PERMISSION_DASHBOARD];
  }
  return [requiredPagePermissionFromDashboardSegment(segment)];
}

/**
 * Primary `page:*` for this path (for logging / legacy callers). When several permissions
 * suffice (e.g. `/dashboard/companies`), returns the earliest in sidebar priority order.
 */
export function getRequiredPagePermission(pathname: string): string | null {
  const reqs = getDashboardPathPageRequirements(pathname);
  if (!reqs?.length) return null;
  return reqs[0] ?? null;
}

export function canAccessDashboardPath(opts: {
  pathname: string;
  rbacEnabled: boolean;
  pagePermissionSet: Set<string>;
  /** Matches `useAuth().hasPage` — full dashboard routes without enumerating `page:*` in the token. */
  isPlatformAdmin?: boolean;
}): boolean {
  if (!opts.rbacEnabled) return true;
  if (opts.isPlatformAdmin) return true;
  const reqs = getDashboardPathPageRequirements(opts.pathname);
  if (!reqs?.length) return true;
  return reqs.some((r) => hasPagePermission(opts.pagePermissionSet, r));
}

const DASHBOARD_ROOT_PATH = "/dashboard";

function deprioritizeDashboardShell(hrefs: readonly string[]): string[] {
  const rest: string[] = [];
  const shell: string[] = [];
  const seen = new Set<string>();
  for (const href of hrefs) {
    const key = href.split("?")[0]?.replace(/\/+$/, "") || DASHBOARD_ROOT_PATH;
    if (seen.has(key)) continue;
    seen.add(key);
    if (key === DASHBOARD_ROOT_PATH) shell.push(href);
    else rest.push(href);
  }
  return [...rest, ...shell];
}

/** Preferred redirect target when current path is blocked or after sign-in. */
export function getFirstAccessibleDashboardPath(opts: {
  rbacEnabled: boolean;
  pagePermissionSet: Set<string>;
  isDemoUser: boolean;
  isPlatformAdmin?: boolean;
}): string | null {
  const visible = getVisibleDashboardNavItems({
    section: "activity",
    rbacEnabled: opts.rbacEnabled,
    pagePermissionSet: opts.pagePermissionSet,
    isDemoUser: opts.isDemoUser,
    isPlatformAdmin: opts.isPlatformAdmin,
  });
  const candidates = deprioritizeDashboardShell(collectNavLeafHrefsInOrder(visible));
  for (const href of candidates) {
    if (
      canAccessDashboardPath({
        pathname: href,
        rbacEnabled: opts.rbacEnabled,
        pagePermissionSet: opts.pagePermissionSet,
        isPlatformAdmin: opts.isPlatformAdmin,
      })
    ) {
      return href;
    }
  }
  return null;
}

export function resolvePostAuthDashboardHref(opts: {
  rbacEnabled: boolean;
  permissionsSyncing: boolean;
  pagePermissionSet: Set<string>;
  isPlatformAdmin: boolean;
  isDemoUser: boolean;
}): string {
  if (!opts.rbacEnabled || opts.permissionsSyncing) return DASHBOARD_ROOT_PATH;
  return (
    getFirstAccessibleDashboardPath({
      rbacEnabled: true,
      pagePermissionSet: opts.pagePermissionSet,
      isDemoUser: opts.isDemoUser,
      isPlatformAdmin: opts.isPlatformAdmin,
    }) ?? DASHBOARD_ROOT_PATH
  );
}

export function resolveDashboardLandingHref(opts: {
  permissionsByType: PermissionsByType | undefined;
  isPlatformAdmin: boolean;
  isDemoUser: boolean;
}): string {
  const rbacEnabled = isRbacActive(opts.permissionsByType);
  const pagePermissionSet = toPermissionSet(opts.permissionsByType?.[PERMISSION_BUCKET_PAGE]);
  return resolvePostAuthDashboardHref({
    rbacEnabled,
    permissionsSyncing: false,
    pagePermissionSet,
    isPlatformAdmin: opts.isPlatformAdmin,
    isDemoUser: opts.isDemoUser,
  });
}

/** Backward-compatible helper name used by older auth exports. */
export function getAccessibleDashboardHref(
  pagePermissionSet: Set<string>,
  opts?: { isPlatformAdmin?: boolean },
): string | null {
  return getFirstAccessibleDashboardPath({
    rbacEnabled: true,
    pagePermissionSet,
    isDemoUser: false,
    isPlatformAdmin: opts?.isPlatformAdmin,
  });
}

export { DASHBOARD_NAV_ITEMS } from "./dashboard-nav-tree";
