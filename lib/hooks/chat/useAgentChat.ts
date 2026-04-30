"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  closeConversation,
  getConversationHistory,
  getMyActiveChats,
  getWaitingChats,
  sendAgentMessage,
} from "@/services/chat/chatApi";
import { getChatSocketClient } from "@/services/chat/chatSocket";
import type {
  ChatMessage,
  ConversationSummary,
  TypingPayload,
} from "@/services/chat/chat.types";

interface UseAgentChatParams {
  token: string;
  agentId?: string;
}

interface UseAgentChatReturn {
  activeChats: ConversationSummary[];
  waitingChats: ConversationSummary[];
  selectedConversationId: string | null;
  messages: ChatMessage[];
  isConnected: boolean;
  typingByConversation: Record<string, boolean>;
  refreshQueues: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  closeSelectedConversation: () => Promise<void>;
  emitTyping: () => void;
  emitStopTyping: () => void;
}

function messageKey(message: ChatMessage): string {
  if (message.id) return message.id;
  return `${message.conversationId}:${message.role}:${message.createdAt ?? ""}:${message.content}`;
}

export function useAgentChat(params: UseAgentChatParams): UseAgentChatReturn {
  const socketClient = useMemo(() => getChatSocketClient(), []);
  const [activeChats, setActiveChats] = useState<ConversationSummary[]>([]);
  const [waitingChats, setWaitingChats] = useState<ConversationSummary[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingByConversation, setTypingByConversation] = useState<Record<string, boolean>>(
    {},
  );
  const messageMapRef = useRef(new Map<string, ChatMessage>());
  const selectedConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const upsertMessage = useCallback((message: ChatMessage) => {
    const key = messageKey(message);
    if (messageMapRef.current.has(key)) return;
    messageMapRef.current.set(key, message);
    setMessages(Array.from(messageMapRef.current.values()));
  }, []);

  const refreshQueues = useCallback(async () => {
    const token = params.token?.trim();
    if (!token) {
      setActiveChats([]);
      setWaitingChats([]);
      return;
    }
    try {
      const [active, waiting] = await Promise.all([
        getMyActiveChats(token),
        getWaitingChats(token),
      ]);
      setActiveChats(active);
      setWaitingChats(waiting);
    } catch {
      setActiveChats([]);
      setWaitingChats([]);
    }
  }, [params.token]);

  useEffect(() => {
    const token = params.token?.trim();
    if (!token) {
      setIsConnected(false);
      return;
    }

    socketClient.connect({ authToken: token, forceNew: true });
    setIsConnected(socketClient.isConnected());

    const offSocketConnect = socketClient.onSocketConnect(() => setIsConnected(true));
    const offSocketDisconnect = socketClient.onSocketDisconnect(() =>
      setIsConnected(false),
    );
    const offConnected = socketClient.onConnected(() => {
      setIsConnected(true);
      void refreshQueues();
    });
    const offVisitorMessage = socketClient.onVisitorMessage(upsertMessage);
    const offAgentMessage = socketClient.onAgentMessage(upsertMessage);
    const isVisitorTyping = (payload: TypingPayload) =>
      payload.role === "visitor" || payload.role === undefined;
    const offTyping = socketClient.onTyping((payload: TypingPayload) => {
      if (!isVisitorTyping(payload)) return;
      setTypingByConversation((prev) => ({ ...prev, [payload.conversationId]: true }));
    });
    const offStopTyping = socketClient.onStopTyping((payload: TypingPayload) => {
      if (!isVisitorTyping(payload)) return;
      setTypingByConversation((prev) => ({ ...prev, [payload.conversationId]: false }));
    });
    const offAssigned = socketClient.onChatAssigned(() => void refreshQueues());
    const offPopup = socketClient.onAgentAssignmentPopup(() => void refreshQueues());
    const offClosed = socketClient.onChatClosed((payload: unknown) => {
      setTypingByConversation({});
      void refreshQueues();
      const maybeConversationId =
        typeof payload === "object" &&
        payload &&
        "conversationId" in payload &&
        typeof (payload as { conversationId?: unknown }).conversationId === "string"
          ? (payload as { conversationId: string }).conversationId
          : null;
      if (
        maybeConversationId &&
        maybeConversationId === selectedConversationIdRef.current
      ) {
        setSelectedConversationId(null);
        messageMapRef.current.clear();
        setMessages([]);
      }
    });

    void refreshQueues();

    return () => {
      offConnected();
      offSocketConnect();
      offSocketDisconnect();
      offVisitorMessage();
      offAgentMessage();
      offTyping();
      offStopTyping();
      offAssigned();
      offPopup();
      offClosed();
    };
  }, [params.token, refreshQueues, socketClient, upsertMessage]);

  const selectConversation = useCallback(
    async (conversationId: string) => {
      const token = params.token?.trim();
      if (!token) return;

      if (selectedConversationId) {
        socketClient.leaveRoom({ conversationId: selectedConversationId, role: "agent" });
      }

      setSelectedConversationId(conversationId);
      socketClient.joinRoom({
        conversationId,
        role: "agent",
        userId: params.agentId,
      });

      try {
        const history = await getConversationHistory(conversationId, token);
        messageMapRef.current.clear();
        history.messages.forEach((message) => {
          messageMapRef.current.set(messageKey(message), message);
        });
        setMessages(Array.from(messageMapRef.current.values()));
      } catch {
        messageMapRef.current.clear();
        setMessages([]);
      }
    },
    [params.agentId, params.token, selectedConversationId, socketClient],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const token = params.token?.trim();
      if (!selectedConversationId || !token) {
        throw new Error("Select a conversation before sending a message.");
      }

      const optimisticMessage: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        conversationId: selectedConversationId,
        content,
        role: "agent",
        senderId: params.agentId,
        createdAt: new Date().toISOString(),
      };

      upsertMessage(optimisticMessage);
      await sendAgentMessage(
        selectedConversationId,
        { content, agentId: params.agentId },
        token,
      );
      socketClient.sendAgentMessage(optimisticMessage);
    },
    [params.agentId, params.token, selectedConversationId, socketClient, upsertMessage],
  );

  const closeSelectedConversation = useCallback(async () => {
    const token = params.token?.trim();
    if (!selectedConversationId || !token) return;

    await closeConversation(selectedConversationId, token);
    socketClient.leaveRoom({ conversationId: selectedConversationId, role: "agent" });
    setSelectedConversationId(null);
    messageMapRef.current.clear();
    setMessages([]);
    await refreshQueues();
  }, [params.token, refreshQueues, selectedConversationId, socketClient]);

  const emitTyping = useCallback(() => {
    if (!selectedConversationId) return;
    socketClient.emitTyping({
      conversationId: selectedConversationId,
      role: "agent",
      actorId: params.agentId,
    });
  }, [params.agentId, selectedConversationId, socketClient]);

  const emitStopTyping = useCallback(() => {
    if (!selectedConversationId) return;
    socketClient.emitStopTyping({
      conversationId: selectedConversationId,
      role: "agent",
      actorId: params.agentId,
    });
  }, [params.agentId, selectedConversationId, socketClient]);

  return {
    activeChats,
    waitingChats,
    selectedConversationId,
    messages,
    isConnected,
    typingByConversation,
    refreshQueues,
    selectConversation,
    sendMessage,
    closeSelectedConversation,
    emitTyping,
    emitStopTyping,
  };
}
