"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/api";
import {
  fetchMyNotifications,
  fetchNotificationBadgeCounts,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notifications/notifications.api";
import type {
  BadgeCounts,
  NotificationDto,
  NotificationSocketEvent,
} from "@/services/notifications/notifications.types";
import { getSharedNotificationsSocket } from "@/services/notifications/notificationsSocket";
import {
  playNotificationSound,
  playSoundForNotificationType,
  soundKeyForNotificationType,
} from "@/lib/notifications/notification-sounds";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import type { NotificationBadgeGroup } from "@/services/notifications/notifications.types";

const EMPTY_BADGES: BadgeCounts = { chat: 0, qa: 0, hrms_leave: 0, hrms_attendance: 0 };

export function useNotifications(enabled: boolean) {
  const token = getAccessToken() ?? "";
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>(EMPTY_BADGES);
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const refreshBadges = useCallback(async () => {
    if (!tokenRef.current) {
      setBadgeCounts(EMPTY_BADGES);
      return;
    }
    try {
      const counts = await fetchNotificationBadgeCounts();
      setBadgeCounts(counts);
    } catch {
      /* keep last counts */
    }
  }, []);

  const refreshList = useCallback(async (unreadOnly = true) => {
    if (!tokenRef.current) return;
    setLoading(true);
    try {
      const list = await fetchMyNotifications({ unreadOnly });
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, []);

  const applySocketEvent = useCallback((payload: NotificationSocketEvent) => {
    setBadgeCounts(payload.badgeCounts ?? EMPTY_BADGES);
    if (payload.event === "new" && payload.notification) {
      setItems((prev) => {
        const exists = prev.some((n) => n.id === payload.notification!.id);
        if (exists) return prev;
        return [payload.notification!, ...prev];
      });
      const n = payload.notification;
      const soundKey =
        n.soundKey ?? soundKeyForNotificationType(n.type) ?? null;
      if (soundKey) playNotificationSound(soundKey);
      else playSoundForNotificationType(n.type);
    }
    if (payload.event === "read" && payload.notification) {
      setItems((prev) =>
        prev.map((n) =>
          n.id === payload.notification!.id
            ? { ...n, readAt: payload.notification!.readAt ?? new Date().toISOString() }
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
  }, []);

  useEffect(() => {
    if (!enabled || !token) {
      setBadgeCounts(EMPTY_BADGES);
      setItems([]);
      return undefined;
    }

    void refreshBadges();

    const socket = getSharedNotificationsSocket();
    const prevToken = tokenRef.current;
    const tokenChanged = prevToken !== token;
    socket.connect(token, tokenChanged);

    const offNotification = socket.onNotification(applySocketEvent);
    const offConnect = socket.onSocketConnect(() => {
      setConnected(true);
      void refreshBadges();
    });
    const offDisconnect = socket.onSocketDisconnect(() => setConnected(false));

    return () => {
      offNotification();
      offConnect();
      offDisconnect();
      socket.disconnect();
      setConnected(false);
    };
  }, [applySocketEvent, enabled, refreshBadges, token]);

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!tokenRef.current) return;
      await markNotificationRead(notificationId);
      setItems((prev) => prev.filter((n) => n.id !== notificationId));
      await refreshBadges();
    },
    [refreshBadges],
  );

  const markAllRead = useCallback(
    async (badgeGroup?: NotificationBadgeGroup | string) => {
      if (!tokenRef.current) return;
      try {
        const counts = await markAllNotificationsRead(badgeGroup);
        setBadgeCounts(counts);
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
    void refreshList(true);
  }, [refreshList]);

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
