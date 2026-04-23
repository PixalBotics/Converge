import type { Socket } from "socket.io-client";
import {
  buildSocketUrl,
  resolveSocketEndpoint,
  SocketConnection,
} from "@/services/socket";
import type { ChatMessage, JoinLeaveRoomPayload, TypingPayload } from "./chat.types";

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
    this.connection.emit("join_room", payload);
  }

  leaveRoom(payload: JoinLeaveRoomPayload): void {
    this.joinedRooms.delete(payload.conversationId);
    this.connection.emit("leave_room", payload);
  }

  sendVisitorMessage(payload: ChatMessage): void {
    this.connection.emit("visitor_message", payload);
  }

  sendAgentMessage(payload: ChatMessage): void {
    this.connection.emit("agent_message", payload);
  }

  emitTyping(payload: TypingPayload): void {
    this.connection.emit("typing", payload);
  }

  emitStopTyping(payload: TypingPayload): void {
    this.connection.emit("stop_typing", payload);
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
    return this.on("joined_room", listener);
  }

  onLeftRoom(listener: ChatEventMap["left_room"]): () => void {
    return this.on("left_room", listener);
  }

  onVisitorMessage(listener: ChatEventMap["visitor_message"]): () => void {
    return this.on("visitor_message", listener);
  }

  onAgentMessage(listener: ChatEventMap["agent_message"]): () => void {
    return this.on("agent_message", listener);
  }

  onTyping(listener: ChatEventMap["typing"]): () => void {
    return this.on("typing", listener);
  }

  onStopTyping(listener: ChatEventMap["stop_typing"]): () => void {
    return this.on("stop_typing", listener);
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

let sharedChatSocket: ChatSocketClient | null = null;

export function getChatSocketClient(): ChatSocketClient {
  if (!sharedChatSocket) {
    sharedChatSocket = new ChatSocketClient();
  }
  return sharedChatSocket;
}
