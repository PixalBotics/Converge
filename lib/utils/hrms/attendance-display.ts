import { isRecord } from "@/lib/utils/core";

export function formatTimeOnly(value: string): string {
  const raw = value.trim();
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
}

export function formatAttendanceStatus(status: string): string {
  const s = status.trim().toLowerCase();
  if (s === "on_break") return "On break";
  if (s === "checked_in") return "Checked in";
  if (s === "checked_out") return "Checked out";
  return status.trim() || "—";
}

export type AttendanceDayState = {
  hasOpenSession: boolean;
  isOnBreak: boolean;
  breakMinutesTaken: number | null;
  breakMinutesAllowed: number | null;
  overBreakMinutes: number | null;
  workedMinutes: number | null;
};

function pickStr(row: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function pickNum(row: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim()) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

/** Derive check-in session + break state from an attendance log API row. */
export function parseAttendanceDayState(row: Record<string, unknown>): AttendanceDayState {
  const status = pickStr(row, ["status"]).toLowerCase();
  const checkInAt = pickStr(row, ["checkInAt", "checkIn", "checkInTime"]);
  const checkOutAt = pickStr(row, ["checkOutAt", "checkOut", "checkOutTime"]);

  let hasOpenSession =
    status === "checked_in" || status === "on_break" || Boolean(checkInAt && !checkOutAt);

  const segments = Array.isArray(row["segments"]) ? row["segments"] : [];
  const lastSeg = segments.length > 0 ? segments[segments.length - 1] : null;
  if (isRecord(lastSeg)) {
    const segIn = pickStr(lastSeg, ["checkInAt"]);
    const segOut = pickStr(lastSeg, ["checkOutAt"]);
    if (segIn && !segOut) hasOpenSession = true;
    if (segOut) hasOpenSession = false;
  }

  let isOnBreak = status === "on_break";
  const breaks = Array.isArray(row["breaks"]) ? row["breaks"] : [];
  const lastBreak = breaks.length > 0 ? breaks[breaks.length - 1] : null;
  if (isRecord(lastBreak)) {
    const bin = pickStr(lastBreak, ["breakInAt"]);
    const bout = pickStr(lastBreak, ["breakOutAt"]);
    if (bin && !bout) isOnBreak = true;
  }

  return {
    hasOpenSession,
    isOnBreak,
    breakMinutesTaken: pickNum(row, ["breakMinutesTaken"]),
    breakMinutesAllowed: pickNum(row, ["breakMinutesAllowed"]),
    overBreakMinutes: pickNum(row, ["overBreakMinutes"]),
    workedMinutes: pickNum(row, ["workedMinutes"]),
  };
}

export function formatBreakSummary(
  taken: number | null,
  allowed: number | null,
  over: number | null,
): string {
  const t = taken ?? 0;
  if (allowed == null) return `${t} min break`;
  const base = `${t} / ${allowed} min`;
  if (over != null && over > 0) return `${base} (+${over} over)`;
  return base;
}
