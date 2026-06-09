"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { alpha, useTheme } from "@mui/material/styles";
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

function statusChipSx(status: string, theme: AppTheme): object {
  const d = theme.app.dashboard;
  const accent =
    status === "completed"
      ? d.accentBlue
      : status === "in_progress"
        ? d.accentViolet
        : d.accentOrange;
  return {
    height: 22,
    fontSize: 10,
    fontWeight: 600,
    textTransform: "capitalize",
    bgcolor: alpha(accent, 0.2),
    color: accent,
    border: `1px solid ${alpha(accent, 0.38)}`,
  };
}

function metaChipSx(theme: AppTheme): object {
  const accent = theme.palette.primary.main;
  return {
    height: 22,
    fontSize: 10,
    fontWeight: 500,
    bgcolor: alpha(accent, 0.08),
    color: theme.app.text.primary,
    border: `1px solid ${alpha(accent, 0.22)}`,
  };
}

function formatAssignSource(value: string): string {
  return value.replace(/_/g, " ");
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
            const poolName = row.pool?.name ?? row.conversation?.pool?.name;
            return (
              <QueueItemRow
                key={row.id}
                active={selected}
                onClick={() => onSelectConversation(row.conversationId)}
                sx={{ alignItems: "flex-start", py: 1.5 }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 1,
                      mb: 0.4,
                    }}
                  >
                    <Typography
                      fontWeight={600}
                      sx={{
                        fontSize: 13,
                        lineHeight: 1.35,
                        minWidth: 0,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {queueRowTitle(row)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.app.dashboard.textMuted,
                        flexShrink: 0,
                        fontSize: 10,
                        lineHeight: 1.35,
                        pt: 0.15,
                      }}
                    >
                      {formatRelativeQueueTime(row.createdAt)}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.app.dashboard.textMuted,
                      fontSize: 11,
                      display: "block",
                      mb: 0.75,
                      textTransform: "capitalize",
                    }}
                  >
                    {row.conversation?.status ?? "—"}
                    {row.overallScore != null ? ` · Score ${row.overallScore}` : ""}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    <Chip
                      label={row.status.replace("_", " ")}
                      size="small"
                      sx={statusChipSx(row.status, theme)}
                    />
                    {poolName ? (
                      <Chip label={poolName} size="small" sx={metaChipSx(theme)} />
                    ) : null}
                    {row.assignSource ? (
                      <Chip
                        label={formatAssignSource(row.assignSource)}
                        size="small"
                        sx={metaChipSx(theme)}
                      />
                    ) : null}
                  </Box>
                </Box>
              </QueueItemRow>
            );
          })
        )}
      </ScrollRegion>
    </PanelColumn>
  );
}
