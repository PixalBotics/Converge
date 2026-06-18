"use client";

import { useAuth } from "@/lib/auth";
import { isDashboardAccessToken } from "@/lib/auth/access-token";
import { isAuthSessionTerminated } from "@/api";
import { useAccessToken } from "@/lib/auth/use-access-token";
import { useAuthRealtimeBridge } from "@/lib/auth/useAuthRealtimeBridge";
import { useAgentSessionSockets } from "@/lib/hooks/chat/useAgentSessionSockets";
import { useChatApiGates } from "@/lib/permissions";
import { NotificationsProvider } from "@/lib/notifications/NotificationsContext";

export function AgentDashboardProviders({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const gates = useChatApiGates();
  const token = useAccessToken()?.trim() ?? "";
  const realtimeEnabled =
    isAuthenticated &&
    Boolean(token) &&
    isDashboardAccessToken(token) &&
    !isAuthSessionTerminated();
  const chatSocketEnabled =
    realtimeEnabled && (gates.agentInbox || gates.monitor);

  useAuthRealtimeBridge(realtimeEnabled, token);
  useAgentSessionSockets(chatSocketEnabled, {
    inboxDeltas: gates.agentInbox,
    respectChatSession: gates.agentInbox,
  });

  return <NotificationsProvider enabled={realtimeEnabled}>{children}</NotificationsProvider>;
}
