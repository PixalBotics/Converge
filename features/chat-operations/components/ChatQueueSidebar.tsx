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
  chatOpsPaneSubtitleSx,
  chatOpsPaneTitleSx,
} from "../styles/chat-operations.styles";
import { ConnectionStatusBar } from "./ConnectionStatusBar";
import { getConversationPreview } from "../utils/conversation-preview";
import { formatRelativeQueueTime } from "../utils/format-message-time";
import {
  resolveQueueFormActionHint,
  resolveQueueFormStatusLabel,
} from "../utils/chat-close-outcome";
import { getInboxRowLabels } from "@/services/chat/visitor-presentation";
import { useSidebarTypingPreviews } from "@/lib/hooks/chat/useConversationTyping";
import { parseVisitorInfo } from "../utils/visitor-info";
import {
  EmptyState,
  PanelColumn,
  QueueAvatar,
  QueueItemRow,
  ScrollRegion,
} from "../styles/chat-operations.styled";

export type ChatQueueTab =
  | "active"
  | "pending"
  | "completed"
  | "spam";

interface ChatQueueSidebarProps {
  queueTab: ChatQueueTab;
  onQueueTabChange: (tab: ChatQueueTab) => void;
  conversations: ConversationSummary[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  activeCount: number;
  pendingCount: number;
  completedCount: number;
  spamCount: number;
  connected: boolean;
  hasToken: boolean;
}

export function ChatQueueSidebar({
  queueTab,
  onQueueTabChange,
  conversations,
  selectedConversationId,
  onSelectConversation,
  activeCount,
  pendingCount,
  completedCount,
  spamCount,
  connected,
  hasToken,
}: ChatQueueSidebarProps) {
  const theme = useTheme() as AppTheme;
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarTypingMap = useSidebarTypingPreviews();

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
    queueTab === "pending"
      ? "Open distribution form to finish"
      : queueTab === "completed"
        ? "Form complete"
        : queueTab === "spam"
          ? "Spam chat"
          : "No messages yet";

  const emptyQueueMessage =
    queueTab === "pending"
      ? "No chats waiting on a distribution form"
      : queueTab === "completed"
        ? "No completed chats in this queue"
        : queueTab === "spam"
          ? "No spam chats in this queue"
          : "No conversations in this queue";

  const endedTab = queueTab === "pending" || queueTab === "completed" || queueTab === "spam";

  return (
    <PanelColumn sx={{ flex: 1, minHeight: 0, maxHeight: "100%" }}>
      <Box sx={chatOpsInboxToolbarSx}>
        <Box>
          <Typography sx={chatOpsPaneTitleSx}>Conversations</Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
            Your queue
          </Typography>
        </Box>
        <ConnectionStatusBar connected={connected} hasToken={hasToken} compact />
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
            sx={chatOpsInboxTabSx(queueTab === "pending")}
            onClick={() => onQueueTabChange("pending")}
          >
            Form pending · {pendingCount}
          </Box>
          <Box
            component="button"
            type="button"
            sx={chatOpsInboxTabSx(queueTab === "completed")}
            onClick={() => onQueueTabChange("completed")}
          >
            Complete · {completedCount}
          </Box>
          <Box
            component="button"
            type="button"
            sx={chatOpsInboxTabSx(queueTab === "spam")}
            onClick={() => onQueueTabChange("spam")}
          >
            Spam · {spamCount}
          </Box>
        </Box>
        {queueTab === "pending" ? (
          <Typography sx={{ ...chatOpsPaneSubtitleSx, mt: 1, lineHeight: 1.45 }}>
            Chats closed — complete the distribution form to send the transcript.
          </Typography>
        ) : queueTab === "completed" ? (
          <Typography sx={{ ...chatOpsPaneSubtitleSx, mt: 1, lineHeight: 1.45 }}>
            Finished chats — form submitted or no distribution needed.
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

      <ScrollRegion sx={{ flex: 1, minHeight: 0 }}>
        {filteredConversations.length === 0 ? (
          <EmptyState sx={{ py: 6 }}>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
              {searchQuery.trim() ? "No results" : emptyQueueMessage}
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
            const isEnded = endedTab;
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
            const formStatusLabel = endedTab ? resolveQueueFormStatusLabel(conversation) : null;
            const formActionHint = endedTab ? resolveQueueFormActionHint(conversation) : null;
            const transferLabel =
              queueTab === "active" &&
              conversation.lastTransferFrom &&
              typeof conversation.lastTransferFrom.label === "string"
                ? conversation.lastTransferFrom.label.trim()
                : "";
            const liveTyping = !endedTab
              ? sidebarTypingMap.get(conversation.id.toLowerCase())
              : undefined;
            const liveDraft = liveTyping?.draft?.trim() ?? "";
            const liveLabel = liveTyping?.label?.trim() ?? "";
            const rowPreview = liveDraft
              ? liveLabel
                ? `${liveLabel}: ${liveDraft}`
                : liveDraft
              : formActionHint && preview === previewFallback
                ? formActionHint
                : preview;
            const isLiveTyping = Boolean(liveDraft);

            return (
              <QueueItemRow
                key={conversation.id}
                active={selected}
                onClick={() => onSelectConversation(conversation.id)}
                sx={{
                  ...(isEnded && !selected ? { opacity: 0.92 } : undefined),
                }}
              >
                <Badge
                  color="primary"
                  badgeContent={unread > 0 ? (unread > 9 ? "9+" : unread) : 0}
                  invisible={unread === 0 || isEnded}
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
                  {formStatusLabel ? (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontSize: 10,
                        fontWeight: 600,
                        color:
                          formStatusLabel === "Form pending"
                            ? theme.app.dashboard.accentBlue
                            : theme.palette.success.light,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        mb: 0.25,
                      }}
                    >
                      {formStatusLabel}
                    </Typography>
                  ) : null}
                  {transferLabel ? (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontSize: 10,
                        fontWeight: 600,
                        color: theme.app.dashboard.accentOrange,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        mb: 0.25,
                      }}
                    >
                      From {transferLabel}
                    </Typography>
                  ) : null}
                  <Typography
                    variant="small"
                    sx={{
                      fontSize: 13,
                      lineHeight: 1.45,
                      color:
                        isLiveTyping
                          ? theme.app.dashboard.accentCyan
                          : unread > 0 && !isEnded
                            ? theme.app.text.primary
                            : theme.app.dashboard.textMuted,
                      fontWeight: isLiveTyping || (unread > 0 && !isEnded) ? 500 : 400,
                      fontStyle: isLiveTyping ? "italic" : "normal",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      whiteSpace: "normal",
                    }}
                  >
                    {isLiveTyping ? liveDraft : rowPreview}
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
