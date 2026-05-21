import { apiClient } from "@/api/http/axios-instance";
import { chatAuthHeaders, unwrapChatHttpData } from "./http";
import type { ChatReportOverview, ChatReportQuery } from "./reports.types";

function reportParams(query: ChatReportQuery): Record<string, string> {
  const params: Record<string, string> = {};
  if (query.from) params.from = query.from;
  if (query.to) params.to = query.to;
  if (query.websiteId) params.websiteId = query.websiteId;
  if (query.departmentId) params.departmentId = query.departmentId;
  return params;
}

export async function fetchChatReportOverview(
  query: ChatReportQuery = {},
  token?: string,
): Promise<ChatReportOverview> {
  const { data } = await apiClient.get<unknown>("/chat/reports/overview", {
    params: reportParams(query),
    headers: chatAuthHeaders(token),
  });
  return unwrapChatHttpData<ChatReportOverview>(data);
}
