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
  FilterButton,
  TablePagination,
  ButtonOutline,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { MetricCard } from "@/components/dashboard";
import {
  AccessTime as AccessTimeIcon,
  MoreHoriz as MoreHorizIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { userIconPath } from "@/assets";

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

export default function ManagerOverview() {
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Avatar src={userIconPath} sx={{ width: 24, height: 24, bgcolor: theme.app.dashboard.buttonIndigo }} />
            <Typography variant="body2" color="textPrimary" fontWeight={500}>
              {row.agent}
            </Typography>
          </Box>
        ),
      },
      {
        id: "department",
        label: "Department",
        render: (_, row) => (
          <Box
            component="span"
            sx={{
              px: 1.1,
              py: 0.3,
              borderRadius: "9999px",
              fontSize: "0.7rem",
              fontWeight: 600,
              bgcolor: "rgba(59,130,246,0.2)",
              color: "#7DD3FC",
              border: "1px solid rgba(59,130,246,0.3)",
            }}
          >
            {row.department}
          </Box>
        ),
      },
      {
        id: "duration",
        label: "Duration",
        render: (_, row) => (
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6 }}>
            <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {row.duration}
            </Typography>
          </Box>
        ),
      },
      {
        id: "priority",
        label: "Priority",
        render: (_, row) => (
          <Box
            component="span"
            sx={{
              px: 1.1,
              py: 0.25,
              borderRadius: "9999px",
              fontSize: "0.7rem",
              fontWeight: 600,
              bgcolor: "rgba(239,68,68,0.2)",
              color: "#FCA5A5",
              border: "1px solid rgba(239,68,68,0.35)",
            }}
          >
            {row.priority}
          </Box>
        ),
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
          <ButtonOutline text="12 Pending Reviews" dotColor="#FACC15" />
          <ButtonOutline text="Today, Oct 24" />
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
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

      <DashboardCard sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap", mb: 1.5 }}>
          <Typography variant="mediumLarge" color="textPrimary" fontWeight={600}>
            Pending Review Queue
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: { xs: "100%", md: "auto" } }}>
            <Box sx={{ flex: 1, minWidth: { xs: 0, md: 220 } }}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything..." />
            </Box>
            <FilterButton />
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

        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data 1 to {rows.length} of 256K entries
          </Typography>
          <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </Box>
      </DashboardCard>
    </Box>
  );
}
