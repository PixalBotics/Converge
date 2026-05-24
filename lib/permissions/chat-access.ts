import { PAGE } from "./permission-constants";
import {
  canAccessRoute,
  canPermissionCode,
  type AuthPermissionArrays,
  type PermissionChecker,
} from "./access-helpers";
import { OP } from "./operational-keys";

const CHAT_MONITOR_OPERATIONAL = [
  OP.chat.audit,
  OP.chat.auditPlatform,
  OP.chat.monitorPool,
  OP.chat.monitorDepartment,
  OP.chat.monitorParentCompany,
  OP.chat.monitorInvolvement,
] as const;

/** Org-scope filters on agent inbox — supervisors / monitor / reseller only (not plain agents). */
const CHAT_INBOX_SCOPE_FILTER_OPERATIONAL = [...CHAT_MONITOR_OPERATIONAL] as const;

export type ChatLiveNavItem = { href: string; label: string };

function hasLegacyChatModule(perms: AuthPermissionArrays): boolean {
  return canPermissionCode(PAGE.CHAT, perms);
}

function hasChatOpsPage(
  perms: AuthPermissionArrays,
  page: string,
): boolean {
  return canPermissionCode(page, perms) || hasLegacyChatModule(perms);
}

function hasChatConfigPage(
  perms: AuthPermissionArrays,
  page: string,
): boolean {
  return (
    canPermissionCode(page, perms) ||
    canPermissionCode(PAGE.CHAT_WIDGET, perms)
  );
}

/** Agent inbox APIs — always from `/auth/me` expanded lists, never role bundle codes. */
export function canAgentChatFromArrays(perms: AuthPermissionArrays): boolean {
  return hasChatOpsPage(perms, PAGE.CHAT_INBOX) && canPermissionCode(OP.chat.access, perms);
}

export function canMonitorFromArrays(perms: AuthPermissionArrays): boolean {
  if (!hasChatOpsPage(perms, PAGE.CHAT_MONITOR)) return false;
  return CHAT_MONITOR_OPERATIONAL.some((code) => canPermissionCode(code, perms));
}

export function canQaFromArrays(perms: AuthPermissionArrays): boolean {
  if (!hasChatOpsPage(perms, PAGE.CHAT_QA)) return false;
  return (
    canPermissionCode(OP.qa.chatReview, perms) ||
    canPermissionCode(OP.qa.chatReviewMessage, perms) ||
    canPermissionCode(OP.qa.chatReviewSession, perms)
  );
}

export function canChatReportsFromArrays(perms: AuthPermissionArrays): boolean {
  return (
    hasChatOpsPage(perms, PAGE.CHAT_REPORTS) &&
    canPermissionCode(OP.chat.reportView, perms)
  );
}

export function canWidgetSettingsFromArrays(perms: AuthPermissionArrays): boolean {
  if (
    !hasChatConfigPage(perms, PAGE.CHAT_CLOSE_POLICY) &&
    !hasChatConfigPage(perms, PAGE.CHAT_CANNED) &&
    !hasChatConfigPage(perms, PAGE.CHAT_INVOLVEMENT) &&
    !hasChatConfigPage(perms, PAGE.CHAT_WIDGET)
  ) {
    return false;
  }
  return (
    canPermissionCode(OP.chatWidget.view, perms) ||
    canPermissionCode(OP.chatWidget.update, perms)
  );
}

export function canAiAssistantFromArrays(perms: AuthPermissionArrays): boolean {
  return (
    (canPermissionCode(PAGE.AI_ASSISTANT, perms) || hasLegacyChatModule(perms)) &&
    (canPermissionCode(OP.aiAssistant.use, perms) ||
      canPermissionCode(OP.aiAssistant.trainingView, perms) ||
      canPermissionCode(OP.chat.access, perms))
  );
}

