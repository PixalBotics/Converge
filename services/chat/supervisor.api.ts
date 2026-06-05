import { apiClient } from "@/api";
import { getSharedAgentChatSocket } from "./sharedAgentChatSocket";
import { unwrapChatHttpData } from "./http";
import type {
  ChatTakeoverRequest,
  ChatWhisper,
  CreateWhisperBody,
  RequestTakeoverBody,
  RequestTakeoverResult,
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
  const socket = getSharedAgentChatSocket();
  if (socket.isConnected()) {
    try {
      const ack = await socket.sendSupervisorWhisperWithAck({
        conversationId,
        message: body.message,
      });
      if (ack && typeof ack === "object") {
        return unwrapChatHttpData(ack);
      }
    } catch {
      /* REST fallback */
    }
  }
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
): Promise<RequestTakeoverResult> {
  const { data } = await apiClient.post<unknown>(
    `${conversationPath(conversationId)}/takeover/request`,
    body,
  );
  return unwrapChatHttpData<RequestTakeoverResult>(data);
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

export async function startDirectSupervisorControl(
  conversationId: string,
): Promise<{ mode: string; supervisorControlUserId: string; agentReadOnly: boolean }> {
  const socket = getSharedAgentChatSocket();
  if (socket.isConnected()) {
    try {
      const ack = await socket.sendSupervisorControlStartWithAck({ conversationId });
      if (ack && typeof ack === "object") {
        return unwrapChatHttpData(ack);
      }
    } catch {
      /* REST fallback */
    }
  }
  const { data } = await apiClient.post<unknown>(
    `${conversationPath(conversationId)}/supervisor/control/start`,
  );
  return unwrapChatHttpData(data);
}

export async function releaseDirectSupervisorControl(
  conversationId: string,
): Promise<{ released: boolean }> {
  const socket = getSharedAgentChatSocket();
  if (socket.isConnected()) {
    try {
      const ack = await socket.sendSupervisorControlReleaseWithAck({ conversationId });
      if (ack && typeof ack === "object") {
        return unwrapChatHttpData(ack);
      }
    } catch {
      /* REST fallback */
    }
  }
  const { data } = await apiClient.post<unknown>(
    `${conversationPath(conversationId)}/supervisor/control/release`,
  );
  return unwrapChatHttpData(data);
}

export async function sendSupervisorControlMessage(
  conversationId: string,
  message: string,
): Promise<unknown> {
  const socket = getSharedAgentChatSocket();
  if (socket.isConnected()) {
    try {
      const ack = await socket.sendSupervisorMessageWithAck({ conversationId, message });
      if (ack !== undefined) return ack;
    } catch {
      /* REST fallback */
    }
  }
  const { data } = await apiClient.post<unknown>(
    `${conversationPath(conversationId)}/supervisor/messages`,
    { message },
  );
  return unwrapChatHttpData(data);
}

export async function supervisorCloseConversation(
  conversationId: string,
  body: { reason?: string } = {},
): Promise<unknown> {
  const { data } = await apiClient.post<unknown>(
    `${conversationPath(conversationId)}/supervisor/close`,
    body,
  );
  return unwrapChatHttpData(data);
}
