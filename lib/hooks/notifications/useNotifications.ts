"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { isAuthSessionTerminated } from "@/api";
import { useAccessToken } from "@/lib/auth/use-access-token";
import {
  fetchNotificationsSnapshot,
  markAllNotificationsRead,
  markNotificationRead,
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
} from "@/lib/hooks/notifications/notification-normalize";

const CHAT_SYNC_RETRY_MS = [0, 400, 900, 1800] as const;
const RECONCILE_INTERVAL_MS = 45_000;

function isUnauthorizedError(err: unknown): boolean {
  return isAxiosError(err) && err.response?.status === 401;
}

function canFetchNotifications(token: string): boolean {
  return Boolean(token.trim()) && !isAuthSessionTerminated();
}

function publishNotificationToast(n: NotificationDto): void {
  const message = n.body?.trim() || n.title?.trim() || "New notification";
  publishAppToast({ variant: "success", message });
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
  const chatToastDedupeRef = useRef<{ at: number; conversationId: string | null }>({
    at: 0,
    conversationId: null,
  });
  const chatSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatSyncRetryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const chatSyncPendingRef = useRef<{
    reason: AgentChatNotificationSyncReason;
    conversationId?: string;
  } | null>(null);

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
    async (unreadOnly = true): Promise<number> => {
      const seq = ++fetchSeqRef.current;
      const snapshot = await fetchNotificationsSnapshot({ unreadOnly });
      if (seq !== fetchSeqRef.current) return seq;
      applySnapshot(snapshot.badgeCounts, snapshot.items, unreadOnly, seq);
      return seq;
    },
    [applySnapshot],
  );

  const maybeToastForChatBadgeIncrease = useCallback(
    (
      prevChat: number,
      nextChat: number,
      conversationId?: string,
      notification?: NotificationDto,
    ) => {
      if (nextChat <= prevChat) return;
      const cid = conversationId?.trim() || null;
      const now = Date.now();
      const prev = chatToastDedupeRef.current;
      const duplicateToast =
        Boolean(cid) && prev.conversationId === cid && now - prev.at < 3000;
      if (duplicateToast) return;
      if (notification) {
        publishNotificationToast(notification);
      } else {
        publishNotificationToast({
          id: "chat-sync",
          type: "chat.new_message",
          badgeGroup: "chat",
          title: "New message",
          body: nextChat === 1 ? "1 new message" : `${nextChat} new messages`,
          href: null,
          payload: cid ? { conversationId: cid } : null,
          readAt: null,
          createdAt: new Date().toISOString(),
          soundKey: "chat",
        });
      }
      chatToastDedupeRef.current = { at: now, conversationId: cid };
      playNotificationSound("chat");
    },
    [],
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
        await fetchSnapshot(true);
        const nextChat = badgeCountsRef.current.chat;
        const nextVisible = itemsRef.current.filter((n) => !n.readAt).length;

        if (nextChat > prevChat) {
          const latestChat = itemsRef.current.find(
            (n) =>
              !n.readAt &&
              n.badgeGroup === "chat" &&
              (!conversationId ||
                conversationIdFromNotificationPayload(n) === conversationId),
          );
          maybeToastForChatBadgeIncrease(
            prevChat,
            nextChat,
            conversationId,
            latestChat,
          );
        }

        const badgeAhead = totalUnread(badgeCountsRef.current) > nextVisible;
        const chatAhead = nextChat > prevChat;
        const needsRetry =
          attempt < CHAT_SYNC_RETRY_MS.length - 1 &&
          (chatAhead || badgeAhead || (nextChat > 0 && nextVisible === 0));

        if (needsRetry) {
          const delay = CHAT_SYNC_RETRY_MS[attempt + 1] ?? 1800;
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
          setItems([]);
          setBadgeCounts(EMPTY_BADGES);
          return;
        }
        if (attempt < CHAT_SYNC_RETRY_MS.length - 1) {
          const delay = CHAT_SYNC_RETRY_MS[attempt + 1] ?? 1800;
          const timer = setTimeout(() => {
            void syncNotificationsFromChatSocket(reason, conversationId, attempt + 1);
          }, delay);
          chatSyncRetryTimersRef.current.push(timer);
        }
      }
    },
    [fetchSnapshot, maybeToastForChatBadgeIncrease],
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
        void syncNotificationsFromChatSocket(pending?.reason ?? "visitor_message", pending?.conversationId, 0);
      }, 280);
    },
    [clearChatSyncRetries, syncNotificationsFromChatSocket],
  );

  const refreshBadges = useCallback(async () => {
    if (!canFetchNotifications(tokenRef.current)) {
      setBadgeCounts(EMPTY_BADGES);
      return;
    }
    try {
      const snapshot = await fetchNotificationsSnapshot({ unreadOnly: true });
      setBadgeCounts(snapshot.badgeCounts);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        setBadgeCounts(EMPTY_BADGES);
      }
    }
  }, []);

  const refreshList = useCallback(
    async (unreadOnly = true) => {
      if (!canFetchNotifications(tokenRef.current)) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        await fetchSnapshot(unreadOnly);
      } catch (err) {
        if (isUnauthorizedError(err)) {
          setItems([]);
          setBadgeCounts(EMPTY_BADGES);
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchSnapshot],
  );

  const ensureListMatchesBadge = useCallback(async () => {
    if (!canFetchNotifications(tokenRef.current)) return;
    const unread = totalUnread(badgeCountsRef.current);
    const visibleUnread = itemsRef.current.filter((n) => !n.readAt).length;
    if (unread > 0 && visibleUnread === 0) {
      await refreshList(true);
    }
  }, [refreshList]);

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

        const soundKey =
          normalized.soundKey ??
          soundKeyForNotificationType(normalized.type) ??
          null;
        if (soundKey) playNotificationSound(soundKey);
        else playSoundForNotificationType(normalized.type);

        if (
          normalized.badgeGroup === "chat" ||
          String(normalized.type).toLowerCase().includes("chat")
        ) {
          const now = Date.now();
          const prev = chatToastDedupeRef.current;
          const duplicateToast =
            Boolean(cid) &&
            prev.conversationId === cid &&
            now - prev.at < 3000;
          if (!duplicateToast) {
            publishNotificationToast(normalized);
            chatToastDedupeRef.current = { at: now, conversationId: cid ?? null };
          }
          if (cid) publishAgentChatMessageSync(cid);
        }
        return;
      }

      const unread = totalUnread(counts);
      const visibleUnread = itemsRef.current.filter((n) => !n.readAt).length;
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
    [refreshList],
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
      } catch (err) {
        if (isUnauthorizedError(err)) {
          setItems([]);
          setBadgeCounts(EMPTY_BADGES);
        }
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
      })();
    });
    const offDisconnect = socket.onSocketDisconnect(() => setConnected(false));

    const offChatSync = subscribeAgentChatNotificationSync((reason, conversationId) => {
      scheduleChatNotificationSync(reason, conversationId);
    });

    const reconcile = () => {
      if (document.visibilityState !== "visible") return;
      if (!canFetchNotifications(tokenRef.current)) return;
      void fetchSnapshot(true);
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
        await markNotificationRead(notificationId);
        setItems((prev) => prev.filter((n) => n.id !== notificationId));
        await refreshBadges();
      } catch (err) {
        if (isUnauthorizedError(err)) {
          setItems([]);
          setBadgeCounts(EMPTY_BADGES);
        }
      }
    },
    [refreshBadges],
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
        await refreshBadges();
        await refreshList(true);
      }
    },
    [refreshBadges, refreshList],
  );

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    void (async () => {
      await refreshList(true);
      await ensureListMatchesBadge();
    })();
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