export function canAiChatbotFromArrays(perms: AuthPermissionArrays): boolean {
  return (
    (canPermissionCode(PAGE.AI_CHATBOT, perms) ||
      canPermissionCode(PAGE.CHAT_WIDGET, perms)) &&
    (canPermissionCode(OP.aiChatbot.trainingView, perms) ||
      canPermissionCode(OP.chatWidget.view, perms) ||
      canPermissionCode(OP.chatWidget.update, perms))
  );
}

/**
 * Agent inbox: `page:chat-inbox` AND expanded `chat:access` from `/auth/me` only.
 */
export function canAccessChatInbox(
  hasOperational: (permission: string) => boolean,
  hasPage?: (pagePermission: string) => boolean,
): boolean {
  if (
    !hasPage?.(PAGE.CHAT_INBOX) &&
    !hasPage?.(PAGE.CHAT)
  ) {
    return false;
  }
  return hasOperational(OP.chat.access);
}

export function canAccessChatInboxFromChecker(perms: PermissionChecker): boolean {
  return canAccessRoute(perms, PAGE.CHAT_INBOX, [OP.chat.access]) ||
    canAccessRoute(perms, PAGE.CHAT, [OP.chat.access]);
}

export function canAccessChatMonitor(hasOperational: (permission: string) => boolean): boolean {
  return CHAT_MONITOR_OPERATIONAL.some((p) => hasOperational(p));
}

export function canMonitorRoute(
  hasPage: (page: string) => boolean,
  hasOperational: (permission: string) => boolean,
): boolean {
  return (
    (hasPage(PAGE.CHAT_MONITOR) || hasPage(PAGE.CHAT)) &&
    canAccessChatMonitor(hasOperational)
  );
}

/**
 * Agent inbox: no org filters for plain agents.
 * Pool head, department head, platform monitor, or reseller bucket (when allowed).
 * QA / reports / settings pages pass their own `apiEnabled` to `useChatScopeFilters`.
 */
export function needsChatScopeFilters(
  hasOperational: (permission: string) => boolean,
  canFilterByResellerId = false,
): boolean {
  if (canFilterByResellerId) return true;
  return CHAT_INBOX_SCOPE_FILTER_OPERATIONAL.some((p) => hasOperational(p));
}

export function buildChatLiveNavItems(
  hasPage: (pagePermission: string) => boolean,
  hasOperational: (permission: string) => boolean,
): ChatLiveNavItem[] {
  const items: ChatLiveNavItem[] = [];
  if (canAccessChatInbox(hasOperational, hasPage)) {
    items.push({ href: "/dashboard/chat-operations", label: "Inbox" });
  }
  if (canMonitorRoute(hasPage, hasOperational)) {
    items.push({ href: "/dashboard/chat-monitor", label: "Monitor" });
  }
  if (
    (hasPage(PAGE.CHAT_QA) || hasPage(PAGE.CHAT)) &&
    canAccessChatQa(hasOperational)
  ) {
    items.push({ href: "/dashboard/chat-qa", label: "QA inbox" });
  }
  if (
    (hasPage(PAGE.CHAT_REPORTS) || hasPage(PAGE.CHAT)) &&
    canViewChatReports(hasOperational)
  ) {
    items.push({ href: "/dashboard/chat-reports", label: "Reports" });
  }
  if (
    (hasPage(PAGE.CHAT_WIDGET) ||
      hasPage(PAGE.CHAT_CLOSE_POLICY) ||
      hasPage(PAGE.CHAT_CANNED) ||
      hasPage(PAGE.CHAT_INVOLVEMENT)) &&
    (hasOperational(OP.chatWidget.view) || hasOperational(OP.chatWidget.update))
  ) {
    items.push({ href: "/dashboard/chat-involvement", label: "Involvement" });
    items.push({ href: "/dashboard/chat-settings/close-policy", label: "Close policy" });
    items.push({ href: "/dashboard/chat-canned", label: "Canned" });
  }
  if (
    (hasPage(PAGE.CHAT_QA_ROSTER) || hasPage(PAGE.CHAT_WIDGET) || hasPage(PAGE.CHAT)) &&
    (hasOperational(OP.qa.chatAssign) ||
      hasOperational(OP.chatWidget.view) ||
      hasOperational(OP.chatWidget.update))
  ) {
    items.push({ href: "/dashboard/chat-settings/qa-roster", label: "QA roster" });
  }
  if (
    (hasPage(PAGE.CHAT_WIDGET) || hasPage(PAGE.CHAT)) &&
    (hasOperational(OP.chatWidget.view) || hasOperational(OP.chatWidget.update))
  ) {
    items.push({ href: "/dashboard/chat-widget", label: "Widget" });
  }
  if (
    (hasPage(PAGE.AI_ASSISTANT) || hasPage(PAGE.CHAT)) &&
    (hasOperational(OP.aiAssistant.use) ||
      hasOperational(OP.aiAssistant.trainingView) ||
      hasOperational(OP.chat.access))
  ) {
    items.push({ href: "/dashboard/ai-training/assistant", label: "AI Assistant" });
  }
  if (
    (hasPage(PAGE.AI_CHATBOT) || hasPage(PAGE.CHAT_WIDGET)) &&
    (hasOperational(OP.aiChatbot.trainingView) ||
      hasOperational(OP.chatWidget.view) ||
      hasOperational(OP.chatWidget.update))
  ) {
    items.push({ href: "/dashboard/ai-training/chatbot", label: "AI Chatbot" });
  }
  return items;
}

