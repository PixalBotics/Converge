"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { SearchBar, Typography } from "@/components/common";
import { getInboxRowLabels } from "@/services/chat/visitor-presentation";
import { agentDisplayName } from "@/services/chat/monitor-normalizers";
import type { MonitorConversationRow, MonitorListTab } from "@/services/chat/monitor.types";
import { getConversationPreview } from "@/features/chat-operations/utils/conversation-preview";
import { formatRelativeQueueTime } from "@/features/chat-operations/utils/format-message-time";
import { ConnectionStatusBar } from "@/features/chat-operations/components/ConnectionStatusBar";
import {
  EmptyState,
  PanelColumn,
  QueueAvatar,
  QueueItemRow,
  ScrollRegion,
} from "@/features/chat-operations/styles/chat-operations.styled";
import { chatOpsPaneTitleSx } from "@/features/chat-operations/styles/chat-operations.styles";
import {
  chatMonitorFilterWrap,
  chatMonitorInboxHeaderSx,
  chatMonitorInboxTabsRow,
  chatMonitorInboxTabSx,
  chatMonitorInboxToolbarSx,
} from "../styles/chat-monitor.styles";

interface MonitorQueueSidebarProps {
  listTab: MonitorListTab;
  onListTabChange: (tab: MonitorListTab) => void;
  conversations: MonitorConversationRow[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  liveCount: number;
  closedCount: number;
  connected: boolean;
  hasToken: boolean;
  loading: boolean;
}

function statusChipColor(
  status: string,
  theme: AppTheme,
): { bgcolor: string; color: string } {
  if (status === "waiting") {
    return {
      bgcolor: `${theme.app.dashboard.accentOrange}22`,
      color: theme.app.dashboard.accentOrange,
    };
  }
  if (status === "closed") {
    return { bgcolor: "rgba(148,163,184,0.15)", color: theme.app.dashboard.textMuted };
  }
  return {
    bgcolor: `${theme.app.dashboard.accentBlue}22`,
    color: theme.app.dashboard.accentBlue,
  };
}

export function MonitorQueueSidebar({
  listTab,
  onListTabChange,
  conversations,
  selectedConversationId,
  onSelectConversation,
  liveCount,
  closedCount,
  connected,
  hasToken,
  loading,
}: MonitorQueueSidebarProps) {
  const theme = useTheme() as AppTheme;
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const { title, subtitle } = getInboxRowLabels(c);
      const agent = agentDisplayName(c.agent).toLowerCase();
      return [title, subtitle ?? "", agent, c.status, c.id].join(" ").toLowerCase().includes(q);
    });
  }, [conversations, searchQuery]);

  return (
    <PanelColumn sx={{ height: "100%" }}>
      <Box sx={chatMonitorInboxToolbarSx}>
        <Box>
          <Typography sx={chatOpsPaneTitleSx}>Monitor queue</Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
            Read-only · scoped by your role
          </Typography>
        </Box>
        <ConnectionStatusBar connected={connected} hasToken={hasToken} compact />
      </Box>

      <Box sx={chatMonitorInboxHeaderSx}>
        <Box sx={chatMonitorInboxTabsRow}>
          <Box
            component="button"
            type="button"
            sx={chatMonitorInboxTabSx(listTab === "live")}
            onClick={() => onListTabChange("live")}
          >
            Live · {liveCount}
          </Box>
          <Box
            component="button"
            type="button"
            sx={chatMonitorInboxTabSx(listTab === "closed")}
            onClick={() => onListTabChange("closed")}
          >
            Closed · {closedCount}
          </Box>
        </Box>
      </Box>

      <Box sx={chatMonitorFilterWrap}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, site, or ID…"
          sx={{ width: "100%" }}
        />
      </Box>

      <ScrollRegion sx={{ flex: 1 }}>
        {loading ? (
          <EmptyState sx={{ py: 6 }}>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
              Loading…
            </Typography>
          </EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState sx={{ py: 6 }}>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
              {searchQuery.trim() ? "No results" : "No conversations in this queue"}
            </Typography>
          </EmptyState>
        ) : (
          filtered.map((conversation) => {
            const { title, subtitle, initials } = getInboxRowLabels(conversation);
            const selected = conversation.id === selectedConversationId;
            const preview = getConversationPreview(
              { ...conversation, id: conversation.id },
              listTab === "closed" ? "Closed" : "No messages yet",
            );
            const chip = statusChipColor(conversation.status, theme);
            const time = formatRelativeQueueTime(conversation.startedAt);

            return (
              <QueueItemRow
                key={conversation.id}
                active={selected}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <QueueAvatar>{initials}</QueueAvatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.25 }}>
                    <Typography
                      fontWeight={selected ? 700 : 600}
                      sx={{
                        fontSize: 14,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {title}
                    </Typography>
                    {time ? (
                      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
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
                        mb: 0.25,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {subtitle}
                    </Typography>
                  ) : null}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                    <Chip
                      label={conversation.status}
                      size="small"
                      sx={{ height: 20, fontSize: 10, ...chip }}
                    />
                    <Typography variant="caption" sx={{ fontSize: 11, color: theme.app.dashboard.textMuted }}>
                      {agentDisplayName(conversation.agent)}
                    </Typography>
                  </Box>
                  <Typography
                    variant="small"
                    sx={{
                      fontSize: 12,
                      color: theme.app.dashboard.textMuted,
                      mt: 0.25,
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
