import { asRecord, pickArray } from "../user-page/utils";

export type DepartmentRow = {
  id: string;
  name: string;
  type: "Internal" | "External";
};

function toDepartmentRow(item: unknown): DepartmentRow | null {
  const r = asRecord(item);
  if (!r) return null;
  const id = String(r.id ?? "").trim();
  if (!id) return null;
  const name = String(r.name ?? "").trim() || "—";
  const typeRaw = String(r.type ?? "Internal");
  const type: "Internal" | "External" = typeRaw === "External" ? "External" : "Internal";

  return {
    id,
    name,
    type,
  };
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
