/** Normalize API or draft time to `HH:mm` for `<input type="time">`. */
export function toTimeInputValue(raw: string | undefined | null): string {
  const t = (raw ?? "").trim();
  if (!t) return "09:00";
  const hm = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (hm) {
    const h = Math.min(23, Math.max(0, Number(hm[1])));
    const m = Math.min(59, Math.max(0, Number(hm[2])));
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  return "09:00";
}

/** Persist 24h `HH:mm` from time input. */
export function fromTimeInputValue(value: string): string {
  return toTimeInputValue(value);
}

/** True when end is earlier than start on the same calendar day (overnight shift). */
export function timesLikelyCrossMidnight(startTime: string, endTime: string): boolean {
  const start = toTimeInputValue(startTime);
  const end = toTimeInputValue(endTime);
  return start !== end && end < start;
}
