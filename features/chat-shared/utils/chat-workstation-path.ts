/** Full-height live-chat workstations (inbox, monitor) — minimal page chrome below dashboard header. */
const WORKSTATION_PREFIXES = [
  "/dashboard/chat-operations",
  "/dashboard/chat-monitor",
] as const;

const WORKSTATION_EXCLUDED = ["/dashboard/chat-operations/distribution"] as const;

export function isDashboardChatWorkstationPath(pathname: string): boolean {
  if (WORKSTATION_EXCLUDED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return false;
  }
  return WORKSTATION_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
