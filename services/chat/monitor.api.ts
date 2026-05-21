import { apiClient } from "@/api";
import { normalizeConversationHistoryPayload } from "./conversation-normalizers";
import { unwrapChatHttpData } from "./http";
import { normalizeMonitorConversationList } from "./monitor-normalizers";
import type {
  MonitorCapabilities,
  MonitorConversationRow,
  MonitorListFilters,
  MonitorTranscriptResponse,
} from "./monitor.types";

function compactMonitorQuery(filters: MonitorListFilters): Record<string, string> {
  const q: Record<string, string> = {};
  if (filters.websiteId?.trim()) q.websiteId = filters.websiteId.trim();
  if (filters.departmentId?.trim()) q.departmentId = filters.departmentId.trim();
  if (filters.poolId?.trim()) q.poolId = filters.poolId.trim();
  if (filters.status?.trim()) q.status = filters.status.trim();
  return q;
}

export async function fetchMonitorCapabilities(): Promise<MonitorCapabilities> {
  const { data } = await apiClient.get<unknown>("/chat/monitor/me/capabilities");
  return unwrapChatHttpData<MonitorCapabilities>(data);
}

export async function fetchMonitorLive(
  filters: MonitorListFilters = {},
): Promise<MonitorConversationRow[]> {
  const { data } = await apiClient.get<unknown>("/chat/monitor/live", {
    params: compactMonitorQuery(filters),
  });
  return normalizeMonitorConversationList(unwrapChatHttpData(data));
}

export async function fetchMonitorClosed(
  filters: MonitorListFilters = {},
): Promise<MonitorConversationRow[]> {
  const { data } = await apiClient.get<unknown>("/chat/monitor/closed", {
    params: compactMonitorQuery(filters),
  });
  return normalizeMonitorConversationList(unwrapChatHttpData(data));
}

export async function fetchMonitorTranscript(
  conversationId: string,
): Promise<MonitorTranscriptResponse> {
  const { data } = await apiClient.get<unknown>(
    `/chat/monitor/conversations/${encodeURIComponent(conversationId)}/transcript`,
  );
  const unwrapped = unwrapChatHttpData<Record<string, unknown>>(data);
  const normalized = normalizeConversationHistoryPayload(unwrapped, conversationId);
  return {
    ...unwrapped,
    conversationId: normalized.conversationId,
    messages: normalized.messages,
    visitor: normalized.visitor,
    readOnly: true,
  };
}
