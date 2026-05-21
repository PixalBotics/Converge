import type { ConversationSummary } from "@/services/chat/chat.types";
import type { MonitorConversationRow } from "@/services/chat/monitor.types";
import type { QaQueueRow } from "@/services/chat/qa.types";
import type { ChatScopeFilterState } from "../types";

export function conversationMatchesScope(
  c: ConversationSummary,
  scope: ChatScopeFilterState,
  websiteIdsInScope: Set<string> | null,
): boolean {
  const wid = typeof c.websiteId === "string" ? c.websiteId : "";
  if (scope.websiteId.trim() && wid !== scope.websiteId.trim()) return false;
  if (websiteIdsInScope && wid && !websiteIdsInScope.has(wid)) return false;
  if (scope.status.trim() && String(c.status ?? "") !== scope.status.trim()) return false;
  return true;
}

export function monitorRowMatchesScope(
  row: MonitorConversationRow,
  scope: ChatScopeFilterState,
  websiteIdsInScope: Set<string> | null,
): boolean {
  if (scope.websiteId.trim() && row.websiteId !== scope.websiteId.trim()) return false;
  if (websiteIdsInScope && row.websiteId && !websiteIdsInScope.has(row.websiteId)) {
    return false;
  }
  if (
    scope.parentCompanyId.trim() &&
    row.parentCompany?.id !== scope.parentCompanyId.trim()
  ) {
    return false;
  }
  if (scope.childCompanyId.trim() && row.childCompany?.id !== scope.childCompanyId.trim()) {
    return false;
  }
  if (scope.departmentId.trim() && row.departmentId !== scope.departmentId.trim()) {
    return false;
  }
  if (scope.poolId.trim() && row.poolId !== scope.poolId.trim()) return false;
  if (scope.status.trim() && row.status !== scope.status.trim()) return false;
  return true;
}

export function qaRowMatchesScope(
  row: QaQueueRow,
  scope: ChatScopeFilterState,
  websiteIdsInScope: Set<string> | null,
): boolean {
  if (scope.websiteId.trim() && row.websiteId !== scope.websiteId.trim()) return false;
  if (websiteIdsInScope && row.websiteId && !websiteIdsInScope.has(row.websiteId)) {
    return false;
  }
  const childId = row.conversation?.website?.childCompany?.id;
  if (scope.childCompanyId.trim() && childId !== scope.childCompanyId.trim()) {
    return false;
  }
  return true;
}
