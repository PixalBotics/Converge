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
import { DashboardAttendanceMetrics } from "../components/DashboardAttendanceMetrics";
import {
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Forum as ForumIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  MoreHoriz as MoreHorizIcon,
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
  paginationRow,
  customerCell,
  customerAvatar,
  onlineStatusPill,
  statusDot,
  ratingStarsWrap,
} from "./AgentDashboardOverview.styles";

type RecentChatRow = {
  chatId: string;
  customer: string;
  website: string;
  topic: string;
  status: "Online" | "Offline";
  rating: number;
};

const RECENT_CHATS: RecentChatRow[] = [
  { chatId: "#29401", customer: "Alex Satrio", website: "facebook.com", topic: "Billing inquiry", status: "Online", rating: 4 },
  { chatId: "#29402", customer: "Alex Satrio", website: "facebook.com", topic: "Billing inquiry", status: "Online", rating: 4 },
  { chatId: "#29403", customer: "Alex Satrio", website: "facebook.com", topic: "Billing inquiry", status: "Online", rating: 5 },
  { chatId: "#29404", customer: "Alex Satrio", website: "facebook.com", topic: "Billing inquiry", status: "Online", rating: 4 },
  { chatId: "#29405", customer: "Alex Satrio", website: "facebook.com", topic: "Billing inquiry", status: "Online", rating: 4 },
  { chatId: "#29406", customer: "Alex Satrio", website: "facebook.com", topic: "Billing inquiry", status: "Online", rating: 4 },
  { chatId: "#29407", customer: "Alex Satrio", website: "facebook.com", topic: "Billing inquiry", status: "Online", rating: 5 },
  { chatId: "#29408", customer: "Alex Satrio", website: "facebook.com", topic: "Billing inquiry", status: "Online", rating: 4 },
  { chatId: "#29409", customer: "Alex Satrio", website: "facebook.com", topic: "Billing inquiry", status: "Online", rating: 4 },
  { chatId: "#29410", customer: "Alex Satrio", website: "facebook.com", topic: "Billing inquiry", status: "Online", rating: 4 },
];

function RatingStars({ value }: { value: number }) {
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

export default function AgentDashboardOverview() {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageCount = 2;

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return RECENT_CHATS;
    return RECENT_CHATS.filter((row) =>
      row.chatId.toLowerCase().includes(q) ||
      row.customer.toLowerCase().includes(q) ||
      row.website.toLowerCase().includes(q) ||
      row.topic.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q),
    );
  }, [search]);

  const columns = useMemo<DataTableColumn<RecentChatRow>[]>(
    () => [
      { id: "chatId", label: "Chat ID", cellVariant: "muted" },
      {
        id: "customer",
        label: "Customer",
        render: (_, row) => (
          <Box sx={customerCell}>
            <Avatar src={userIconPath} sx={customerAvatar(theme)}>
              A
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
          <Box
            component="span"
            sx={onlineStatusPill(theme)}
          >
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
      <Box sx={headerRow}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Agent dashboard
        </Typography>
        <Box sx={headerActions}>
          <ButtonOutline text="Active" dotColor="#4CAF50" />
          <ButtonOutline text="Current Shift 09:00 - 17:00" />
          <ButtonOutline text="Today, Oct 24" />
        </Box>
      </Box>

      <DashboardAttendanceMetrics />

      <Box sx={metricsGrid}>
        <MetricCard
          title="My Active Chats"
          value="32"
          subtitle="7 Chats open"
          icon={<ChatBubbleOutlineIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentBlue}
          valueColor="#7DD3FC"
        />
        <MetricCard
          title="Closed Chats"
          value="21,136"
          subtitle="7 Resolved"
          icon={<ForumIcon sx={{ fontSize: 22 }} />}
          iconBgColor={theme.app.dashboard.accentOrange}
          valueColor="#F0ABFC"
        />
        <MetricCard
          title="Avg Rating"
          value="4.5 / 5.0"
          subtitle="7 Longest wait: 3m 12s"
          icon={<StarIcon sx={{ fontSize: 22 }} />}
          iconBgColor="#EC4899"
          valueColor="#A5B4FC"
        />
        <MetricCard
          title="Response Time"
          value="1m 42s"
          subtitle="7 Average Response Time"
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

        <DataTable<RecentChatRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.chatId}
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
            Showing data 1 to {filteredRows.length} of 25K entries
          </Typography>
          <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </Box>
      </DashboardCard>
    </Box>
  );
}
