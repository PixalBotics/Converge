import { describe, expect, it } from "vitest";
import {
  mergeNotificationItems,
  upsertNotificationItem,
} from "./notification-state.utils";
import type { NotificationDto } from "@/services/notifications/notifications.types";

const sample = (id: string, createdAt: string): NotificationDto => ({
  id,
  type: "chat.new_message",
  badgeGroup: "chat",
  title: "Visitor",
  body: "Hi",
  createdAt,
  readAt: null,
});

describe("mergeNotificationItems", () => {
  it("keeps socket unread rows when REST returns empty", () => {
    const prev = [sample("a", "2026-01-02T10:00:00.000Z")];
    const merged = mergeNotificationItems([], prev, true);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.id).toBe("a");
  });

  it("prefers server ordering for overlapping ids", () => {
    const prev = [sample("a", "2026-01-01T10:00:00.000Z")];
    const server = [sample("b", "2026-01-03T10:00:00.000Z")];
    const merged = mergeNotificationItems(server, prev, true);
    expect(merged.map((n) => n.id)).toEqual(["b", "a"]);
  });
});

describe("upsertNotificationItem", () => {
  it("prepends new notification", () => {
    const next = upsertNotificationItem(
      [sample("old", "2026-01-01T10:00:00.000Z")],
      sample("new", "2026-01-02T10:00:00.000Z"),
    );
    expect(next[0]?.id).toBe("new");
  });
});
