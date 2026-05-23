"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { KnowledgeSourceListItem, KnowledgeSourceStatus } from "@/api/ai-knowledge/types";
import { Button, DataTable, SelectField, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { formatSourceRefForDisplay } from "./ai-training-kb.utils";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "indexed", label: "Indexed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
] as const;

function statusChipColor(
  status: KnowledgeSourceStatus,
  theme: AppTheme,
): { bgcolor: string; color: string } {
  switch (status) {
    case "indexed":
      return { bgcolor: `${theme.palette.success.main}22`, color: theme.palette.success.light };
    case "failed":
      return { bgcolor: `${theme.palette.error.main}22`, color: theme.palette.error.light };
    default:
      return { bgcolor: `${theme.palette.warning.main}22`, color: theme.palette.warning.light };
  }
}

type SourceRow = KnowledgeSourceListItem & Record<string, unknown>;

export function AiTrainingSourcesTable({
  websiteId,
  items,
  total,
  limit,
  offset,
  isLoading,
  isFetching,
  statusFilter,
  onStatusFilterChange,
  onOffsetChange,
  onRefresh,
  onReindexRow,
  onDeleteRow,
  rowBusyId,
}: {
  websiteId: string;
  items: KnowledgeSourceListItem[];
  total: number;
  limit: number;
  offset: number;
  isLoading: boolean;
  isFetching: boolean;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  onOffsetChange: (next: number) => void;
  onRefresh: () => void;
  onReindexRow: (sourceId: string) => void;
  onDeleteRow: (sourceId: string) => void;
  rowBusyId: string | null;
}) {
  const theme = useTheme() as AppTheme;

  const rows = useMemo<SourceRow[]>(() => items.map((item) => ({ ...item })), [items]);

  const columns = useMemo<DataTableColumn<SourceRow>[]>(
    () => [
      {
        id: "title",
        label: "Source",
        render: (_, row) => (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              {formatSourceRefForDisplay(row)}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {row.sourceType}
            </Typography>
          </Box>
        ),
      },
      {
        id: "status",
        label: "Status",
        render: (_, row) => {
          const colors = statusChipColor(row.status, theme);
          return (
            <Chip
              label={row.status}
              size="small"
              sx={{ ...colors, fontWeight: 600, textTransform: "capitalize" }}
            />
          );
        },
      },
      {
        id: "lastIndexedAt",
        label: "Last indexed",
        render: (_, row) => (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            {row.lastIndexedAt ? new Date(row.lastIndexedAt).toLocaleString() : "—"}
          </Typography>
        ),
      },
      {
        id: "errorMessage",
        label: "Error",
        render: (_, row) =>
          row.errorMessage ? (
            <Typography variant="caption" sx={{ color: theme.palette.error.light, maxWidth: 220 }}>
              {row.errorMessage}
            </Typography>
          ) : (
            "—"
          ),
      },
    ],
    [theme],
  );

  const actionColumn = useMemo(
    () => ({
      label: "Actions",
      render: (row: SourceRow) => {
        const busy = rowBusyId === row.id;
        return (
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            <Button
              type="button"
              variant="secondary"
              size="small"
              disabled={busy}
              onClick={() => onReindexRow(row.id)}
            >
              {busy ? "…" : "Reindex"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="small"
              disabled={busy}
              onClick={() => onDeleteRow(row.id)}
            >
              Delete
            </Button>
          </Box>
        );
      },
    }),
    [rowBusyId, onReindexRow, onDeleteRow],
  );

  const rangeStart = total === 0 ? 0 : offset + 1;
  const rangeEnd = offset + items.length;
  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "flex-end",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ minWidth: 200 }}>
          <SelectField
            label="Status filter"
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={[...STATUS_FILTER_OPTIONS]}
            searchable={false}
            menuMaxRows={6}
          />
        </Box>
        <Button type="button" variant="secondary" onClick={onRefresh} disabled={isFetching || !websiteId.trim()}>
          {isFetching ? "Refreshing…" : "Refresh list"}
        </Button>
      </Box>

      {!websiteId.trim() ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
          Select a website above to list knowledge sources for that site.
        </Typography>
      ) : (
        <>
          <DataTable<SourceRow>
            columns={columns}
            rows={rows}
            getRowId={(row) => row.id}
            actionColumn={actionColumn}
            isLoading={isLoading}
            minWidth={720}
            emptyState={{
              title: "No sources yet",
              description: "Create a source above to ingest content for this website.",
            }}
          />
          {total > 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 1.5,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Showing {rangeStart}–{rangeEnd} of {total}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  disabled={!canPrev || isFetching}
                  onClick={() => onOffsetChange(Math.max(0, offset - limit))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  disabled={!canNext || isFetching}
                  onClick={() => onOffsetChange(offset + limit)}
                >
                  Next
                </Button>
              </Box>
            </Box>
          ) : null}
        </>
      )}
    </Box>
  );
}
