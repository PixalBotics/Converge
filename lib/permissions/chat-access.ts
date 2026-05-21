import { OP } from "./operational-keys";

const CHAT_MONITOR_OPERATIONAL = [
  OP.chat.audit,
  OP.chat.auditPlatform,
  OP.chat.monitorPool,
  OP.chat.monitorDepartment,
  OP.chat.monitorParentCompany,
] as const;

export function canAccessChatMonitor(hasOperational: (permission: string) => boolean): boolean {
  return CHAT_MONITOR_OPERATIONAL.some((p) => hasOperational(p));
}

/**
 * Agent inbox + socket: needs operational `chat:access`, or page `page:chat` when the role
 * only grants the module page key (common misconfiguration — APIs may still require `chat:access`).
 */
export function canAccessChatInbox(
  hasOperational: (permission: string) => boolean,
  hasPage?: (pagePermission: string) => boolean,
): boolean {
  if (hasOperational(OP.chat.access)) return true;
  if (hasPage?.("page:chat")) return true;
  return false;
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
  return (
    hasOperational(OP.chat.guestLinkSend) ||
    hasOperational(OP.chat.access)
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