export function canWhisper(hasOperational: (permission: string) => boolean): boolean {
  return hasOperational(OP.chat.whisper);
}

export function canRequestTakeover(hasOperational: (permission: string) => boolean): boolean {
  return hasOperational(OP.chat.takeoverRequest);
}

export function canApproveTakeover(hasOperational: (permission: string) => boolean): boolean {
  return hasOperational(OP.chat.takeoverApprove) || hasOperational(OP.chat.takeoverRequest);
}

const CHAT_QA_OPERATIONAL = [
  OP.qa.chatReview,
  OP.qa.chatReviewMessage,
  OP.qa.chatReviewSession,
  OP.qa.chatAssign,
] as const;

export function canViewChatReports(hasOperational: (permission: string) => boolean): boolean {
  return hasOperational(OP.chat.reportView);
}

export function canAccessChatQa(hasOperational: (permission: string) => boolean): boolean {
  return CHAT_QA_OPERATIONAL.some((p) => hasOperational(p));
}

export function canReviewQaSession(hasOperational: (permission: string) => boolean): boolean {
  return hasOperational(OP.qa.chatReviewSession) || hasOperational(OP.qa.chatReview);
}

export function canAnnotateQaMessage(hasOperational: (permission: string) => boolean): boolean {
  return hasOperational(OP.qa.chatReviewMessage) || hasOperational(OP.qa.chatReview);
}

export function canAssignQaReview(hasOperational: (permission: string) => boolean): boolean {
  return hasOperational(OP.qa.chatAssign);
}

export function canSendGuestLink(hasOperational: (permission: string) => boolean): boolean {
  return hasOperational(OP.chat.guestLinkSend) || hasOperational(OP.chat.access);
}

export function canSupervisorCloseChat(hasOperational: (permission: string) => boolean): boolean {
  return (
    hasOperational(OP.chat.supervisorClose) ||
    hasOperational(OP.chat.monitorPool) ||
    hasOperational(OP.chat.monitorDepartment)
  );
}

export function canUseSupervisorTools(hasOperational: (permission: string) => boolean): boolean {
  return (
    canWhisper(hasOperational) ||
    canRequestTakeover(hasOperational) ||
    canApproveTakeover(hasOperational) ||
    canAccessChatMonitor(hasOperational)
  );
}

/** Platform-wide audit — not for tenant QA bundle. */
export function canPlatformChatAudit(hasOperational: (permission: string) => boolean): boolean {
  return hasOperational(OP.chat.auditPlatform);
}
