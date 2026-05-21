"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { SearchBar, Typography } from "@/components/common";
import type { ConversationSummary } from "@/services/chat/chat.types";
import { MAX_ACTIVE_CHATS_PER_AGENT } from "@/services/chat/chat.constants";
import {
  chatOpsInboxHeaderSx,
  chatOpsInboxSearchWrap,
  chatOpsInboxTabSx,
  chatOpsInboxTabsRow,
  chatOpsInboxToolbarSx,
} from "../styles/chat-operations.styles";
import { ConnectionStatusBar } from "./ConnectionStatusBar";
import { getConversationPreview } from "../utils/conversation-preview";
import { formatRelativeQueueTime } from "../utils/format-message-time";
import { getInboxRowLabels } from "@/services/chat/visitor-presentation";
import { parseVisitorInfo } from "../utils/visitor-info";
import {
  EmptyState,
  PanelColumn,
  QueueAvatar,
  QueueItemRow,
  ScrollRegion,
} from "../styles/chat-operations.styled";

export type ChatQueueTab = "active" | "waiting" | "closed";

interface ChatQueueSidebarProps {
  queueTab: ChatQueueTab;
  onQueueTabChange: (tab: ChatQueueTab) => void;
  conversations: ConversationSummary[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  activeCount: number;
  waitingCount: number;
  closedCount: number;
  connected: boolean;
  hasToken: boolean;
  atActiveCap?: boolean;
  canPickWaiting?: boolean;
}

export function ChatQueueSidebar({
  queueTab,
  onQueueTabChange,
  conversations,
  selectedConversationId,
  onSelectConversation,
  activeCount,
  waitingCount,
  closedCount,
  connected,
  hasToken,
  atActiveCap = false,
  canPickWaiting = true,
}: ChatQueueSidebarProps) {
  const theme = useTheme() as AppTheme;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const { title, subtitle } = getInboxRowLabels(c);
      const haystack = [title, subtitle ?? "", String(c.id)].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [conversations, searchQuery]);

  const previewFallback =
    queueTab === "waiting"
      ? "Waiting for an agent…"
      : queueTab === "closed"
        ? "Closed conversation"
        : "No messages yet";

  return (
    <PanelColumn sx={{ height: "100%" }}>
      <Box sx={chatOpsInboxToolbarSx}>
        <ConnectionStatusBar connected={connected} hasToken={hasToken} />
      </Box>
      <Box sx={chatOpsInboxHeaderSx}>
        <Box sx={chatOpsInboxTabsRow}>
          <Box
            component="button"
            type="button"
            sx={chatOpsInboxTabSx(queueTab === "active")}
            onClick={() => onQueueTabChange("active")}
          >
            Active · {activeCount}
          </Box>
          <Box
            component="button"
            type="button"
            sx={chatOpsInboxTabSx(queueTab === "waiting")}
            onClick={() => onQueueTabChange("waiting")}
          >
            Waiting · {waitingCount}
          </Box>
          <Box
            component="button"
            type="button"
            sx={chatOpsInboxTabSx(queueTab === "closed")}
            onClick={() => onQueueTabChange("closed")}
          >
            Closed · {closedCount}
          </Box>
        </Box>
        {atActiveCap && queueTab === "waiting" ? (
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 0.75, color: theme.palette.warning.main, fontSize: 11 }}
          >
            Max {MAX_ACTIVE_CHATS_PER_AGENT} active chats — finish or close one to accept more.
          </Typography>
        ) : null}
      </Box>

      <Box sx={chatOpsInboxSearchWrap}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, site, or ID…"
          sx={{ width: "100%", minWidth: "100%" }}
        />
      </Box>

      <ScrollRegion sx={{ flex: 1 }}>
        {filteredConversations.length === 0 ? (
          <EmptyState sx={{ py: 6 }}>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
              {searchQuery.trim() ? "No results" : "No conversations in this queue"}
            </Typography>
          </EmptyState>
        ) : (
          filteredConversations.map((conversation) => {
            const visitor =
              typeof conversation.visitor === "object" && conversation.visitor !== null
                ? (conversation.visitor as Record<string, unknown>)
                : null;
            const parsed = parseVisitorInfo(visitor);
            const { title, subtitle, initials } = getInboxRowLabels(
              conversation,
              parsed.displayName !== "Visitor" ? parsed.displayName : undefined,
            );
            const selected = conversation.id === selectedConversationId;
            const isWaiting = queueTab === "waiting";
            const isClosed = queueTab === "closed";
            const pickBlocked = isWaiting && !canPickWaiting;
            const unread =
              typeof conversation.unreadCount === "number" && conversation.unreadCount > 0
                ? conversation.unreadCount
                : 0;
            const time = formatRelativeQueueTime(
              typeof conversation.lastMessageAt === "string"
                ? conversation.lastMessageAt
                : undefined,
            );
            const preview = getConversationPreview(conversation, previewFallback);

            return (
              <QueueItemRow
                key={conversation.id}
                active={selected}
                onClick={() => {
                  if (!pickBlocked) onSelectConversation(conversation.id);
                }}
                sx={{
                  ...(pickBlocked ? { opacity: 0.45, cursor: "not-allowed" } : {}),
                  ...(isWaiting && !selected && !pickBlocked
                    ? {
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: theme.app.dashboard.accentOrange,
                        },
                      }
                    : undefined),
                  ...(isClosed && !selected
                    ? { opacity: 0.92 }
                    : undefined),
                }}
              >
                <Badge
                  color="primary"
                  badgeContent={unread > 0 ? (unread > 9 ? "9+" : unread) : 0}
                  invisible={unread === 0 || isClosed}
                  overlap="circular"
                >
                  <QueueAvatar>{initials}</QueueAvatar>
                </Badge>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.25 }}>
                    <Typography
                      fontWeight={selected ? 700 : 600}
                      sx={{
                        fontSize: 14,
                        color: theme.app.text.primary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {title}
                    </Typography>
                    {time ? (
                      <Typography
                        variant="caption"
                        sx={{ color: theme.app.dashboard.textMuted, flexShrink: 0 }}
                      >
                        {time}
                      </Typography>
                    ) : null}
                  </Box>
                  {subtitle ? (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontSize: 11,
                        color: theme.app.dashboard.textMuted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        mb: 0.25,
                      }}
                    >
                      {subtitle}
                    </Typography>
                  ) : null}
                  <Typography
                    variant="small"
                    sx={{
                      fontSize: 12,
                      color: unread > 0 && !isClosed ? theme.app.text.primary : theme.app.dashboard.textMuted,
                      fontWeight: unread > 0 && !isClosed ? 500 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {preview}
                  </Typography>
                </Box>
              </QueueItemRow>
            );
          })
        )}
      </ScrollRegion>
    </PanelColumn>
  );
}
