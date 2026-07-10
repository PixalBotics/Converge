"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  SearchBar,
  TablePagination,
  ButtonOutline,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { MetricCard } from "@/components/common";
import {
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Forum as ForumIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  MoreHoriz as MoreHorizIcon,
} from "@mui/icons-material";
import { userIconPath } from "@/assets";
import { useAuth } from "@/lib/auth";
import { useAccessToken } from "@/lib/auth/use-access-token";
import { useAgentInboxQueues } from "@/lib/hooks/chat/useAgentInboxQueues";
import { useAgentChatSession } from "@/lib/hooks/chat/useAgentChatSession";
import { useChatApiGates } from "@/lib/permissions";
import { formatDurationSeconds, formatScore } from "@/features/chat-reports/utils/format-metric";
import type { ConversationSummary } from "@/services/chat/chat.types";
import {
  pageRoot,
  headerRow,
  headerActions,
  metricsGrid,
  cardPadding,
  cardHeaderRow,
  cardActionsWrap,
  searchWrap,
  paginationRow,
  customerCell,
  customerAvatar,
  onlineStatusPill,
  statusDot,
  ratingStarsWrap,
} from "./AgentDashboardOverview.styles";
import {
  conversationVisitorName,
  conversationWebsiteLabel,
  formatDashboardCount,
  formatTodayHeader,
  paginateRows,
  shortConversationId,
} from "../components/dashboard-chat.utils";
import { useDashboardChatReports } from "../components/use-dashboard-chat-data";

const PAGE_SIZE = 10;

type RecentChatRow = {
  id: string;
  chatId: string;
  customer: string;
  website: string;
  topic: string;
  status: "Online" | "Offline";
  rating: number | null;
};

function conversationTopic(row: ConversationSummary): string {
  const routingKey = String(row.routingKey ?? row["routingKey"] ?? "").trim();
  if (routingKey) return routingKey;
  const lastTransfer = row.lastTransferFrom?.label?.trim();
  if (lastTransfer) return `Transfer from ${lastTransfer}`;
  return row.status === "waiting" ? "Waiting in queue" : "Live chat";
}

function mapRecentChat(row: ConversationSummary, closed: boolean): RecentChatRow {
  const isActive = !closed && (row.status === "active" || row.status === "assigned");
  return {
    id: row.id,
    chatId: shortConversationId(row.id),
    customer: conversationVisitorName(row),
    website: conversationWebsiteLabel(row),
    topic: conversationTopic(row),
    status: isActive ? "Online" : "Offline",
    rating: null,
  };
}

function RatingStars({ value }: { value: number | null }) {
  if (value == null) return <Typography variant="body2">—</Typography>;
  return (
    <Box sx={ratingStarsWrap}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <StarIcon
          key={idx}
          sx={{
            fontSize: 17,
            color: idx < value ? "#FACC15" : "rgba(255,255,255,0.35)",
          }}
        />
      ))}
    </Box>
  );
}

