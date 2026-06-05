"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { isAuthSessionTerminated } from "@/api";
import { isDashboardAccessToken } from "@/lib/auth/access-token";
import { useAccessToken } from "@/lib/auth/use-access-token";
import {
  fetchNotificationsSnapshot,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationsSnapshot,
} from "@/services/notifications/notifications.api";
import type {
  BadgeCounts,
  NotificationDto,
  NotificationSocketEvent,
} from "@/services/notifications/notifications.types";
import {
  connectSharedNotifications,
  getSharedNotificationsSocket,
} from "@/services/notifications/notificationsSocket";
import {
  playNotificationSound,
  playSoundForNotificationType,
  soundKeyForNotificationType,
} from "@/lib/notifications/notification-sounds";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import { publishAgentChatMessageSync } from "@/lib/hooks/chat/agent-chat-message-sync-bus";
import {
  subscribeAgentChatNotificationSync,
  type AgentChatNotificationSyncReason,
} from "@/lib/hooks/chat/agent-chat-notification-sync-bus";
import { conversationIdFromNotificationPayload } from "@/lib/hooks/chat/chat-socket-delivery";
import type { NotificationBadgeGroup } from "@/services/notifications/notifications.types";
import {
  EMPTY_BADGES,
  mergeNotificationItems,
  normalizeBadgeCounts,
  totalUnread,
} from "@/lib/hooks/notifications/notification-state.utils";
import {
  normalizeNotificationDto,
  upsertConversationNotification,
} from "@/lib/notifications/notification-normalize";

const CHAT_SYNC_RETRY_DELAYS_MS = [400, 900, 1800] as const;
const RECONCILE_INTERVAL_MS = 45_000;
const CHAT_ALERT_DEDUPE_MS = 3_000;

type FetchSnapshotResult = {
  seq: number;
  snapshot: NotificationsSnapshot | null;
};

function isUnauthorizedError(err: unknown): boolean {
  return isAxiosError(err) && err.response?.status === 401;
}

function canFetchNotifications(token: string): boolean {
  return isDashboardAccessToken(token) && !isAuthSessionTerminated();
}

function clearNotificationsState(
  setItems: (value: NotificationDto[]) => void,
  setBadgeCounts: (value: BadgeCounts) => void,
): void {
  setItems([]);
  setBadgeCounts(EMPTY_BADGES);
}

function publishNotificationToast(n: NotificationDto): void {
  const message = n.body?.trim() || n.title?.trim() || "New notification";
  publishAppToast({ variant: "success", message });
}

function countVisibleUnread(items: NotificationDto[]): number {
  return items.filter((n) => !n.readAt).length;
}

