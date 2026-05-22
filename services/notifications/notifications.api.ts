import { apiClient } from "@/api";
import { unwrapChatHttpData } from "@/services/chat/http";
import type { BadgeCounts, NotificationDto, NotificationsListResponse } from "./notifications.types";

export async function fetchNotificationBadgeCounts(): Promise<BadgeCounts> {
  const { data } = await apiClient.get<unknown>("/notifications/me/badge-counts");
  const raw = unwrapChatHttpData<BadgeCounts | { counts?: BadgeCounts }>(data);
  if (raw && typeof raw === "object" && "counts" in raw && raw.counts) {
    return normalizeBadgeCounts(raw.counts);
  }
  return normalizeBadgeCounts(raw);
}

export async function fetchMyNotifications(params?: {
  unreadOnly?: boolean;
}): Promise<NotificationDto[]> {
  const { data } = await apiClient.get<unknown>("/notifications/me", {
    params: params?.unreadOnly ? { unreadOnly: "true" } : undefined,
  });
  const raw = unwrapChatHttpData<NotificationsListResponse | NotificationDto[]>(data);
  if (Array.isArray(raw)) return raw;
  return raw?.items ?? [];
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
  const raw = unwrapChatHttpData<BadgeCounts | { badgeCounts?: BadgeCounts }>(data);
  if (raw && typeof raw === "object" && "badgeCounts" in raw && raw.badgeCounts) {
    return normalizeBadgeCounts(raw.badgeCounts);
  }
  return normalizeBadgeCounts(raw);
}

function normalizeBadgeCounts(raw: unknown): BadgeCounts {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    chat: Number(o.chat ?? 0) || 0,
    qa: Number(o.qa ?? 0) || 0,
    hrms_leave: Number(o.hrms_leave ?? o.hrmsLeave ?? 0) || 0,
  };
}
