import { apiClient } from "@/api";
import { unwrapChatHttpData } from "@/services/chat/http";
import type { BadgeCounts, NotificationDto, NotificationsListResponse } from "./notifications.types";
import {
  normalizeBadgeCounts as normalizeBadgeCountsInner,
} from "@/lib/hooks/notifications/notification-state.utils";
import {
  normalizeNotificationItems,
  reconcileBadgeCounts,
} from "@/lib/hooks/notifications/notification-normalize";

export type NotificationsSnapshot = {
  items: NotificationDto[];
  badgeCounts: BadgeCounts;
};

export async function fetchNotificationsSnapshot(params?: {
  unreadOnly?: boolean;
}): Promise<NotificationsSnapshot> {
  const { data } = await apiClient.get<unknown>("/notifications/me", {
    params: params?.unreadOnly ? { unreadOnly: "true" } : undefined,
  });
  const raw = unwrapChatHttpData<NotificationsListResponse | NotificationDto[]>(data);
  if (Array.isArray(raw)) {
    const items = normalizeNotificationItems(raw);
    return { items, badgeCounts: reconcileBadgeCounts(EMPTY_BADGES, items) };
  }
  const items = normalizeNotificationItems(raw?.items ?? []);
  const badgeCounts = reconcileBadgeCounts(
    normalizeBadgeCountsInner(raw?.badgeCounts),
    items,
  );
  return { items, badgeCounts };
}

const EMPTY_BADGES: BadgeCounts = {
  chat: 0,
  qa: 0,
  hrms_leave: 0,
  hrms_attendance: 0,
};

export async function fetchNotificationBadgeCounts(): Promise<BadgeCounts> {
  const { data } = await apiClient.get<unknown>("/notifications/me/badge-counts");
  return parseBadgeCountsResponse(data);
}

export async function fetchMyNotifications(params?: {
  unreadOnly?: boolean;
}): Promise<NotificationDto[]> {
  const snapshot = await fetchNotificationsSnapshot(params);
  return snapshot.items;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.patch<unknown>(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
    {},
  );
}

export async function markAllNotificationsRead(badgeGroup?: string): Promise<BadgeCounts> {
  // Must send `{}` — axios serializes `null` as the literal "null", which express.json rejects (400).
  const { data } = await apiClient.post<unknown>("/notifications/me/mark-all-read", {}, {
    params: badgeGroup ? { badgeGroup } : undefined,
  });
  return parseBadgeCountsResponse(data);
}

function parseBadgeCountsResponse(payload: unknown): BadgeCounts {
  const raw = unwrapChatHttpData<BadgeCounts | { badgeCounts?: BadgeCounts; counts?: BadgeCounts }>(
    payload,
  );
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (o.badgeCounts && typeof o.badgeCounts === "object") {
      return normalizeBadgeCounts(o.badgeCounts);
    }
    if (o.counts && typeof o.counts === "object") {
      return normalizeBadgeCounts(o.counts);
    }
    if ("chat" in o || "qa" in o || "hrms_leave" in o || "hrms_attendance" in o) {
      return normalizeBadgeCounts(o);
    }
  }
  return normalizeBadgeCounts(raw);
}

function normalizeBadgeCounts(raw: unknown): BadgeCounts {
  return normalizeBadgeCountsInner(raw);
}
