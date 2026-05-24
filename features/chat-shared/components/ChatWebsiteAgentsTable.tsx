"use client";

import { useMemo } from "react";
import OpenInNew from "@mui/icons-material/OpenInNew";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DataTable, Typography, dataTableActionButton } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import type { ChatWebsiteAgentRow } from "../utils/flatten-website-agents";
import {
  websiteAssignmentTableCard,
  websiteAssignmentTableIconBox,
  websiteAssignmentTableToolbar,
} from "@/app/dashboard/website-assigning/website-assigning.styles";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";

type ChatWebsiteAgentsTableProps = {
  rows: ChatWebsiteAgentRow[];
  isLoading: boolean;
  isError: boolean;
  selectedAgentUserId?: string | null;
  onSelectAgent: (row: ChatWebsiteAgentRow) => void;
  websiteLabel?: string;
};

export function ChatWebsiteAgentsTable({
  rows,
  isLoading,
  isError,
  selectedAgentUserId,
  onSelectAgent,
  websiteLabel,
}: ChatWebsiteAgentsTableProps) {
  const theme = useTheme() as AppTheme;

  const columns = useMemo<DataTableColumn<ChatWebsiteAgentRow>[]>(
    () => [
      {
        id: "agent",
        label: "Agent",
        render: (_, row) => (
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              {row.displayName}
            </Typography>
            {row.email ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {row.email}
              </Typography>
            ) : null}
          </Box>
        ),
      },
      {
        id: "department",
        label: "Department",
        render: (_, row) => row.departmentName || "—",
      },
      {
        id: "channel",
        label: "Channel",
        render: (_, row) => (
          <Chip
            label={row.serviceChannel}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: 11 }}
          />
        ),
      },
      {
        id: "tier",
        label: "Role",
        render: (_, row) => row.assignmentTier,
      },
      {
        id: "live",
        label: "Live",
        render: (_, row) => (
          <Typography
            variant="body2"
            fontWeight={row.liveCount > 0 ? 700 : 400}
            sx={{
              color:
                row.liveCount > 0
                  ? theme.app.dashboard.accentBlue
                  : theme.app.dashboard.textMuted,
            }}
          >
            {row.liveCount}
          </Typography>
        ),
      },
      {
        id: "open",
        label: "",
        render: (_, row) => (
          <Tooltip title="Open this agent's chats">
            <IconButton
              size="small"
              sx={dataTableActionButton}
              aria-label={`Open chats for ${row.displayName}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectAgent(row);
              }}
            >
              <OpenInNew fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [onSelectAgent, theme],
  );

  return (
    <Box sx={websiteAssignmentTableCard}>
      <Box sx={websiteAssignmentTableToolbar}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={websiteAssignmentTableIconBox}>
            <GroupsOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography fontWeight={700} sx={{ fontSize: 16, color: theme.app.text.primary }}>
              Assigned agents
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {websiteLabel
                ? `${websiteLabel} · `
                : null}
              {isLoading
                ? "Loading roster…"
                : `${rows.length} agent${rows.length === 1 ? "" : "s"} · click a row to open chats`}
            </Typography>
          </Box>
        </Box>
      </Box>

      <DataTable<ChatWebsiteAgentRow>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.rowKey}
        isLoading={isLoading}
        onRowClick={onSelectAgent}
        emptyState={{
          title: isError ? "Could not load agents" : "No agents on this website",
          description: isError
            ? "Check website assignment and monitor permissions."
            : "Assign agents on Website assign, then pick them here to monitor or coach.",
        }}
      />
    </Box>
  );
}
