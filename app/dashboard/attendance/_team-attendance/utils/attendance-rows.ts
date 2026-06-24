import { isRecord, pickStr, unwrapApiData } from "@/lib/utils/core";
import {
  formatAttendanceStatus,
  formatBreakSummary,
  formatTimeOnly,
  mapAttendanceEnrichedColumns,
} from "@/lib/utils/hrms/attendance-display";

export type TeamAttendanceTableRow = {
  id: string;
  employeeName: string;
  poolName: string;
  departmentName: string;
  date: string;
  status: string;
  checkIn: string;
  checkOut: string;
  breakSummary: string;
  workedMinutes: string;
  startChat: string;
  chatPause: string;
  login: string;
  logout: string;
  chatMinutes: string;
  meetingMinutes: string;
};

export function extractAttendanceItems(data: unknown): Record<string, unknown>[] {
  const payload = unwrapApiData(data);
  if (!payload) return [];
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];
  const items = payload["items"];
  return Array.isArray(items) ? items.filter(isRecord) : [];
}

export function extractAttendanceTotal(data: unknown, fallback: number): number {
  const payload = unwrapApiData(data);
  if (!isRecord(payload)) return fallback;
  const n = Number(payload["total"]);
  return Number.isFinite(n) ? n : fallback;
}

export function extractAttendanceTotalPages(data: unknown): number {
  const payload = unwrapApiData(data);
  if (!isRecord(payload)) return 1;
  const n = Number(payload["totalPages"]);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function pickNum(row: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

function field(row: Record<string, unknown>, keys: string[]): string {
  return pickStr(row, keys) || "";
}

export function mapAttendanceQueueRow(
  row: Record<string, unknown>,
  idx: number,
  idPrefix: string,
  options?: {
    fallbackDepartmentName?: string;
    rosterProfileByUserId?: Map<string, { employeeName: string; departmentName: string }>;
  },
): TeamAttendanceTableRow {
  const userNested = isRecord(row["user"]) ? (row["user"] as Record<string, unknown>) : null;
  const poolNested = isRecord(row["pool"]) ? (row["pool"] as Record<string, unknown>) : null;
  const userPoolNested =
    userNested && isRecord(userNested["pool"]) ? (userNested["pool"] as Record<string, unknown>) : null;
  const rowDepartmentNested = isRecord(row["department"]) ? (row["department"] as Record<string, unknown>) : null;
  const userDepartmentNested =
    userNested && isRecord(userNested["department"])
      ? (userNested["department"] as Record<string, unknown>)
      : null;
  const departmentNested =
    (poolNested && isRecord(poolNested["department"])
      ? (poolNested["department"] as Record<string, unknown>)
      : null) ??
    (userPoolNested && isRecord(userPoolNested["department"])
      ? (userPoolNested["department"] as Record<string, unknown>)
      : null) ??
    userDepartmentNested ??
    rowDepartmentNested;

  const fromUser = userNested
    ? `${pickStr(userNested, ["firstName"])} ${pickStr(userNested, ["lastName"])}`.trim()
    : "";
  const rowUserId = pickStr(userNested, ["id", "userId"]) || field(row, ["userId"]);
  const rosterProfile = rowUserId ? options?.rosterProfileByUserId?.get(rowUserId) : undefined;
  const employeeName =
    pickStr(userNested ?? row, ["employeeName", "userName", "name"]) ||
    fromUser ||
    rosterProfile?.employeeName ||
    "—";
  const poolName =
    pickStr(poolNested ?? userPoolNested ?? row, ["name", "poolName"]) ||
    field(row, ["poolName"]) ||
    "—";
  const departmentName =
    pickStr(departmentNested, ["name"]) ||
    pickStr(userNested, ["departmentName"]) ||
    field(row, ["departmentName"]) ||
    rosterProfile?.departmentName ||
    options?.fallbackDepartmentName?.trim() ||
    "—";

  const rawStatus = field(row, ["status"]);
  const taken = pickNum(row, ["breakMinutesTaken"]);
  const allowed = pickNum(row, ["breakMinutesAllowed"]);
  const over = pickNum(row, ["overBreakMinutes"]);
  const worked = pickNum(row, ["workedMinutes"]);

  const enriched = mapAttendanceEnrichedColumns(row);

  return {
    id: field(row, ["id", "attendanceId"]) || `${idPrefix}-${idx}`,
    employeeName,
    poolName,
    departmentName,
    date: field(row, ["date", "day", "attendanceDate"]) || "—",
    status: rawStatus ? formatAttendanceStatus(rawStatus) : "—",
    checkIn: formatTimeOnly(field(row, ["checkInAt", "checkIn", "checkInTime", "inTime"])),
    checkOut: formatTimeOnly(field(row, ["checkOutAt", "checkOut", "checkOutTime", "outTime"])),
    breakSummary: formatBreakSummary(taken, allowed, over),
    workedMinutes: worked != null ? `${worked} min` : "—",
    startChat: enriched.startChat,
    chatPause: enriched.chatPause,
    login: enriched.login,
    logout: enriched.logout,
    chatMinutes: enriched.chatMinutes,
    meetingMinutes: enriched.meetingMinutes,
  };
}
