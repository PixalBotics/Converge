/**
 * One-line website label for dropdowns: show a single URL (or name), never duplicate
 * `http://x · http://x` when name and url are the same host.
 */
export function formatWebsiteSelectLabel(
  name?: string | null,
  url?: string | null,
  fallbackId?: string,
): string {
  const u = String(url ?? "").trim();
  const n = String(name ?? "").trim();
  if (u) return u;
  if (n) return n;
  const id = String(fallbackId ?? "").trim();
  return id ? id.slice(0, 12) : "Website";
}
