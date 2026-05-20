"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { SearchBar, Typography } from "@/components/common";
import type { ConversationSummary } from "@/services/chat/chat.types";
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
import { parseVisitorInfo } from "../utils/visitor-info";
import {
  EmptyState,
  PanelColumn,
  QueueAvatar,
  QueueItemRow,
  ScrollRegion,
} from "../styles/chat-operations.styled";

interface ChatQueueSidebarProps {
  queueTab: "active" | "waiting";
  onQueueTabChange: (tab: "active" | "waiting") => void;
  conversations: ConversationSummary[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  activeCount: number;
  waitingCount: number;
  connected: boolean;
  hasToken: boolean;
}

function getConversationLabel(conversation: ConversationSummary): string {
  const visitor =
    typeof conversation.visitor === "object" && conversation.visitor !== null
      ? (conversation.visitor as Record<string, unknown>)
      : null;
  const parsed = parseVisitorInfo(visitor);
  if (parsed.displayName !== "Visitor") return parsed.displayName;
  return `Visitor ${String(conversation.id).slice(0, 6)}`;
}

export function ChatQueueSidebar({
  queueTab,
  onQueueTabChange,
  conversations,
  selectedConversationId,
  onSelectConversation,
  activeCount,
  waitingCount,
  connected,
  hasToken,
}: ChatQueueSidebarProps) {
  const theme = useTheme() as AppTheme;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const label = getConversationLabel(c).toLowerCase();
      return label.includes(q) || String(c.id).toLowerCase().includes(q);
    });
  }, [conversations, searchQuery]);

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
        </Box>
      </Box>

      <Box sx={chatOpsInboxSearchWrap}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or ID…"
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
            const label = getConversationLabel(conversation);
            const initials = parseVisitorInfo(
              typeof conversation.visitor === "object" && conversation.visitor !== null
                ? (conversation.visitor as Record<string, unknown>)
                : null,
            ).initials;
            const selected = conversation.id === selectedConversationId;
            const isWaiting = queueTab === "waiting";
            const unread =
              typeof conversation.unreadCount === "number" && conversation.unreadCount > 0
                ? conversation.unreadCount
                : 0;
            const time = formatRelativeQueueTime(
              typeof conversation.lastMessageAt === "string" ? conversation.lastMessageAt : undefined,
            );
            const preview = getConversationPreview(
              conversation,
              queueTab === "waiting" ? "Waiting for an agent…" : "No messages yet",
            );

            return (
              <QueueItemRow
                key={conversation.id}
                active={selected}
                onClick={() => onSelectConversation(conversation.id)}
                sx={
                  isWaiting && !selected
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
                    : undefined
                }
              >
                <Badge
                  color="primary"
                  badgeContent={unread > 0 ? (unread > 9 ? "9+" : unread) : 0}
                  invisible={unread === 0}
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
                      {label}
                    </Typography>
                    {time ? (
                      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, flexShrink: 0 }}>
                        {time}
                      </Typography>
                    ) : null}
                  </Box>
                  <Typography
                    variant="small"
                    sx={{
                      fontSize: 12,
                      color: unread > 0 ? theme.app.text.primary : theme.app.dashboard.textMuted,
                      fontWeight: unread > 0 ? 500 : 400,
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
