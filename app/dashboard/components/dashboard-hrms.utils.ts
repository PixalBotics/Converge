import { isRecord, pickStr, unwrapApiData } from "@/lib/utils/core";
import { extractAttendanceItems } from "../attendance/_team-attendance/utils/attendance-rows";

export const HRMS_DATE_RANGE_OPTIONS = ["Last 7 Days", "Last 30 Days", "Last 90 Days"] as const;
export type HrmsDateRangeLabel = (typeof HRMS_DATE_RANGE_OPTIONS)[number];

export const HRMS_DATE_RANGE_DAYS: Record<HrmsDateRangeLabel, number> = {
  "Last 7 Days": 7,
  "Last 30 Days": 30,
  "Last 90 Days": 90,
};

export function resolveHrmsTrendDayCount(label: HrmsDateRangeLabel): number {
  const days = HRMS_DATE_RANGE_DAYS[label] ?? 30;
  return Math.min(days, 14);
}

export function buildDateStringsEndingToday(count: number): string[] {
  const safe = Math.max(1, Math.min(count, 31));
  const out: string[] = [];
  const end = new Date();
  for (let i = safe - 1; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function extractListItems(data: unknown): Record<string, unknown>[] {
  const payload = unwrapApiData(data);
  if (!payload) return [];
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];
  const items = payload.items;
  return Array.isArray(items) ? items.filter(isRecord) : [];
}

export function extractListTotal(data: unknown, fallback = 0): number {
  const payload = unwrapApiData(data);
  if (!isRecord(payload)) return fallback;
  const n = Number(payload.total ?? payload.count ?? payload.totalCount);
  return Number.isFinite(n) ? n : fallback;
}

export type PoolFilterOption = { id: string; name: string };

export function extractPoolFilterOptions(data: unknown): PoolFilterOption[] {
  return extractListItems(data)
    .map((row) => {
      const id = pickStr(row, ["id", "poolId"]);
      const name = pickStr(row, ["name", "poolName"]) || id;
      if (!id) return null;
      return { id, name };
    })
    .filter((x): x is PoolFilterOption => x !== null);
}

export function countAttendanceByStatus(items: Record<string, unknown>[]) {
  let present = 0;
  let late = 0;
  let absent = 0;
  let other = 0;

  for (const row of items) {
    const status = pickStr(row, ["status", "attendanceStatus", "dayStatus"]).toLowerCase();
    if (status.includes("late")) late += 1;
    else if (status.includes("present") || status.includes("checked")) present += 1;
    else if (status.includes("absent") || status === "a") absent += 1;
    else other += 1;
  }

  const total = items.length;
  const checkedIn = present + late + other;
  return { present, late, absent, other, total, checkedIn };
}

export function summarizeAttendanceTrend(
  dayResults: Array<{ date: string; items: Record<string, unknown>[] }>,
) {
  return dayResults.map(({ date, items }, index) => {
    const { checkedIn, total } = countAttendanceByStatus(items);
    const label = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return {
      day: index + 1,
      value: checkedIn,
      total,
      name: label,
    };
  });
}

export function mapAttendanceLogEntry(row: Record<string, unknown>, idx: number) {
  const userNested = isRecord(row.user) ? row.user : null;
  const name =
    [pickStr(userNested, ["firstName"]), pickStr(userNested, ["lastName"])].filter(Boolean).join(" ").trim() ||
    pickStr(userNested, ["email"]) ||
    pickStr(row, ["memberName", "employeeName"]) ||
    "—";
  const checkIn = pickStr(row, ["checkInAt", "checkIn", "checkInTime"]) || "—";
  const statusRaw = pickStr(row, ["status", "attendanceStatus", "dayStatus"]) || "—";
  const statusLower = statusRaw.toLowerCase();
  const status = statusLower.includes("late") ? "Late" : statusLower.includes("absent") ? "Absent" : "Present";
  return {
    id: pickStr(row, ["id", "userId"]) || `att-${idx}`,
    name,
    time: checkIn.length > 10 ? new Date(checkIn).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : checkIn,
    status,
  };
}

export function mapPendingLeaveEntry(
  row: Record<string, unknown>,
  idx: number,
): { id: string; name: string; leave: string; days: string } | null {
  const id = pickStr(row, ["id"]);
  if (!id) return null;
  const applicant = isRecord(row.user) ? row.user : null;
  const name =
    [pickStr(applicant, ["firstName"]), pickStr(applicant, ["lastName"])].filter(Boolean).join(" ").trim() || "—";
  const leaveType =
    pickStr(isRecord(row.leaveType) ? row.leaveType : null, ["name"]) ||
    pickStr(row, ["leaveTypeName"]) ||
    "Leave";
  const start = pickStr(row, ["startDate", "effectiveFrom"]);
  const end = pickStr(row, ["endDate", "effectiveTo"]);
  const days = start && end ? `${start} → ${end}` : start || end || "—";
  return { id, name, leave: leaveType, days };
}

export function attendanceItemsFromUnknown(data: unknown): Record<string, unknown>[] {
  return extractAttendanceItems(data);
}
