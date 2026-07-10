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
  AccessTime as AccessTimeIcon,
  MoreHoriz as MoreHorizIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { userIconPath } from "@/assets";
import { useChatQa } from "@/features/chat-qa/hooks/useChatQa";
import { qaUserLabel } from "@/features/chat-qa/utils/qa-labels";
import { formatScore } from "@/features/chat-reports/utils/format-metric";
import type { QaQueueRow } from "@/services/chat/qa.types";
import {
  pageRoot,
  headerRow,
  headerActions,
  metricsGrid,
  cardPadding,
  cardHeaderRow,
  cardActionsWrap,
  searchWrap,
  queueAgentCell,
  queueAgentAvatar,
  queueDepartmentPill,
  queueDurationWrap,
  queueDurationIcon,
  queueDurationText,
  queuePriorityPill,
  paginationRow,
} from "./QaDashboardOverview.styles";
import { dashboardEmbeddedOverviewRoot, embeddedOverviewToolbar } from "../dashboard.styles";
import {
  elapsedDurationLabel,
  formatDashboardCount,
  formatTodayHeader,
  isTodayUtc,
  paginateRows,
  shortConversationId,
} from "../components/dashboard-chat.utils";
import { useDashboardChatReports } from "../components/use-dashboard-chat-data";

const PAGE_SIZE = 10;

type QueueRow = {
  id: string;
  chatId: string;
  agent: string;
  department: string;
  duration: string;
  priority: "High" | "Medium";
};

function mapQueueRow(row: QaQueueRow): QueueRow {
  const waitMinutes = row.createdAt
    ? Math.floor((Date.now() - new Date(row.createdAt).getTime()) / 60_000)
    : 0;
  return {
    id: row.id,
    chatId: shortConversationId(row.conversationId),
    agent: qaUserLabel(row.conversation?.agent),
    department:
      row.pool?.name ??
      row.conversation?.pool?.name ??
      row.conversation?.routingKey?.trim() ??
      row.conversation?.website?.name?.trim() ??
      "—",
    duration: elapsedDurationLabel(row.createdAt),
    priority: waitMinutes >= 30 ? "High" : "Medium",
  };
}

export default function QaDashboardOverview({ embedded = false }: { embedded?: boolean }) {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const qa = useChatQa(null, { apiEnabled: true });
  const reports = useDashboardChatReports("Last 30 Days");

  useEffect(() => {
    qa.setStatusTab("all");
  }, [qa.setStatusTab]);

  const pendingSource = useMemo(
    () => qa.queue.filter((row) => row.status === "pending"),
    [qa.queue],
  );

  const pendingRows = useMemo(() => pendingSource.map(mapQueueRow), [pendingSource]);

  const reviewedToday = useMemo(
    () =>
      qa.queue.filter((row) => row.status === "completed" && isTodayUtc(row.completedAt)).length,
    [qa.queue],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return pendingRows;
    return pendingRows.filter(
      (row) =>
        row.chatId.toLowerCase().includes(query) ||
        row.agent.toLowerCase().includes(query) ||
        row.department.toLowerCase().includes(query) ||
        row.duration.toLowerCase().includes(query) ||
        row.priority.toLowerCase().includes(query),
    );
  }, [pendingRows, search]);

  const pagination = useMemo(
    () => paginateRows(filteredRows, page, PAGE_SIZE),
    [filteredRows, page],
  );

  useEffect(() => {
    if (page > pagination.pageCount) setPage(pagination.pageCount);
  }, [page, pagination.pageCount]);

  const avgScore =
    reports.overview?.qa.avgOverallScore ?? reports.overview?.summary.avgQaScore ?? null;
  const metricsLoading = qa.queueLoading || reports.loading;

  const columns = useMemo<DataTableColumn<QueueRow>[]>(
    () => [
      { id: "chatId", label: "Chat ID", cellVariant: "muted" },
      {
        id: "agent",
        label: "Agent",
        render: (_, row) => (
          <Box sx={queueAgentCell}>
            <Avatar src={userIconPath} sx={queueAgentAvatar(theme)} />
            <Typography variant="body2" color="white" fontWeight={500}>
              {row.agent}
            </Typography>
          </Box>
        ),
      },
      {
        id: "department",
        label: "Department",
        render: (_, row) => (
          <Box component="span" sx={queueDepartmentPill}>
            {row.department}
          </Box>
        ),
      },
      {
        id: "duration",
        label: "Duration",
        render: (_, row) => (
          <Box sx={queueDurationWrap}>
            <AccessTimeIcon sx={queueDurationIcon} />
            <Typography variant="body2" sx={queueDurationText}>
              {row.duration}
            </Typography>
          </Box>
        ),
      },
      {
        id: "priority",
        label: "Priority",
        render: (_, row) => (
          <Box component="span" sx={queuePriorityPill}>
            {row.priority}
          </Box>
        ),
      },
    ],
    [theme],
  );

  return (
    <Box sx={embedded ? dashboardEmbeddedOverviewRoot : pageRoot}>
      <Box sx={embedded ? embeddedOverviewToolbar : headerRow}>
        {!embedded ? (
          <Typography variant="regularLarge" fontWeight={700} color="white">
            QA dashboard
          </Typography>
        ) : null}
        <Box sx={headerActions}>
          <ButtonOutline
            text={`${formatDashboardCount(qa.statusCounts.pending, qa.queueLoading)} Pending Reviews`}
            dotColor="#FACC15"
          />
          <ButtonOutline text={`Today, ${formatTodayHeader()}`} />
        </Box>
      </Box>

      <Box sx={metricsGrid}>
        <MetricCard
          title="Chats Pending Review"
          value={formatDashboardCount(qa.statusCounts.pending, metricsLoading)}
          subtitle={`${formatDashboardCount(qa.statusCounts.in_progress, metricsLoading)} in progress`}
          icon={<ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          valueColor="#7DD3FC"
        />
        <MetricCard
          title="Reviewed Today"
          value={formatDashboardCount(reviewedToday, qa.queueLoading)}
          subtitle={`${formatDashboardCount(qa.statusCounts.completed, metricsLoading)} completed in queue`}
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 20 }} />}
          iconBgColor={theme.app.dashboard.accentOrange}
          valueColor="#A5B4FC"
        />
        <MetricCard
          title="Avg Quality Score"
          value={metricsLoading ? "…" : formatScore(avgScore)}
          subtitle={`${formatDashboardCount(reports.overview?.qa.pending, metricsLoading)} pending in reports`}
          icon={<StarIcon sx={{ fontSize: 20 }} />}
          iconBgColor="#EC4899"
          valueColor="#60A5FA"
        />
      </Box>

      <DashboardCard sx={cardPadding}>
        <Box sx={cardHeaderRow}>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Pending Review Queue
          </Typography>
          <Box sx={cardActionsWrap}>
            <Box sx={searchWrap}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything..." />
            </Box>
          </Box>
        </Box>

        {qa.queueLoading ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
            Loading QA queue…
          </Typography>
        ) : pagination.rows.length === 0 ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
            No pending reviews in your queue.
          </Typography>
        ) : (
          <DataTable<QueueRow>
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
            {(pagination.safePage - 1) * PAGE_SIZE + pagination.rows.length} of{" "}
            {pagination.total} entries
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
