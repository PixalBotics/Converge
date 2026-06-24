"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  closeConversation,
  getAgentConversationHistorySocket,
} from "@/services/chat/agent-inbox.api";
import { sendSupervisorControlMessage } from "@/services/chat/supervisor.api";
import { fetchAgentWrapUp } from "@/services/chat/wrap-up.api";
import { getSharedAgentChatSocket } from "@/services/chat/sharedAgentChatSocket";
import { normalizeServerMessage } from "@/services/chat/normalize-message";
import type { ChatWhisperSocketPayload } from "@/services/chat/supervisor.types";
import type { AgentWrapUpPayload } from "@/services/chat/wrap-up.types";
import type {
  AgentVisitorPresentation,
  ChatCloseResponse,
  ChatMessage,
  ConversationSummary,
} from "@/services/chat/chat.types";
import { mergeVisitorPanelContext } from "@/features/chat-operations/utils/visitor-info";
import {
  conversationIdFromSocketPayload,
  sortMessagesChronologically,
  stableMessageDedupeKey,
} from "./agent-chat.utils";
import {
  CHAT_DISCONNECTED_SYNC_MS,
  CHAT_RECONNECT_SYNC_DEBOUNCE_MS,
  ensureConversationRoomJoin,
  unwrapSocketAckPayload,
} from "./chat-socket-delivery";
import { subscribeAgentChatMessageSync } from "./agent-chat-message-sync-bus";
import { buildInboxPatchFromSocket } from "./agent-inbox-queue-patch";
import {
  publishAgentInboxDelta,
  subscribeAgentInboxDelta,
} from "./agent-inbox-delta-bus";
import {
  clearVisitorTyping,
  type ConversationTypingEntry,
} from "./conversation-typing-bus";
import { useConversationTypingEntries } from "./useConversationTyping";
import { useAgentInboxQueues } from "./useAgentInboxQueues";
import { useAgentChatSocket } from "./useAgentChatSocket";
import { isAgentChatSessionAccepting } from "./agent-chat-session-bus";

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
  visitorTypingDraft: string;
  remoteTypingEntries: ConversationTypingEntry[];
  refreshQueues: () => Promise<void>;
  selectConversation: (
    conversationId: string,
    options?: { readOnly?: boolean; assigneeAgentId?: string | null },
  ) => Promise<void>;
  clearSelection: () => void;
  sendMessage: (content: string, options?: { messageType?: string }) => Promise<void>;
  closeSelectedConversation: () => Promise<void>;
  emitTyping: (draft?: string) => void;
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
  applyVisitorProfileUpdate: (payload: unknown) => void;
}

