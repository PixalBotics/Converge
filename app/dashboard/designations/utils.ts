import { asRecord, pickArray } from "../user-page/utils";

export type DesignationRow = {
  id: string;
  designationName: string;
  department: string;
};

function toDesignationRow(item: unknown): DesignationRow | null {
  const r = asRecord(item);
  if (!r) return null;
  const id = String(r.id ?? "").trim();
  if (!id) return null;
  const designationName = String(r.name ?? "").trim() || "—";
  const dept = asRecord(r.department);
  const department = String(dept?.name ?? "").trim() || "—";

  return {
    id,
    designationName,
    department,
  };
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
