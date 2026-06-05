import type { Socket } from "socket.io-client";
import {
  resolveSocketEndpoint,
  SocketConnection,
} from "@/services/socket";
import type {
  ChatMessage,
  JoinLeaveRoomPayload,
  SocketAgentMessagePayload,
  SocketTypingEmitPayload,
  SocketVisitorMessagePayload,
  TypingPayload,
} from "./chat.types";
import { normalizeServerMessage } from "./normalize-message";

export interface MonitorLiveUpdatePayload {
  event: string;
  conversationId: string;
  payload: unknown;
}

type ChatEventMap = {
  connected: (payload: unknown) => void;
  joined_room: (payload: JoinLeaveRoomPayload) => void;
  left_room: (payload: JoinLeaveRoomPayload) => void;
  visitor_message: (payload: ChatMessage) => void;
  agent_message: (payload: ChatMessage) => void;
  ai_message: (payload: ChatMessage) => void;
  ai_reply_delta: (payload: unknown) => void;
  typing: (payload: TypingPayload) => void;
  stop_typing: (payload: TypingPayload) => void;
  chat_assigned: (payload: unknown) => void;
  chat_queued: (payload: unknown) => void;
  chat_resumed: (payload: unknown) => void;
  chat_closed: (payload: unknown) => void;
  chat_completed: (payload: unknown) => void;
  chat_transferred: (payload: unknown) => void;
  chat_supervisor_control: (payload: unknown) => void;
  chat_whisper: (payload: unknown) => void;
  takeover_requested: (payload: unknown) => void;
  takeover_update: (payload: unknown) => void;
  agent_wrap_up_form: (payload: unknown) => void;
  agent_wrap_up_required: (payload: unknown) => void;
  agent_wrap_up_submitted: (payload: unknown) => void;
  agent_distribution_submitted: (payload: unknown) => void;
  agent_assignment_popup: (payload: unknown) => void;
  agent_queue_popup: (payload: unknown) => void;
  monitor_live_update: (payload: MonitorLiveUpdatePayload) => void;
  visitor_profile_updated: (payload: unknown) => void;
  chat_handover: (payload: unknown) => void;
  chat_talk_to_agent: (payload: unknown) => void;
  qa_queue_updated: (payload: unknown) => void;
  qa_review_updated: (payload: unknown) => void;
};

export interface ChatSocketOptions {
  authToken?: string;
  forceNew?: boolean;
}

function bodyFromAgentPayload(payload: SocketAgentMessagePayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    conversationId: payload.conversationId,
    message: payload.message,
  };
  if (payload.agentId !== undefined && payload.agentId !== "") {
    body.agentId = payload.agentId;
  }
  return body;
}

const chatSocketEndpoint = resolveSocketEndpoint({
  envBaseUrl: process.env.NEXT_PUBLIC_CHAT_SOCKET_BASE_URL,
  envFallbackBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  envNamespace: process.env.NEXT_PUBLIC_CHAT_SOCKET_NAMESPACE,
  defaultNamespace: "/chat",
});

export class ChatSocketClient {
  private connection = new SocketConnection(chatSocketEndpoint);
  private joinedRooms = new Set<string>();

  connect(options?: ChatSocketOptions): Socket {
    const existing = this.connection.getSocket();
    if (existing?.connected && !options?.forceNew) {
      this.handleConnect();
      return existing;
    }

    const socket = this.connection.connect({
      authToken: options?.authToken,
      forceNew: options?.forceNew,
    });

    socket.off("connect", this.handleConnect);
    socket.on("connect", this.handleConnect);
    if (socket.connected) {
      this.handleConnect();
    }
    return socket;
  }

