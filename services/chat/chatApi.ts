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

export async function createConversation(
  payload: VisitorCreateConversationPayload,
): Promise<VisitorCreateConversationResponse> {
  const { data } = await apiClient.post<VisitorCreateConversationResponse>(
    "/chat/widget/conversations",
    payload,
  );
  return data;
}

export async function sendVisitorMessage(
  conversationId: string,
  payload: VisitorSendMessagePayload,
): Promise<unknown> {
  const { data } = await apiClient.post(
    `/chat/widget/conversations/${encodeURIComponent(conversationId)}/messages`,
    payload,
  );
  return data;
}

export async function sendAgentMessage(
  conversationId: string,
  payload: AgentSendMessagePayload,
  token?: string,
): Promise<unknown> {
  const { data } = await apiClient.post(
    `/chat/agent/conversations/${encodeURIComponent(conversationId)}/messages`,
    payload,
    { headers: withBearer(token) },
  );
  return data;
}

export async function closeConversation(
  conversationId: string,
  token?: string,
): Promise<ChatCloseResponse> {
  const { data } = await apiClient.post<ChatCloseResponse>(
    `/chat/agent/conversations/${encodeURIComponent(conversationId)}/close`,
    undefined,
    { headers: withBearer(token) },
  );
  return data;
}

export async function getConversationHistory(
  conversationId: string,
  token?: string,
): Promise<ConversationHistoryResponse> {
  const { data } = await apiClient.get<unknown>(
    `/chat/agent/conversations/${encodeURIComponent(conversationId)}/history`,
    { headers: withBearer(token) },
  );
  return normalizeConversationHistoryPayload(data, conversationId);
}

export async function getMyActiveChats(
  token?: string,
): Promise<ConversationSummary[]> {
  const { data } = await apiClient.get<unknown>(
    "/chat/agent/me/active",
    { headers: withBearer(token) },
  );
  return normalizeConversationList(data);
}

export async function getWaitingChats(
  token?: string,
): Promise<ConversationSummary[]> {
  const { data } = await apiClient.get<unknown>(
    "/chat/agent/waiting",
    { headers: withBearer(token) },
  );
  return normalizeConversationList(data);
}
