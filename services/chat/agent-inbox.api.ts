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
import { chatAuthHeaders, unwrapChatHttpData } from "./http";

/** @deprecated Use `createWidgetConversation` from `widget-visitor.api` (no dashboard session side effects). */
export async function createConversation(
  payload: VisitorCreateConversationPayload,
): Promise<VisitorCreateConversationResponse> {
  const { createWidgetConversation } = await import("./widget-visitor.api");
  return createWidgetConversation(payload);
}

/** @deprecated Use `sendWidgetVisitorMessage` from `widget-visitor.api`. */
export async function sendVisitorMessage(
  conversationId: string,
  payload: VisitorSendMessagePayload,
): Promise<unknown> {
  const { sendWidgetVisitorMessage } = await import("./widget-visitor.api");
  return sendWidgetVisitorMessage(conversationId, payload);
}

export async function sendAgentMessage(
  conversationId: string,
  payload: AgentSendMessagePayload,
  token?: string,
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    `/chat/agent/conversations/${encodeURIComponent(conversationId)}/messages`,
    payload,
    { headers: chatAuthHeaders(token) },
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
    { headers: chatAuthHeaders(token) },
  );
  return unwrapChatHttpData<ChatCloseResponse>(data);
}

export async function getConversationHistory(
  conversationId: string,
  token?: string,
): Promise<ConversationHistoryResponse> {
  const { data } = await apiClient.get<unknown>(
    `/chat/agent/conversations/${encodeURIComponent(conversationId)}/history`,
    { headers: chatAuthHeaders(token) },
  );
  return normalizeConversationHistoryPayload(
    unwrapChatHttpData(data),
    conversationId,
  );
}

export async function getMyActiveChats(token?: string): Promise<ConversationSummary[]> {
  const { data } = await apiClient.get<unknown>("/chat/agent/me/active", {
    headers: chatAuthHeaders(token),
  });
  return normalizeConversationList(unwrapChatHttpData(data));
}

export async function getWaitingChats(token?: string): Promise<ConversationSummary[]> {
  const { data } = await apiClient.get<unknown>("/chat/agent/waiting", {
    headers: chatAuthHeaders(token),
  });
  return normalizeConversationList(unwrapChatHttpData(data));
}

export async function getMyClosedChats(token?: string): Promise<ConversationSummary[]> {
  const { data } = await apiClient.get<unknown>("/chat/agent/me/closed", {
    headers: chatAuthHeaders(token),
  });
  return normalizeConversationList(unwrapChatHttpData(data));
}

export async function postAgentWebsiteAvailabilityCheck(
  websiteId: string,
  token?: string,
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    `/chat/agent/websites/${encodeURIComponent(websiteId)}/availability-check`,
    undefined,
    { headers: chatAuthHeaders(token) },
  );
  return unwrapChatHttpData(data);
}
