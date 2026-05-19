"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  closeConversation,
  getConversationHistory,
  getMyActiveChats,
  getWaitingChats,
  sendAgentMessage,
} from "@/services/chat/chatApi";
import { createChatSocketClient } from "@/services/chat/chatSocket";
import type {
  ChatMessage,
  TypingPayload,
} from "@/services/chat/chat.types";

interface UseAgentChatParams {
  token: string;
  agentId?: string;
}

interface UseAgentChatReturn {
  activeChats: import("@/services/chat/chat.types").ConversationSummary[];
  waitingChats: import("@/services/chat/chat.types").ConversationSummary[];
  selectedConversationId: string | null;
  messages: ChatMessage[];
  visitorFromHistory: Record<string, unknown> | null;
  isConnected: boolean;
  visitorTypingSelected: boolean;
  refreshQueues: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, options?: { messageType?: string }) => Promise<void>;
  closeSelectedConversation: () => Promise<void>;
  emitTyping: () => void;
  emitStopTyping: () => void;
}

function stableMessageDedupeKey(message: ChatMessage): string {
  if (message.id) return `id:${message.id}`;
  return `${message.conversationId}:${message.role}:${message.createdAt ?? ""}:${message.content}`;
}

const POLL_MS = 12_000;

export function useAgentChat(params: UseAgentChatParams): UseAgentChatReturn {
  const socketClient = useMemo(() => createChatSocketClient(), []);
  const [activeChats, setActiveChats] = useState<
    import("@/services/chat/chat.types").ConversationSummary[]
  >([]);
  const [waitingChats, setWaitingChats] = useState<
    import("@/services/chat/chat.types").ConversationSummary[]
  >([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visitorFromHistory, setVisitorFromHistory] =
    useState<Record<string, unknown> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [visitorTypingSelected, setVisitorTypingSelected] = useState(false);

  const messageMapRef = useRef(new Map<string, ChatMessage>());
  const selectedConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

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

  const refreshQueues = useCallback(async () => {
    const [active, waiting] = await Promise.all([
      getMyActiveChats(params.token),
      getWaitingChats(params.token),
    ]);
    setActiveChats(active);
    setWaitingChats(waiting);
  }, [params.token]);

  useEffect(() => {
    socketClient.connect({ authToken: params.token, forceNew: true });
    setIsConnected(socketClient.isConnected());

    const offSocketConnect = socketClient.onSocketConnect(() =>
      setIsConnected(true),
    );
    const offSocketDisconnect = socketClient.onSocketDisconnect(() =>
      setIsConnected(false),
    );
    const offConnected = socketClient.onConnected(() => {
      setIsConnected(true);
      void refreshQueues();
    });

    const offVisitorMessage = socketClient.onVisitorMessage((m) =>
      upsertMessage(m),
    );
    const offAgentMessage = socketClient.onAgentMessage((m) => upsertMessage(m));
    const offAiMessage = socketClient.onAiMessage((m) => upsertMessage(m));

    const offTyping = socketClient.onTyping((payload: TypingPayload) => {
      const cid = selectedConversationIdRef.current;
      if (!cid || payload.conversationId !== cid) return;
      if (payload.userType === "visitor" || payload.userType == null)
        setVisitorTypingSelected(true);
    });
    const offStopTyping = socketClient.onStopTyping((payload: TypingPayload) => {
      const cid = selectedConversationIdRef.current;
      if (!cid || payload.conversationId !== cid) return;
      setVisitorTypingSelected(false);
    });

    const offAssigned = socketClient.onChatAssigned(() => void refreshQueues());
    const offPopup = socketClient.onAgentAssignmentPopup(() =>
      void refreshQueues(),
    );
    const offClosed = socketClient.onChatClosed((payload: unknown) => {
      setVisitorTypingSelected(false);
      void refreshQueues();

      let maybeConversationId: string | null = null;
      if (
        typeof payload === "object" &&
        payload &&
        "conversationId" in payload &&
        typeof (payload as { conversationId?: unknown }).conversationId ===
          "string"
      ) {
        maybeConversationId = (payload as { conversationId: string })
          .conversationId;
      }
      if (
        maybeConversationId &&
        maybeConversationId === selectedConversationIdRef.current
      ) {
        setSelectedConversationId(null);
        messageMapRef.current.clear();
        setMessages([]);
        setVisitorFromHistory(null);
      }
    });

    const offTransferred = socketClient.onChatTransferred(() => void refreshQueues());
    const offHandover = socketClient.onChatHandover(() => void refreshQueues());

    void refreshQueues();
    const poll = window.setInterval(() => void refreshQueues(), POLL_MS);

    return () => {
      window.clearInterval(poll);
      offConnected();
      offSocketConnect();
      offSocketDisconnect();
      offVisitorMessage();
      offAgentMessage();
      offAiMessage();
      offTyping();
      offStopTyping();
      offAssigned();
      offPopup();
      offClosed();
      offTransferred();
      offHandover();
      socketClient.disconnect();
    };
  }, [params.token, refreshQueues, socketClient, upsertMessage]);

  const selectConversation = useCallback(
    async (conversationId: string) => {
      if (selectedConversationId) {
        socketClient.leaveRoom({ conversationId: selectedConversationId });
      }

      setSelectedConversationId(conversationId);
      setVisitorTypingSelected(false);
      socketClient.joinRoom({
        conversationId,
      });

      const history = await getConversationHistory(
        conversationId,
        params.token,
      );

      messageMapRef.current.clear();
      history.messages.forEach((msg) =>
        messageMapRef.current.set(stableMessageDedupeKey(msg), msg),
      );
      setMessages(Array.from(messageMapRef.current.values()));

      const v = history.visitor;
      setVisitorFromHistory(
        typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null,
      );
    },
    [params.token, selectedConversationId, socketClient],
  );

  const sendMessage = useCallback(
    async (content: string, sendOpts?: { messageType?: string }) => {
      if (!selectedConversationId) {
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
        {
          message: content,
          ...(sendOpts?.messageType ? { messageType: sendOpts.messageType } : {}),
        },
        params.token,
      );
      socketClient.sendAgentMessage({
        conversationId: selectedConversationId,
        message: content,
        ...(params.agentId ? { agentId: params.agentId } : {}),
      });
    },
    [params.agentId, params.token, selectedConversationId, socketClient, upsertMessage],
  );

  const closeSelectedConversation = useCallback(async () => {
    if (!selectedConversationId) return;

    const closed = await closeConversation(selectedConversationId, params.token);
    socketClient.leaveRoom({ conversationId: selectedConversationId });

    const nextConversationId =
      closed.reassigned && typeof closed.reassigned.conversationId === "string"
        ? closed.reassigned.conversationId
        : null;

    setSelectedConversationId(null);
    messageMapRef.current.clear();
    setMessages([]);
    setVisitorFromHistory(null);
    await refreshQueues();

    if (nextConversationId) await selectConversation(nextConversationId);
  }, [
    params.token,
    refreshQueues,
    selectConversation,
    selectedConversationId,
    socketClient,
  ]);

  const emitTyping = useCallback(() => {
    if (!selectedConversationId) return;
    socketClient.emitTyping({
      conversationId: selectedConversationId,
      userType: "agent",
      ...(params.agentId ? { userId: params.agentId } : {}),
    });
  }, [params.agentId, selectedConversationId, socketClient]);

  const emitStopTyping = useCallback(() => {
    if (!selectedConversationId) return;
    socketClient.emitStopTyping({
      conversationId: selectedConversationId,
      userType: "agent",
      ...(params.agentId ? { userId: params.agentId } : {}),
    });
  }, [params.agentId, selectedConversationId, socketClient]);

  return {
    activeChats,
    waitingChats,
    selectedConversationId,
    messages,
    visitorFromHistory,
    isConnected,
    visitorTypingSelected,
    refreshQueues,
    selectConversation,
    sendMessage,
    closeSelectedConversation,
    emitTyping,
    emitStopTyping,
  };
}
