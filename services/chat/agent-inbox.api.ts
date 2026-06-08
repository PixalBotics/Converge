import { apiClient } from "@/api";
import {
  agentChatSocketAckOrRest,
  agentChatSocketAckRequired,
  ensureAgentChatSocketReady,
} from "./agent-socket-api.util";
import { unwrapSocketAckPayload } from "@/lib/hooks/chat/chat-socket-delivery";
import {
  isSocketTransportError,
  isVisitorProfileBusinessError,
} from "@/features/chat-operations/utils/visitor-profile-capture";
import type {
  AgentSendMessagePayload,
  AgentVisitorProfileUpdateResult,
  ChatCloseResponse,
  ConversationHistoryResponse,
  ConversationSummary,
  PatchAgentVisitorProfileBody,
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

export interface TransferToPoolHeadResponse {
  conversationId: string;
  transfer: {
    conversationId: string;
    fromAgentId: string;
    toAgentId: string;
  };
  fromAgent: { id: string; label: string };
  toAgent: { id: string; label: string };
  assignedRank?: string | null;
  lastTransferFrom?: {
    userId: string;
    label: string;
    transferredAt?: string;
  } | null;
}

export async function transferConversationToPoolHead(
  conversationId: string,
  _token?: string,
): Promise<TransferToPoolHeadResponse> {
  return agentChatSocketAckRequired<TransferToPoolHeadResponse>(
    (socket) => socket.transferToPoolHeadWithAck({ conversationId }, 15_000),
    "transfer to pool head",
  );
}

export async function getAgentConversationHistorySocket(
  conversationId: string,
): Promise<ConversationHistoryResponse> {
  const payload = await agentChatSocketAckRequired<unknown>(
    (socket) => socket.fetchAgentHistoryWithAck({ conversationId }, 15_000),
    "load conversation history",
  );
  return normalizeConversationHistoryPayload(payload, conversationId);
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
  body: PatchAgentVisitorProfileBody,
  token?: string,
): Promise<AgentVisitorProfileUpdateResult> {
  const restCall = async () => {
    const { data } = await apiClient.patch<unknown>(
      `/chat/agent/conversations/${encodeURIComponent(conversationId)}/visitor-profile`,
      body,
      { headers: chatAuthHeaders(token) },
    );
    return unwrapChatHttpData<AgentVisitorProfileUpdateResult>(data);
  };

  const socket = await ensureAgentChatSocketReady();
  if (socket) {
    try {
      const ack = await socket.updateVisitorProfileWithAck(
        { conversationId, ...body },
        15_000,
      );
      const payload = unwrapSocketAckPayload(ack);
      if (payload !== undefined && payload !== null && typeof payload === "object") {
        return unwrapChatHttpData<AgentVisitorProfileUpdateResult>(payload);
      }
    } catch (err) {
      if (isVisitorProfileBusinessError(err) || !isSocketTransportError(err)) {
        throw err;
      }
    }
  }

  return restCall();
}
