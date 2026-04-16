/** Backend keys for permission buckets (see login /auth/me). */
export const PERMISSION_BUCKET_PAGE = "PAGE";
export const PERMISSION_BUCKET_OPERATIONAL = "OPERATIONAL";

/** Wildcard-style page permission some tenants send with the rest of PAGE perms. */
export const PAGE_ACCESS_ALL = "page:access";

export type PermissionsByType = Record<string, string[]>;

function normalizeBucketKey(rawKey: string): string {
  const key = rawKey.trim().toLowerCase();
  if (key === "page" || key === "pages") return PERMISSION_BUCKET_PAGE;
  if (key === "operational" || key === "operation" || key === "operations") {
    return PERMISSION_BUCKET_OPERATIONAL;
  }
  return rawKey.trim();
}

export function mergePermissionsByType(
  primary: PermissionsByType | undefined,
  secondary: PermissionsByType | undefined,
): PermissionsByType | undefined {
  if (!primary && !secondary) return undefined;
  const out: PermissionsByType = {};
  const keys = new Set([...Object.keys(primary ?? {}), ...Object.keys(secondary ?? {})]);
  for (const k of keys) {
    const merged = [...(primary?.[k] ?? []), ...(secondary?.[k] ?? [])];
    out[k] = [...new Set(merged)];
  }
  return out;
}

export function toPermissionSet(perms: string[] | undefined): Set<string> {
  return new Set((perms ?? []).map((p) => p.trim()).filter(Boolean));
}

/**
 * When the API never sent `permissionsByType`, we skip UI RBAC so existing flows keep working.
 * When the object is present with at least one bucket key, we enforce checks (even if arrays are empty).
 */
export function isRbacActive(permissionsByType: PermissionsByType | undefined): boolean {
  return permissionsByType != null && Object.keys(permissionsByType).length > 0;
}

function normalizePermissionsRaw(raw: unknown): PermissionsByType | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: PermissionsByType = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(v)) continue;
    const normalizedKey = normalizeBucketKey(k);
    const normalizedValues = v.filter((x): x is string => typeof x === "string").map((s) => s.trim());
    out[normalizedKey] = [...(out[normalizedKey] ?? []), ...normalizedValues];
  }
  for (const key of Object.keys(out)) {
    out[key] = [...new Set(out[key])];
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Supports flat or `{ data: { permissionsByType } }` envelopes from `/auth/me` or login. */
export function extractPermissionsByType(payload: unknown): PermissionsByType | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const root = payload as Record<string, unknown>;
  const direct = normalizePermissionsRaw(root.permissionsByType);
  if (direct) return direct;
  const fromPermissions = normalizePermissionsRaw(root.permissions);
  if (fromPermissions) return fromPermissions;
  const data = root.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const dataRecord = data as Record<string, unknown>;
    const fromDataPermissionsByType = normalizePermissionsRaw(dataRecord.permissionsByType);
    if (fromDataPermissionsByType) return fromDataPermissionsByType;
    return normalizePermissionsRaw(dataRecord.permissions);
  }
  return undefined;
}

export function hasPagePermission(pagePerms: Set<string>, required: string): boolean {
  if (pagePerms.has(PAGE_ACCESS_ALL)) return true;
  return pagePerms.has(required);
}

export function hasOperationalPermission(opPerms: Set<string>, required: string): boolean {
  return opPerms.has(required);
}
