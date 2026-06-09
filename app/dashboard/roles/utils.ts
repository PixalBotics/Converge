import { asRecord, pickArray } from "../user-page/utils";
import { extractRoleExpandedPermissionNames } from "@/lib/permissions/role-permission-payload";

export {
  extractRoleExpandedPermissionNames,
  extractRoleStoredPermissionNames,
  flattenPermissionNamesByType,
} from "@/lib/permissions/role-permission-payload";

export type RoleRow = {
  id: string;
  name: string;
  userCount?: number;
};

function toRoleRow(item: unknown): RoleRow | null {
  const r = asRecord(item);
  if (!r) return null;
  const id = String(r.id ?? "").trim();
  if (!id) return null;
  const name = String(r.name ?? r.roleName ?? "").trim() || "—";
  const countObj = asRecord((r as Record<string, unknown>)._count);
  const rawCount =
    (countObj ? countObj.users : undefined) ??
    (r as Record<string, unknown>).userCount ??
    (r as Record<string, unknown>).usersCount ??
    (r as Record<string, unknown>).totalUsers ??
    (r as Record<string, unknown>).assignedUsers ??
    (r as Record<string, unknown>).user_count;
  const userCount = Number(rawCount);
  return {
    id,
    name,
    ...(Number.isFinite(userCount) ? { userCount } : {}),
  };
}

export function extractRolesRows(payload: unknown): RoleRow[] {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const itemsRaw = data ? (data as Record<string, unknown>).items : undefined;
  const list =
    (Array.isArray(itemsRaw) ? (itemsRaw as unknown[]) : null) ??
    pickArray(payload, ["items", "rows", "results", "roles"]);
  return list.map(toRoleRow).filter((row): row is RoleRow => row !== null);
}

export function extractRolesTotal(payload: unknown): number {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const candidates = [source?.total, source?.count, source?.totalCount, source?.recordsTotal];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export function extractRolesTotalPages(payload: unknown): number {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const n = Number(source?.totalPages);
  if (Number.isFinite(n) && n > 0) return n;
  return 1;
}

export function extractRolesLimit(payload: unknown): number | undefined {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const n = Number(source?.limit);
  if (Number.isFinite(n) && n > 0) return n;
  return undefined;
}

export type PermissionOption = { code: string; label: string };
export type PermissionGroup = { title: string; permissions: PermissionOption[] };

function pickString(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

function extractCatalogArray(payload: unknown): unknown[] {
  const root = asRecord(payload);
  if (!root) return [];
  const direct = (root as Record<string, unknown>).data;
  if (Array.isArray(direct)) return direct;
  const nested = asRecord((root as Record<string, unknown>).data);
  const nestedData = nested ? (nested as Record<string, unknown>).data : undefined;
  if (Array.isArray(nestedData)) return nestedData;
  return pickArray(payload, ["items", "rows", "results", "permissions"]);
}

function toPermissionOption(raw: unknown): PermissionOption | null {
  const r = asRecord(raw);
  if (!r) return null;
  const code = pickString(r.name ?? r.code ?? r.permissionName ?? r.permission ?? r.id);
  if (!code) return null;
  const label =
    pickString(r.description ?? r.label ?? r.title ?? r.displayName ?? r.name) || code;
  return { code, label };
}

export function extractPermissionsCatalogGroups(payload: unknown): PermissionGroup[] {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const dataRec = (data ?? null) as Record<string, unknown> | null;
  const rootRec = (root ?? null) as Record<string, unknown> | null;
  const groupsRaw =
    (Array.isArray(dataRec?.groups) ? dataRec?.groups : null)
    ?? (Array.isArray(rootRec?.groups) ? rootRec?.groups : null)
    ?? null;
  if (groupsRaw) {
    const out: PermissionGroup[] = [];
    for (const g of groupsRaw as unknown[]) {
      const gr = asRecord(g);
      if (!gr) continue;
      const title = pickString(gr.title ?? gr.name ?? gr.type ?? "Permissions");
      const list = Array.isArray(gr.permissions) ? (gr.permissions as unknown[]) : [];
      const permissions = list.map(toPermissionOption).filter((p): p is PermissionOption => p !== null);
      if (permissions.length > 0) out.push({ title, permissions });
    }
    if (out.length > 0) return out;
  }

  // Some backends return grouped output as an object map, e.g.:
  // { data: { PAGE: [...], OPERATIONAL: [...] } } (or lower-case keys).
  // Support that shape as well.
  const groupedObj =
    (asRecord(dataRec?.permissionNamesByType) as Record<string, unknown> | null) ??
    (asRecord(dataRec?.permissionsByType) as Record<string, unknown> | null) ??
    (asRecord(dataRec?.grouped) as Record<string, unknown> | null) ??
    (asRecord(rootRec?.permissionNamesByType) as Record<string, unknown> | null) ??
    (asRecord(rootRec?.permissionsByType) as Record<string, unknown> | null) ??
    (asRecord(rootRec?.grouped) as Record<string, unknown> | null) ??
    (data as Record<string, unknown> | null);
  if (groupedObj && !Array.isArray(groupedObj)) {
    const out: PermissionGroup[] = [];
    for (const [k, v] of Object.entries(groupedObj)) {
      if (!Array.isArray(v)) continue;
      const permissions = (v as unknown[])
        .map(toPermissionOption)
        .filter((p): p is PermissionOption => p !== null)
        .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
      if (permissions.length === 0) continue;
      out.push({ title: pickString(k) || "Permissions", permissions });
    }
    if (out.length > 0) {
      out.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
      return out;
    }
  }

  // Group by permissionType if available (OPERATIONAL / PAGE).
  const items = extractCatalogArray(payload);
  const grouped = new Map<string, PermissionOption[]>();
  for (const item of items) {
    const r = asRecord(item);
    const option = toPermissionOption(item);
    if (!option) continue;
    const type = pickString(r ? (r as Record<string, unknown>).permissionType : undefined) || "Permissions";
    const list = grouped.get(type) ?? [];
    list.push(option);
    grouped.set(type, list);
  }
  const out = Array.from(grouped.entries())
    .map(([title, permissions]) => ({
      title,
      permissions: permissions.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" })),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));

  if (out.length > 0) return out;

  // Final fallback: flat list -> one group
  const flat = extractPermissionsCatalogFlat(payload);
  return flat.length > 0 ? [{ title: "Permissions", permissions: flat }] : [];
}

export function extractPermissionsCatalogFlat(payload: unknown): PermissionOption[] {
  const items = extractCatalogArray(payload);
  const mapped = items.map(toPermissionOption).filter((p): p is PermissionOption => p !== null);
  return mapped.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

/** @deprecated Prefer {@link extractRoleExpandedPermissionNames} for display. */
export function extractRoleAssignedPermissionNames(payload: unknown): string[] {
  return extractRoleExpandedPermissionNames(payload);
}

export function extractRoleNameFromDetail(payload: unknown): string {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const src = (source ?? null) as Record<string, unknown> | null;
  const name = String((src?.name ?? src?.roleName ?? "") as unknown).trim();
  return name;
}

