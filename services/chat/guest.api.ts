import { apiClient } from "@/api/http/axios-instance";
import { normalizeConversationHistoryPayload } from "./conversation-normalizers";
import { chatAuthHeaders, unwrapChatHttpData } from "./http";
import type {
  GuestSessionExchangeResponse,
  GuestTranscriptResponse,
} from "./guest.types";

export async function exchangeGuestLinkToken(
  token: string,
): Promise<GuestSessionExchangeResponse> {
  const { data } = await apiClient.post<unknown>("/chat/guest/session", { token });
  return unwrapChatHttpData<GuestSessionExchangeResponse>(data);
}

export async function getGuestTranscript(
  conversationId: string,
  guestAccessToken: string,
): Promise<GuestTranscriptResponse> {
  const { data } = await apiClient.get<unknown>(
    `/chat/guest/conversations/${encodeURIComponent(conversationId)}/transcript`,
    { headers: chatAuthHeaders(guestAccessToken) },
  );
  const unwrapped = unwrapChatHttpData<unknown>(data);
  const normalized = normalizeConversationHistoryPayload(unwrapped, conversationId);
  return {
    ...(typeof unwrapped === "object" && unwrapped !== null
      ? (unwrapped as Record<string, unknown>)
      : {}),
    ...normalized,
    readOnly: true,
  };
}

export async function createGuestWhisper(
  conversationId: string,
  guestAccessToken: string,
  message: string,
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    `/chat/guest/conversations/${encodeURIComponent(conversationId)}/whispers`,
    { message },
    { headers: chatAuthHeaders(guestAccessToken) },
  );
  return unwrapChatHttpData(data);
}

export async function requestGuestTakeover(
  conversationId: string,
  guestAccessToken: string,
  body?: { targetAgentId?: string; note?: string },
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    `/chat/guest/conversations/${encodeURIComponent(conversationId)}/takeover/request`,
    body ?? {},
    { headers: chatAuthHeaders(guestAccessToken) },
  );
  return unwrapChatHttpData(data);
}
