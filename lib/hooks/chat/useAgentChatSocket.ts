"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import type { ChatSocketClient } from "@/services/chat/chatSocket";
import type { TypingPayload } from "@/services/chat/chat.types";
import { conversationIdFromSocketPayload } from "./agent-chat.utils";

export interface AgentChatSocketHandlers {
  onVisitorMessage: (message: import("@/services/chat/chat.types").ChatMessage) => void;
  onRefreshQueues: () => void;
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

/** Fallback poll when socket is up (debounced socket refresh is primary). */
const POLL_MS = 60_000;
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

    const tokenChanged = connectedTokenRef.current !== token;
    if (tokenChanged) {
      connectedTokenRef.current = token;
      socketClient.connect({ authToken: token, forceNew: true });
    } else {
      socketClient.connect({ authToken: token });
    }

    onConnectedChangeRef.current(socketClient.isConnected());

    const offSocketConnect = socketClient.onSocketConnect(() => {
      onConnectedChangeRef.current(true);
      scheduleRefresh();
    });
    const offSocketDisconnect = socketClient.onSocketDisconnect(() => {
      onConnectedChangeRef.current(false);
    });
    const offConnected = socketClient.onConnected(() => {
      onConnectedChangeRef.current(true);
      scheduleRefresh();
    });

    const offVisitorMessage = socketClient.onVisitorMessage((m) =>
      getHandlers().onVisitorMessage(m),
    );
    const offAgentMessage = socketClient.onAgentMessage((m) =>
      getHandlers().onVisitorMessage(m),
    );
    const offAiMessage = socketClient.onAiMessage((m) => getHandlers().onVisitorMessage(m));

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
    const poll = window.setInterval(scheduleRefresh, POLL_MS);

    return () => {
      window.clearInterval(poll);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
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
      connectedTokenRef.current = null;
    };
  }, [socketClient, token]);
}

export { conversationIdFromSocketPayload };
