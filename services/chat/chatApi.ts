import { apiClient } from "@/api";
import { isRecord } from "@/lib/utils";
import type {
  AgentMessagePayload,
  ConversationHistoryResponse,
  ConversationSummary,
  SendMessagePayload,
  VisitorCreateConversationPayload,
  VisitorCreateConversationResponse,
} from "./chat.types";

function withBearer(token?: string): Record<string, string> | undefined {
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
}

function coerceConversationSummary(row: Record<string, unknown>): ConversationSummary | null {
  const idRaw = row["id"] ?? row["conversationId"];
  const id = typeof idRaw === "string" && idRaw.trim() ? idRaw.trim() : "";
  if (!id) return null;
  return { ...row, id } as ConversationSummary;
}

/** Backend may return a bare array or an envelope (`data`, `items`, `chats`, …). */
export function normalizeConversationListPayload(payload: unknown): ConversationSummary[] {
  if (Array.isArray(payload)) {
    return payload
      .filter(isRecord)
      .map((x) => coerceConversationSummary(x))
      .filter((x): x is ConversationSummary => x !== null);
  }
  if (isRecord(payload)) {
    const inner =
      payload["data"] ??
      payload["items"] ??
      payload["chats"] ??
      payload["conversations"] ??
      payload["results"] ??
      payload["rows"];
    if (inner !== undefined && inner !== payload) {
      return normalizeConversationListPayload(inner);
    }
  }
  return [];
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
  payload: SendMessagePayload,
): Promise<unknown> {
  const { data } = await apiClient.post(
    `/chat/widget/conversations/${encodeURIComponent(conversationId)}/messages`,
    payload,
  );
  return data;
}

export async function sendAgentMessage(
  conversationId: string,
  payload: AgentMessagePayload,
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
): Promise<unknown> {
  const { data } = await apiClient.post(
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
  const { data } = await apiClient.get<ConversationHistoryResponse>(
    `/chat/agent/conversations/${encodeURIComponent(conversationId)}/history`,
    { headers: withBearer(token) },
  );
  return data;
}

export async function getMyActiveChats(
  token?: string,
): Promise<ConversationSummary[]> {
  const { data } = await apiClient.get<unknown>("/chat/agent/me/active", {
    headers: withBearer(token),
  });
  return normalizeConversationListPayload(data);
}

export async function getWaitingChats(
  token?: string,
): Promise<ConversationSummary[]> {
  const { data } = await apiClient.get<unknown>("/chat/agent/waiting", {
    headers: withBearer(token),
  });
  return normalizeConversationListPayload(data);
}
