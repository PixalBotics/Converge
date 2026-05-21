import type { Socket } from "socket.io-client";
import {
  buildSocketUrl,
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
  chat_whisper: (payload: unknown) => void;
  takeover_requested: (payload: unknown) => void;
  takeover_update: (payload: unknown) => void;
  agent_wrap_up_form: (payload: unknown) => void;
  agent_wrap_up_required: (payload: unknown) => void;
  agent_wrap_up_submitted: (payload: unknown) => void;
  agent_assignment_popup: (payload: unknown) => void;
  agent_queue_popup: (payload: unknown) => void;
  monitor_live_update: (payload: MonitorLiveUpdatePayload) => void;
  visitor_profile_updated: (payload: unknown) => void;
  chat_handover: (payload: unknown) => void;
};

export interface ChatSocketOptions {
  authToken?: string;
  forceNew?: boolean;
}

const chatSocketEndpoint = resolveSocketEndpoint({
  envBaseUrl: process.env.NEXT_PUBLIC_CHAT_SOCKET_BASE_URL,
  envFallbackBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  envNamespace: process.env.NEXT_PUBLIC_CHAT_SOCKET_NAMESPACE,
  defaultNamespace: "/chat",
});

export class ChatSocketClient {
  private connection = new SocketConnection(buildSocketUrl(chatSocketEndpoint));
  private joinedRooms = new Set<string>();

  connect(options?: ChatSocketOptions): Socket {
    const existing = this.connection.getSocket();
    if (existing?.connected && !options?.forceNew) return existing;

    const socket = this.connection.connect({
      authToken: options?.authToken,
      forceNew: options?.forceNew,
    });

    socket.off("connect", this.handleConnect);
    socket.on("connect", this.handleConnect);
    return socket;
  }

  private handleConnect = (): void => {
    this.joinedRooms.forEach((conversationId) => {
      this.joinRoom({ conversationId });
    });
  };

  disconnect(): void {
    this.joinedRooms.clear();
    this.connection.disconnect(true);
  }

  joinRoom(payload: JoinLeaveRoomPayload): void {
    this.joinedRooms.add(payload.conversationId);
    this.connection.emit("join_room", { conversationId: payload.conversationId });
  }

  leaveRoom(payload: JoinLeaveRoomPayload): void {
    this.joinedRooms.delete(payload.conversationId);
    this.connection.emit("leave_room", { conversationId: payload.conversationId });
  }

  sendVisitorMessage(payload: SocketVisitorMessagePayload): void {
    this.connection.emit("visitor_message", payload);
  }

  sendAgentMessage(payload: SocketAgentMessagePayload): void {
    const body: Record<string, unknown> = {
      conversationId: payload.conversationId,
      message: payload.message,
    };
    if (payload.agentId !== undefined && payload.agentId !== "") {
      body.agentId = payload.agentId;
    }
    this.connection.emit("agent_message", body);
  }

  emitTyping(payload: SocketTypingEmitPayload): void {
    const body: Record<string, unknown> = { conversationId: payload.conversationId };
    if (payload.userType !== undefined) body.userType = payload.userType;
    if (payload.userId !== undefined) body.userId = payload.userId;
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
    const socket = this.connection.getSocket();
    socket?.on("connect", listener);
    return () => socket?.off("connect", listener);
  }

  onSocketDisconnect(listener: () => void): () => void {
    const socket = this.connection.getSocket();
    socket?.on("disconnect", listener);
    return () => socket?.off("disconnect", listener);
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

  onAgentMessage(listener: ChatEventMap["agent_message"]): () => void {
    return this.on("agent_message", (payload: unknown) => {
      const m = normalizeServerMessage(payload);
      if (m) listener(m);
    });
  }

  onAiMessage(listener: ChatEventMap["ai_message"]): () => void {
    return this.on("ai_message", (payload: unknown) => {
      const m = normalizeServerMessage(payload);
      if (m) listener(m);
    });
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

  onChatHandover(listener: ChatEventMap["chat_handover"]): () => void {
    return this.on("chat_handover", listener);
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
