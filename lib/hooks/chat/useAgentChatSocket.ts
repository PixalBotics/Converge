"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import type { ChatSocketClient } from "@/services/chat/chatSocket";
import type { TypingPayload } from "@/services/chat/chat.types";
import { conversationIdFromSocketPayload } from "./agent-chat.utils";
import { publishAgentInboxRefreshSoon } from "@/lib/hooks/chat/agent-inbox-refresh-bus";
import {
  CHAT_RECONNECT_SYNC_DEBOUNCE_MS,
  normalizeSocketMessage,
  scheduleJoinRoomRetries,
  unwrapSocketMessagePayload,
} from "./chat-socket-delivery";

export interface AgentChatSocketHandlers {
  onVisitorMessage: (message: import("@/services/chat/chat.types").ChatMessage) => void;
  onRefreshQueues: () => void;
  /** One-shot REST gap-fill after reconnect (not on every message). */
  onReconnectHistorySync?: () => void;
  onSessionEnded: (payload: unknown) => void;
  onChatResumed: (payload: unknown) => void;
  onVisitorTyping: (typing: boolean) => void;
  onChatCompleted?: (payload: unknown) => void;
  onChatWhisper?: (payload: unknown) => void;
  onTakeoverRequested?: (payload: unknown) => void;
  onTakeoverUpdate?: (payload: unknown) => void;
  onChatTransferred?: (payload: unknown) => void;
  onSupervisorControl?: (payload: unknown) => void;
  onAgentWrapUpForm?: (payload: unknown) => void;
  onAgentWrapUpSubmitted?: (payload: unknown) => void;
  onAgentDistributionSubmitted?: (payload: unknown) => void;
  selectedConversationIdRef: MutableRefObject<string | null>;
  selectedIsClosedRef: MutableRefObject<boolean>;
}

const REFRESH_DEBOUNCE_MS = 500;
const SESSION_ENDED_DEDUPE_MS = 2500;