export function useAgentChat(params: UseAgentChatParams): UseAgentChatReturn {
  const permissionEnabled = params.apiEnabled !== false;
  const token = params.token?.trim() ?? "";
  const apiEnabled = permissionEnabled && Boolean(token);
  const socketClient = useMemo(() => getSharedAgentChatSocket(), []);
  const queues = useAgentInboxQueues(token, permissionEnabled, params.agentId, {
    respectChatSession: permissionEnabled,
  });

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [selectedIsClosed, setSelectedIsClosed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visitorFromHistory, setVisitorFromHistory] =
    useState<Record<string, unknown> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
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

  const applyDistributionPrompt = useCallback((wrapUp: AgentWrapUpPayload | null) => {
    if (wrapUp?.requiresDistributionForm && !wrapUp.distributionSubmitted) {
      setPendingWrapUp(wrapUp);
    }
  }, []);

  const extractWrapUp = useCallback((payload: unknown): AgentWrapUpPayload | null => {
    if (typeof payload !== "object" || !payload) return null;
    const o = payload as Record<string, unknown>;
    if (o.wrapUp && typeof o.wrapUp === "object") return o.wrapUp as AgentWrapUpPayload;
    if (
      o.conversationId &&
      (o.requiresDistributionForm ||
        o.requiresDistributionSetup ||
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
      queueRow?.talkToAgentRequested === true ||
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

  const remoteTypingEntries = useConversationTypingEntries(selectedConversationId, {
    excludeUserId: params.agentId,
  });
  const visitorTypingEntry = remoteTypingEntries.find((e) => e.kind === "visitor");
  const visitorTypingSelected = Boolean(visitorTypingEntry?.draft.trim());
  const visitorTypingDraft = visitorTypingEntry?.draft.trim() ?? "";

  const canSendMessage =
    sendBlockedReason === null &&
    Boolean(selectedConversationId && !selectedIsClosed && params.agentId);

  useEffect(() => {
    selectedIsClosedRef.current = selectedIsClosed;
  }, [selectedIsClosed]);

  const syncMessagesFromMap = useCallback(() => {
    setMessages(sortMessagesChronologically(Array.from(messageMapRef.current.values())));
  }, []);

  const loadConversationHistorySocket = useCallback(
    async (conversationId: string) => {
      if (!apiEnabled) return null;
      return getAgentConversationHistorySocket(conversationId);
    },
    [apiEnabled],
  );

  const reloadConversationHistory = useCallback(
    async (conversationId: string) => {
      if (!apiEnabled) return;
      const history = await loadConversationHistorySocket(conversationId);
      if (!history) return;
      messageMapRef.current.clear();
      for (const msg of history.messages) {
        messageMapRef.current.set(stableMessageDedupeKey(msg), msg);
      }
      syncMessagesFromMap();
      const v = history.visitor;
      setVisitorFromHistory(
        mergeVisitorPanelContext(
          typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null,
          history as Record<string, unknown>,
        ),
      );
    },
    [apiEnabled, loadConversationHistorySocket, syncMessagesFromMap],
  );

  const applyAssigneeFromSocketPayload = useCallback(
    (payload: unknown) => {
      const conversationId = conversationIdFromSocketPayload(payload);
      if (!conversationId || !params.agentId) return;
      const o =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : null;
      const toAgentId = String(
        o?.toAgentId ?? o?.agentId ?? o?.assignedAgentId ?? "",
      ).trim();
      const me = params.agentId.trim();
      if (!toAgentId || toAgentId.toLowerCase() !== me.toLowerCase()) return;

      const selected = selectedConversationIdRef.current?.toLowerCase() ?? "";
      if (selected && selected !== conversationId.toLowerCase()) return;

      setConversationAssigneeId(toAgentId);
      setSelectedIsClosed(false);
      selectedIsClosedRef.current = false;
      setSupervisorControlUserId(null);
      ensureConversationRoomJoin(
        socketClient,
        conversationId,
        () =>
          selectedConversationIdRef.current?.toLowerCase() ===
            conversationId.toLowerCase() || !selectedConversationIdRef.current,
      );
      if (selected === conversationId.toLowerCase()) {
        void loadConversationHistorySocket(conversationId).then((history) => {
          if (
            !history ||
            selectedConversationIdRef.current?.toLowerCase() !==
              conversationId.toLowerCase()
          ) {
            return;
          }
          messageMapRef.current.clear();
          for (const msg of history.messages) {
            messageMapRef.current.set(stableMessageDedupeKey(msg), msg);
          }
          syncMessagesFromMap();
        });
      }
    },
    [loadConversationHistorySocket, params.agentId, socketClient, syncMessagesFromMap],
  );

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
    if (!cid || !apiEnabled || selectedIsClosedRef.current) return;
    try {
      const history = await loadConversationHistorySocket(cid);
      if (!history) return;
      if (selectedConversationIdRef.current !== cid) return;
      for (const msg of history.messages) {
        messageMapRef.current.set(stableMessageDedupeKey(msg), msg);
      }
      syncMessagesFromMap();
      const v = history.visitor;
      setVisitorFromHistory((prev) =>
        mergeVisitorPanelContext(
          typeof v === "object" && v !== null
            ? (v as Record<string, unknown>)
            : prev,
          history as Record<string, unknown>,
        ),
      );
    } catch {
      /* transient — next reconnect sync will retry */
    }
  }, [apiEnabled, loadConversationHistorySocket, syncMessagesFromMap]);

  const handleVisitorMessage = useCallback(
    (message: ChatMessage) => {
      const cid = selectedConversationIdRef.current;
      if (!cid) return;
      if (message.conversationId.toLowerCase() !== cid.toLowerCase()) {
        if (message.content?.trim()) {
          publishAgentInboxDelta({
            kind: "row_enrich",
            conversationId: message.conversationId,
            fields: {
              lastMessage: message.content.trim(),
              ...(message.createdAt ? { lastMessageAt: message.createdAt } : {}),
            },
          });
        }
        return;
      }
      upsertMessage(message);
      clearVisitorTyping(message.conversationId);
      if (message.content?.trim()) {
        publishAgentInboxDelta({
          kind: "row_enrich",
          conversationId: cid,
          fields: {
            lastMessage: message.content.trim(),
            ...(message.createdAt ? { lastMessageAt: message.createdAt } : {}),
          },
        });
      }
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
    messageMapRef.current.clear();
    setMessages([]);
    setVisitorFromHistory(null);
    setConversationAssigneeId(null);
    setSupervisorControlUserId(null);
  }, [socketClient]);

  const handleSessionEnded = useCallback(
    (payload: unknown) => {
      const closedPatch = buildInboxPatchFromSocket(
        "chat_closed",
        payload,
        params.agentId,
      );
      if (closedPatch) {
        publishAgentInboxDelta(closedPatch);
      }
      const endedId = conversationIdFromSocketPayload(payload);
      const wrapUp = extractWrapUp(payload);

      if (endedId && endedId === selectedConversationIdRef.current) {
        setSelectedIsClosed(true);
        selectedIsClosedRef.current = true;
        applyDistributionPrompt(wrapUp);
        if (endedId) {
          void reloadConversationHistory(endedId);
        }
      }
    },
    [applyDistributionPrompt, extractWrapUp, params.agentId, reloadConversationHistory],
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

  const applyVisitorProfileUpdate = useCallback((payload: unknown) => {
    const cid = conversationIdFromSocketPayload(payload);
    if (!cid || cid !== selectedConversationIdRef.current) return;
    if (typeof payload !== "object" || !payload) return;
    const o = payload as Record<string, unknown>;
    const vp =
      o.visitorPresentation && typeof o.visitorPresentation === "object"
        ? (o.visitorPresentation as Record<string, unknown>)
        : null;
    const name =
      typeof o.name === "string" && o.name.trim()
        ? o.name.trim()
        : typeof vp?.displayName === "string" && vp.displayName.trim()
          ? vp.displayName.trim()
          : typeof o.displayName === "string" && o.displayName.trim()
            ? o.displayName.trim()
            : null;
    if (!name && !(typeof vp?.inboxTitle === "string" && vp.inboxTitle.trim())) return;

    setVisitorFromHistory((prev) => ({
      ...(prev ?? {}),
      ...(name ? { name, displayName: name } : {}),
      email:
        typeof o.email === "string"
          ? o.email
          : o.email === null
            ? null
            : prev?.email,
      phone:
        typeof o.phone === "string"
          ? o.phone
          : o.phone === null
            ? null
            : prev?.phone,
      visitorProfileComplete:
        typeof o.visitorProfileComplete === "boolean"
          ? o.visitorProfileComplete
          : typeof vp?.visitorProfileComplete === "boolean"
            ? vp.visitorProfileComplete
            : prev?.visitorProfileComplete,
      ...(vp ? { visitorPresentation: vp } : {}),
    }));
  }, []);

  const handleVisitorProfileUpdated = applyVisitorProfileUpdate;

  const handleTakeoverActivity = useCallback(
    (payload?: unknown) => {
      const transferredPatch = buildInboxPatchFromSocket(
        "chat_transferred",
        payload,
        params.agentId,
      );
      if (transferredPatch) {
        publishAgentInboxDelta(transferredPatch);
      }
      setSupervisorTick((n) => n + 1);
      if (typeof payload === "object" && payload !== null) {
        const p = payload as Record<string, unknown>;
        const fromAgentId =
          typeof p.fromAgentId === "string" ? p.fromAgentId.trim() : "";
        if (
          fromAgentId &&
          params.agentId &&
          fromAgentId.toLowerCase() === params.agentId.trim().toLowerCase()
        ) {
          clearSelection();
          return;
        }
        const eventConversationId = conversationIdFromSocketPayload(payload);
        const selected = selectedConversationIdRef.current?.toLowerCase() ?? "";
        const appliesToSelected =
          !eventConversationId ||
          !selected ||
          eventConversationId.toLowerCase() === selected;
        if (appliesToSelected) {
          applyAssigneeFromSocketPayload(payload);
        }
        if (appliesToSelected && typeof p.supervisorControlUserId === "string") {
          setSupervisorControlUserId(p.supervisorControlUserId.trim() || null);
        }
        if (appliesToSelected && p.released === true) {
          setSupervisorControlUserId(null);
        }
      }
    },
    [applyAssigneeFromSocketPayload, clearSelection, params.agentId],
  );

  const handleAgentAssignmentPopup = useCallback(
    (payload: unknown) => {
      if (!isAgentChatSessionAccepting()) return;
      const patch = buildInboxPatchFromSocket(
        "agent_assignment_popup",
        payload,
        params.agentId,
      );
      if (patch) {
        publishAgentInboxDelta(patch);
      }
      applyAssigneeFromSocketPayload(payload);
    },
    [applyAssigneeFromSocketPayload, params.agentId],
  );

  const handleChatResumed = useCallback(
    async (payload: unknown) => {
      const resumedPatch = buildInboxPatchFromSocket(
        "chat_resumed",
        payload,
        params.agentId,
      );
      if (resumedPatch) {
        publishAgentInboxDelta(resumedPatch);
      }
      const resumedId = conversationIdFromSocketPayload(payload);
      if (
        resumedId &&
        resumedId === selectedConversationIdRef.current &&
        selectedIsClosedRef.current
      ) {
        setSelectedIsClosed(false);
        selectedIsClosedRef.current = false;
        setPendingWrapUp(null);
        for (const [key, msg] of messageMapRef.current) {
          const mt =
            typeof msg.metadata?.messageType === "string"
              ? msg.metadata.messageType
              : "";
          if (
            mt === "distribution_link" ||
            mt === "close_form_link" ||
            mt === "distribution_setup_required" ||
            mt === "policy_close"
          ) {
            messageMapRef.current.delete(key);
          }
        }
        syncMessagesFromMap();
        ensureConversationRoomJoin(
          socketClient,
          resumedId,
          () => selectedConversationIdRef.current?.toLowerCase() === resumedId.toLowerCase(),
        );
        void reloadConversationHistory(resumedId);
      }
    },
    [params.agentId, reloadConversationHistory, socketClient, syncMessagesFromMap],
  );

  const handleAgentWrapUpForm = useCallback(
    (p: unknown) => {
      const wrapUp =
        extractWrapUp(p) ?? (typeof p === "object" && p ? (p as AgentWrapUpPayload) : null);
      applyDistributionPrompt(wrapUp);
    },
    [applyDistributionPrompt, extractWrapUp],
  );

  useAgentChatSocket(
    apiEnabled ? params.token : "",
    socketClient,
    params.agentId,
    {
      onVisitorMessage: handleVisitorMessage,
      onRefreshQueues: () => {},
      onReconnectHistorySync: () => void syncSelectedHistory(),
      onSessionEnded: handleSessionEnded,
      onChatResumed: handleChatResumed,
      onVisitorTyping: () => {},
      onVisitorProfileUpdated: handleVisitorProfileUpdated,
      onChatWhisper: handleChatWhisper,
      onChatTransferred: handleTakeoverActivity,
      onAgentAssignmentPopup: handleAgentAssignmentPopup,
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
    { publishInboxDeltas: false },
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

      const queueRow = [...queues.activeChats, ...queues.waitingChats].find(
        (c) => c.id === conversationId,
      );
      const queueAssignee =
        options?.assigneeAgentId?.trim() ||
        queueRow?.assignedAgentId ||
        (typeof queueRow?.agentId === "string" ? queueRow.agentId : null);
      setConversationAssigneeId(queueAssignee?.trim() || null);

      const isWaitingRow =
        queueRow?.status === "waiting" ||
        queueRow?.queuedForAgent === true ||
        queueRow?.talkToAgentRequested === true;
      if (
        !readOnly &&
        isWaitingRow &&
        params.agentId &&
        (!queueAssignee || queueAssignee !== params.agentId)
      ) {
        try {
          await socketClient.waitUntilSocketReady(8_000);
          if (socketClient.isConnected()) {
            await socketClient.sendAgentPickWaitingWithAck({ conversationId });
            setConversationAssigneeId(params.agentId);
          }
        } catch {
          /* first reply will claim via agent_message */
        }
      }

      if (!readOnly) {
        ensureConversationRoomJoin(
          socketClient,
          conversationId,
          () =>
            selectedConversationIdRef.current?.toLowerCase() ===
            conversationId.toLowerCase(),
        );
      }

      if (!apiEnabled) return;
      const history = await loadConversationHistorySocket(conversationId);
      if (!history) return;
      if (
        selectedConversationIdRef.current?.toLowerCase() !==
        conversationId.toLowerCase()
      ) {
        return;
      }
      messageMapRef.current.clear();
      for (const msg of history.messages) {
        messageMapRef.current.set(stableMessageDedupeKey(msg), msg);
      }
      syncMessagesFromMap();

      const v = history.visitor;
      setVisitorFromHistory(
        mergeVisitorPanelContext(
          typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null,
          history as Record<string, unknown>,
        ),
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

      const historyVp =
        typeof historyRecord.visitorPresentation === "object" &&
        historyRecord.visitorPresentation !== null
          ? (historyRecord.visitorPresentation as AgentVisitorPresentation)
          : null;
      const lastMsg =
        history.messages.length > 0
          ? history.messages[history.messages.length - 1]
          : null;
      const enrichFields: Partial<ConversationSummary> = {};
      if (historyVp) enrichFields.visitorPresentation = historyVp;
      if (lastMsg?.content?.trim()) {
        enrichFields.lastMessage = lastMsg.content.trim();
        if (lastMsg.createdAt) enrichFields.lastMessageAt = lastMsg.createdAt;
      }
      const historyLastTransfer =
        historyRecord.lastTransferFrom &&
        typeof historyRecord.lastTransferFrom === "object"
          ? (historyRecord.lastTransferFrom as ConversationSummary["lastTransferFrom"])
          : null;
      if (historyLastTransfer) {
        enrichFields.lastTransferFrom = historyLastTransfer;
      }
      if (Object.keys(enrichFields).length > 0) {
        publishAgentInboxDelta({
          kind: "row_enrich",
          conversationId,
          fields: enrichFields,
        });
      }

      if (readOnly && apiEnabled && params.token) {
        try {
          const wrapUp = await fetchAgentWrapUp(conversationId);
          applyDistributionPrompt(wrapUp);
          if (
            (!wrapUp.requiresDistributionForm || wrapUp.distributionSubmitted) &&
            selectedConversationIdRef.current === conversationId
          ) {
            setPendingWrapUp((prev) =>
              prev?.conversationId === conversationId ? null : prev,
            );
          }
        } catch {
          /* distribution payload unavailable */
        }
      }
    },
    [
      apiEnabled,
      applyDistributionPrompt,
      closedIdSet,
      loadConversationHistorySocket,
      params.agentId,
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

  useEffect(() => {
    return subscribeAgentInboxDelta((patch) => {
      const selected = selectedConversationIdRef.current?.toLowerCase() ?? "";
      const patchId = patch.kind === "assigned_to_agent"
        ? patch.conversationId
        : "conversationId" in patch
          ? patch.conversationId
          : patch.kind === "conversation_resumed"
            ? String(patch.summary.id ?? patch.summary.conversationId ?? "")
            : "";
      const patchIdLower = patchId.toLowerCase();

      if (patch.kind === "conversation_reassigned_away") {
        if (selected && selected === patchIdLower) {
          clearSelection();
        }
        return;
      }

      if (!selected || !patchIdLower || selected !== patchIdLower) return;

      if (patch.kind === "assigned_to_agent") {
        const me = params.agentId?.trim().toLowerCase();
        if (me && patch.agentId?.toLowerCase() === me) {
          setConversationAssigneeId(patch.agentId);
          setSelectedIsClosed(false);
          selectedIsClosedRef.current = false;
          setSupervisorControlUserId(null);
        }
        return;
      }

      if (patch.kind === "conversation_closed") {
        setSelectedIsClosed(true);
        selectedIsClosedRef.current = true;
        return;
      }

      if (patch.kind === "conversation_resumed") {
        setSelectedIsClosed(false);
        selectedIsClosedRef.current = false;
        const assignee =
          patch.summary.assignedAgentId ??
          (typeof patch.summary.agentId === "string" ? patch.summary.agentId : null);
        if (assignee?.trim()) {
          setConversationAssigneeId(assignee.trim());
        }
      }
    });
  }, [clearSelection, params.agentId]);

  useEffect(() => {
    const cid = selectedConversationId?.toLowerCase();
    if (!cid || !params.agentId || selectedIsClosed) return;
    const row = [...queues.activeChats, ...queues.waitingChats].find(
      (c) => (c.id || c.conversationId || "").toLowerCase() === cid,
    );
    if (!row) return;
    const assignee =
      row.assignedAgentId ??
      (typeof row.agentId === "string" ? row.agentId : null);
    if (assignee?.trim()) {
      setConversationAssigneeId(assignee.trim());
    }
  }, [
    params.agentId,
    queues.activeChats,
    queues.waitingChats,
    selectedConversationId,
    selectedIsClosed,
  ]);

  const sendMessage = useCallback(
    async (content: string) => {
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

        let response: unknown;
        if (useSupervisorSend) {
          response = await sendSupervisorControlMessage(selectedConversationId, trimmed);
        } else {
          await socketClient.waitUntilConnected(10_000);
          if (!socketClient.isConnected()) {
            throw new Error("Chat socket is not connected. Wait for Live chat to connect.");
          }
          response = await socketClient.sendAgentMessageWithAck({
            conversationId: selectedConversationId,
            message: trimmed,
            agentId: params.agentId,
          });
        }

        const envelope =
          response && typeof response === "object"
            ? (unwrapSocketAckPayload(response) as Record<string, unknown>)
            : null;
        if (envelope?.claimed === true && params.agentId && selectedConversationId) {
          setConversationAssigneeId(params.agentId);
          publishAgentInboxDelta({
            kind: "assigned_to_agent",
            conversationId: selectedConversationId,
            agentId: params.agentId,
            summary: {
              id: selectedConversationId,
              conversationId: selectedConversationId,
              agentId: params.agentId,
              assignedAgentId: params.agentId,
              status: "assigned",
              queuedForAgent: false,
            },
          });
        }
        const persisted =
          normalizeServerMessage(response) ??
          normalizeServerMessage(envelope) ??
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
      selectedConversationId,
      selectedIsClosed,
      sendBlockedReason,
      socketClient,
      supervisorControlUserId,
      syncMessagesFromMap,
      upsertMessage,
    ],
  );

  const closeSelectedConversation = useCallback(async () => {
    if (!selectedConversationId || selectedIsClosed) return;

    const closingId = selectedConversationId;
    let closed: Awaited<ReturnType<typeof closeConversation>>;
    try {
      await socketClient.waitUntilConnected(10_000);
      if (socketClient.isConnected()) {
        const ack = await socketClient.sendAgentCloseChatWithAck({
          conversationId: closingId,
        });
        closed =
          ack && typeof ack === "object"
            ? (unwrapSocketAckPayload(ack) as ChatCloseResponse)
            : await closeConversation(closingId, params.token);
      } else {
        closed = await closeConversation(closingId, params.token);
      }
    } catch {
      closed = await closeConversation(closingId, params.token);
    }
    setSelectedIsClosed(true);
    selectedIsClosedRef.current = true;

    const nextId =
      closed.reassigned && typeof closed.reassigned.conversationId === "string"
        ? closed.reassigned.conversationId
        : null;

    if (nextId) {
      setPendingWrapUp(null);
      await selectConversation(nextId, { readOnly: false });
      return;
    }

    await reloadConversationHistory(closingId);

    if (apiEnabled && params.token) {
      try {
        const wrapUp = await fetchAgentWrapUp(closingId);
        applyDistributionPrompt(wrapUp);
      } catch {
        /* distribution payload unavailable */
      }
    }
  }, [
    apiEnabled,
    applyDistributionPrompt,
    params.token,
    reloadConversationHistory,
    socketClient,
    selectConversation,
    selectedConversationId,
    selectedIsClosed,
  ]);

  const emitStopTyping = useCallback(() => {
    if (!selectedConversationId || selectedIsClosed) return;
    socketClient.emitStopTyping({
      conversationId: selectedConversationId,
      userType: "agent",
      ...(params.agentId ? { userId: params.agentId } : {}),
    });
  }, [params.agentId, selectedConversationId, selectedIsClosed, socketClient]);

  const emitTyping = useCallback(
    (draft?: string) => {
      if (!selectedConversationId || selectedIsClosed) return;
      const text = typeof draft === "string" ? draft : "";
      if (!text.trim()) {
        emitStopTyping();
        return;
      }
      socketClient.emitTyping({
        conversationId: selectedConversationId,
        userType: "agent",
        ...(params.agentId ? { userId: params.agentId } : {}),
        draft: text,
      });
    },
    [emitStopTyping, params.agentId, selectedConversationId, selectedIsClosed, socketClient],
  );

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
    visitorTypingDraft,
    remoteTypingEntries,
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
    applyVisitorProfileUpdate,
  };
}
