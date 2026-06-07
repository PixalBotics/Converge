import { isAxiosError } from "axios";
import { apiClient } from "@/api";
import { agentChatSocketAckOrRest } from "./agent-socket-api.util";
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
import {
  VisitorProfileConflictError,
  type PatchVisitorProfileBody,
  type PatchVisitorProfileResult,
  type VisitorProfileField,
} from "./visitor-profile.types";

function readVisitorProfileConflict(
  payload: unknown,
): { message: string; field: VisitorProfileField; currentValue: string } | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const err =
    root.error && typeof root.error === "object"
      ? (root.error as Record<string, unknown>)
      : root;
  const code = typeof err.code === "string" ? err.code : "";
  if (code !== "VISITOR_FIELD_ALREADY_SET") return null;
  const message =
    typeof err.message === "string" && err.message.trim()
      ? err.message.trim()
      : "This field is already set.";
  const details =
    err.details && typeof err.details === "object"
      ? (err.details as Record<string, unknown>)
      : null;
  const fieldRaw = typeof details?.field === "string" ? details.field : "";
  const field: VisitorProfileField | null =
    fieldRaw === "name" || fieldRaw === "email" || fieldRaw === "phone" ? fieldRaw : null;
  if (!field) return null;
  const currentValue =
    typeof details?.currentValue === "string" ? details.currentValue : "";
  return { message, field, currentValue };
}

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
  const payload = await agentChatSocketAckOrRest<unknown>(
    (socket) => socket.fetchAgentHistoryWithAck({ conversationId }, 15_000),
    async () => {
      const { data } = await apiClient.get<unknown>(
        `/chat/agent/conversations/${encodeURIComponent(conversationId)}/history`,
        { headers: chatAuthHeaders(token) },
      );
      return unwrapChatHttpData(data);
    },
  );
  return normalizeConversationHistoryPayload(payload, conversationId);
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

export async function patchAgentVisitorProfile(
  conversationId: string,
  body: PatchVisitorProfileBody,
  token?: string,
): Promise<PatchVisitorProfileResult> {
  try {
    const { data } = await apiClient.patch<unknown>(
      `/chat/agent/conversations/${encodeURIComponent(conversationId)}/visitor-profile`,
      body,
      { headers: chatAuthHeaders(token) },
    );
    return unwrapChatHttpData<PatchVisitorProfileResult>(data);
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 409) {
      const conflict = readVisitorProfileConflict(err.response.data);
      if (conflict) {
        throw new VisitorProfileConflictError(
          conflict.message,
          conflict.field,
          conflict.currentValue,
        );
      }
    }
    throw err;
  }
}
