/** Helpers for website-assignment API envelopes until response types are finalized. */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function unwrapApiData(payload: unknown): unknown {
  if (!isRecord(payload)) return null;
  if ("data" in payload && payload.data !== undefined) return payload.data;
  return payload;
}

export function pickItemsFromWebsitesPayload(payload: unknown): Record<string, unknown>[] {
  const data = unwrapApiData(payload);
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(isRecord);
  if (!isRecord(data)) return [];
  const candidates = [data.items, data.websites, data.rows, data.results];
  for (const c of candidates) {
    if (Array.isArray(c)) return c.filter(isRecord);
  }
  return [];
}

const ASSIGNMENT_ARRAY_KEYS = [
  "assignments",
  "tierAssignments",
  "agentAssignments",
  "assignmentBreakdown",
] as const;

export function pickAssignmentsFromDetailPayload(payload: unknown): Record<string, unknown>[] {
  const data = unwrapApiData(payload);
  if (!isRecord(data)) return [];
  for (const k of ASSIGNMENT_ARRAY_KEYS) {
    const arr = data[k];
    if (Array.isArray(arr)) return arr.filter(isRecord);
  }
  return [];
}

export function pickWebsiteMetaFromDetail(payload: unknown): Record<string, unknown> | null {
  const data = unwrapApiData(payload);
  return isRecord(data) ? data : null;
}

export function pickString(obj: Record<string, unknown> | null, keys: string[]): string {
  if (!obj) return "";
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

export function nestedRecord(obj: Record<string, unknown>, keys: string[]): Record<string, unknown> | null {
  for (const k of keys) {
    const v = obj[k];
    if (isRecord(v)) return v;
  }
  return null;
}
