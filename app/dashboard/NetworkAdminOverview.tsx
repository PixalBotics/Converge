"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  SearchBar,
  FilterButton,
  TablePagination,
  ButtonOutline,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { MetricCard } from "@/components/dashboard";
import {
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Forum as ForumIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  MoreHoriz as MoreHorizIcon,
} from "@mui/icons-material";
import { userIconPath } from "@/assets";

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
  const theme = useTheme() as AppTheme;
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.15 }}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <StarIcon
          key={idx}
          sx={{
            fontSize: 17,
            color: idx < value ? "#FACC15" : alpha(theme.palette.text.primary, 0.35),
          }}
        />
      ))}
    </Box>
  );
}

export default function NetworkAdminOverview() {
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Avatar src={userIconPath} sx={{ width: 30, height: 30, bgcolor: theme.app.dashboard.buttonIndigo }}>
              A
            </Avatar>
            <Typography variant="body2" color="textPrimary" fontWeight={500}>
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
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.8,
              px: 1.2,
              py: 0.45,
              borderRadius: "9999px",
              bgcolor: "rgba(34,197,94,0.16)",
              color: "#22C55E",
              border: "1px solid rgba(34,197,94,0.35)",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#22C55E" }} />
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Typography variant="regularLarge" fontWeight={700} color="textPrimary">
          Overview
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <ButtonOutline text="Active" dotColor="#4CAF50" />
          <ButtonOutline text="Current Shift 09:00 - 17:00" />
          <ButtonOutline text="Today, Oct 24" />
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
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

      <DashboardCard sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap", mb: 1.5 }}>
          <Typography variant="mediumLarge" color="textPrimary" fontWeight={600}>
            My Recent Chats
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: { xs: "100%", md: "auto" } }}>
            <Box sx={{ flex: 1, minWidth: { xs: 0, md: 240 } }}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything..." />
            </Box>
            <FilterButton />
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

        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data 1 to {filteredRows.length} of 25K entries
          </Typography>
          <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </Box>
      </DashboardCard>
    </Box>
  );
}
