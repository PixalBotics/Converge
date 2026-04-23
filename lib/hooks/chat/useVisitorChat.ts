"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createConversation, sendVisitorMessage } from "@/services/chat/chatApi";
import { getChatSocketClient } from "@/services/chat/chatSocket";
import type {
  ChatMessage,
  TypingPayload,
  VisitorCreateConversationPayload,
} from "@/services/chat/chat.types";

interface UseVisitorChatOptions {
  autoConnect?: boolean;
}

interface UseVisitorChatReturn {
  conversationId: string | null;
  visitorId: string | null;
  assigned: boolean;
  messages: ChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  startConversation: (payload: VisitorCreateConversationPayload) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  emitTyping: () => void;
  emitStopTyping: () => void;
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
}

function messageKey(message: ChatMessage): string {
  if (message.id) return message.id;
  return `${message.conversationId}:${message.role}:${message.createdAt ?? ""}:${message.content}`;
}

export function useVisitorChat(
  options?: UseVisitorChatOptions,
): UseVisitorChatReturn {
  const socketClient = useMemo(() => getChatSocketClient(), []);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [assigned, setAssigned] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messageMapRef = useRef(new Map<string, ChatMessage>());

  const upsertMessage = useCallback((message: ChatMessage) => {
    const key = messageKey(message);
    if (messageMapRef.current.has(key)) return;
    messageMapRef.current.set(key, message);
    setMessages(Array.from(messageMapRef.current.values()));
  }, []);

  useEffect(() => {
    if (!options?.autoConnect && options?.autoConnect !== undefined) return;

    socketClient.connect();
    setIsConnected(socketClient.isConnected());
    const offSocketConnect = socketClient.onSocketConnect(() => setIsConnected(true));
    const offSocketDisconnect = socketClient.onSocketDisconnect(() =>
      setIsConnected(false),
    );
    const offConnected = socketClient.onConnected(() => setIsConnected(true));
    const offVisitorMessage = socketClient.onVisitorMessage(upsertMessage);
    const offAgentMessage = socketClient.onAgentMessage(upsertMessage);
    const offTyping = socketClient.onTyping((payload: TypingPayload) => {
      if (!conversationId || payload.conversationId !== conversationId) return;
      setIsTyping(true);
    });
    const offStopTyping = socketClient.onStopTyping((payload: TypingPayload) => {
      if (!conversationId || payload.conversationId !== conversationId) return;
      setIsTyping(false);
    });
    const offAssigned = socketClient.onChatAssigned(() => setAssigned(true));
    const offClosed = socketClient.onChatClosed(() => {
      setAssigned(false);
      setIsTyping(false);
    });

    return () => {
      offConnected();
      offSocketConnect();
      offSocketDisconnect();
      offVisitorMessage();
      offAgentMessage();
      offTyping();
      offStopTyping();
      offAssigned();
      offClosed();
    };
  }, [conversationId, options?.autoConnect, socketClient, upsertMessage]);

  const joinRoom = useCallback(
    (roomConversationId: string) => {
      socketClient.joinRoom({ conversationId: roomConversationId, role: "visitor" });
    },
    [socketClient],
  );

  const leaveRoom = useCallback(
    (roomConversationId: string) => {
      socketClient.leaveRoom({ conversationId: roomConversationId, role: "visitor" });
    },
    [socketClient],
  );

  const startConversation = useCallback(
    async (payload: VisitorCreateConversationPayload) => {
      const created = await createConversation(payload);
      setConversationId(created.conversationId);
      setVisitorId(created.visitorId ?? null);
      setAssigned(Boolean(created.assigned));
      socketClient.connect();
      joinRoom(created.conversationId);
    },
    [joinRoom, socketClient],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) {
        throw new Error("Conversation not started. Call startConversation first.");
      }

      const optimisticMessage: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        conversationId,
        content,
        role: "visitor",
        createdAt: new Date().toISOString(),
      };

      upsertMessage(optimisticMessage);
      await sendVisitorMessage(conversationId, { content });
      socketClient.sendVisitorMessage(optimisticMessage);
    },
    [conversationId, socketClient, upsertMessage],
  );

  const emitTyping = useCallback(() => {
    if (!conversationId) return;
    socketClient.emitTyping({ conversationId, role: "visitor", actorId: visitorId ?? undefined });
  }, [conversationId, socketClient, visitorId]);

  const emitStopTyping = useCallback(() => {
    if (!conversationId) return;
    socketClient.emitStopTyping({
      conversationId,
      role: "visitor",
      actorId: visitorId ?? undefined,
    });
  }, [conversationId, socketClient, visitorId]);

  return {
    conversationId,
    visitorId,
    assigned,
    messages,
    isConnected,
    isTyping,
    startConversation,
    sendMessage,
    emitTyping,
    emitStopTyping,
    joinRoom,
    leaveRoom,
  };
}