export default function AgentDashboardOverview({ embedded = false }: { embedded?: boolean }) {
  const theme = useTheme() as AppTheme;
  const { user } = useAuth();
  const gates = useChatApiGates();
  const token = useAccessToken() ?? "";
  const session = useAgentChatSession();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [queuesLoading, setQueuesLoading] = useState(true);

  const inbox = useAgentInboxQueues(token, gates.agentInbox, user?.id, {
    respectChatSession: true,
  });

  const reports = useDashboardChatReports("Last 30 Days");

  useEffect(() => {
    let cancelled = false;
    void inbox.refreshQueues().finally(() => {
      if (!cancelled) setQueuesLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [inbox.refreshQueues]);

  const agentBucket = useMemo(() => {
    if (!user?.id) return null;
    return (reports.overview?.byAgent ?? []).find((row) => row.key === user.id) ?? null;
  }, [reports.overview?.byAgent, user?.id]);

  const recentChats = useMemo(() => {
    const merged = [
      ...inbox.activeChats.map((row) => mapRecentChat(row, false)),
      ...inbox.closedChats.map((row) => mapRecentChat(row, true)),
    ];
    return merged.sort((a, b) => b.chatId.localeCompare(a.chatId));
  }, [inbox.activeChats, inbox.closedChats]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recentChats;
    return recentChats.filter(
      (row) =>
        row.chatId.toLowerCase().includes(q) ||
        row.customer.toLowerCase().includes(q) ||
        row.website.toLowerCase().includes(q) ||
        row.topic.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q),
    );
  }, [recentChats, search]);

  const pagination = useMemo(
    () => paginateRows(filteredRows, page, PAGE_SIZE),
    [filteredRows, page],
  );

  useEffect(() => {
    if (page > pagination.pageCount) setPage(pagination.pageCount);
  }, [page, pagination.pageCount]);

  const metricsLoading = queuesLoading || (reports.enabled && reports.loading);
  const sessionLabel =
    session.session.status === "active" && session.session.acceptingChats
      ? "Active"
      : "Paused";
  const sessionDot =
    session.session.status === "active" && session.session.acceptingChats
      ? "#4CAF50"
      : "#F97316";

  const avgRating = agentBucket?.avgCsatScore ?? agentBucket?.avgQaScore ?? null;
  const avgResponse = agentBucket?.avgFirstResponseSeconds ?? null;

  const columns = useMemo<DataTableColumn<RecentChatRow>[]>(
    () => [
      { id: "chatId", label: "Chat ID", cellVariant: "muted" },
      {
        id: "customer",
        label: "Customer",
        render: (_, row) => (
          <Box sx={customerCell}>
            <Avatar src={userIconPath} sx={customerAvatar(theme)}>
              {row.customer.slice(0, 1).toUpperCase()}
            </Avatar>
            <Typography variant="body2" color="white" fontWeight={500}>
              {row.customer}
            </Typography>
          </Box>
        ),
      },
      { id: "website", label: "Website", cellVariant: "muted" },
      { id: "topic", label: "Topic", cellVariant: "default" },
      {
        id: "status",
        label: "Status",
        render: (_, row) => (
          <Box component="span" sx={onlineStatusPill(theme)}>
            <Box sx={statusDot} />
            {row.status}
          </Box>
        ),
      },
      {
        id: "rating",
        label: "Rating",
        render: (_, row) => <RatingStars value={row.rating} />,
      },
    ],
    [theme],
  );

  return (
    <Box sx={pageRoot}>
      <Box sx={[headerRow, embedded ? { justifyContent: "flex-end", mb: 2 } : undefined]}>
        {!embedded ? (
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Agent dashboard
          </Typography>
        ) : null}
        <Box sx={headerActions}>
          <ButtonOutline text={sessionLabel} dotColor={sessionDot} />
          <ButtonOutline text={`Today, ${formatTodayHeader()}`} />
        </Box>
      </Box>

      <Box sx={metricsGrid}>
        <MetricCard
          title="My Active Chats"
          value={formatDashboardCount(inbox.activeChats.length, metricsLoading)}
          subtitle={`${formatDashboardCount(inbox.waitingChats.length, metricsLoading)} waiting`}
          icon={<ChatBubbleOutlineIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          valueColor="#7DD3FC"
        />
        <MetricCard
          title="Closed Chats"
          value={formatDashboardCount(inbox.closedChats.length, metricsLoading)}
          subtitle={`${formatDashboardCount(agentBucket?.closedCount, metricsLoading)} in report range`}
          icon={<ForumIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentOrange}
          valueColor="#F0ABFC"
        />
        <MetricCard
          title="Avg Rating"
          value={metricsLoading ? "…" : formatScore(avgRating)}
          subtitle={
            metricsLoading
              ? "Loading report metrics"
              : `CSAT / QA in selected range`
          }
          icon={<StarIcon sx={{ fontSize: 22 }} />}
          iconBgColor="#EC4899"
          valueColor="#A5B4FC"
        />
        <MetricCard
          title="Response Time"
          value={metricsLoading ? "…" : formatDurationSeconds(avgResponse)}
          subtitle="Average first response"
          icon={<AccessTimeIcon sx={{ fontSize: 22 }} />}
          iconBgColor="#F87171"
          valueColor="#F9A8D4"
        />
      </Box>

      <DashboardCard sx={cardPadding}>
        <Box sx={cardHeaderRow}>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            My Recent Chats
          </Typography>
          <Box sx={cardActionsWrap}>
            <Box sx={searchWrap}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything..." />
            </Box>
          </Box>
        </Box>

        {queuesLoading ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
            Loading chats…
          </Typography>
        ) : pagination.rows.length === 0 ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
            No recent chats yet.
          </Typography>
        ) : (
          <DataTable<RecentChatRow>
            columns={columns}
            rows={pagination.rows}
            getRowId={(row) => row.id}
            minWidth={940}
            actionColumn={{
              label: "Action",
              render: () => (
                <IconButton size="small" sx={dataTableActionButton}>
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
        )}

        <Box sx={paginationRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing {pagination.rows.length === 0 ? 0 : (pagination.safePage - 1) * PAGE_SIZE + 1} to{" "}
            {(pagination.safePage - 1) * PAGE_SIZE + pagination.rows.length} of {pagination.total}{" "}
            entries
          </Typography>
          <TablePagination
            page={pagination.safePage}
            pageCount={pagination.pageCount}
            onPageChange={setPage}
          />
        </Box>
      </DashboardCard>
    </Box>
  );
}
