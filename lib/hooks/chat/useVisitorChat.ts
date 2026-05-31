"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createWidgetConversation,
  fetchWidgetTranscript,
  sendWidgetVisitorMessage,
} from "@/services/chat/widget-visitor.api";
import { createChatSocketClient } from "@/services/chat/chatSocket";
import { normalizeServerMessage } from "@/services/chat/normalize-message";
import {
  CHAT_DISCONNECTED_SYNC_MS,
  CHAT_RECONNECT_SYNC_DEBOUNCE_MS,
  normalizeSocketMessage,
  scheduleJoinRoomRetries,
  unwrapSocketMessagePayload,
} from "./chat-socket-delivery";
import { conversationIdFromSocketPayload } from "./agent-chat.utils";
import type {
  ChatMessage,
  TypingPayload,
  VisitorCreateConversationPayload,
  VisitorCreateConversationResponse,
} from "@/services/chat/chat.types";
import type { WidgetTranscriptMessage } from "@/services/chat/widget-visitor.api";

export interface UseVisitorChatOptions {
  autoConnect?: boolean;
  /** Widget session JWT (`POST /widget/session`). Required for authenticated Socket.IO in production. */
  widgetSessionToken?: string | null;
  websiteId?: string | null;
  getCurrentPageUrl?: () => string;
  onChatAssigned?: () => void;
  onChatQueued?: () => void;
  /** Fired when a supervisor takes/releases direct control (takeover). */
  onSupervisorControl?: () => void;
  /** When true, ignore server-persisted AI rows (HYBRID after “Talk to agent”). */
  getSkipServerAiReply?: () => boolean;
  /** Agent/AI socket replies (for launcher badge + browser notify when panel closed). */
  onIncomingReply?: (message: ChatMessage) => void;
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
  /** Restore socket + messages after embed reload (localStorage conversation id). */
  resumeConversation: (params: {
    conversationId: string;
    visitorId?: string | null;
    status?: string;
    messages: WidgetTranscriptMessage[];
  }) => void;
  sendMessage: (
    content: string,
    options?: { messageType?: string },
  ) => Promise<void>;
  emitTyping: () => void;
  emitStopTyping: () => void;
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
  /** Reload messages from REST (initial load or reconnect gap-fill only). */
  refreshTranscript: () => Promise<void>;
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
  const optionsRef = useRef(options);
  const refreshTranscriptRef = useRef<(() => Promise<void>) | null>(null);
  const reconnectSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectedWidgetTokenRef = useRef<string | null>(null);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    widgetTokenRef.current = options?.widgetSessionToken;
  }, [options?.widgetSessionToken]);

  const reconnectSocket = useCallback(
    (forceNew: boolean) => {
      const token = widgetTokenRef.current;
      socketClient.connect({
        authToken: token ?? undefined,
        forceNew,
      });
      const cid = conversationIdRef.current;
      if (cid) {
        socketClient.joinRoom({ conversationId: cid });
      }
      setIsConnected(socketClient.isConnected());
    },
    [socketClient],
  );

  useEffect(() => {
    const token = options?.widgetSessionToken?.trim();
    if (!token) return undefined;
    const tokenChanged = connectedWidgetTokenRef.current !== token;
    connectedWidgetTokenRef.current = token;
    reconnectSocket(tokenChanged);
    return undefined;
  }, [options?.widgetSessionToken, reconnectSocket]);

  const resolvePageUrl = useCallback(() => {
    const fromOpt = options?.getCurrentPageUrl?.();
    if (fromOpt) return fromOpt;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  }, [options]);

  const upsertMessage = useCallback((message: ChatMessage) => {
    const openId = conversationIdRef.current;
    if (
      openId &&
      message.conversationId.toLowerCase() !== openId.toLowerCase()
    ) {
      return;
    }

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

  const refreshTranscript = useCallback(async () => {
    const cid = conversationIdRef.current;
    const wid = optionsRef.current?.websiteId?.trim();
    if (!cid || !wid) return;
    const res = await fetchWidgetTranscript(
      cid,
      wid,
      widgetTokenRef.current ?? undefined,
    );
    if (!res.ok) return;
    messageMapRef.current.clear();
    for (const row of res.data.messages) {
      const normalized = normalizeServerMessage({
        id: row.id,
        conversationId: cid,
        content: row.content,
        senderType: row.senderType,
        createdAt: row.createdAt,
      });
      if (normalized) {
        messageMapRef.current.set(stableMessageDedupeKey(normalized), normalized);
      }
    }
    setMessages(Array.from(messageMapRef.current.values()));
    setAssigned(Boolean(res.data.assignedAgentId) || res.data.status === "assigned");
  }, []);

  /** Merge new rows from REST without clearing optimistic / socket state. */
  const mergeTranscriptGapFill = useCallback(async () => {
    const cid = conversationIdRef.current;
    const wid = optionsRef.current?.websiteId?.trim();
    if (!cid || !wid) return;
    const res = await fetchWidgetTranscript(
      cid,
      wid,
      widgetTokenRef.current ?? undefined,
    );
    if (!res.ok) return;
    let changed = false;
    for (const row of res.data.messages) {
      const normalized = normalizeServerMessage({
        id: row.id,
        conversationId: cid,
        content: row.content,
        senderType: row.senderType,
        createdAt: row.createdAt,
      });
      if (!normalized) continue;
      const key = stableMessageDedupeKey(normalized);
      if (!messageMapRef.current.has(key)) {
        messageMapRef.current.set(key, normalized);
        changed = true;
      }
    }
    if (changed) {
      setMessages(Array.from(messageMapRef.current.values()));
    }
    if (res.data.assignedAgentId || res.data.status === "assigned") {
      setAssigned(true);
    }
  }, []);

  useEffect(() => {
    refreshTranscriptRef.current = mergeTranscriptGapFill;
  }, [mergeTranscriptGapFill]);

  const scheduleReconnectSync = useCallback(() => {
    if (reconnectSyncTimerRef.current) clearTimeout(reconnectSyncTimerRef.current);
    reconnectSyncTimerRef.current = setTimeout(() => {
      reconnectSyncTimerRef.current = null;
      void mergeTranscriptGapFill();
    }, CHAT_RECONNECT_SYNC_DEBOUNCE_MS);
  }, [mergeTranscriptGapFill]);

  const deliverIncomingMessage = useCallback(
    (
      payload: unknown,
      options?: { forcedRole?: ChatMessage["role"]; trustActiveConversation?: boolean },
    ) => {
      const openId = conversationIdRef.current;
      let normalized = normalizeSocketMessage(payload, openId);
      if (!normalized && openId) {
        const payloadCid = conversationIdFromSocketPayload(payload);
        if (
          payloadCid &&
          (options?.trustActiveConversation ||
            payloadCid.toLowerCase() === openId.toLowerCase())
        ) {
          const unwrapped = unwrapSocketMessagePayload(payload);
          if (unwrapped && typeof unwrapped === "object") {
            normalized = normalizeSocketMessage(
              {
                ...(unwrapped as Record<string, unknown>),
                conversationId: openId,
              },
              openId,
            );
          }
        }
      }
      if (!normalized && openId && options?.trustActiveConversation) {
        const unwrapped = unwrapSocketMessagePayload(payload);
        if (unwrapped && typeof unwrapped === "object") {
          normalized = normalizeSocketMessage(
            { ...(unwrapped as Record<string, unknown>), conversationId: openId },
            openId,
          );
        }
      }
      if (!normalized) {
        scheduleReconnectSync();
        return;
      }
      if (options?.forcedRole) {
        normalized = { ...normalized, role: options.forcedRole };
      }
      if (
        openId &&
        normalized.conversationId.toLowerCase() !== openId.toLowerCase() &&
        options?.trustActiveConversation
      ) {
        normalized = { ...normalized, conversationId: openId };
      }
      upsertMessage(normalized);
      if (normalized.role === "agent") {
        setAssigned(true);
        optionsRef.current?.onIncomingReply?.(normalized);
      } else if (normalized.role === "system") {
        if (optionsRef.current?.getSkipServerAiReply?.() !== true) {
          optionsRef.current?.onIncomingReply?.(normalized);
        }
      }
    },
    [scheduleReconnectSync, upsertMessage],
  );

  useEffect(() => {
    if (!conversationId) return undefined;
    void refreshTranscript();
    socketClient.joinRoom({ conversationId });
    const clearJoinRetries = scheduleJoinRoomRetries(
      (cid) => socketClient.joinRoom({ conversationId: cid }),
      conversationId,
      () =>
        conversationIdRef.current?.toLowerCase() === conversationId.toLowerCase(),
    );
    if (isConnected) return clearJoinRetries;
    const poll = window.setInterval(() => {
      void refreshTranscriptRef.current?.();
    }, CHAT_DISCONNECTED_SYNC_MS);
    return () => {
      clearJoinRetries();
      window.clearInterval(poll);
    };
  }, [conversationId, isConnected, refreshTranscript, socketClient]);

  useEffect(
    () => () => {
      if (reconnectSyncTimerRef.current) clearTimeout(reconnectSyncTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    let clearJoinRetries: (() => void) | undefined;

    const resyncAfterReconnect = () => {
      setIsConnected(true);
      clearJoinRetries?.();
      clearJoinRetries = undefined;
      const cid = conversationIdRef.current;
      if (cid) {
        socketClient.joinRoom({ conversationId: cid });
        clearJoinRetries = scheduleJoinRoomRetries(
          (roomId) => socketClient.joinRoom({ conversationId: roomId }),
          cid,
          () => conversationIdRef.current?.toLowerCase() === cid.toLowerCase(),
        );
      }
      scheduleReconnectSync();
    };

    const offSocketConnect = socketClient.onSocketConnect(resyncAfterReconnect);
    const offSocketDisconnect = socketClient.onSocketDisconnect(() =>
      setIsConnected(false),
    );
    const offConnected = socketClient.onConnected(resyncAfterReconnect);

    const offVisitorMessage = socketClient.onVisitorMessageRaw((payload) => {
      deliverIncomingMessage(payload, {
        forcedRole: "visitor",
        trustActiveConversation: true,
      });
    });
    const offAgentMessage = socketClient.onAgentMessageRaw((payload) => {
      deliverIncomingMessage(payload, {
        forcedRole: "agent",
        trustActiveConversation: true,
      });
    });
    const offSupervisorControl = socketClient.onSupervisorControl((payload) => {
      const cid = conversationIdRef.current;
      if (
        !cid ||
        typeof payload !== "object" ||
        !payload ||
        (payload as { conversationId?: string }).conversationId !== cid
      ) {
        return;
      }
      const released = (payload as { released?: boolean }).released === true;
      if (!released) {
        setAssigned(true);
        optionsRef.current?.onChatAssigned?.();
      }
      optionsRef.current?.onSupervisorControl?.();
    });
    const offAiMessage = socketClient.onAiMessageRaw((payload) => {
      if (optionsRef.current?.getSkipServerAiReply?.() === true) return;
      deliverIncomingMessage(payload, {
        forcedRole: "system",
        trustActiveConversation: true,
      });
    });

    const offMonitorLive = socketClient.onMonitorLiveUpdate((update) => {
      const event = String(update.event ?? "").toLowerCase();
      if (
        event !== "visitor_message" &&
        event !== "agent_message" &&
        event !== "ai_message" &&
        !event.includes("message")
      ) {
        return;
      }
      const forcedRole: ChatMessage["role"] | undefined =
        event === "agent_message" || event.includes("agent")
          ? "agent"
          : event === "ai_message" || event.includes("ai")
            ? "system"
            : event === "visitor_message" || event.includes("visitor")
              ? "visitor"
              : undefined;
      const payload =
        update.payload && typeof update.payload === "object"
          ? {
              ...(update.payload as Record<string, unknown>),
              conversationId:
                (update.payload as { conversationId?: string }).conversationId ??
                update.conversationId,
            }
          : update.payload;
      deliverIncomingMessage(payload, {
        forcedRole,
        trustActiveConversation: true,
      });
    });

    const offHandover = socketClient.onChatHandover((payload: unknown) => {
      const cid = conversationIdRef.current;
      if (
        cid &&
        typeof payload === "object" &&
        payload &&
        (payload as { conversationId?: string }).conversationId === cid
      ) {
        scheduleReconnectSync();
      }
    });

    const offTyping = socketClient.onTyping((payload: TypingPayload) => {
      const cid = conversationIdRef.current;
      if (!cid || payload.conversationId !== cid) return;
      if (payload.userType === "agent") setAgentTypingFromOther(true);
    });
    const offStopTyping = socketClient.onStopTyping((payload: TypingPayload) => {
      const cid = conversationIdRef.current;
      if (!cid || payload.conversationId !== cid) return;
      if (payload.userType === "agent") {
        setAgentTypingFromOther(false);
        scheduleReconnectSync();
      }
    });

    const offAssigned = socketClient.onChatAssigned((payload: unknown) => {
      const cid = conversationIdRef.current;
      if (
        cid &&
        typeof payload === "object" &&
        payload &&
        (payload as { conversationId?: string }).conversationId === cid
      ) {
        setAssigned(true);
        optionsRef.current?.onChatAssigned?.();
        scheduleReconnectSync();
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
        optionsRef.current?.onChatQueued?.();
      }
    });
    const offClosed = socketClient.onChatClosed(() => {
      setAssigned(false);
      setAgentTypingFromOther(false);
    });

    return () => {
      clearJoinRetries?.();
      clearJoinRetries = undefined;
      offConnected();
      offSocketConnect();
      offSocketDisconnect();
      offVisitorMessage();
      offAgentMessage();
      offSupervisorControl();
      offAiMessage();
      offMonitorLive();
      offHandover();
      offTyping();
      offStopTyping();
      offAssigned();
      offQueued();
      offClosed();
    };
  }, [deliverIncomingMessage, scheduleReconnectSync, socketClient]);

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
      });

      const created = await createWidgetConversation(
        payload,
        widgetTokenRef.current ?? undefined,
      );
      setConversationId(created.conversationId);
      conversationIdRef.current = created.conversationId;
      setVisitorId(created.visitorId ?? null);
      setAssigned(created.status === "assigned");
      joinRoom(created.conversationId);
      scheduleJoinRoomRetries(
        (roomId) => socketClient.joinRoom({ conversationId: roomId }),
        created.conversationId,
        () =>
          conversationIdRef.current?.toLowerCase() ===
          created.conversationId.toLowerCase(),
      );
      return created;
    },
    [joinRoom, socketClient],
  );

  const resumeConversation = useCallback(
    (params: {
      conversationId: string;
      visitorId?: string | null;
      status?: string;
      messages: WidgetTranscriptMessage[];
    }) => {
      const token = widgetTokenRef.current;
      socketClient.connect({
        authToken: token ?? undefined,
      });
      messageMapRef.current.clear();
      for (const row of params.messages) {
        const normalized = normalizeServerMessage({
          id: row.id,
          conversationId: params.conversationId,
          content: row.content,
          senderType: row.senderType,
          createdAt: row.createdAt,
        });
        if (normalized) {
          messageMapRef.current.set(stableMessageDedupeKey(normalized), normalized);
        }
      }
      setMessages(Array.from(messageMapRef.current.values()));
      setConversationId(params.conversationId);
      conversationIdRef.current = params.conversationId;
      setVisitorId(params.visitorId ?? null);
      setAssigned(params.status === "assigned");
      joinRoom(params.conversationId);
      scheduleJoinRoomRetries(
        (roomId) => socketClient.joinRoom({ conversationId: roomId }),
        params.conversationId,
        () =>
          conversationIdRef.current?.toLowerCase() ===
          params.conversationId.toLowerCase(),
      );
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
      const raw = await sendWidgetVisitorMessage(
        conversationId,
        {
          message: content,
          currentPageUrl: pageUrl,
          ...(sendOpts?.messageType ? { messageType: sendOpts.messageType } : {}),
        },
        widgetTokenRef.current ?? undefined,
      );
      const skipAi = optionsRef.current?.getSkipServerAiReply?.() === true;
      if (!skipAi && raw && typeof raw === "object") {
        const envelope = raw as {
          aiMessage?: {
            id?: string;
            content?: string;
            createdAt?: string;
            senderType?: string;
          };
        };
        const aiRow = envelope.aiMessage;
        if (aiRow?.content?.trim()) {
          const normalized = normalizeServerMessage({
            ...aiRow,
            conversationId,
            senderType: aiRow.senderType ?? "ai",
          });
          if (normalized) upsertMessage(normalized);
        }
      }
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
    resumeConversation,
    sendMessage,
    emitTyping,
    emitStopTyping,
    joinRoom,
    leaveRoom,
    refreshTranscript,
  };
}
