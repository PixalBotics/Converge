import dayjs from "dayjs";

export function isoToCalendarDate(iso: string): string {
  if (!iso.trim()) return "";
  const d = dayjs(iso);
  return d.isValid() ? d.format("YYYY-MM-DD") : "";
}

export function calendarDateToIsoStart(date: string): string {
  if (!date.trim()) return "";
  const d = dayjs(date, "YYYY-MM-DD", true);
  return d.isValid() ? d.startOf("day").toISOString() : "";
}

export function calendarDateToIsoEnd(date: string): string {
  if (!date.trim()) return "";
  const d = dayjs(date, "YYYY-MM-DD", true);
  return d.isValid() ? d.endOf("day").toISOString() : "";
}
