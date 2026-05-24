"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createConversation, sendVisitorMessage } from "@/services/chat/chatApi";
import { createChatSocketClient } from "@/services/chat/chatSocket";
import type {
  ChatMessage,
  TypingPayload,
  VisitorCreateConversationPayload,
  VisitorCreateConversationResponse,
} from "@/services/chat/chat.types";

export interface UseVisitorChatOptions {
  autoConnect?: boolean;
  /** Widget session JWT (`POST /widget/session`). Required for authenticated Socket.IO in production. */
  widgetSessionToken?: string | null;
  getCurrentPageUrl?: () => string;
  onChatAssigned?: () => void;
  onChatQueued?: () => void;
}

export interface UseVisitorChatReturn {
  conversationId: string | null;
  visitorId: string | null;
  assigned: boolean;
  messages: ChatMessage[];
  isConnected: boolean;
  /** True when an agent is emitting typing for the active conversation. */
  agentTypingSeen: boolean;
  startConversation: (
    payload: VisitorCreateConversationPayload,
  ) => Promise<VisitorCreateConversationResponse>;
  sendMessage: (
    content: string,
    options?: { messageType?: string },
  ) => Promise<void>;
  emitTyping: () => void;
  emitStopTyping: () => void;
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
}

function stableMessageDedupeKey(message: ChatMessage): string {
  if (message.id) return `id:${message.id}`;
  return `${message.conversationId}:${message.role}:${message.createdAt ?? ""}:${message.content}`;
}

export function useVisitorChat(
  options?: UseVisitorChatOptions,
): UseVisitorChatReturn {
  const socketClient = useMemo(() => createChatSocketClient(), []);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [assigned, setAssigned] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [agentTypingFromOther, setAgentTypingFromOther] = useState(false);
  const messageMapRef = useRef(new Map<string, ChatMessage>());
  const conversationIdRef = useRef<string | null>(null);
  const widgetTokenRef = useRef<string | null | undefined>(
    options?.widgetSessionToken,
  );

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    widgetTokenRef.current = options?.widgetSessionToken;
  }, [options?.widgetSessionToken]);

  const resolvePageUrl = useCallback(() => {
    const fromOpt = options?.getCurrentPageUrl?.();
    if (fromOpt) return fromOpt;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  }, [options]);

  const upsertMessage = useCallback((message: ChatMessage) => {
    const key = stableMessageDedupeKey(message);

    if (message.id && !message.id.startsWith("optimistic-")) {
      const toDelete: string[] = [];
      for (const [k, existing] of messageMapRef.current) {
        if (
          existing.id?.startsWith("optimistic-") &&
          existing.role === message.role &&
          existing.content === message.content &&
          existing.conversationId === message.conversationId
        ) {
          toDelete.push(k);
        }
      }
      toDelete.forEach((k) => messageMapRef.current.delete(k));
    }

    messageMapRef.current.set(key, message);
    setMessages(Array.from(messageMapRef.current.values()));
  }, []);

  useEffect(() => {
    const token = widgetTokenRef.current;
    socketClient.connect({
      authToken: token ?? undefined,
      forceNew: true,
    });
    setIsConnected(socketClient.isConnected());

    const offSocketConnect = socketClient.onSocketConnect(() =>
      setIsConnected(true),
    );
    const offSocketDisconnect = socketClient.onSocketDisconnect(() =>
      setIsConnected(false),
    );
    const offConnected = socketClient.onConnected(() => setIsConnected(true));

    const offVisitorMessage = socketClient.onVisitorMessage(upsertMessage);
    const offAgentMessage = socketClient.onAgentMessage(upsertMessage);
    const offAiMessage = socketClient.onAiMessage(upsertMessage);

    const offTyping = socketClient.onTyping((payload: TypingPayload) => {
      const cid = conversationIdRef.current;
      if (!cid || payload.conversationId !== cid) return;
      if (payload.userType === "agent") setAgentTypingFromOther(true);
    });
    const offStopTyping = socketClient.onStopTyping((payload: TypingPayload) => {
      const cid = conversationIdRef.current;
      if (!cid || payload.conversationId !== cid) return;
      setAgentTypingFromOther(false);
    });

    const getHandlers = () => options ?? {};

    const offAssigned = socketClient.onChatAssigned((payload: unknown) => {
      const cid = conversationIdRef.current;
      if (
        cid &&
        typeof payload === "object" &&
        payload &&
        (payload as { conversationId?: string }).conversationId === cid
      ) {
        setAssigned(true);
        getHandlers().onChatAssigned?.();
      }
    });
    const offQueued = socketClient.onChatQueued((payload: unknown) => {
      const cid = conversationIdRef.current;
      if (
        cid &&
        typeof payload === "object" &&
        payload &&
        (payload as { conversationId?: string }).conversationId === cid
      ) {
        getHandlers().onChatQueued?.();
      }
    });
    const offClosed = socketClient.onChatClosed(() => {
      setAssigned(false);
      setAgentTypingFromOther(false);
    });

    return () => {
      offConnected();
      offSocketConnect();
      offSocketDisconnect();
      offVisitorMessage();
      offAgentMessage();
      offAiMessage();
      offTyping();
      offStopTyping();
      offAssigned();
      offQueued();
      offClosed();
    };
  }, [options, socketClient, upsertMessage]);

  const joinRoom = useCallback(
    (roomConversationId: string) => {
      socketClient.joinRoom({ conversationId: roomConversationId });
    },
    [socketClient],
  );

  const leaveRoom = useCallback(
    (roomConversationId: string) => {
      socketClient.leaveRoom({ conversationId: roomConversationId });
    },
    [socketClient],
  );

  const startConversation = useCallback(
    async (
      payload: VisitorCreateConversationPayload,
    ): Promise<VisitorCreateConversationResponse> => {
      const token = widgetTokenRef.current;
      socketClient.connect({
        authToken: token ?? undefined,
        forceNew: true,
      });

      const created = await createConversation(payload);
      setConversationId(created.conversationId);
      setVisitorId(created.visitorId ?? null);
      setAssigned(created.status === "assigned");
      joinRoom(created.conversationId);
      return created;
    },
    [joinRoom, socketClient],
  );

  const sendMessage = useCallback(
    async (content: string, sendOpts?: { messageType?: string }) => {
      if (!conversationId) {
        throw new Error("Conversation not started. Call startConversation first.");
      }

      const pageUrl = resolvePageUrl();
      const optimisticMessage: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        conversationId,
        content,
        role: "visitor",
        createdAt: new Date().toISOString(),
      };

      upsertMessage(optimisticMessage);
      await sendVisitorMessage(conversationId, {
        message: content,
        currentPageUrl: pageUrl,
        ...(sendOpts?.messageType ? { messageType: sendOpts.messageType } : {}),
      });
    },
    [conversationId, resolvePageUrl, upsertMessage],
  );

  const emitTyping = useCallback(() => {
    if (!conversationId) return;
    socketClient.emitTyping({ conversationId, userType: "visitor" });
  }, [conversationId, socketClient]);

  const emitStopTyping = useCallback(() => {
    if (!conversationId) return;
    socketClient.emitStopTyping({ conversationId, userType: "visitor" });
  }, [conversationId, socketClient]);

  return {
    conversationId,
    visitorId,
    assigned,
    messages,
    isConnected,
    agentTypingSeen: agentTypingFromOther,
    startConversation,
    sendMessage,
    emitTyping,
    emitStopTyping,
    joinRoom,
    leaveRoom,
  };
}
