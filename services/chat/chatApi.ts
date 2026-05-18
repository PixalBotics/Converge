import { apiClient } from "@/api";
import type {
  AgentSendMessagePayload,
  ChatCloseResponse,
  ConversationHistoryResponse,
  ConversationSummary,
  VisitorCreateConversationPayload,
  VisitorCreateConversationResponse,
  VisitorSendMessagePayload,
} from "./chat.types";
import {
  normalizeConversationHistoryPayload,
  normalizeConversationList,
} from "./conversation-normalizers";

function withBearer(token?: string): Record<string, string> | undefined {
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
}

/** Backend `{ success: true, data: T }` or raw `T` (axios `response.data`). */
export function unwrapChatHttpData<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as { success?: unknown }).success === true &&
    "data" in payload &&
    (payload as { data: unknown }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export async function createConversation(
  payload: VisitorCreateConversationPayload,
): Promise<VisitorCreateConversationResponse> {
  const { data } = await apiClient.post<unknown>(
    "/chat/widget/conversations",
    payload,
  );
  return unwrapChatHttpData<VisitorCreateConversationResponse>(data);
}

export async function sendVisitorMessage(
  conversationId: string,
  payload: VisitorSendMessagePayload,
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    `/chat/widget/conversations/${encodeURIComponent(conversationId)}/messages`,
    payload,
  );
  return unwrapChatHttpData(data);
}

export async function sendAgentMessage(
  conversationId: string,
  payload: AgentSendMessagePayload,
  token?: string,
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    `/chat/agent/conversations/${encodeURIComponent(conversationId)}/messages`,
    payload,
    { headers: withBearer(token) },
  );
  return unwrapChatHttpData(data);
}

export async function closeConversation(
  conversationId: string,
  token?: string,
): Promise<ChatCloseResponse> {
  const { data } = await apiClient.post<unknown>(
    `/chat/agent/conversations/${encodeURIComponent(conversationId)}/close`,
    undefined,
    { headers: withBearer(token) },
  );
  return unwrapChatHttpData<ChatCloseResponse>(data);
}

export async function getConversationHistory(
  conversationId: string,
  token?: string,
): Promise<ConversationHistoryResponse> {
  const { data } = await apiClient.get<unknown>(
    `/chat/agent/conversations/${encodeURIComponent(conversationId)}/history`,
    { headers: withBearer(token) },
  );
  return normalizeConversationHistoryPayload(
    unwrapChatHttpData(data),
    conversationId,
  );
}

export async function getMyActiveChats(
  token?: string,
): Promise<ConversationSummary[]> {
  const { data } = await apiClient.get<unknown>(
    "/chat/agent/me/active",
    { headers: withBearer(token) },
  );
  return normalizeConversationList(unwrapChatHttpData(data));
}

export async function getWaitingChats(
  token?: string,
): Promise<ConversationSummary[]> {
  const { data } = await apiClient.get<unknown>(
    "/chat/agent/waiting",
    { headers: withBearer(token) },
  );
  return normalizeConversationList(unwrapChatHttpData(data));
}

/** POST /chat/agent/websites/:websiteId/availability-check — staffing / routing gate (no body). */
export async function postAgentWebsiteAvailabilityCheck(
  websiteId: string,
  token?: string,
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    `/chat/agent/websites/${encodeURIComponent(websiteId)}/availability-check`,
    undefined,
    { headers: withBearer(token) },
  );
  return unwrapChatHttpData(data);
}
