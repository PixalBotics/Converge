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
  SocketVisitorMessagePayload,
  TypingPayload,
} from "./chat.types";
import { normalizeServerMessage } from "./normalize-message";

type ChatEventMap = {
  connected: (payload: unknown) => void;
  joined_room: (payload: JoinLeaveRoomPayload) => void;
  left_room: (payload: JoinLeaveRoomPayload) => void;
  visitor_message: (payload: ChatMessage) => void;
  agent_message: (payload: ChatMessage) => void;
  typing: (payload: TypingPayload) => void;
  stop_typing: (payload: TypingPayload) => void;
  chat_assigned: (payload: unknown) => void;
  chat_closed: (payload: unknown) => void;
  agent_assignment_popup: (payload: unknown) => void;
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
    this.connection.emit("agent_message", payload);
  }

  emitTyping(payload: Pick<TypingPayload, "conversationId">): void {
    this.connection.emit("typing", { conversationId: payload.conversationId });
  }

  emitStopTyping(payload: Pick<TypingPayload, "conversationId">): void {
    this.connection.emit("stop_typing", { conversationId: payload.conversationId });
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

  onTyping(listener: ChatEventMap["typing"]): () => void {
    return this.on("typing", listener as (payload: unknown) => void);
  }

  onStopTyping(listener: ChatEventMap["stop_typing"]): () => void {
    return this.on("stop_typing", listener as (payload: unknown) => void);
  }

  onChatAssigned(listener: ChatEventMap["chat_assigned"]): () => void {
    return this.on("chat_assigned", listener);
  }

  onChatClosed(listener: ChatEventMap["chat_closed"]): () => void {
    return this.on("chat_closed", listener);
  }

  onAgentAssignmentPopup(
    listener: ChatEventMap["agent_assignment_popup"],
  ): () => void {
    return this.on("agent_assignment_popup", listener);
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