export function useAgentChatSocket(
  token: string,
  socketClient: ChatSocketClient,
  handlers: AgentChatSocketHandlers,
  onConnectedChange: (connected: boolean) => void,
): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const onConnectedChangeRef = useRef(onConnectedChange);
  onConnectedChangeRef.current = onConnectedChange;

  const connectedTokenRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionEndedDedupeRef = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    if (!token) {
      connectedTokenRef.current = null;
      return undefined;
    }

    const getHandlers = () => handlersRef.current;

    const scheduleRefresh = () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => {
        refreshTimerRef.current = null;
        getHandlers().onRefreshQueues();
      }, REFRESH_DEBOUNCE_MS);
    };

    const scheduleReconnectHistorySync = () => {
      if (reconnectSyncTimerRef.current) clearTimeout(reconnectSyncTimerRef.current);
      reconnectSyncTimerRef.current = setTimeout(() => {
        reconnectSyncTimerRef.current = null;
        getHandlers().onReconnectHistorySync?.();
      }, CHAT_RECONNECT_SYNC_DEBOUNCE_MS);
    };

    const emitSessionEndedOnce = (payload: unknown) => {
      const cid = conversationIdFromSocketPayload(payload) ?? "";
      const now = Date.now();
      const prev = sessionEndedDedupeRef.current;
      if (cid && prev?.key === cid && now - prev.at < SESSION_ENDED_DEDUPE_MS) {
        return;
      }
      if (cid) sessionEndedDedupeRef.current = { key: cid, at: now };

      const h = getHandlers();
      h.onSessionEnded(payload);
      if (h.onChatCompleted && h.onChatCompleted !== h.onSessionEnded) {
        h.onChatCompleted(payload);
      }
    };

    const deliverSocketMessage = (payload: unknown) => {
      const cid = getHandlers().selectedConversationIdRef.current;
      let normalized = normalizeSocketMessage(payload, cid);
      if (!normalized && cid) {
        const payloadCid = conversationIdFromSocketPayload(payload);
        if (payloadCid && payloadCid.toLowerCase() === cid.toLowerCase()) {
          const unwrapped = unwrapSocketMessagePayload(payload);
          if (unwrapped && typeof unwrapped === "object") {
            normalized = normalizeSocketMessage(
              { ...(unwrapped as Record<string, unknown>), conversationId: payloadCid },
              cid,
            );
          }
        }
      }
      if (!normalized) {
        scheduleReconnectHistorySync();
        return;
      }
      getHandlers().onVisitorMessage(normalized);
    };

    const tokenChanged = connectedTokenRef.current !== token;
    if (tokenChanged) {
      connectedTokenRef.current = token;
      socketClient.connect({ authToken: token, forceNew: true });
    } else {
      socketClient.connect({ authToken: token });
    }

    onConnectedChangeRef.current(socketClient.isConnected());

    let clearJoinRetries: (() => void) | undefined;

    const resyncAfterReconnect = () => {
      onConnectedChangeRef.current(true);
      clearJoinRetries?.();
      clearJoinRetries = undefined;
      const cid = getHandlers().selectedConversationIdRef.current;
      if (cid && !getHandlers().selectedIsClosedRef.current) {
        socketClient.joinRoom({ conversationId: cid });
        clearJoinRetries = scheduleJoinRoomRetries(
          (roomId) => socketClient.joinRoom({ conversationId: roomId }),
          cid,
          () =>
            getHandlers().selectedConversationIdRef.current?.toLowerCase() ===
            cid.toLowerCase(),
        );
      }
      scheduleRefresh();
      scheduleReconnectHistorySync();
    };

    const offSocketConnect = socketClient.onSocketConnect(resyncAfterReconnect);
    const offSocketDisconnect = socketClient.onSocketDisconnect(() => {
      onConnectedChangeRef.current(false);
    });
    const offConnected = socketClient.onConnected(resyncAfterReconnect);

    const offVisitorMessage = socketClient.onVisitorMessageRaw((payload) => {
      deliverSocketMessage(payload);
    });
    const offAgentMessage = socketClient.onAgentMessageRaw((payload) => {
      deliverSocketMessage(payload);
    });
    const offAiMessage = socketClient.onAiMessageRaw((payload) => {
      deliverSocketMessage(payload);
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
      const payload =
        update.payload && typeof update.payload === "object"
          ? {
              ...(update.payload as Record<string, unknown>),
              conversationId:
                (update.payload as { conversationId?: string }).conversationId ??
                update.conversationId,
            }
          : update.payload;
      deliverSocketMessage(payload);
    });

    const offTyping = socketClient.onTyping((payload: TypingPayload) => {
      const cid = getHandlers().selectedConversationIdRef.current;
      if (!cid || payload.conversationId !== cid || getHandlers().selectedIsClosedRef.current) {
        return;
      }
      if (payload.userType === "visitor" || payload.userType == null) {
        getHandlers().onVisitorTyping(true);
      }
    });
    const offStopTyping = socketClient.onStopTyping((payload: TypingPayload) => {
      const cid = getHandlers().selectedConversationIdRef.current;
      if (!cid || payload.conversationId !== cid) return;
      getHandlers().onVisitorTyping(false);
    });

    const offAssigned = socketClient.onChatAssigned(scheduleRefresh);
    const offQueued = socketClient.onChatQueued(scheduleRefresh);
    const offHandover = socketClient.onChatHandover(() => publishAgentInboxRefreshSoon());
    const offResumed = socketClient.onChatResumed((p) => getHandlers().onChatResumed(p));
    const offClosed = socketClient.onChatClosed(emitSessionEndedOnce);
    const offCompleted = socketClient.onChatCompleted(emitSessionEndedOnce);
    const offTransferred = socketClient.onChatTransferred((p) => {
      scheduleRefresh();
      getHandlers().onChatTransferred?.(p);
    });
    const offSupervisorControl = socketClient.onSupervisorControl((p) => {
      scheduleRefresh();
      getHandlers().onSupervisorControl?.(p);
    });
    const offWhisper = socketClient.onChatWhisper((p) => getHandlers().onChatWhisper?.(p));
    const offTakeoverReq = socketClient.onTakeoverRequested((p) =>
      getHandlers().onTakeoverRequested?.(p),
    );
    const offTakeoverUpd = socketClient.onTakeoverUpdate((p) => getHandlers().onTakeoverUpdate?.(p));

    const wrapUpHandler = (p: unknown) => getHandlers().onAgentWrapUpForm?.(p);
    const offWrapUpForm = socketClient.onAgentWrapUpForm(wrapUpHandler);
    const offWrapUpRequired = socketClient.onAgentWrapUpRequired(wrapUpHandler);
    const offWrapUpSubmitted = socketClient.onAgentWrapUpSubmitted((p) =>
      getHandlers().onAgentWrapUpSubmitted?.(p),
    );
    const offDistributionSubmitted = socketClient.onAgentDistributionSubmitted((p) =>
      getHandlers().onAgentDistributionSubmitted?.(p),
    );

    scheduleRefresh();

    return () => {
      clearJoinRetries?.();
      clearJoinRetries = undefined;
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      if (reconnectSyncTimerRef.current) clearTimeout(reconnectSyncTimerRef.current);
      refreshTimerRef.current = null;
      reconnectSyncTimerRef.current = null;
      offConnected();
      offSocketConnect();
      offSocketDisconnect();
      offVisitorMessage();
      offAgentMessage();
      offAiMessage();
      offMonitorLive();
      offTyping();
      offStopTyping();
      offAssigned();
      offQueued();
      offHandover();
      offResumed();
      offClosed();
      offCompleted();
      offTransferred();
      offSupervisorControl();
      offWhisper();
      offTakeoverReq();
      offTakeoverUpd();
      offWrapUpForm();
      offWrapUpRequired();
      offWrapUpSubmitted();
      offDistributionSubmitted();
    };
  }, [socketClient, token]);
}

export { conversationIdFromSocketPayload };
