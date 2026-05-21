"use client";

import { useAuth } from "@/lib/auth";
import { PERMISSION_BUCKET_PAGE, toPermissionSet } from "@/lib/auth/permissions-model";
import { useAgentSessionSockets } from "@/lib/hooks/chat/useAgentSessionSockets";
import { canAccessChatInbox } from "@/lib/permissions/chat-access";
import { NotificationsProvider } from "@/lib/notifications/NotificationsContext";

export function AgentDashboardProviders({ children }: { children: React.ReactNode }) {
  const { hasOperational, hasPage, permissionsByType, isAuthenticated } = useAuth();
  const pageSet = toPermissionSet(permissionsByType?.[PERMISSION_BUCKET_PAGE]);
  const hasChatPage = pageSet.has("page:chat");
  const inboxEnabled =
    isAuthenticated && hasChatPage && canAccessChatInbox(hasOperational, hasPage);

  useAgentSessionSockets(inboxEnabled);

  return <NotificationsProvider enabled={isAuthenticated}>{children}</NotificationsProvider>;
}
