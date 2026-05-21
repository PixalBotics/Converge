import { apiClient } from "@/api/http/axios-instance";
import { chatAuthHeaders, unwrapChatHttpData } from "./http";
import type {
  QaQueueFilters,
  QaQueueRow,
  QaReviewBundle,
  UpsertQaMessageAnnotationBody,
  UpsertQaSessionReviewBody,
} from "./qa.types";

function queueQueryParams(filters: QaQueueFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.status) params.status = filters.status;
  if (filters.websiteId) params.websiteId = filters.websiteId;
  if (filters.departmentId) params.departmentId = filters.departmentId;
  if (filters.agentId) params.agentId = filters.agentId;
  if (filters.hasTakeover) params.hasTakeover = "true";
  return params;
}

export async function fetchQaMyQueue(
  filters: QaQueueFilters = {},
  token?: string,
): Promise<QaQueueRow[]> {
  const { data } = await apiClient.get<unknown>("/chat/qa/me/queue", {
    params: queueQueryParams(filters),
    headers: chatAuthHeaders(token),
  });
  const rows = unwrapChatHttpData<unknown>(data);
  return Array.isArray(rows) ? (rows as QaQueueRow[]) : [];
}

export async function fetchQaReviewBundle(
  conversationId: string,
  token?: string,
): Promise<QaReviewBundle> {
  const { data } = await apiClient.get<unknown>(
    `/chat/qa/conversations/${encodeURIComponent(conversationId)}/review`,
    { headers: chatAuthHeaders(token) },
  );
  return unwrapChatHttpData<QaReviewBundle>(data);
}

export async function upsertQaSessionReview(
  conversationId: string,
  body: UpsertQaSessionReviewBody,
  token?: string,
): Promise<unknown> {
  const { data } = await apiClient.put<unknown>(
    `/chat/qa/conversations/${encodeURIComponent(conversationId)}/review`,
    body,
    { headers: chatAuthHeaders(token) },
  );
  return unwrapChatHttpData(data);
}

export async function upsertQaMessageAnnotation(
  messageId: string,
  body: UpsertQaMessageAnnotationBody,
  token?: string,
): Promise<unknown> {
  const { data } = await apiClient.put<unknown>(
    `/chat/qa/messages/${encodeURIComponent(messageId)}/annotation`,
    body,
    { headers: chatAuthHeaders(token) },
  );
  return unwrapChatHttpData(data);
}

export async function assignQaReview(
  conversationId: string,
  body?: { qaUserId?: string },
  token?: string,
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    `/chat/qa/conversations/${encodeURIComponent(conversationId)}/assign`,
    body ?? {},
    { headers: chatAuthHeaders(token) },
  );
  return unwrapChatHttpData(data);
}