  async waitUntilConnected(timeoutMs = 12_000): Promise<boolean> {
    try {
      await this.connection.waitUntilConnected(timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async waitUntilSocketReady(timeoutMs = 12_000): Promise<boolean> {
    try {
      await this.connection.waitUntilSocketReady(timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async joinRoomWithAck(
    payload: JoinLeaveRoomPayload,
    timeoutMs = 8_000,
  ): Promise<void> {
    this.joinedRooms.add(payload.conversationId);
    const ready = await this.waitUntilSocketReady(timeoutMs);
    if (!ready) {
      throw new Error("Socket not ready for join_room");
    }

    return new Promise((resolve, reject) => {
      const needle = payload.conversationId.toLowerCase();
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("join_room ack timeout"));
      }, timeoutMs);

      const onJoined = (raw: unknown) => {
        const cid =
          raw && typeof raw === "object" && "conversationId" in raw
            ? String((raw as { conversationId?: string }).conversationId ?? "")
            : "";
        if (cid.toLowerCase() !== needle) return;
        cleanup();
        resolve();
      };

      const cleanup = () => {
        clearTimeout(timer);
        offJoined();
      };

      const offJoined = this.connection.once("joined_room", onJoined);
      this.connection.emit("join_room", { conversationId: payload.conversationId });
    });
  }

  private handleConnect = (): void => {
    this.joinedRooms.forEach((conversationId) => {
      this.joinRoom({ conversationId });
    });
  };

  disconnect(hard = false): void {
    this.joinedRooms.clear();
    this.connection.disconnect(true, hard);
  }

  joinRoom(payload: JoinLeaveRoomPayload): void {
    this.joinedRooms.add(payload.conversationId);
    if (this.connection.isConnected()) {
      this.connection.emit("join_room", { conversationId: payload.conversationId });
    }
  }

  leaveRoom(payload: JoinLeaveRoomPayload): void {
    this.joinedRooms.delete(payload.conversationId);
    this.connection.emit("leave_room", { conversationId: payload.conversationId });
  }

  sendVisitorMessage(payload: SocketVisitorMessagePayload): void {
    this.connection.emit("visitor_message", payload);
  }

  sendVisitorMessageWithAck(
    payload: SocketVisitorMessagePayload,
    timeoutMs?: number,
  ): Promise<unknown> {
    return this.connection.emitWithAck("visitor_message", payload, timeoutMs);
  }

  sendAgentMessage(payload: SocketAgentMessagePayload): void {
    this.connection.emit("agent_message", bodyFromAgentPayload(payload));
  }

  sendAgentMessageWithAck(
    payload: SocketAgentMessagePayload,
    timeoutMs?: number,
  ): Promise<unknown> {
    return this.connection.emitWithAck("agent_message", bodyFromAgentPayload(payload), timeoutMs);
  }

  sendAgentCloseChatWithAck(
    payload: { conversationId: string },
    timeoutMs?: number,
  ): Promise<unknown> {
    return this.connection.emitWithAck("agent_close_chat", payload, timeoutMs);
  }

  sendAgentPickWaitingWithAck(
    payload: { conversationId: string },
    timeoutMs?: number,
  ): Promise<unknown> {
    return this.connection.emitWithAck("agent_pick_waiting", payload, timeoutMs);
  }

  sendSupervisorWhisperWithAck(
    payload: { conversationId: string; message: string },
    timeoutMs?: number,
  ): Promise<unknown> {
    return this.connection.emitWithAck("supervisor_whisper", payload, timeoutMs);
  }

  sendSupervisorTakeoverRequestWithAck(
    payload: { conversationId: string; reason?: string },
    timeoutMs?: number,
  ): Promise<unknown> {
    return this.connection.emitWithAck("supervisor_takeover_request", payload, timeoutMs);
  }

  sendSupervisorControlStartWithAck(
    payload: { conversationId: string },
    timeoutMs?: number,
  ): Promise<unknown> {
    return this.connection.emitWithAck("supervisor_control_start", payload, timeoutMs);
  }

  sendSupervisorControlReleaseWithAck(
    payload: { conversationId: string },
    timeoutMs?: number,
  ): Promise<unknown> {
    return this.connection.emitWithAck("supervisor_control_release", payload, timeoutMs);
  }

  sendSupervisorMessageWithAck(
    payload: { conversationId: string; message: string },
    timeoutMs?: number,
  ): Promise<unknown> {
    return this.connection.emitWithAck("supervisor_message", payload, timeoutMs);
  }

  sendQaAssignReviewWithAck(
    payload: { conversationId: string; qaUserId?: string },
    timeoutMs?: number,
  ): Promise<unknown> {
    return this.connection.emitWithAck("qa_assign_review", payload, timeoutMs);
  }

  sendQaUpsertSessionReviewWithAck(
    payload: { conversationId: string; body: Record<string, unknown> },
    timeoutMs?: number,
  ): Promise<unknown> {
    return this.connection.emitWithAck("qa_upsert_session_review", payload, timeoutMs);
  }

  emitTyping(payload: SocketTypingEmitPayload): void {
    const body: Record<string, unknown> = { conversationId: payload.conversationId };
    if (payload.userType !== undefined) body.userType = payload.userType;
    if (payload.userId !== undefined) body.userId = payload.userId;
    if (payload.draft !== undefined) body.draft = payload.draft;
    this.connection.emit("typing", body);
  }

  emitStopTyping(payload: SocketTypingEmitPayload): void {
    const body: Record<string, unknown> = { conversationId: payload.conversationId };
    if (payload.userType !== undefined) body.userType = payload.userType;
    if (payload.userId !== undefined) body.userId = payload.userId;
    this.connection.emit("stop_typing", body);
  }

  onConnected(listener: ChatEventMap["connected"]): () => void {
    return this.on("connected", listener);
  }

  onSocketConnect(listener: () => void): () => void {
    if (this.connection.isConnected()) {
      queueMicrotask(() => listener());
    }
    return this.connection.on("connect", listener);
  }

  onSocketDisconnect(listener: () => void): () => void {
    return this.connection.on("disconnect", listener);
  }

  onJoinedRoom(listener: ChatEventMap["joined_room"]): () => void {
    return this.on("joined_room", listener as (payload: unknown) => void);
  }

  onLeftRoom(listener: ChatEventMap["left_room"]): () => void {
    return this.on("left_room", listener as (payload: unknown) => void);
  }

  onVisitorMessage(listener: ChatEventMap["visitor_message"]): () => void {
    return this.on("visitor_message", (payload: unknown) => {
      const m = normalizeServerMessage(payload);
      if (m) listener(m);
    });
  }

  /** Raw payload — use when conversationId may be omitted (widget embed). */
  onVisitorMessageRaw(listener: (payload: unknown) => void): () => void {
    return this.on("visitor_message", listener);
  }

  onAgentMessage(listener: ChatEventMap["agent_message"]): () => void {
    return this.on("agent_message", (payload: unknown) => {
      const m = normalizeServerMessage(payload);
      if (m) listener(m);
    });
  }

  onAgentMessageRaw(listener: (payload: unknown) => void): () => void {
    return this.on("agent_message", listener);
  }

  onAiMessage(listener: ChatEventMap["ai_message"]): () => void {
    return this.on("ai_message", (payload: unknown) => {
      const m = normalizeServerMessage(payload);
      if (m) listener(m);
    });
  }

  onAiMessageRaw(listener: (payload: unknown) => void): () => void {
    return this.on("ai_message", listener);
  }

  onTyping(listener: ChatEventMap["typing"]): () => void {
    return this.on("typing", listener as (payload: unknown) => void);
  }

  onStopTyping(listener: ChatEventMap["stop_typing"]): () => void {
    return this.on("stop_typing", listener as (payload: unknown) => void);
  }

  onAiReplyDelta(listener: ChatEventMap["ai_reply_delta"]): () => void {
    return this.on("ai_reply_delta", listener);
  }

  onChatAssigned(listener: ChatEventMap["chat_assigned"]): () => void {
    return this.on("chat_assigned", listener);
  }

  onChatQueued(listener: ChatEventMap["chat_queued"]): () => void {
    return this.on("chat_queued", listener);
  }

  onChatTalkToAgent(listener: ChatEventMap["chat_talk_to_agent"]): () => void {
    return this.on("chat_talk_to_agent", listener);
  }

  onChatResumed(listener: ChatEventMap["chat_resumed"]): () => void {
    return this.on("chat_resumed", listener);
  }

  onChatClosed(listener: ChatEventMap["chat_closed"]): () => void {
    return this.on("chat_closed", listener);
  }

  onChatCompleted(listener: ChatEventMap["chat_completed"]): () => void {
    return this.on("chat_completed", listener);
  }

  onChatWhisper(listener: ChatEventMap["chat_whisper"]): () => void {
    return this.on("chat_whisper", listener);
  }

  onTakeoverRequested(listener: ChatEventMap["takeover_requested"]): () => void {
    return this.on("takeover_requested", listener);
  }

  onTakeoverUpdate(listener: ChatEventMap["takeover_update"]): () => void {
    return this.on("takeover_update", listener);
  }

  onAgentWrapUpForm(listener: ChatEventMap["agent_wrap_up_form"]): () => void {
    return this.on("agent_wrap_up_form", listener);
  }

  onAgentWrapUpRequired(listener: ChatEventMap["agent_wrap_up_required"]): () => void {
    return this.on("agent_wrap_up_required", listener);
  }

  onAgentWrapUpSubmitted(listener: ChatEventMap["agent_wrap_up_submitted"]): () => void {
    return this.on("agent_wrap_up_submitted", listener);
  }

  onAgentDistributionSubmitted(
    listener: ChatEventMap["agent_distribution_submitted"],
  ): () => void {
    return this.on("agent_distribution_submitted", listener);
  }

  onAgentAssignmentPopup(
    listener: ChatEventMap["agent_assignment_popup"],
  ): () => void {
    return this.on("agent_assignment_popup", listener);
  }

  onAgentQueuePopup(listener: ChatEventMap["agent_queue_popup"]): () => void {
    return this.on("agent_queue_popup", listener);
  }

  onMonitorLiveUpdate(listener: ChatEventMap["monitor_live_update"]): () => void {
    return this.on("monitor_live_update", listener);
  }

  onVisitorProfileUpdated(listener: ChatEventMap["visitor_profile_updated"]): () => void {
    return this.on("visitor_profile_updated", listener);
  }

  onChatTransferred(listener: ChatEventMap["chat_transferred"]): () => void {
    return this.on("chat_transferred", listener);
  }

  onSupervisorControl(listener: ChatEventMap["chat_supervisor_control"]): () => void {
    return this.on("chat_supervisor_control", listener);
  }

  onChatHandover(listener: ChatEventMap["chat_handover"]): () => void {
    return this.on("chat_handover", listener);
  }

  onQaQueueUpdated(listener: ChatEventMap["qa_queue_updated"]): () => void {
    return this.on("qa_queue_updated", listener);
  }

  onQaReviewUpdated(listener: ChatEventMap["qa_review_updated"]): () => void {
    return this.on("qa_review_updated", listener);
  }

  isConnected(): boolean {
    return this.connection.isConnected();
  }

  private on<K extends keyof ChatEventMap>(
    event: K,
    listener: ChatEventMap[K],
  ): () => void {
    return this.connection.on<Parameters<ChatEventMap[K]>[0]>(
      event,
      listener as (payload: Parameters<ChatEventMap[K]>[0]) => void,
    );
  }
}

export function createChatSocketClient(): ChatSocketClient {
  return new ChatSocketClient();
}

let sharedLegacyClient: ChatSocketClient | null = null;

/** @deprecated Prefer {@link createChatSocketClient} to avoid leaking state between unrelated surfaces. */
export function getChatSocketClient(): ChatSocketClient {
  if (!sharedLegacyClient) {
    sharedLegacyClient = new ChatSocketClient();
  }
  return sharedLegacyClient;
}
