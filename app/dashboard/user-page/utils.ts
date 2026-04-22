import type { UnknownRecord, UserRow, UserSuggestion } from "./types";
import { unwrapApiData } from "@/lib/utils/api-payload";

export function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

export function pickArray(payload: unknown, candidates: string[]): unknown[] {
  const root = asRecord(payload);
  if (!root) return [];
  for (const key of candidates) {
    const direct = root[key];
    if (Array.isArray(direct)) return direct;
  }
  const data = asRecord(root.data);
  if (!data) return [];
  for (const key of candidates) {
    const nested = data[key];
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

function toUserRow(value: unknown): UserRow | null {
  const row = asRecord(value);
  if (!row) return null;
  const firstName = String(row.firstName ?? "").trim();
  const middleName = String(row.middleName ?? "").trim();
  const lastName = String(row.lastName ?? "").trim();
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ").trim();

  const departmentObj = asRecord(row.department);
  const roleObj = asRecord(row.role);
  const designationObj = asRecord(row.designation);
  const resellerObj = asRecord(row.reseller);
  const parentCompanyObj = asRecord(row.parentCompany);
  const licenseObj = asRecord(row.license);

  const departmentName = String(
    row.departmentName ?? departmentObj?.name ?? designationObj?.departmentName ?? "—",
  ).trim();
  const roleName = String(row.roleName ?? roleObj?.name ?? designationObj?.name ?? "—").trim();
  const resellerName = String(row.companyName ?? resellerObj?.name ?? row.company ?? "-").trim();
  const parentCompanyName = String(parentCompanyObj?.name ?? row.parentCompanyName ?? "-").trim();
  const resellerId = String(row.resellerId ?? resellerObj?.id ?? "").trim();
  const parentCompanyId = String(row.parentCompanyId ?? parentCompanyObj?.id ?? "").trim();
  const id = String(row.id ?? row.userId ?? row.user_id ?? row._id ?? "").trim();
  const licenseKey = String(
    row.licenseKey
      ?? row.tenantLicenseKey
      ?? row.companyLicenseKey
      ?? row.resellerLicenseKey
      ?? licenseObj?.key
      ?? row.license,
  ).trim();

  return {
    id,
    licenseKey: licenseKey || undefined,
    user: fullName || String(row.name ?? row.fullName ?? row.email ?? "—"),
    email: String(row.email ?? "—"),
    type: String(row.userType ?? "External") === "Internal" ? "Internal" : "External",
    department: departmentName || "—",
    role: roleName || "—",
    company: resellerName || parentCompanyName || "-",
    ...(resellerId ? { resellerId } : {}),
    ...(parentCompanyId ? { parentCompanyId } : {}),
  };
}

export function extractUsersRows(payload: unknown): UserRow[] {
  const layer = unwrapApiData(payload);
  if (Array.isArray(layer)) {
    return layer.map(toUserRow).filter((row): row is UserRow => row !== null);
  }
  const list = pickArray(layer, ["items", "rows", "results", "users", "records", "list", "members", "data"]);
  return list.map(toUserRow).filter((row): row is UserRow => row !== null);
}

export function extractUserSuggestions(payload: unknown): UserSuggestion[] {
  const list = pickArray(payload, ["items", "data", "results"]);
  return list
    .map((item) => asRecord(item))
    .filter((item): item is UnknownRecord => !!item)
    .map((item) => ({
      id: String(item.id ?? ""),
      label: String(item.label ?? item.name ?? item.email ?? "").trim(),
    }))
    .filter((item) => item.id && item.label);
}

export function extractUserCounts(payload: unknown): { internalCount: number; externalCount: number } {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const internalRaw = Number(source?.internalCount);
  const externalRaw = Number(source?.externalCount);
  return {
    internalCount: Number.isFinite(internalRaw) ? internalRaw : 0,
    externalCount: Number.isFinite(externalRaw) ? externalRaw : 0,
  };
}

export function extractUsersTotal(payload: unknown): number {
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

export function extractUsersTotalPages(payload: unknown): number {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const n = Number(source?.totalPages);
  if (Number.isFinite(n) && n > 0) return n;
  return 1;
}
