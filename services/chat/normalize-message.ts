import type { ChatMessage, ChatParticipantRole } from "./chat.types";

/** Raw message payloads from Socket.IO / history (Prisma-style or transitional). */
export type RawChatMessagePayload = Record<string, unknown>;

function coerceString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function inferRole(payload: Record<string, unknown>): ChatParticipantRole {
  const roleRaw = coerceString(payload.role).toLowerCase();
  const userTypeRaw = coerceString((payload.userType ?? payload.senderType ?? payload.authorType) as unknown).toLowerCase();

  if (roleRaw === "ai") return "system";
  if (
    roleRaw === "visitor" ||
    roleRaw === "agent" ||
    roleRaw === "system" ||
    roleRaw === "assistant"
  ) {
    if (roleRaw === "assistant") return "system";
    return roleRaw as ChatParticipantRole;
  }
  if (userTypeRaw === "visitor") return "visitor";
  if (userTypeRaw === "agent") return "agent";
  if (userTypeRaw === "ai") return "system";
  const senderRaw = coerceString(payload.sender ?? payload.sentBy ?? payload.messageSender).toLowerCase();
  if (senderRaw.includes("visitor")) return "visitor";
  if (senderRaw.includes("agent")) return "agent";
  if (senderRaw.includes("system") || senderRaw.includes("ai")) return "system";
  return "visitor";
}

/**
 * Normalize backend message payloads (REST history + Socket.IO) into {@link ChatMessage}.
 */
export function normalizeServerMessage(payload: unknown): ChatMessage | null {
  if (!payload || typeof payload !== "object") return null;
  const pl = payload as RawChatMessagePayload;

  const conversationId = coerceString(
    pl.conversationId ?? pl.conversation_id ?? pl.chatId ?? pl.chat_id,
  );
  if (!conversationId) return null;

  const content =
    coerceString(pl.message) ||
    coerceString(pl.content) ||
    coerceString(pl.text) ||
    coerceString(pl.body);

  const id =
    (typeof pl.id === "string" && pl.id) ||
    (typeof pl.messageId === "string" && pl.messageId) ||
    undefined;

  const createdAt =
    (typeof pl.createdAt === "string" && pl.createdAt) ||
    (typeof pl.created_at === "string" && pl.created_at) ||
    (typeof pl.timestamp === "string" && pl.timestamp) ||
    undefined;

  const senderId =
    (typeof pl.senderId === "string" && pl.senderId) ||
    (typeof pl.userId === "string" && pl.userId) ||
    (typeof pl.agentId === "string" && pl.agentId) ||
    (typeof pl.visitorId === "string" && pl.visitorId) ||
    undefined;

  const senderName =
    (typeof pl.senderName === "string" && pl.senderName) ||
    (typeof pl.name === "string" && pl.name) ||
    undefined;

  const meta =
    typeof pl.metadata === "object" && pl.metadata !== null
      ? (pl.metadata as Record<string, unknown>)
      : typeof pl.meta === "object" && pl.meta !== null
        ? (pl.meta as Record<string, unknown>)
        : undefined;

  const messageType =
    (typeof pl.messageType === "string" && pl.messageType) ||
    (typeof pl.message_type === "string" && pl.message_type) ||
    undefined;

  const attachmentMetadata =
    typeof pl.attachmentMetadata === "object" && pl.attachmentMetadata !== null
      ? (pl.attachmentMetadata as Record<string, unknown>)
      : typeof pl.attachment_metadata === "object" && pl.attachment_metadata !== null
        ? (pl.attachment_metadata as Record<string, unknown>)
        : undefined;

  const role = inferRole(pl as Record<string, unknown>);

  const mergedMetadata: Record<string, unknown> = {
    ...(meta ?? {}),
    ...(messageType ? { messageType } : {}),
    ...(attachmentMetadata ? { attachmentMetadata } : {}),
  };
  if (attachmentMetadata) {
    if (typeof attachmentMetadata.href === "string") {
      mergedMetadata.href = attachmentMetadata.href;
    }
    if (typeof attachmentMetadata.label === "string") {
      mergedMetadata.label = attachmentMetadata.label;
    }
    if (typeof attachmentMetadata.category === "string") {
      mergedMetadata.category = attachmentMetadata.category;
    }
  }

  return {
    id,
    conversationId,
    content,
    role,
    senderId,
    senderName,
    createdAt,
    ...(Object.keys(mergedMetadata).length ? { metadata: mergedMetadata } : {}),
  };
}
