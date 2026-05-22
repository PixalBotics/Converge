import { extractUsersRows } from "@/app/dashboard/user-page/utils";
import { unwrapApiData } from "@/lib/utils/core";

export type RosterUserOption = {
  id: string;
  label: string;
  disabled: boolean;
  disabledReason?: string;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function isDeptHeadOfDepartment(row: Record<string, unknown>, departmentId: string): boolean {
  const list = row.departmentHeadOf;
  if (!Array.isArray(list)) return Boolean(row.isDepartmentHead);
  return list.some((item) => {
    const r = asRecord(item);
    return r && String(r.departmentId ?? "") === departmentId;
  });
}

function isPoolHeadInDepartment(row: Record<string, unknown>, departmentId: string): boolean {
  if (!Boolean(row.isPoolHead)) return false;
  const userDept = String(
    row.departmentId ?? asRecord(row.department)?.id ?? "",
  ).trim();
  const poolDept = String(
    row.poolDepartmentId ?? asRecord(row.pool)?.departmentId ?? "",
  ).trim();
  if (userDept === departmentId || poolDept === departmentId) return true;
  const list = row.poolHeadOf;
  if (!Array.isArray(list) || list.length === 0) return false;
  return userDept === departmentId;
}

function rosterBlocked(
  row: Record<string, unknown>,
  departmentId: string,
): { blocked: boolean; reason?: string } {
  const deptHeadHere = isDeptHeadOfDepartment(row, departmentId);
  const poolHeadHere = isPoolHeadInDepartment(row, departmentId);
  if (deptHeadHere && !poolHeadHere) {
    return {
      blocked: true,
      reason: "Department heads cannot take website chat roster slots",
    };
  }
  return { blocked: false };
}

export function buildRosterUserOptions(
  payload: unknown,
  departmentId: string,
): RosterUserOption[] {
  const layer = unwrapApiData(payload);
  const list = Array.isArray(layer)
    ? layer
    : Array.isArray(asRecord(layer)?.items)
      ? (asRecord(layer)!.items as unknown[])
      : [];

  const fromList = list
    .map((item) => {
      const raw = asRecord(item);
      if (!raw) return null;
      const id = String(raw.id ?? "").trim();
      if (!id) return null;
      const name = [raw.firstName, raw.lastName].filter(Boolean).join(" ").trim() || String(raw.email ?? "User");
      const email = String(raw.email ?? "").trim();
      const dept = String(
        raw.departmentName ?? asRecord(raw.department)?.name ?? "",
      ).trim();
      const pool = String(raw.poolName ?? asRecord(raw.pool)?.name ?? "").trim();
      const parts = [name];
      if (email) parts.push(email);
      if (dept) parts.push(dept);
      if (pool) parts.push(`Pool: ${pool}`);
      const { blocked, reason } = rosterBlocked(raw, departmentId);
      return {
        id,
        label: parts.join(" · "),
        disabled: blocked,
        disabledReason: reason,
      };
    })
    .filter((o): o is RosterUserOption => o !== null);

  if (fromList.length > 0) return fromList;

  return extractUsersRows(payload).map((row) => {
    const { blocked, reason } = rosterBlocked(row as Record<string, unknown>, departmentId);
    const pool = String((row as Record<string, unknown>).poolName ?? "").trim();
    const parts = [row.user];
    if (row.email && row.email !== "—") parts.push(row.email);
    if (row.department && row.department !== "—") parts.push(row.department);
    if (pool) parts.push(`Pool: ${pool}`);
    return {
      id: row.id,
      label: parts.join(" · "),
      disabled: blocked,
      disabledReason: reason,
    };
  });
}
