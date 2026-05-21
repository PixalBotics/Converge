"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Skeleton from "@mui/material/Skeleton";
import { alpha, useTheme } from "@mui/material/styles";
import BeachAccessOutlined from "@mui/icons-material/BeachAccessOutlined";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import DoneAllOutlined from "@mui/icons-material/DoneAllOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import { useRouter } from "next/navigation";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { BellIcon } from "@/components/common/icons";
import { useNotificationsContext } from "@/lib/notifications/NotificationsContext";
import { resolveNotificationHref } from "@/lib/notifications/resolve-notification-href";
import { dashboardHeaderCircleIconButtonSx } from "@/components/layout/dashboard/DashboardHeader/styles/shell.styles";
import type {
  NotificationBadgeGroup,
  NotificationDto,
} from "@/services/notifications/notifications.types";
import type { SxProps, Theme } from "@mui/material/styles";

type FilterKey = "all" | NotificationBadgeGroup;

function totalUnread(counts: { chat: number; qa: number; hrms_leave: number }): number {
  return counts.chat + counts.qa + counts.hrms_leave;
}

const GROUP_LABELS: Record<NotificationBadgeGroup, string> = {
  chat: "Chat",
  qa: "QA",
  hrms_leave: "Leave",
};

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "chat", label: "Chat" },
  { key: "qa", label: "QA" },
  { key: "hrms_leave", label: "Leave" },
];

function groupAccent(group: NotificationBadgeGroup, theme: AppTheme): string {
  if (group === "chat") return theme.app.dashboard.accentBlue;
  if (group === "qa") return theme.app.dashboard.accentViolet;
  return theme.app.dashboard.accentOrange;
}

function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function countForFilter(
  key: FilterKey,
  badgeCounts: { chat: number; qa: number; hrms_leave: number },
): number {
  if (key === "all") return totalUnread(badgeCounts);
  return badgeCounts[key];
}

function GroupIcon({ group, color }: { group: NotificationBadgeGroup; color: string }) {
  const sx = { fontSize: 18, color };
  if (group === "chat") return <ChatBubbleOutline sx={sx} />;
  if (group === "qa") return <FactCheckOutlined sx={sx} />;
  return <BeachAccessOutlined sx={sx} />;
}

