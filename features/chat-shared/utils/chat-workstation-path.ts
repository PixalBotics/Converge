/** Full-height live-chat workstations (inbox, monitor, transcript detail) — minimal page chrome below dashboard header. */
const WORKSTATION_PREFIXES = [
  "/dashboard/chat-operations",
  "/dashboard/chat-monitor",
] as const;

const WORKSTATION_EXCLUDED = ["/dashboard/chat-operations/distribution"] as const;

const TRANSCRIPT_DETAIL_PREFIX = "/dashboard/chat-transcripts/";

export function isDashboardChatWorkstationPath(pathname: string): boolean {
  if (WORKSTATION_EXCLUDED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return false;
  }
  if (
    pathname.startsWith(TRANSCRIPT_DETAIL_PREFIX) &&
    pathname.length > TRANSCRIPT_DETAIL_PREFIX.length
  ) {
    return true;
  }
  return WORKSTATION_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
