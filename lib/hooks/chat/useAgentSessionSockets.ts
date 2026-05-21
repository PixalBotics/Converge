"use client";

import { useEffect, useRef } from "react";
import { getAccessToken } from "@/api";
import { publishAgentInboxRefresh } from "@/lib/hooks/chat/agent-inbox-refresh-bus";
import { playNotificationSound } from "@/lib/notifications/notification-sounds";
import { publishAppToast } from "@/lib/notify";
import { getSharedAgentChatSocket } from "@/services/chat/sharedAgentChatSocket";
import { conversationIdFromSocketPayload } from "./agent-chat.utils";

const REFRESH_DEBOUNCE_MS = 500;

/**
 * Keeps agent `/chat` connected for the dashboard session (popups + queue refresh).
 * Inbox page adds message handlers via {@link useAgentChatSocket}.
 */
export function useAgentSessionSockets(enabled: boolean): void {
  const token = getAccessToken() ?? "";
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !token) return undefined;

    const socketClient = getSharedAgentChatSocket();
    const scheduleRefresh = () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => {
        refreshTimerRef.current = null;
        publishAgentInboxRefresh();
      }, REFRESH_DEBOUNCE_MS);
    };

    const tokenChanged = connectedTokenRef.current !== token;
    if (tokenChanged) {
      connectedTokenRef.current = token;
      socketClient.connect({ authToken: token, forceNew: true });
    } else {
      socketClient.connect({ authToken: token });
    }

    const offAssignment = socketClient.onAgentAssignmentPopup((payload) => {
      playNotificationSound("chat");
      const cid = conversationIdFromSocketPayload(payload);
      publishAppToast({
        message: cid ? `New chat assigned · ${cid.slice(0, 8)}` : "New chat assigned",
        severity: "success",
      });
      scheduleRefresh();
    });

    const offQueue = socketClient.onAgentQueuePopup((payload) => {
      playNotificationSound("chat");
      publishAppToast({
        message: "Visitor waiting in queue",
        severity: "success",
      });
      scheduleRefresh();
    });

    const offTransferred = socketClient.onChatTransferred(scheduleRefresh);
    const offCompleted = socketClient.onChatCompleted(scheduleRefresh);
    const offClosed = socketClient.onChatClosed(scheduleRefresh);
    const offAssigned = socketClient.onChatAssigned(scheduleRefresh);
    const offQueued = socketClient.onChatQueued(scheduleRefresh);

    scheduleRefresh();

    return () => {
      offAssignment();
      offQueue();
      offTransferred();
      offCompleted();
      offClosed();
      offAssigned();
      offQueued();
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    };
  }, [enabled, token]);
}
