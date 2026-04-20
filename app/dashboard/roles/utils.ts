import { asRecord, pickArray } from "../user-page/utils";

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
  const rawCount =
    (asRecord(r._count) as any)?.users ??
    r.userCount ??
    r.usersCount ??
    r.totalUsers ??
    r.assignedUsers ??
    r.user_count;
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
  const list =
    (Array.isArray((data as any)?.items) ? ((data as any).items as unknown[]) : null) ??
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
  const direct = (root as any)?.data;
  if (Array.isArray(direct)) return direct;
  const nested = asRecord((root as any)?.data);
  if (Array.isArray((nested as any)?.data)) return (nested as any).data;
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
  const groupsRaw =
    (Array.isArray((data as any)?.groups) ? (data as any).groups : null)
    ?? (Array.isArray((root as any)?.groups) ? (root as any).groups : null)
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

  // Group by permissionType if available (OPERATIONAL / PAGE).
  const items = extractCatalogArray(payload);
  const grouped = new Map<string, PermissionOption[]>();
  for (const item of items) {
    const r = asRecord(item);
    const option = toPermissionOption(item);
    if (!option) continue;
    const type = pickString((r as any)?.permissionType) || "Permissions";
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

export function extractRoleAssignedPermissionNames(payload: unknown): string[] {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const candidates: unknown[] = [
    (data as any)?.permissionNames,
    (data as any)?.permissions,
    (data as any)?.assignedPermissionNames,
    (data as any)?.assigned,
    (root as any)?.permissionNames,
    (root as any)?.permissions,
    (root as any)?.assignedPermissionNames,
    (root as any)?.assigned,
  ];
  for (const c of candidates) {
    if (!Array.isArray(c)) continue;
    const out = (c as unknown[])
      .map((v) => pickString((asRecord(v) as any)?.name ?? (asRecord(v) as any)?.code ?? v))
      .filter((s) => s.length > 0);
    if (out.length > 0) return Array.from(new Set(out)).sort();
  }
  return [];
}

export function extractRoleNameFromDetail(payload: unknown): string {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const name = String((source as any)?.name ?? (source as any)?.roleName ?? "").trim();
  return name;
}

