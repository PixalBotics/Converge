import { unwrapApiData } from "@/lib/utils/core";

export interface CatalogOption {
  id: string;
  label: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pickArray(payload: unknown): Record<string, unknown>[] {
  const data = unwrapApiData(payload);
  if (Array.isArray(data)) return data.filter(isRecord);
  if (!isRecord(data)) return [];
  for (const key of ["items", "data", "rows", "results", "departments", "pools"]) {
    const arr = data[key];
    if (Array.isArray(arr)) return arr.filter(isRecord);
  }
  return [];
}

export function parseDepartmentOptions(payload: unknown): CatalogOption[] {
  return pickArray(payload)
    .map((row) => {
      const id = String(row.id ?? "").trim();
      const name = String(row.name ?? row.departmentName ?? "").trim();
      if (!id) return null;
      return { id, label: name || id };
    })
    .filter((x): x is CatalogOption => Boolean(x));
}

export function parsePoolOptions(payload: unknown): CatalogOption[] {
  return pickArray(payload)
    .map((row) => {
      const id = String(row.id ?? "").trim();
      const name = String(row.name ?? row.poolName ?? "").trim();
      if (!id) return null;
      return { id, label: name || id };
    })
    .filter((x): x is CatalogOption => Boolean(x));
}
