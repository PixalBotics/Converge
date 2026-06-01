"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  closeConversation,
  getConversationHistory,
  sendAgentMessage,
} from "@/services/chat/agent-inbox.api";
import { sendSupervisorControlMessage } from "@/services/chat/supervisor.api";
import { fetchAgentWrapUp } from "@/services/chat/wrap-up.api";
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
import {
  CHAT_DISCONNECTED_SYNC_MS,
  CHAT_RECONNECT_SYNC_DEBOUNCE_MS,
  scheduleJoinRoomRetries,
} from "./chat-socket-delivery";
import { subscribeAgentChatMessageSync } from "./agent-chat-message-sync-bus";
import { useAgentInboxQueues } from "./useAgentInboxQueues";
import { useAgentChatSocket } from "./useAgentChatSocket";

interface UseAgentChatParams {
  token: string;
  agentId?: string;
  /** False when user lacks `page:chat` + `chat:access` — no agent APIs or socket. */
  apiEnabled?: boolean;
}

export interface UseAgentChatReturn {
  activeChats: ConversationSummary[];
  waitingChats: ConversationSummary[];
  closedChats: ConversationSummary[];
  selectedConversationId: string | null;
  selectedWebsiteId: string | null;
  selectedIsClosed: boolean;
  atActiveCap: boolean;
  messages: ChatMessage[];
  visitorFromHistory: Record<string, unknown> | null;
  isConnected: boolean;
  visitorTypingSelected: boolean;
  refreshQueues: () => Promise<void>;
  selectConversation: (
    conversationId: string,
    options?: { readOnly?: boolean; assigneeAgentId?: string | null },
  ) => Promise<void>;
  clearSelection: () => void;
  sendMessage: (content: string, options?: { messageType?: string }) => Promise<void>;
  closeSelectedConversation: () => Promise<void>;
  emitTyping: () => void;
  emitStopTyping: () => void;
  pendingWrapUp: AgentWrapUpPayload | null;
  dismissWrapUp: () => void;
  activeWhisper: ChatWhisperSocketPayload | null;
  dismissWhisper: () => void;
  onSupervisorActivity: (payload?: unknown) => void;
  supervisorRefreshToken: number;
  /** True when the current user may post a visitor-visible reply. */
  canSendMessage: boolean;
  sendBlockedReason: string | null;
}

