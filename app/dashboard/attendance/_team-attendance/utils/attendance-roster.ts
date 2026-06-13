import { isRecord, pickStr, unwrapApiData } from "@/lib/utils/core";

export function extractListItems(data: unknown): Record<string, unknown>[] {
  const payload = unwrapApiData(data);
  if (!payload) return [];
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];
  const items = payload["items"];
  return Array.isArray(items) ? items.filter(isRecord) : [];
}

/** User ids from pool-head or department-head assignment list rows. */
export function extractHeadUserIds(data: unknown): string[] {
  const ids = new Set<string>();
  for (const row of extractListItems(data)) {
    const user = isRecord(row["user"]) ? (row["user"] as Record<string, unknown>) : row;
    const userId = pickStr(user, ["id", "userId"]) || pickStr(row, ["userId"]);
    if (userId) ids.add(userId);
  }
  return [...ids];
}

export function attendanceRowUserId(row: Record<string, unknown>): string {
  const user = isRecord(row["user"]) ? (row["user"] as Record<string, unknown>) : row;
  return pickStr(user, ["id", "userId"]) || pickStr(row, ["userId"]);
}

export function filterAttendanceItemsByUserIds(
  items: Record<string, unknown>[],
  userIds: readonly string[],
): Record<string, unknown>[] {
  if (userIds.length === 0) return items;
  const allowed = new Set(userIds);
  return items.filter((row) => allowed.has(attendanceRowUserId(row)));
}

export function paginateItems<T>(items: readonly T[], page: number, limit: number): T[] {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

export function userIsListedHead(data: unknown, userId: string | undefined): boolean {
  const id = userId?.trim();
  if (!id) return false;
  return extractHeadUserIds(data).includes(id);
}

/** Department id from a department-head assignment row matching the logged-in user. */
export function findListedHeadDepartmentId(data: unknown, userId: string | undefined): string | undefined {
  const id = userId?.trim();
  if (!id) return undefined;
  for (const row of extractListItems(data)) {
    const user = isRecord(row["user"]) ? (row["user"] as Record<string, unknown>) : row;
    const rowUserId = pickStr(user, ["id", "userId"]) || pickStr(row, ["userId"]);
    if (rowUserId !== id) continue;
    const dept = isRecord(row["department"]) ? (row["department"] as Record<string, unknown>) : null;
    const departmentId = pickStr(dept, ["id"]) || pickStr(row, ["departmentId"]);
    if (departmentId) return departmentId;
  }
  return undefined;
}

/** Department name from a department-head assignment row matching the logged-in user. */
export function findListedHeadDepartmentName(data: unknown, userId: string | undefined): string | undefined {
  const id = userId?.trim();
  if (!id) return undefined;
  for (const row of extractListItems(data)) {
    const user = isRecord(row["user"]) ? (row["user"] as Record<string, unknown>) : row;
    const rowUserId = pickStr(user, ["id", "userId"]) || pickStr(row, ["userId"]);
    if (rowUserId !== id) continue;
    const dept = isRecord(row["department"]) ? (row["department"] as Record<string, unknown>) : null;
    return pickStr(dept, ["name"]) || pickStr(row, ["departmentName"]) || undefined;
  }
  return undefined;
}

export function extractAttendancePayloadDepartmentName(data: unknown): string | undefined {
  const payload = unwrapApiData(data);
  if (!isRecord(payload)) return undefined;
  const dept = isRecord(payload["department"]) ? (payload["department"] as Record<string, unknown>) : null;
  return pickStr(dept, ["name"]) || pickStr(payload, ["departmentName"]) || undefined;
}

export type HeadRosterUserProfile = {
  employeeName: string;
  departmentName: string;
};

/** Map department-/pool-head roster rows to user profiles for attendance enrichment. */
export function buildHeadRosterProfileByUserId(data: unknown): Map<string, HeadRosterUserProfile> {
  const map = new Map<string, HeadRosterUserProfile>();
  for (const row of extractListItems(data)) {
    const user = isRecord(row["user"]) ? (row["user"] as Record<string, unknown>) : row;
    const userId = pickStr(user, ["id", "userId"]) || pickStr(row, ["userId"]);
    if (!userId) continue;
    const dept = isRecord(row["department"]) ? (row["department"] as Record<string, unknown>) : null;
    const firstName = pickStr(user, ["firstName", "first_name"]);
    const lastName = pickStr(user, ["lastName", "last_name"]);
    const joined = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
    const employeeName =
      joined ||
      pickStr(user, ["name", "fullName", "userName", "employeeName"]) ||
      pickStr(row, ["userName"]) ||
      "—";
    const departmentName = pickStr(dept, ["name"]) || pickStr(row, ["departmentName"]) || "—";
    map.set(userId, { employeeName, departmentName });
  }
  return map;
}
