import type { ChatMessage } from "@/services/chat/chat.types";

export function stableMessageDedupeKey(message: ChatMessage): string {
  if (message.id) return `id:${message.id}`;
  return `${message.conversationId}:${message.role}:${message.createdAt ?? ""}:${message.content}`;
}

export function conversationIdFromSocketPayload(payload: unknown): string | null {
  if (typeof payload !== "object" || !payload) return null;
  const o = payload as Record<string, unknown>;
  const id = o.conversationId ?? o.conversation_id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

export function sortMessagesChronologically(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    if (ta !== tb) return ta - tb;
    return String(a.id ?? "").localeCompare(String(b.id ?? ""));
  });
}
