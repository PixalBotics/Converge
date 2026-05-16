"use client";

import { useMemo, useState } from "react";
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

type QueueRow = {
  chatId: string;
  agent: string;
  department: string;
  duration: string;
  priority: "High" | "Medium";
};

const PENDING_REVIEWS: QueueRow[] = [
  { chatId: "#29401", agent: "Alex Satrio", department: "Support", duration: "1m 06s", priority: "High" },
  { chatId: "#29402", agent: "Jerome Bell", department: "Support", duration: "8m 10s", priority: "High" },
  { chatId: "#29403", agent: "Brooklyn Simmons", department: "Support", duration: "21m 00s", priority: "High" },
  { chatId: "#29404", agent: "Guy Hawkins", department: "Support", duration: "12m 11s", priority: "High" },
  { chatId: "#29405", agent: "Wade Warren", department: "Support", duration: "17m 08s", priority: "High" },
  { chatId: "#29406", agent: "Leslie Alexander", department: "Support", duration: "45m 18s", priority: "High" },
  { chatId: "#29407", agent: "Darlene Robertson", department: "Support", duration: "8m 10s", priority: "High" },
  { chatId: "#29408", agent: "Kristin Watson", department: "Support", duration: "1m 08s", priority: "High" },
  { chatId: "#29409", agent: "Cody Fisher", department: "Support", duration: "21m 00s", priority: "High" },
  { chatId: "#29410", agent: "Courtney Henry", department: "Support", duration: "8m 10s", priority: "High" },
];

export default function QaDashboardOverview() {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageCount = 2;

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return PENDING_REVIEWS;
    return PENDING_REVIEWS.filter((row) =>
      row.chatId.toLowerCase().includes(query) ||
      row.agent.toLowerCase().includes(query) ||
      row.department.toLowerCase().includes(query) ||
      row.duration.toLowerCase().includes(query) ||
      row.priority.toLowerCase().includes(query),
    );
  }, [search]);

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
    <Box sx={pageRoot}>
      <Box sx={headerRow}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          QA dashboard
        </Typography>
        <Box sx={headerActions}>
          <ButtonOutline text="12 Pending Reviews" dotColor="#FACC15" />
          <ButtonOutline text="Today, Oct 24" />
        </Box>
      </Box>

      <Box sx={metricsGrid}>
        <MetricCard
          title="Chats Pending Review"
          value="12"
          subtitle="8 Awaiting QA"
          icon={<ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          valueColor="#7DD3FC"
        />
        <MetricCard
          title="Reviewed Today"
          value="21"
          subtitle="8 Completed"
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 20 }} />}
          iconBgColor={theme.app.dashboard.accentOrange}
          valueColor="#A5B4FC"
        />
        <MetricCard
          title="Avg Quality Score"
          value="8.7 / 10.0"
          subtitle="8 Chats open"
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

        <DataTable<QueueRow>
          columns={columns}
          rows={rows}
          getRowId={(row) => `${row.chatId}-${row.agent}`}
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

        <Box sx={paginationRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data 1 to {rows.length} of 256K entries
          </Typography>
          <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </Box>
      </DashboardCard>
    </Box>
  );
}
