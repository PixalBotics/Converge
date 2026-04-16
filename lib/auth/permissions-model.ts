/** Backend keys for permission buckets (see login /auth/me). */
export const PERMISSION_BUCKET_PAGE = "PAGE";
export const PERMISSION_BUCKET_OPERATIONAL = "OPERATIONAL";

/** Wildcard-style page permission some tenants send with the rest of PAGE perms. */
export const PAGE_ACCESS_ALL = "page:access";

export type PermissionsByType = Record<string, string[]>;

function normalizeBucketKey(rawKey: string): string {
  const key = rawKey.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (key === "page" || key === "pages" || key === "pagepermissions") return PERMISSION_BUCKET_PAGE;
  if (
    key === "operational" ||
    key === "operation" ||
    key === "operations" ||
    key === "operationalpermissions"
  ) {
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

function readStringArray(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Supports list-style payloads such as:
 * - [{ type: "PAGE", permissions: ["page:users"] }]
 * - [{ key: "PAGE", value: ["page:users"] }]
 */
function normalizePermissionsList(raw: unknown): PermissionsByType | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: PermissionsByType = {};

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const rawKey = record.type ?? record.key ?? record.bucket ?? record.name;
    if (typeof rawKey !== "string" || !rawKey.trim()) continue;
    const normalizedKey = normalizeBucketKey(rawKey);
    const values = readStringArray(
      record.permissions ?? record.values ?? record.value ?? record.items,
    );
    if (values.length === 0) continue;
    out[normalizedKey] = [...(out[normalizedKey] ?? []), ...values];
  }

  for (const key of Object.keys(out)) {
    out[key] = [...new Set(out[key])];
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function extractFromRecord(record: Record<string, unknown>): PermissionsByType | undefined {
  const direct = normalizePermissionsRaw(record.permissionsByType);
  if (direct) return direct;

  const fromPermissionsObject = normalizePermissionsRaw(record.permissions);
  if (fromPermissionsObject) return fromPermissionsObject;

  const fromPermissionsList = normalizePermissionsList(record.permissions);
  if (fromPermissionsList) return fromPermissionsList;

  return undefined;
}

/** Supports flat or `{ data: { permissionsByType } }` envelopes from `/auth/me` or login. */
export function extractPermissionsByType(payload: unknown): PermissionsByType | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const root = payload as Record<string, unknown>;

  const rootPermissions = extractFromRecord(root);
  if (rootPermissions) return rootPermissions;

  const data = root.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const dataRecord = data as Record<string, unknown>;
    const dataPermissions = extractFromRecord(dataRecord);
    if (dataPermissions) return dataPermissions;

    // Some APIs wrap twice: { data: { data: { permissionsByType } } }
    const nestedData = dataRecord.data;
    if (nestedData && typeof nestedData === "object" && !Array.isArray(nestedData)) {
      const nestedPermissions = extractFromRecord(nestedData as Record<string, unknown>);
      if (nestedPermissions) return nestedPermissions;
    }
  }

  // Fallback: permissions attached under user / role objects.
  const user = root.user;
  if (user && typeof user === "object" && !Array.isArray(user)) {
    const userRecord = user as Record<string, unknown>;
    const userPermissions = extractFromRecord(userRecord);
    if (userPermissions) return userPermissions;

    const role = userRecord.role;
    if (role && typeof role === "object" && !Array.isArray(role)) {
      const rolePermissions = extractFromRecord(role as Record<string, unknown>);
      if (rolePermissions) return rolePermissions;
    }
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
