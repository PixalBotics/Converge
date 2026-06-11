/** Agent dashboard links stored as SPA paths (preferred) or legacy absolute URLs. */
export function resolveDashboardHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (typeof window !== "undefined" && trimmed.startsWith("/")) {
    return `${window.location.origin}${trimmed}`;
  }
  return trimmed;
}