export function useAgentChat(params: UseAgentChatParams): UseAgentChatReturn {
  const apiEnabled = params.apiEnabled !== false && Boolean(params.token);
  const socketClient = useMemo(() => getSharedAgentChatSocket(), []);
  const queues = useAgentInboxQueues(params.token, apiEnabled);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [selectedIsClosed, setSelectedIsClosed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visitorFromHistory, setVisitorFromHistory] =
    useState<Record<string, unknown> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [visitorTypingSelected, setVisitorTypingSelected] = useState(false);
  const [pendingWrapUp, setPendingWrapUp] = useState<AgentWrapUpPayload | null>(null);
  const [activeWhisper, setActiveWhisper] = useState<ChatWhisperSocketPayload | null>(null);
  const [supervisorTick, setSupervisorTick] = useState(0);
  const [conversationAssigneeId, setConversationAssigneeId] = useState<string | null>(
    null,
  );
  const [supervisorControlUserId, setSupervisorControlUserId] = useState<string | null>(
    null,
  );

  const messageMapRef = useRef(new Map<string, ChatMessage>());
  const selectedConversationIdRef = useRef<string | null>(null);
  const selectedIsClosedRef = useRef(false);
  const messageSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectConversationRef = useRef<
    (
      id: string,
      opts?: { readOnly?: boolean; assigneeAgentId?: string | null },
    ) => Promise<void>
  >(async () => {});

  const extractWrapUp = useCallback((payload: unknown): AgentWrapUpPayload | null => {
    if (typeof payload !== "object" || !payload) return null;
    const o = payload as Record<string, unknown>;
    if (o.wrapUp && typeof o.wrapUp === "object") return o.wrapUp as AgentWrapUpPayload;
    if (
      o.conversationId &&
      (o.requiresDistributionForm ||
        o.requiresAgentWrapUp ||
        o.chatCompleted)
    ) {
      return o as AgentWrapUpPayload;
    }
    return null;
  }, []);

  const closedIdSet = useMemo(
    () => new Set(queues.closedChats.map((c) => c.id)),
    [queues.closedChats],
  );

  const sendBlockedReason = useMemo((): string | null => {
    if (!selectedConversationId || selectedIsClosed || !params.agentId) {
      return null;
    }
    const me = params.agentId;
    if (supervisorControlUserId && supervisorControlUserId === me) {
      return null;
    }
    if (supervisorControlUserId && supervisorControlUserId !== me) {
      return "A supervisor is controlling this chat. You can view only until they release it.";
    }
    const queueRow = [...queues.activeChats, ...queues.waitingChats].find(
      (c) => c.id === selectedConversationId,
    );
    const awaitingHumanAgent =
      queues.waitingChats.some((c) => c.id === selectedConversationId) ||
      queueRow?.handoverRequested === true ||
      queueRow?.queuedForAgent === true ||
      String(queueRow?.status ?? "") === "waiting";
    if (!conversationAssigneeId || conversationAssigneeId !== me) {
      if (awaitingHumanAgent) return null;
      return "You are not the assigned agent for this conversation.";
    }
    return null;
  }, [
    conversationAssigneeId,
    params.agentId,
    queues.activeChats,
    queues.waitingChats,
    selectedConversationId,
    selectedIsClosed,
    supervisorControlUserId,
  ]);

  const canSendMessage = sendBlockedReason === null && Boolean(selectedConversationId && !selectedIsClosed && params.agentId);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    selectedIsClosedRef.current = selectedIsClosed;
  }, [selectedIsClosed]);

  const syncMessagesFromMap = useCallback(() => {
    setMessages(sortMessagesChronologically(Array.from(messageMapRef.current.values())));
  }, []);

  const refreshQueuesRef = useRef(queues.refreshQueues);
  refreshQueuesRef.current = queues.refreshQueues;

  const upsertMessage = useCallback(
    (message: ChatMessage) => {
      if (selectedIsClosedRef.current && message.role !== "system") return;

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

  const syncSelectedHistory = useCallback(async () => {
    const cid = selectedConversationIdRef.current;
    if (!cid || !apiEnabled || !params.token || selectedIsClosedRef.current) return;
    try {
      const history = await getConversationHistory(cid, params.token);
      if (selectedConversationIdRef.current !== cid) return;
      for (const msg of history.messages) {
        messageMapRef.current.set(stableMessageDedupeKey(msg), msg);
      }
      syncMessagesFromMap();
    } catch {
      /* transient — next reconnect sync will retry */
    }
  }, [apiEnabled, params.token, syncMessagesFromMap]);

  const handleVisitorMessage = useCallback(
    (message: ChatMessage) => {
      const cid = selectedConversationIdRef.current;
      if (!cid) return;
      if (message.conversationId.toLowerCase() !== cid.toLowerCase()) {
        void refreshQueuesRef.current();
        return;
      }
      upsertMessage(message);
    },
    [upsertMessage],
  );

  const clearSelection = useCallback(() => {
    const prevId = selectedConversationIdRef.current;
    if (prevId && !selectedIsClosedRef.current) {
      socketClient.leaveRoom({ conversationId: prevId });
    }
    setSelectedConversationId(null);
    selectedConversationIdRef.current = null;
    setSelectedWebsiteId(null);
    setSelectedIsClosed(false);
    selectedIsClosedRef.current = false;
    setVisitorTypingSelected(false);
    messageMapRef.current.clear();
    setMessages([]);
    setVisitorFromHistory(null);
    setConversationAssigneeId(null);
    setSupervisorControlUserId(null);
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
        const needsDistribution =
          wrapUp?.requiresDistributionForm && !wrapUp.distributionSubmitted;
        const needsLegacyWrapUp =
          wrapUp?.requiresAgentWrapUp && !wrapUp.wrapUpSubmitted;
        if (wrapUp && (needsDistribution || needsLegacyWrapUp)) {
          setPendingWrapUp(wrapUp);
        }
      }
    },
    [extractWrapUp, queues],
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

  const handleTakeoverActivity = useCallback(
    (payload?: unknown) => {
      void queues.refreshQueues();
      setSupervisorTick((n) => n + 1);
      if (typeof payload === "object" && payload !== null) {
        const p = payload as Record<string, unknown>;
        if (typeof p.toAgentId === "string" && p.toAgentId.trim()) {
          setConversationAssigneeId(p.toAgentId.trim());
        }
        if (typeof p.supervisorControlUserId === "string") {
          setSupervisorControlUserId(p.supervisorControlUserId.trim() || null);
        }
        if (p.released === true) {
          setSupervisorControlUserId(null);
        }
      }
      const cid = selectedConversationIdRef.current;
      if (cid) void selectConversationRef.current(cid, { readOnly: selectedIsClosedRef.current });
    },
    [queues],
  );

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
    [queues, socketClient],
  );

  const handleAgentWrapUpForm = useCallback(
    (p: unknown) => {
      const wrapUp =
        extractWrapUp(p) ?? (typeof p === "object" && p ? (p as AgentWrapUpPayload) : null);
      const needsDistribution =
        wrapUp?.requiresDistributionForm && !wrapUp.distributionSubmitted;
      const needsLegacyWrapUp =
        wrapUp?.requiresAgentWrapUp && !wrapUp.wrapUpSubmitted;
      if (needsDistribution || needsLegacyWrapUp) {
        setPendingWrapUp(wrapUp);
      }
    },
    [extractWrapUp],
  );

  useAgentChatSocket(
    apiEnabled ? params.token : "",
    socketClient,
    {
      onVisitorMessage: handleVisitorMessage,
      onRefreshQueues: () => void refreshQueuesRef.current(),
      onReconnectHistorySync: () => void syncSelectedHistory(),
      onSessionEnded: handleSessionEnded,
      onChatResumed: handleChatResumed,
      onVisitorTyping: setVisitorTypingSelected,
      onChatWhisper: handleChatWhisper,
      onChatTransferred: handleTakeoverActivity,
      onSupervisorControl: handleTakeoverActivity,
      onAgentWrapUpForm: handleAgentWrapUpForm,
      onAgentWrapUpSubmitted: (p) => {
        const cid = conversationIdFromSocketPayload(p);
        setPendingWrapUp((prev) => {
          if (!prev) return null;
          if (cid && prev.conversationId === cid) return null;
          if (cid && prev.conversationId && prev.conversationId !== cid) return prev;
          return null;
        });
      },
      onAgentDistributionSubmitted: (p) => {
        const cid = conversationIdFromSocketPayload(p);
        setPendingWrapUp((prev) => {
          if (!prev) return null;
          if (cid && prev.conversationId === cid) {
            return { ...prev, distributionSubmitted: true };
          }
          return prev;
        });
      },
      selectedConversationIdRef,
      selectedIsClosedRef,
    },
    setIsConnected,
  );

  useEffect(() => {
    if (!apiEnabled) return undefined;
    return subscribeAgentChatMessageSync((conversationId) => {
      if (
        selectedConversationIdRef.current?.toLowerCase() !==
        conversationId.toLowerCase()
      ) {
        return;
      }
      if (messageSyncTimerRef.current) clearTimeout(messageSyncTimerRef.current);
      messageSyncTimerRef.current = setTimeout(() => {
        messageSyncTimerRef.current = null;
        void syncSelectedHistory();
      }, CHAT_RECONNECT_SYNC_DEBOUNCE_MS);
    });
  }, [apiEnabled, syncSelectedHistory]);

  useEffect(
    () => () => {
      if (messageSyncTimerRef.current) clearTimeout(messageSyncTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!apiEnabled || !selectedConversationId || selectedIsClosed || isConnected) {
      return undefined;
    }
    const poll = window.setInterval(() => {
      void syncSelectedHistory();
    }, CHAT_DISCONNECTED_SYNC_MS);
    return () => window.clearInterval(poll);
  }, [apiEnabled, isConnected, selectedConversationId, selectedIsClosed, syncSelectedHistory]);

  const selectConversation = useCallback(
    async (
      conversationId: string,
      options?: { readOnly?: boolean; assigneeAgentId?: string | null },
    ) => {
      const readOnly = options?.readOnly === true || closedIdSet.has(conversationId);

      const prevId = selectedConversationIdRef.current;
      if (prevId && prevId !== conversationId && !selectedIsClosedRef.current) {
        socketClient.leaveRoom({ conversationId: prevId });
      }

      setSelectedConversationId(conversationId);
      selectedConversationIdRef.current = conversationId;
      setSelectedIsClosed(readOnly);
      selectedIsClosedRef.current = readOnly;
      setVisitorTypingSelected(false);

      const queueRow = [...queues.activeChats, ...queues.waitingChats].find(
        (c) => c.id === conversationId,
      );
      const queueAssignee =
        options?.assigneeAgentId?.trim() ||
        queueRow?.assignedAgentId ||
        (typeof queueRow?.agentId === "string" ? queueRow.agentId : null);
      setConversationAssigneeId(queueAssignee?.trim() || null);

      if (!readOnly) {
        socketClient.joinRoom({ conversationId });
        scheduleJoinRoomRetries(
          (cid) => socketClient.joinRoom({ conversationId: cid }),
          conversationId,
          () =>
            selectedConversationIdRef.current?.toLowerCase() ===
            conversationId.toLowerCase(),
        );
      }

      if (!apiEnabled || !params.token) return;
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

      const historyRecord = history as Record<string, unknown>;
      const historyWebsiteId =
        typeof historyRecord.websiteId === "string"
          ? historyRecord.websiteId
          : typeof history.websiteId === "string"
            ? history.websiteId
            : null;
      setSelectedWebsiteId(historyWebsiteId?.trim() || null);
      const assignee =
        typeof historyRecord.agentId === "string"
          ? historyRecord.agentId
          : typeof historyRecord.assignedAgentId === "string"
            ? historyRecord.assignedAgentId
            : null;
      setConversationAssigneeId(assignee?.trim() || null);
      const supervisorId =
        typeof historyRecord.supervisorControlUserId === "string"
          ? historyRecord.supervisorControlUserId
          : null;
      setSupervisorControlUserId(supervisorId?.trim() || null);

      if (readOnly && apiEnabled && params.token) {
        try {
          const wrapUp = await fetchAgentWrapUp(conversationId);
          const needsDistribution =
            wrapUp.requiresDistributionForm && !wrapUp.distributionSubmitted;
          const needsLegacy =
            wrapUp.requiresAgentWrapUp && !wrapUp.wrapUpSubmitted;
          if (needsDistribution || needsLegacy) {
            setPendingWrapUp(wrapUp);
          } else if (
            selectedConversationIdRef.current === conversationId
          ) {
            setPendingWrapUp((prev) =>
              prev?.conversationId === conversationId ? null : prev,
            );
          }
        } catch {
          /* no wrap-up / distribution for this chat */
        }
      }
    },
    [
      apiEnabled,
      closedIdSet,
      params.token,
      queues.activeChats,
      queues.waitingChats,
      socketClient,
      syncMessagesFromMap,
    ],
  );

  useEffect(() => {
    selectConversationRef.current = selectConversation;
  }, [selectConversation]);

  const sendMessage = useCallback(
    async (content: string, sendOpts?: { messageType?: string }) => {
      const trimmed = content.trim();
      if (!selectedConversationId || selectedIsClosed) {
        throw new Error("Select an active conversation before sending a message.");
      }
      if (!trimmed) {
        throw new Error("Message cannot be empty.");
      }
      if (!params.agentId) {
        throw new Error("Sign in again to send messages.");
      }
      if (sendBlockedReason) {
        throw new Error(sendBlockedReason);
      }

      const optimisticId = `optimistic-${Date.now()}`;
      upsertMessage({
        id: optimisticId,
        conversationId: selectedConversationId,
        content: trimmed,
        role: "agent",
        senderId: params.agentId,
        createdAt: new Date().toISOString(),
      });

      try {
        setActiveWhisper(null);

        const useSupervisorSend =
          supervisorControlUserId != null &&
          supervisorControlUserId === params.agentId;

        const response = useSupervisorSend
          ? await sendSupervisorControlMessage(selectedConversationId, trimmed)
          : await sendAgentMessage(
              selectedConversationId,
              {
                message: trimmed,
                ...(sendOpts?.messageType ? { messageType: sendOpts.messageType } : {}),
              },
              params.token,
            );

        const envelope =
          response && typeof response === "object"
            ? (response as Record<string, unknown>)
            : null;
        if (envelope?.claimed === true && params.agentId) {
          setConversationAssigneeId(params.agentId);
          void queues.refreshQueues();
        }
        const persisted =
          normalizeServerMessage(response) ??
          (envelope && "message" in envelope
            ? normalizeServerMessage(envelope.message)
            : null);
        if (persisted) upsertMessage(persisted);
      } catch (err) {
        messageMapRef.current.delete(optimisticId);
        syncMessagesFromMap();
        throw err;
      }
    },
    [
      params.agentId,
      params.token,
      queues,
      selectedConversationId,
      selectedIsClosed,
      sendBlockedReason,
      supervisorControlUserId,
      syncMessagesFromMap,
      upsertMessage,
    ],
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

    if (apiEnabled && params.token) {
      try {
        const wrapUp = await fetchAgentWrapUp(closingId);
        const needsDistribution =
          wrapUp.requiresDistributionForm && !wrapUp.distributionSubmitted;
        const needsLegacy =
          wrapUp.requiresAgentWrapUp && !wrapUp.wrapUpSubmitted;
        if (needsDistribution || needsLegacy) {
          setPendingWrapUp(wrapUp);
        }
      } catch {
        /* distribution not configured */
      }
    }
  }, [
    apiEnabled,
    params.token,
    queues,
    selectConversation,
    selectedConversationId,
    selectedIsClosed,
  ]);

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
    selectedWebsiteId,
    selectedIsClosed,
    atActiveCap: queues.atActiveCap,
    messages,
    visitorFromHistory,
    isConnected,
    visitorTypingSelected,
    refreshQueues: queues.refreshQueues,
    selectConversation,
    clearSelection,
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
    onSupervisorActivity: handleTakeoverActivity,
    supervisorRefreshToken: supervisorTick,
    canSendMessage,
    sendBlockedReason,
  };
}
