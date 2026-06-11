import { asRecord, pickArray } from "../user-page/utils";

export type DepartmentRow = {
  id: string;
  name: string;
  type: "Internal" | "External";
  /** Present when API returns flat or nested reseller (External departments). */
  resellerId?: string;
  /** Present when API returns flat or nested parent company (External departments). */
  parentCompanyId?: string;
};

function toDepartmentRow(item: unknown): DepartmentRow | null {
  const r = asRecord(item);
  if (!r) return null;
  const id = String(r.id ?? "").trim();
  if (!id) return null;
  const name = String(r.name ?? "").trim() || "—";
  const typeRaw = String(r.type ?? "Internal");
  const type: "Internal" | "External" = typeRaw === "External" ? "External" : "Internal";

  const resellerObj = asRecord(r.reseller);
  const parentObj = asRecord(r.parentCompany);
  const resellerIdRaw =
    r.resellerId ?? r.reseller_id ?? resellerObj?.id;
  const parentCompanyIdRaw =
    r.parentCompanyId
    ?? r.parent_company_id
    ?? parentObj?.id
    ?? r.companyId
    ?? r.company_id;
  const resellerId =
    resellerIdRaw != null && String(resellerIdRaw).trim().length > 0
      ? String(resellerIdRaw).trim()
      : undefined;
  const parentCompanyId =
    parentCompanyIdRaw != null && String(parentCompanyIdRaw).trim().length > 0
      ? String(parentCompanyIdRaw).trim()
      : undefined;

  return {
    id,
    name,
    type,
    ...(resellerId ? { resellerId } : {}),
    ...(parentCompanyId ? { parentCompanyId } : {}),
  };
}

/**
 * Normalizes `GET /hrms/departments/:id` (and similar) envelopes to {@link DepartmentRow}.
 */
export function extractDepartmentFromDetailApi(payload: unknown): DepartmentRow | null {
  const root = asRecord(payload);
  if (!root) return null;
  const data = asRecord(root.data);
  const fromNested =
    toDepartmentRow(asRecord(data?.department))
    ?? toDepartmentRow(asRecord(data?.item))
    ?? toDepartmentRow(data)
    ?? toDepartmentRow(asRecord(root.department))
    ?? toDepartmentRow(asRecord(root.item))
    ?? toDepartmentRow(root);
  return fromNested;
}

export function extractDepartmentsRows(payload: unknown): DepartmentRow[] {
  const list = pickArray(payload, ["items", "rows", "results", "departments"]);
  return list.map(toDepartmentRow).filter((row): row is DepartmentRow => row !== null);
}

export function extractDepartmentsTotal(payload: unknown): number {
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

export function extractDepartmentsTotalPages(payload: unknown): number {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const n = Number(source?.totalPages);
  if (Number.isFinite(n) && n > 0) return n;
  return 1;
}

/** Page size the API applied (echoed in `data.limit`) — use for “Showing X to Y” math. */
export function extractDepartmentsLimit(payload: unknown): number | undefined {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const n = Number(source?.limit);
  if (Number.isFinite(n) && n > 0) return n;
  return undefined;
}
