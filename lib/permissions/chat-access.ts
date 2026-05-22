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

/** Agent inbox APIs — always from `/auth/me` expanded lists, never role bundle codes. */
export function canAgentChatFromArrays(perms: AuthPermissionArrays): boolean {
  return canPermissionCode(PAGE.CHAT, perms) && canPermissionCode(OP.chat.access, perms);
}

export function canMonitorFromArrays(perms: AuthPermissionArrays): boolean {
  if (!canPermissionCode(PAGE.CHAT, perms)) return false;
  return CHAT_MONITOR_OPERATIONAL.some((code) => canPermissionCode(code, perms));
}

export function canQaFromArrays(perms: AuthPermissionArrays): boolean {
  return (
    canPermissionCode(PAGE.CHAT, perms) &&
    (canPermissionCode(OP.qa.chatReview, perms) ||
      canPermissionCode(OP.qa.chatReviewMessage, perms) ||
      canPermissionCode(OP.qa.chatReviewSession, perms))
  );
}

export function canChatReportsFromArrays(perms: AuthPermissionArrays): boolean {
  return canPermissionCode(PAGE.CHAT, perms) && canPermissionCode(OP.chat.reportView, perms);
}

export function canWidgetSettingsFromArrays(perms: AuthPermissionArrays): boolean {
  if (!canPermissionCode(PAGE.CHAT_WIDGET, perms)) return false;
  return (
    canPermissionCode(OP.chatWidget.view, perms) || canPermissionCode(OP.chatWidget.update, perms)
  );
}

/**
 * Agent inbox: `page:chat` AND expanded `chat:access` from `/auth/me` only.
 */
export function canAccessChatInbox(
  hasOperational: (permission: string) => boolean,
  hasPage?: (pagePermission: string) => boolean,
): boolean {
  if (!hasPage?.(PAGE.CHAT)) return false;
  return hasOperational(OP.chat.access);
}

export function canAccessChatInboxFromChecker(perms: PermissionChecker): boolean {
  return canAccessRoute(perms, PAGE.CHAT, [OP.chat.access]);
}

export function canAccessChatMonitor(hasOperational: (permission: string) => boolean): boolean {
  return CHAT_MONITOR_OPERATIONAL.some((p) => hasOperational(p));
}

export function canMonitorRoute(
  hasPage: (page: string) => boolean,
  hasOperational: (permission: string) => boolean,
): boolean {
  return hasPage(PAGE.CHAT) && canAccessChatMonitor(hasOperational);
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
  if (hasPage(PAGE.CHAT) && canAccessChatQa(hasOperational)) {
    items.push({ href: "/dashboard/chat-qa", label: "QA inbox" });
  }
  if (hasPage(PAGE.CHAT) && canViewChatReports(hasOperational)) {
    items.push({ href: "/dashboard/chat-reports", label: "Reports" });
  }
  if (
    hasPage(PAGE.CHAT_WIDGET) &&
    (hasOperational(OP.chatWidget.view) || hasOperational(OP.chatWidget.update))
  ) {
    items.push({ href: "/dashboard/chat-involvement", label: "Involvement" });
    items.push({ href: "/dashboard/chat-settings", label: "Canned" });
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