function NotificationRow({
  notification,
  onSelect,
}: {
  notification: NotificationDto;
  onSelect: () => void;
}) {
  const theme = useTheme() as AppTheme;
  const accent = groupAccent(notification.badgeGroup, theme);
  const isUnread = !notification.readAt;

  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        px: 1.5,
        py: 1.25,
        border: "none",
        borderBottom: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.3)}`,
        cursor: "pointer",
        textAlign: "left",
        font: "inherit",
        color: "inherit",
        bgcolor: isUnread ? alpha(accent, 0.07) : "transparent",
        transition: "background-color 0.15s ease",
        "&:hover": {
          bgcolor: alpha(theme.app.dashboard.overlayLight, 0.7),
        },
        "&:last-of-type": {
          borderBottom: "none",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(accent, 0.14),
          border: `1px solid ${alpha(accent, 0.25)}`,
        }}
      >
        <GroupIcon group={notification.badgeGroup} color={accent} />
        {isUnread ? (
          <Box
            sx={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: theme.app.dashboard.accentBlue,
              border: `2px solid ${theme.app.dashboard.menuSurfaceBg}`,
            }}
          />
        ) : null}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, mb: 0.25 }}>
          <Typography
            fontWeight={isUnread ? 600 : 500}
            sx={{
              fontSize: 13,
              lineHeight: 1.35,
              flex: 1,
              color: theme.app.text.primary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {notification.title}
          </Typography>
          <Typography
            component="span"
            sx={{
              flexShrink: 0,
              fontSize: 10,
              color: theme.app.dashboard.textMuted,
            }}
          >
            {formatNotificationTime(notification.createdAt)}
          </Typography>
        </Box>
        {notification.body ? (
          <Typography
            sx={{
              fontSize: 12,
              lineHeight: 1.4,
              color: theme.app.dashboard.textMuted,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {notification.body}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

function NotificationsEmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2.5,
        py: 4,
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: d.accentCyan,
          background: `radial-gradient(100% 100% at 50% 0%, ${alpha(d.accentIndigo, 0.3)} 0%, ${alpha(d.accentPurple, 0.1)} 100%)`,
          border: `1px solid ${alpha(d.cardBorder, 0.35)}`,
        }}
      >
        {icon}
      </Box>
      <Typography fontWeight={600} sx={{ fontSize: 14, color: theme.app.text.primary }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 12, color: d.textMuted, maxWidth: 240, lineHeight: 1.45 }}>
        {description}
      </Typography>
    </Box>
  );
}

function NotificationListSkeleton() {
  const theme = useTheme() as AppTheme;
  const skeletonSx = { bgcolor: alpha(theme.app.dashboard.overlayLight, 0.5) };

  return (
    <Box sx={{ px: 1.5, py: 0.5 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            gap: 1.25,
            py: 1.25,
            borderBottom: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.3)}`,
          }}
        >
          <Skeleton variant="rounded" width={36} height={36} sx={skeletonSx} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" sx={skeletonSx} />
            <Skeleton variant="text" width="90%" sx={skeletonSx} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export function NotificationsBellDrawer() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const ctx = useNotificationsContext();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ctx?.drawerOpen) {
      setFilter("all");
      setAnchorEl(null);
    }
  }, [ctx?.drawerOpen]);

  if (!ctx) return null;

  const { badgeCounts, items, loading, drawerOpen, openDrawer, closeDrawer, markRead, markAllRead } =
    ctx;
  const unreadTotal = totalUnread(badgeCounts);
  const popoverOpen = drawerOpen && Boolean(anchorEl);

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((n) => n.badgeGroup === filter);
  }, [filter, items]);

  const handleBellClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    openDrawer();
  };

  const handleClose = () => {
    closeDrawer();
    setAnchorEl(null);
  };

  const handleClickItem = (notification: NotificationDto) => {
    const target = resolveNotificationHref(notification);
    handleClose();
    if (target) {
      router.push(target);
    }
    void markRead(notification.id);
  };

  const emptyTitle =
    filter === "all" ? "You're all caught up" : `No ${GROUP_LABELS[filter as NotificationBadgeGroup]} alerts`;
  const emptyDescription =
    filter === "all"
      ? "New chat, QA, and leave updates appear here."
      : `No ${GROUP_LABELS[filter as NotificationBadgeGroup].toLowerCase()} notifications right now.`;

  const paperSx = useMemo(
    () => ({
      mt: 1.25,
      width: 360,
      maxWidth: "calc(100vw - 24px)",
      overflow: "hidden",
      borderRadius: 2.5,
      bgcolor: theme.app.dashboard.menuSurfaceBg,
      border: `1px solid ${theme.app.dashboard.cardBorder}`,
      boxShadow: "0 20px 56px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
      display: "flex",
      flexDirection: "column",
      maxHeight: "min(480px, calc(100vh - 96px))",
    }),
    [theme.app.dashboard.cardBorder, theme.app.dashboard.menuSurfaceBg],
  );

  return (
    <>
      <IconButton
        onClick={handleBellClick}
        sx={dashboardHeaderCircleIconButtonSx(theme.app) as SxProps<Theme>}
        aria-label={`Notifications${unreadTotal ? `, ${unreadTotal} unread` : ""}`}
        aria-expanded={popoverOpen}
        aria-haspopup="true"
      >
        <Badge
          badgeContent={unreadTotal > 0 ? (unreadTotal > 99 ? "99+" : unreadTotal) : 0}
          color="error"
          overlap="circular"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: 10,
              minWidth: 18,
              height: 18,
            },
          }}
        >
          <BellIcon width={22} height={22} />
        </Badge>
      </IconButton>

      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        disableScrollLock
        slotProps={{
          paper: { sx: paperSx, elevation: 0 },
        }}
      >
        <Box
          sx={{
            px: 1.75,
            pt: 1.5,
            pb: 1,
            borderBottom: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.35)}`,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.35 }}>
            <Typography fontWeight={700} sx={{ fontSize: 15, color: theme.app.text.primary }}>
              Notifications
            </Typography>
            {unreadTotal > 0 ? (
              <Box
                component="button"
                type="button"
                onClick={() => void markAllRead()}
                sx={{
                  border: "none",
                  p: 0,
                  bgcolor: "transparent",
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 11,
                  color: theme.app.text.link,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                  "&:hover": { color: theme.app.text.primary },
                }}
              >
                Mark all read
              </Box>
            ) : null}
          </Box>
          <Typography sx={{ fontSize: 11, color: theme.app.dashboard.textMuted }}>
            {unreadTotal > 0 ? `${unreadTotal} unread` : "Live updates from chat, QA & leave"}
          </Typography>
        </Box>

        <Box
          role="tablist"
          aria-label="Filter notifications"
          sx={{
            display: "flex",
            flexShrink: 0,
            borderBottom: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.3)}`,
          }}
        >
          {FILTER_TABS.map((tab) => {
            const count = countForFilter(tab.key, badgeCounts);
            const active = filter === tab.key;
            const accent =
              tab.key === "all"
                ? theme.app.dashboard.accentBlue
                : groupAccent(tab.key as NotificationBadgeGroup, theme);

            return (
              <Box
                key={tab.key}
                component="button"
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.key)}
                sx={{
                  flex: 1,
                  py: 0.9,
                  px: 0.25,
                  border: "none",
                  borderBottom: active ? `2px solid ${accent}` : "2px solid transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  bgcolor: "transparent",
                  color: active ? theme.app.text.primary : theme.app.dashboard.textMuted,
                  fontSize: 11,
                  fontWeight: active ? 600 : 500,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.4,
                  "&:hover": { color: theme.app.text.primary },
                }}
              >
                {tab.label}
                {count > 0 ? (
                  <Box
                    component="span"
                    sx={{
                      fontSize: 9,
                      fontWeight: 700,
                      px: 0.5,
                      py: 0.1,
                      borderRadius: "5px",
                      bgcolor: active ? alpha(accent, 0.2) : alpha(theme.app.dashboard.overlayLight, 0.5),
                      color: active ? accent : theme.app.dashboard.textMuted,
                    }}
                  >
                    {count > 99 ? "99+" : count}
                  </Box>
                ) : null}
              </Box>
            );
          })}
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {loading ? (
            <NotificationListSkeleton />
          ) : filteredItems.length === 0 ? (
            <NotificationsEmptyState
              title={emptyTitle}
              description={emptyDescription}
              icon={
                filter === "all" ? (
                  <DoneAllOutlined sx={{ fontSize: 28 }} />
                ) : (
                  <NotificationsNoneOutlined sx={{ fontSize: 28 }} />
                )
              }
            />
          ) : (
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {filteredItems.map((n) => (
                <Box component="li" key={n.id}>
                  <NotificationRow notification={n} onSelect={() => handleClickItem(n)} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}
