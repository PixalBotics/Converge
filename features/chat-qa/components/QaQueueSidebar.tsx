"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { SearchBar, Typography } from "@/components/common";
import type { QaQueueFilters, QaQueueRow } from "@/services/chat/qa.types";
import { formatRelativeQueueTime } from "@/features/chat-operations/utils/format-message-time";
import {
  EmptyState,
  PanelColumn,
  QueueItemRow,
  ScrollRegion,
} from "@/features/chat-operations/styles/chat-operations.styled";
import type { QaStatusTab } from "../hooks/useChatQa";
import { queueRowTitle } from "../utils/qa-labels";
import {
  chatQaFilterWrap,
  chatQaInboxHeaderSx,
  chatQaInboxTabsRow,
  chatQaInboxTabSx,
  chatQaInboxToolbarSx,
  chatQaPaneTitleSx,
} from "../styles/chat-qa.styles";

const STATUS_TABS: Array<{ id: QaStatusTab; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Completed" },
  { id: "all", label: "All" },
];

function statusChipColor(
  status: string,
  theme: AppTheme,
): { bgcolor: string; color: string } {
  if (status === "completed") {
    return {
      bgcolor: `${theme.app.dashboard.accentBlue}22`,
      color: theme.app.dashboard.accentBlue,
    };
  }
  if (status === "in_progress") {
    return {
      bgcolor: `${theme.app.dashboard.accentViolet}22`,
      color: theme.app.dashboard.accentViolet,
    };
  }
  return {
    bgcolor: `${theme.app.dashboard.accentOrange}22`,
    color: theme.app.dashboard.accentOrange,
  };
}

interface QaQueueSidebarProps {
  statusTab: QaStatusTab;
  onStatusTabChange: (tab: QaStatusTab) => void;
  queue: QaQueueRow[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  loading: boolean;
  filters: QaQueueFilters;
  onFiltersChange: (filters: QaQueueFilters) => void;
  statusCounts: {
    pending: number;
    in_progress: number;
    completed: number;
    all: number;
  };
}

export function QaQueueSidebar({
  statusTab,
  onStatusTabChange,
  queue,
  selectedConversationId,
  onSelectConversation,
  loading,
  filters,
  onFiltersChange,
  statusCounts,
}: QaQueueSidebarProps) {
  const theme = useTheme() as AppTheme;
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return queue;
    return queue.filter((row) => {
      const title = queueRowTitle(row).toLowerCase();
      const id = row.conversationId.toLowerCase();
      return title.includes(q) || id.includes(q);
    });
  }, [queue, searchQuery]);

  return (
    <PanelColumn sx={{ height: "100%" }}>
      <Box sx={chatQaInboxToolbarSx}>
        <Box>
          <Typography sx={chatQaPaneTitleSx}>QA reviews</Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
            Closed conversations for scoring
          </Typography>
        </Box>
      </Box>
      <Box sx={chatQaInboxHeaderSx}>
        <Box sx={chatQaInboxTabsRow}>
          {STATUS_TABS.map((tab) => {
            const count = statusCounts[tab.id as keyof typeof statusCounts] ?? 0;
            return (
              <Box
                key={tab.id}
                component="button"
                type="button"
                onClick={() => onStatusTabChange(tab.id)}
                sx={chatQaInboxTabSx(statusTab === tab.id)}
              >
                {tab.label}
                {count > 0 ? ` (${count})` : ""}
              </Box>
            );
          })}
        </Box>
      </Box>
        <Box sx={chatQaFilterWrap}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search reviews…"
          />
          <FormControlLabel
            sx={{ mt: 0.5, ml: 0 }}
            control={
              <Checkbox
                size="small"
                checked={Boolean(filters.hasTakeover)}
                onChange={(_, v) =>
                  onFiltersChange({ ...filters, hasTakeover: v || undefined })
                }
              />
            }
            label={
              <Typography variant="caption" sx={{ fontSize: 11 }}>
                Has approved takeover
              </Typography>
            }
          />
        </Box>

      <ScrollRegion sx={{ flex: 1 }}>
        {loading ? (
          <Typography sx={{ p: 2, color: theme.app.dashboard.textMuted, fontSize: 13 }}>
            Loading queue…
          </Typography>
        ) : filtered.length === 0 ? (
          <EmptyState sx={{ py: 6 }}>
            <Typography sx={{ color: theme.app.dashboard.textMuted, fontSize: 13 }}>
              No QA reviews in this view.
            </Typography>
          </EmptyState>
        ) : (
          filtered.map((row) => {
            const selected = row.conversationId === selectedConversationId;
            const chip = statusChipColor(row.status, theme);
            return (
              <QueueItemRow
                key={row.id}
                active={selected}
                onClick={() => onSelectConversation(row.conversationId)}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography fontWeight={600} sx={{ fontSize: 13, lineHeight: 1.3 }}>
                    {queueRowTitle(row)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                    {row.conversation?.status ?? "—"}
                    {row.overallScore != null ? ` · score ${row.overallScore}` : ""}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
                    <Chip
                      label={row.status.replace("_", " ")}
                      size="small"
                      sx={{ height: 20, fontSize: 10, ...chip }}
                    />
                    {row.assignSource ? (
                      <Chip
                        label={row.assignSource}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: 10 }}
                      />
                    ) : null}
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, flexShrink: 0 }}>
                  {formatRelativeQueueTime(row.createdAt)}
                </Typography>
              </QueueItemRow>
            );
          })
        )}
      </ScrollRegion>
    </PanelColumn>
  );
}
