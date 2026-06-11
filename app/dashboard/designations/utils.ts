import { asRecord, pickArray } from "../user-page/utils";

export type DesignationRow = {
  id: string;
  designationName: string;
  department: string;
  departmentId?: string;
};

function toDesignationRow(item: unknown): DesignationRow | null {
  const r = asRecord(item);
  if (!r) return null;
  const id = String(r.id ?? "").trim();
  if (!id) return null;
  const designationName = String(r.name ?? "").trim() || "—";
  const dept = asRecord(r.department);
  const department = String(dept?.name ?? "").trim() || "—";
  const deptIdRaw = dept?.id ?? r.departmentId ?? r.department_id;
  const departmentId =
    deptIdRaw != null && String(deptIdRaw).trim().length > 0 ? String(deptIdRaw).trim() : undefined;

  return {
    id,
    designationName,
    department,
    ...(departmentId ? { departmentId } : {}),
  };
}

/** Normalize `GET /hrms/designations/:id` (and similar envelopes) to {@link DesignationRow}. */
export function extractDesignationFromDetailApi(payload: unknown): DesignationRow | null {
  const root = asRecord(payload);
  if (!root) return null;
  const data = asRecord(root.data);
  const fromNested =
    toDesignationRow(asRecord(data?.designation))
    ?? toDesignationRow(asRecord(data?.item))
    ?? toDesignationRow(data)
    ?? toDesignationRow(asRecord(root.designation))
    ?? toDesignationRow(asRecord(root.item))
    ?? toDesignationRow(root);
  return fromNested;
}

export function extractDesignationsRows(payload: unknown): DesignationRow[] {
  const list = pickArray(payload, ["items", "rows", "results", "designations"]);
  return list.map(toDesignationRow).filter((row): row is DesignationRow => row !== null);
}

export function extractDesignationsTotal(payload: unknown): number {
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

export function extractDesignationsTotalPages(payload: unknown): number {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const n = Number(source?.totalPages);
  if (Number.isFinite(n) && n > 0) return n;
  return 1;
}

export function extractDesignationsLimit(payload: unknown): number | undefined {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const source = data ?? root;
  const n = Number(source?.limit);
  if (Number.isFinite(n) && n > 0) return n;
  return undefined;
}
