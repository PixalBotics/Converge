function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Format a Date to YYYY-MM-DD (local time). */
export function toIsoDateString(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

export function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** ISO date strings (YYYY-MM-DD) compare lexicographically. */
export function isoDateInRange(dayIso: string, fromIso: string, toIso: string): boolean {
  return dayIso >= fromIso && dayIso <= toIso;
}

