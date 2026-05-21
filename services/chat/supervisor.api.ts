import { apiClient } from "@/api";
import { unwrapChatHttpData } from "./http";
import type {
  ChatTakeoverRequest,
  ChatWhisper,
  CreateWhisperBody,
  RequestTakeoverBody,
} from "./supervisor.types";

function conversationPath(conversationId: string): string {
  return `/chat/conversations/${encodeURIComponent(conversationId)}`;
}

export async function fetchConversationWhispers(
  conversationId: string,
): Promise<ChatWhisper[]> {
  const { data } = await apiClient.get<unknown>(
    `${conversationPath(conversationId)}/whispers`,
  );
  const raw = unwrapChatHttpData<unknown>(data);
  return Array.isArray(raw) ? (raw as ChatWhisper[]) : [];
}

export async function createConversationWhisper(
  conversationId: string,
  body: CreateWhisperBody,
): Promise<{ whisper: ChatWhisper; agentMustClickSend: boolean }> {
  const { data } = await apiClient.post<unknown>(
    `${conversationPath(conversationId)}/whispers`,
    body,
  );
  return unwrapChatHttpData(data);
}

export async function fetchTakeoverRequests(
  conversationId: string,
): Promise<ChatTakeoverRequest[]> {
  const { data } = await apiClient.get<unknown>(
    `${conversationPath(conversationId)}/takeover/requests`,
  );
  const raw = unwrapChatHttpData<unknown>(data);
  return Array.isArray(raw) ? (raw as ChatTakeoverRequest[]) : [];
}

export async function requestConversationTakeover(
  conversationId: string,
  body: RequestTakeoverBody,
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    `${conversationPath(conversationId)}/takeover/request`,
    body,
  );
  return unwrapChatHttpData(data);
}

export async function approveTakeoverRequest(
  conversationId: string,
  requestId: string,
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    `${conversationPath(conversationId)}/takeover/requests/${encodeURIComponent(requestId)}/approve`,
  );
  return unwrapChatHttpData(data);
}

export async function rejectTakeoverRequest(
  conversationId: string,
  requestId: string,
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    `${conversationPath(conversationId)}/takeover/requests/${encodeURIComponent(requestId)}/reject`,
  );
  return unwrapChatHttpData(data);
}