export function useNotifications(enabled: boolean) {
  const token = useAccessToken() ?? "";
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>(EMPTY_BADGES);
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const badgeCountsRef = useRef(badgeCounts);
  badgeCountsRef.current = badgeCounts;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const fetchSeqRef = useRef(0);
  const chatAlertDedupeRef = useRef<{ at: number; conversationId: string | null }>({
    at: 0,
    conversationId: null,
  });
  const chatSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatSyncRetryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const chatSyncPendingRef = useRef<{
    reason: AgentChatNotificationSyncReason;
    conversationId?: string;
  } | null>(null);

  const shouldSkipChatAlert = useCallback((conversationId: string | null): boolean => {
    if (!conversationId) return false;
    const prev = chatAlertDedupeRef.current;
    return prev.conversationId === conversationId && Date.now() - prev.at < CHAT_ALERT_DEDUPE_MS;
  }, []);

  const recordChatAlert = useCallback((conversationId: string | null): void => {
    chatAlertDedupeRef.current = { at: Date.now(), conversationId };
  }, []);

  const alertChatNotification = useCallback(
    (notification: NotificationDto, conversationId?: string | null): void => {
      const cid =
        conversationId?.trim() ||
        conversationIdFromNotificationPayload(notification) ||
        null;
      if (shouldSkipChatAlert(cid)) return;

      publishNotificationToast(notification);
      recordChatAlert(cid);

      const soundKey =
        notification.soundKey ??
        soundKeyForNotificationType(notification.type) ??
        "chat";
      if (soundKey) playNotificationSound(soundKey);
      else playSoundForNotificationType(notification.type);
    },
    [recordChatAlert, shouldSkipChatAlert],
  );

  const applySnapshot = useCallback(
    (
      counts: BadgeCounts,
      list: NotificationDto[],
      unreadOnly: boolean,
      seq: number,
    ) => {
      if (seq !== fetchSeqRef.current) return;
      setBadgeCounts(counts);
      setItems((prev) => mergeNotificationItems(list, prev, unreadOnly));
    },
    [],
  );

  const fetchSnapshot = useCallback(
    async (unreadOnly = true): Promise<FetchSnapshotResult> => {
      const seq = ++fetchSeqRef.current;
      try {
        const snapshot = await fetchNotificationsSnapshot({ unreadOnly });
        if (seq !== fetchSeqRef.current) return { seq, snapshot: null };
        applySnapshot(snapshot.badgeCounts, snapshot.items, unreadOnly, seq);
        return { seq, snapshot };
      } catch (err) {
        if (seq !== fetchSeqRef.current) return { seq, snapshot: null };
        if (isUnauthorizedError(err)) {
          clearNotificationsState(setItems, setBadgeCounts);
        }
        return { seq, snapshot: null };
      }
    },
    [applySnapshot],
  );

  const maybeAlertForChatBadgeIncrease = useCallback(
    (
      prevChat: number,
      nextChat: number,
      items: NotificationDto[],
      conversationId?: string,
    ) => {
      if (nextChat <= prevChat) return;
      const latestChat = items.find(
        (n) =>
          !n.readAt &&
          n.badgeGroup === "chat" &&
          (!conversationId ||
            conversationIdFromNotificationPayload(n) === conversationId),
      );
      if (latestChat) {
        alertChatNotification(latestChat, conversationId);
        return;
      }
      alertChatNotification(
        {
          id: "chat-sync",
          type: "chat.new_message",
          badgeGroup: "chat",
          title: "New message",
          body: nextChat === 1 ? "1 new message" : `${nextChat} new messages`,
          href: null,
          payload: conversationId ? { conversationId } : null,
          readAt: null,
          createdAt: new Date().toISOString(),
          soundKey: "chat",
        },
        conversationId,
      );
    },
    [alertChatNotification],
  );

  const clearChatSyncRetries = useCallback(() => {
    for (const t of chatSyncRetryTimersRef.current) clearTimeout(t);
    chatSyncRetryTimersRef.current = [];
  }, []);

  const syncNotificationsFromChatSocket = useCallback(
    async (
      reason: AgentChatNotificationSyncReason,
      conversationId?: string,
      attempt = 0,
    ) => {
      if (!canFetchNotifications(tokenRef.current)) return;

      const prevChat = badgeCountsRef.current.chat;

      try {
        const { snapshot } = await fetchSnapshot(true);
        if (!snapshot) return;

        const nextChat = snapshot.badgeCounts.chat;
        const nextVisible = countVisibleUnread(snapshot.items);

        if (nextChat > prevChat) {
          maybeAlertForChatBadgeIncrease(
            prevChat,
            nextChat,
            snapshot.items,
            conversationId,
          );
        }

        const badgeAhead = totalUnread(snapshot.badgeCounts) > nextVisible;
        const chatAhead = nextChat > prevChat;
        const needsRetry =
          attempt < CHAT_SYNC_RETRY_DELAYS_MS.length &&
          (chatAhead || badgeAhead || (nextChat > 0 && nextVisible === 0));

        if (needsRetry) {
          const delay = CHAT_SYNC_RETRY_DELAYS_MS[attempt] ?? 1800;
          const timer = setTimeout(() => {
            void syncNotificationsFromChatSocket(reason, conversationId, attempt + 1);
          }, delay);
          chatSyncRetryTimersRef.current.push(timer);
        }

        if (reason === "visitor_message" && conversationId) {
          publishAgentChatMessageSync(conversationId);
        }
      } catch (err) {
        if (isUnauthorizedError(err)) {
          clearNotificationsState(setItems, setBadgeCounts);
          return;
        }
        if (attempt < CHAT_SYNC_RETRY_DELAYS_MS.length) {
          const delay = CHAT_SYNC_RETRY_DELAYS_MS[attempt] ?? 1800;
          const timer = setTimeout(() => {
            void syncNotificationsFromChatSocket(reason, conversationId, attempt + 1);
          }, delay);
          chatSyncRetryTimersRef.current.push(timer);
        }
      }
    },
    [fetchSnapshot, maybeAlertForChatBadgeIncrease],
  );

  const scheduleChatNotificationSync = useCallback(
    (reason: AgentChatNotificationSyncReason, conversationId?: string) => {
      chatSyncPendingRef.current = { reason, conversationId };
      if (chatSyncTimerRef.current) return;
      chatSyncTimerRef.current = setTimeout(() => {
        chatSyncTimerRef.current = null;
        const pending = chatSyncPendingRef.current;
        chatSyncPendingRef.current = null;
        clearChatSyncRetries();
        void syncNotificationsFromChatSocket(
          pending?.reason ?? "visitor_message",
          pending?.conversationId,
          0,
        );
      }, 280);
    },
    [clearChatSyncRetries, syncNotificationsFromChatSocket],
  );

  const refreshBadges = useCallback(async () => {
    if (!canFetchNotifications(tokenRef.current)) {
      setBadgeCounts(EMPTY_BADGES);
      return;
    }
    await fetchSnapshot(true);
  }, [fetchSnapshot]);

  const refreshList = useCallback(
    async (unreadOnly = true) => {
      if (!canFetchNotifications(tokenRef.current)) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        await fetchSnapshot(unreadOnly);
      } catch {
        /* fetchSnapshot handles 401; other errors leave prior state intact */
      } finally {
        setLoading(false);
      }
    },
    [fetchSnapshot],
  );

  const ensureListMatchesBadge = useCallback(async () => {
    if (!canFetchNotifications(tokenRef.current)) return;
    const { snapshot } = await fetchSnapshot(true);
    if (!snapshot) return;
    const unread = totalUnread(snapshot.badgeCounts);
    const visibleUnread = countVisibleUnread(snapshot.items);
    if (unread > 0 && visibleUnread === 0) {
      await fetchSnapshot(true);
    }
  }, [fetchSnapshot]);

  const applySocketEvent = useCallback(
    (payload: NotificationSocketEvent) => {
      const counts = normalizeBadgeCounts(payload.badgeCounts);
      setBadgeCounts(counts);

      if (payload.event === "new" && payload.notification) {
        const normalized =
          normalizeNotificationDto(payload.notification) ?? payload.notification;
        const cid = conversationIdFromNotificationPayload(normalized);
        setItems((prev) =>
          upsertConversationNotification(prev, normalized, cid),
        );

        if (
          normalized.badgeGroup === "chat" ||
          String(normalized.type).toLowerCase().includes("chat")
        ) {
          alertChatNotification(normalized, cid);
          if (cid) publishAgentChatMessageSync(cid);
        } else {
          const soundKey =
            normalized.soundKey ??
            soundKeyForNotificationType(normalized.type) ??
            null;
          if (soundKey) playNotificationSound(soundKey);
          else playSoundForNotificationType(normalized.type);
          publishNotificationToast(normalized);
        }
        return;
      }

      const unread = totalUnread(counts);
      const visibleUnread = countVisibleUnread(itemsRef.current);
      if (unread > visibleUnread) {
        void refreshList(true);
      }

      if (payload.event === "read" && payload.notification) {
        setItems((prev) =>
          prev.map((n) =>
            n.id === payload.notification!.id
              ? {
                  ...n,
                  readAt: payload.notification!.readAt ?? new Date().toISOString(),
                }
              : n,
          ),
        );
      }
      if (payload.event === "read_all") {
        const group = payload.badgeGroup;
        if (group) {
          setItems((prev) => prev.filter((n) => n.badgeGroup !== group));
        } else {
          setItems([]);
        }
      }
    },
    [alertChatNotification, refreshList],
  );

  useEffect(() => {
    if (!enabled || !canFetchNotifications(token)) {
      setBadgeCounts(EMPTY_BADGES);
      setItems([]);
      return undefined;
    }

    let cancelled = false;

    connectSharedNotifications(token);
    const socket = getSharedNotificationsSocket();

    const bootstrap = async () => {
      await socket.waitUntilSocketReady(12_000);
      if (cancelled || !canFetchNotifications(tokenRef.current)) return;
      setLoading(true);
      try {
        await fetchSnapshot(true);
      } catch {
        /* transient bootstrap failure — socket + reconcile will retry */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void bootstrap();

    const offNotification = socket.onNotification(applySocketEvent);
    const offConnect = socket.onSocketConnect(() => {
      void (async () => {
        await socket.waitUntilSocketReady(12_000);
        if (!canFetchNotifications(tokenRef.current)) return;
        setConnected(true);
        await refreshList(true);
      })().catch(() => {
        /* Socket reconnect refresh must not surface as a runtime error. */
      });
    });
    const offDisconnect = socket.onSocketDisconnect(() => setConnected(false));

    const offChatSync = subscribeAgentChatNotificationSync((reason, conversationId) => {
      scheduleChatNotificationSync(reason, conversationId);
    });

    const reconcile = () => {
      if (document.visibilityState !== "visible") return;
      if (!canFetchNotifications(tokenRef.current)) return;
      void fetchSnapshot(true).catch(() => {
        /* Background poll — transient failures must not surface as runtime errors. */
      });
    };
    const reconcileTimer = setInterval(reconcile, RECONCILE_INTERVAL_MS);
    document.addEventListener("visibilitychange", reconcile);

    return () => {
      cancelled = true;
      ++fetchSeqRef.current;
      offNotification();
      offConnect();
      offDisconnect();
      offChatSync();
      if (chatSyncTimerRef.current) {
        clearTimeout(chatSyncTimerRef.current);
        chatSyncTimerRef.current = null;
      }
      clearChatSyncRetries();
      chatSyncPendingRef.current = null;
      clearInterval(reconcileTimer);
      document.removeEventListener("visibilitychange", reconcile);
      setConnected(false);
    };
  }, [
    applySocketEvent,
    clearChatSyncRetries,
    enabled,
    fetchSnapshot,
    refreshList,
    scheduleChatNotificationSync,
    token,
  ]);

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!canFetchNotifications(tokenRef.current)) return;
      try {
        const target = itemsRef.current.find((n) => n.id === notificationId);
        const conversationId = target
          ? conversationIdFromNotificationPayload(target)
          : null;

        await markNotificationRead(notificationId);

        setItems((prev) => {
          if (conversationId && target?.badgeGroup === "chat") {
            return prev.filter(
              (n) =>
                n.badgeGroup !== "chat" ||
                conversationIdFromNotificationPayload(n) !== conversationId,
            );
          }
          return prev.filter((n) => n.id !== notificationId);
        });
        await fetchSnapshot(true);
      } catch (err) {
        if (isUnauthorizedError(err)) {
          clearNotificationsState(setItems, setBadgeCounts);
        }
      }
    },
    [fetchSnapshot],
  );

  const markAllRead = useCallback(
    async (badgeGroup?: NotificationBadgeGroup | string) => {
      if (!tokenRef.current) return;
      try {
        const counts = await markAllNotificationsRead(badgeGroup);
        setBadgeCounts(normalizeBadgeCounts(counts));
        if (badgeGroup) {
          setItems((prev) => prev.filter((n) => n.badgeGroup !== badgeGroup));
        } else {
          setItems([]);
        }
        await refreshList(true);
      } catch (err) {
        publishAppToast({
          variant: "error",
          message:
            extractApiErrorMessageForToast(err) ??
            "Could not mark notifications as read.",
        });
        await fetchSnapshot(true);
      }
    },
    [fetchSnapshot, refreshList],
  );

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    void (async () => {
      await refreshList(true);
      await ensureListMatchesBadge();
    })().catch(() => {
      /* Drawer refresh failures are non-fatal for the UI shell. */
    });
  }, [ensureListMatchesBadge, refreshList]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return {
    badgeCounts,
    items,
    loading,
    connected,
    drawerOpen,
    openDrawer,
    closeDrawer,
    refreshBadges,
    refreshList,
    markRead,
    markAllRead,
  };
}
