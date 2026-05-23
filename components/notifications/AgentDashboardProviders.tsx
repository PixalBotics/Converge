"use client";

import { useAuth } from "@/lib/auth";
import { useAgentSessionSockets } from "@/lib/hooks/chat/useAgentSessionSockets";
import { useChatApiGates } from "@/lib/permissions";
import { NotificationsProvider } from "@/lib/notifications/NotificationsContext";

export function AgentDashboardProviders({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, permissionsSyncing } = useAuth();
  const gates = useChatApiGates();
  const inboxEnabled = isAuthenticated && !permissionsSyncing && gates.agentInbox;

  useAgentSessionSockets(inboxEnabled);

  return <NotificationsProvider enabled={isAuthenticated}>{children}</NotificationsProvider>;
}
