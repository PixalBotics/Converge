import { describe, expect, it } from "vitest";
import {
  coalesceChatNotificationList,
  upsertConversationNotification,
} from "@/lib/notifications/notification-normalize";
import type { NotificationDto } from "@/services/notifications/notifications.types";

const chat = (
  id: string,
  conversationId: string,
  createdAt: string,
  body: string,
): NotificationDto => ({
  id,
  type: "chat.new_message",
  badgeGroup: "chat",
  title: "Visitor",
  body,
  createdAt,
  readAt: null,
  payload: { conversationId },
});

describe("coalesceChatNotificationList", () => {
  it("keeps newest unread chat row per conversation", () => {
    const items = [
      chat("a", "conv-1", "2026-01-01T10:00:00.000Z", "Hi"),
      chat("b", "conv-1", "2026-01-02T10:00:00.000Z", "Follow up"),
      chat("c", "conv-2", "2026-01-03T10:00:00.000Z", "Other chat"),
    ];
    const out = coalesceChatNotificationList(items);
    expect(out.map((n) => n.id).sort()).toEqual(["b", "c"]);
  });
});

describe("upsertConversationNotification", () => {
  it("removes older unread rows for the same conversation", () => {
    const prev = [chat("old", "conv-1", "2026-01-01T10:00:00.000Z", "Old")];
    const incoming = chat("new", "conv-1", "2026-01-02T10:00:00.000Z", "New");
    const out = upsertConversationNotification(prev, incoming, "conv-1");
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe("new");
  });
});
