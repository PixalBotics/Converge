"use client";

import { useEffect, useRef } from "react";
import { getAccessToken } from "@/api";
import { reconnectAgentRealtime } from "@/services/socket/reconnectAgentRealtime";
import { disconnectSharedAgentChat } from "@/services/chat/sharedAgentChatSocket";
import { disconnectSharedNotifications } from "@/services/notifications/notificationsSocket";

/**
 * Keeps multiplexed agent realtime sockets aligned with the dashboard access token.
 * Hard-reconnects when the JWT changes (login-as, revert, token refresh).
 */
export function useAuthRealtimeBridge(
  enabled: boolean,
  authToken: string,
): void {
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (lastTokenRef.current) {
        disconnectSharedAgentChat(true);
        disconnectSharedNotifications(true);
        lastTokenRef.current = null;
      }
      return undefined;
    }

    const token = authToken.trim() || getAccessToken()?.trim() || "";
    if (!token) {
      if (lastTokenRef.current) {
        disconnectSharedAgentChat(true);
        disconnectSharedNotifications(true);
        lastTokenRef.current = null;
      }
      return undefined;
    }

    if (lastTokenRef.current === token) {
      return undefined;
    }

    lastTokenRef.current = token;
    void reconnectAgentRealtime(token);
    return undefined;
  }, [authToken, enabled]);
}
