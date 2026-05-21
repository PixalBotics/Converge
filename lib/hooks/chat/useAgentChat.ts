"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  closeConversation,
  getConversationHistory,
  sendAgentMessage,
} from "@/services/chat/agent-inbox.api";
import { getSharedAgentChatSocket } from "@/services/chat/sharedAgentChatSocket";
import { normalizeServerMessage } from "@/services/chat/normalize-message";
import type { ChatWhisperSocketPayload } from "@/services/chat/supervisor.types";
import type { AgentWrapUpPayload } from "@/services/chat/wrap-up.types";
import type { ChatMessage, ConversationSummary } from "@/services/chat/chat.types";
import {
  conversationIdFromSocketPayload,
  sortMessagesChronologically,
  stableMessageDedupeKey,
} from "./agent-chat.utils";
import { useAgentInboxQueues } from "./useAgentInboxQueues";
import { useAgentChatSocket } from "./useAgentChatSocket";

interface UseAgentChatParams {
  token: string;
  agentId?: string;
}

export interface UseAgentChatReturn {
  activeChats: ConversationSummary[];
  waitingChats: ConversationSummary[];
  closedChats: ConversationSummary[];
  selectedConversationId: string | null;
  selectedIsClosed: boolean;
  atActiveCap: boolean;
  messages: ChatMessage[];
  visitorFromHistory: Record<string, unknown> | null;
  isConnected: boolean;
  visitorTypingSelected: boolean;
  refreshQueues: () => Promise<void>;
  selectConversation: (conversationId: string, options?: { readOnly?: boolean }) => Promise<void>;
  sendMessage: (content: string, options?: { messageType?: string }) => Promise<void>;
  closeSelectedConversation: () => Promise<void>;
  emitTyping: () => void;
  emitStopTyping: () => void;
  pendingWrapUp: AgentWrapUpPayload | null;
  dismissWrapUp: () => void;
  activeWhisper: ChatWhisperSocketPayload | null;
  dismissWhisper: () => void;
  onSupervisorActivity: () => void;
  supervisorRefreshToken: number;
}

export function useAgentChat(params: UseAgentChatParams): UseAgentChatReturn {
  const socketClient = useMemo(() => getSharedAgentChatSocket(), []);
  const queues = useAgentInboxQueues(params.token);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedIsClosed, setSelectedIsClosed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visitorFromHistory, setVisitorFromHistory] =
    useState<Record<string, unknown> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [visitorTypingSelected, setVisitorTypingSelected] = useState(false);
  const [pendingWrapUp, setPendingWrapUp] = useState<AgentWrapUpPayload | null>(null);
  const [activeWhisper, setActiveWhisper] = useState<ChatWhisperSocketPayload | null>(null);
  const [supervisorTick, setSupervisorTick] = useState(0);

  const messageMapRef = useRef(new Map<string, ChatMessage>());
  const selectedConversationIdRef = useRef<string | null>(null);
  const selectedIsClosedRef = useRef(false);
  const selectConversationRef = useRef<
    (id: string, opts?: { readOnly?: boolean }) => Promise<void>
  >(async () => {});

  const extractWrapUp = useCallback((payload: unknown): AgentWrapUpPayload | null => {
    if (typeof payload !== "object" || !payload) return null;
    const o = payload as Record<string, unknown>;
    if (o.wrapUp && typeof o.wrapUp === "object") return o.wrapUp as AgentWrapUpPayload;
    if (o.conversationId && (o.requiresAgentWrapUp || o.chatCompleted)) {
      return o as AgentWrapUpPayload;
    }
    return null;
  }, []);

  const closedIdSet = useMemo(
    () => new Set(queues.closedChats.map((c) => c.id)),
    [queues.closedChats],
  );

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    selectedIsClosedRef.current = selectedIsClosed;
  }, [selectedIsClosed]);

  const syncMessagesFromMap = useCallback(() => {
    setMessages(sortMessagesChronologically(Array.from(messageMapRef.current.values())));
  }, []);

  const upsertMessage = useCallback(
    (message: ChatMessage) => {
      if (selectedIsClosedRef.current) return;

      if (message.id && !message.id.startsWith("optimistic-")) {
        for (const [k, existing] of messageMapRef.current) {
          if (
            existing.id?.startsWith("optimistic-") &&
            existing.role === message.role &&
            existing.content === message.content &&
            existing.conversationId === message.conversationId
          ) {
            messageMapRef.current.delete(k);
          }
        }
      }

      messageMapRef.current.set(stableMessageDedupeKey(message), message);
      syncMessagesFromMap();
    },
    [syncMessagesFromMap],
  );

  const clearSelection = useCallback(() => {
    const prevId = selectedConversationIdRef.current;
    if (prevId && !selectedIsClosedRef.current) {
      socketClient.leaveRoom({ conversationId: prevId });
    }
    setSelectedConversationId(null);
    setSelectedIsClosed(false);
    selectedIsClosedRef.current = false;
    setVisitorTypingSelected(false);
    messageMapRef.current.clear();
    setMessages([]);
    setVisitorFromHistory(null);
  }, [socketClient]);

  const handleSessionEnded = useCallback(
    (payload: unknown) => {
      setVisitorTypingSelected(false);
      void queues.refreshQueues();
      const endedId = conversationIdFromSocketPayload(payload);
      const wrapUp = extractWrapUp(payload);

      if (endedId && endedId === selectedConversationIdRef.current) {
        setSelectedIsClosed(true);
        selectedIsClosedRef.current = true;
        if (wrapUp?.requiresAgentWrapUp && !wrapUp.wrapUpSubmitted) {
          setPendingWrapUp(wrapUp);
        } else {
          clearSelection();
        }
      }
    },
    [clearSelection, extractWrapUp, queues.refreshQueues],
  );

  const handleChatWhisper = useCallback(
    (payload: unknown) => {
      if (typeof payload !== "object" || !payload) return;
      const p = payload as ChatWhisperSocketPayload;
      if (p.conversationId !== selectedConversationIdRef.current) return;
      if (p.whisper?.toUserId && params.agentId && p.whisper.toUserId === params.agentId) {
        setActiveWhisper(p);
      }
      setSupervisorTick((n) => n + 1);
    },
    [params.agentId],
  );

  const handleTakeoverActivity = useCallback(() => {
    void queues.refreshQueues();
    setSupervisorTick((n) => n + 1);
    const cid = selectedConversationIdRef.current;
    if (cid) void selectConversationRef.current(cid, { readOnly: selectedIsClosedRef.current });
  }, [queues.refreshQueues]);

  const handleChatResumed = useCallback(
    async (payload: unknown) => {
      await queues.refreshQueues();
      const resumedId = conversationIdFromSocketPayload(payload);
      if (
        resumedId &&
        resumedId === selectedConversationIdRef.current &&
        selectedIsClosedRef.current
      ) {
        setSelectedIsClosed(false);
        selectedIsClosedRef.current = false;
        socketClient.joinRoom({ conversationId: resumedId });
      }
    },
    [queues.refreshQueues, socketClient],
  );

  const refreshQueuesRef = useRef(queues.refreshQueues);
  refreshQueuesRef.current = queues.refreshQueues;

  const handleAgentWrapUpForm = useCallback(
    (p: unknown) => {
      const wrapUp =
        extractWrapUp(p) ?? (typeof p === "object" && p ? (p as AgentWrapUpPayload) : null);
      if (wrapUp?.requiresAgentWrapUp && !wrapUp.wrapUpSubmitted) {
        setPendingWrapUp(wrapUp);
      }
    },
    [extractWrapUp],
  );

  useAgentChatSocket(
    params.token,
    socketClient,
    {
      onVisitorMessage: upsertMessage,
      onRefreshQueues: () => void refreshQueuesRef.current(),
      onSessionEnded: handleSessionEnded,
      onChatResumed: handleChatResumed,
      onVisitorTyping: setVisitorTypingSelected,
      onChatWhisper: handleChatWhisper,
      onTakeoverRequested: handleTakeoverActivity,
      onTakeoverUpdate: handleTakeoverActivity,
      onChatTransferred: handleTakeoverActivity,
      onAgentWrapUpForm: handleAgentWrapUpForm,
      onAgentWrapUpSubmitted: (p) => {
        const cid = conversationIdFromSocketPayload(p);
        setPendingWrapUp((prev) => {
          if (!prev) return null;
          if (cid && prev.conversationId && prev.conversationId !== cid) return prev;
          return null;
        });
      },
      selectedConversationIdRef,
      selectedIsClosedRef,
    },
    setIsConnected,
  );

  const selectConversation = useCallback(
    async (conversationId: string, options?: { readOnly?: boolean }) => {
      const readOnly = options?.readOnly === true || closedIdSet.has(conversationId);

      const prevId = selectedConversationIdRef.current;
      if (prevId && prevId !== conversationId && !selectedIsClosedRef.current) {
        socketClient.leaveRoom({ conversationId: prevId });
      }

      setSelectedConversationId(conversationId);
      setSelectedIsClosed(readOnly);
      selectedIsClosedRef.current = readOnly;
      setVisitorTypingSelected(false);

      if (!readOnly) {
        socketClient.joinRoom({ conversationId });
      }

      const history = await getConversationHistory(conversationId, params.token);
      messageMapRef.current.clear();
      for (const msg of history.messages) {
        messageMapRef.current.set(stableMessageDedupeKey(msg), msg);
      }
      syncMessagesFromMap();

      const v = history.visitor;
      setVisitorFromHistory(
        typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null,
      );
    },
    [closedIdSet, params.token, socketClient, syncMessagesFromMap],
  );

  useEffect(() => {
    selectConversationRef.current = selectConversation;
  }, [selectConversation]);

  const sendMessage = useCallback(
    async (content: string, sendOpts?: { messageType?: string }) => {
      if (!selectedConversationId || selectedIsClosed) {
        throw new Error("Select an active conversation before sending a message.");
      }

      upsertMessage({
        id: `optimistic-${Date.now()}`,
        conversationId: selectedConversationId,
        content,
        role: "agent",
        senderId: params.agentId,
        createdAt: new Date().toISOString(),
      });

      const response = await sendAgentMessage(
        selectedConversationId,
        {
          message: content,
          ...(sendOpts?.messageType ? { messageType: sendOpts.messageType } : {}),
        },
        params.token,
      );

      const persisted =
        normalizeServerMessage(response) ??
        (response &&
        typeof response === "object" &&
        "message" in response
          ? normalizeServerMessage((response as { message: unknown }).message)
          : null);
      if (persisted) upsertMessage(persisted);
    },
    [params.agentId, params.token, selectedConversationId, selectedIsClosed, upsertMessage],
  );

  const closeSelectedConversation = useCallback(async () => {
    if (!selectedConversationId || selectedIsClosed) return;

    const closingId = selectedConversationId;
    const closed = await closeConversation(closingId, params.token);
    setSelectedIsClosed(true);
    selectedIsClosedRef.current = true;
    setVisitorTypingSelected(false);
    await queues.refreshQueues();

    const nextId =
      closed.reassigned && typeof closed.reassigned.conversationId === "string"
        ? closed.reassigned.conversationId
        : null;

    if (nextId) {
      setPendingWrapUp(null);
      await selectConversation(nextId, { readOnly: false });
      return;
    }
  }, [params.token, queues, selectConversation, selectedConversationId, selectedIsClosed]);

  const emitTyping = useCallback(() => {
    if (!selectedConversationId || selectedIsClosed) return;
    socketClient.emitTyping({
      conversationId: selectedConversationId,
      userType: "agent",
      ...(params.agentId ? { userId: params.agentId } : {}),
    });
  }, [params.agentId, selectedConversationId, selectedIsClosed, socketClient]);

  const emitStopTyping = useCallback(() => {
    if (!selectedConversationId || selectedIsClosed) return;
    socketClient.emitStopTyping({
      conversationId: selectedConversationId,
      userType: "agent",
      ...(params.agentId ? { userId: params.agentId } : {}),
    });
  }, [params.agentId, selectedConversationId, selectedIsClosed, socketClient]);

  return {
    activeChats: queues.activeChats,
    waitingChats: queues.waitingChats,
    closedChats: queues.closedChats,
    selectedConversationId,
    selectedIsClosed,
    atActiveCap: queues.atActiveCap,
    messages,
    visitorFromHistory,
    isConnected,
    visitorTypingSelected,
    refreshQueues: queues.refreshQueues,
    selectConversation,
    sendMessage,
    closeSelectedConversation,
    emitTyping,
    emitStopTyping,
    pendingWrapUp,
    dismissWrapUp: () => {
      setPendingWrapUp(null);
      clearSelection();
    },
    activeWhisper,
    dismissWhisper: () => setActiveWhisper(null),
    onSupervisorActivity: () => setSupervisorTick((n) => n + 1),
    supervisorRefreshToken: supervisorTick,
  };
}
