"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { KnowledgeSourceListItem, KnowledgeSourceStatus } from "@/api/ai-knowledge/types";
import { Button, DataTable, SelectField, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  formatSourceRefForDisplay,
  formatScrapeProgressLabel,
  isWebSourceType,
  sourceTypeHumanLabel,
  type AiTrainingKbVariant,
} from "./ai-training-kb.utils";
import { AiTrainingScrapeLiveSummary } from "./AiTrainingScrapeLiveSummary";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "indexed", label: "Indexed" },
  { value: "processing", label: "Training…" },
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
    case "processing":
      return { bgcolor: `${theme.palette.info.main}22`, color: theme.palette.info.light };
    default:
      return { bgcolor: `${theme.palette.warning.main}22`, color: theme.palette.warning.light };
  }
}

type SourceRow = KnowledgeSourceListItem & Record<string, unknown>;

export function AiTrainingSourcesTable({
  variant,
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
  previewSourceId,
  onPreviewSource,
}: {
  variant: AiTrainingKbVariant;
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
  previewSourceId: string | null;
  onPreviewSource: (sourceId: string | null) => void;
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
              {sourceTypeHumanLabel(row.sourceType)}
            </Typography>
          </Box>
        ),
      },
      {
        id: "chunkCount",
        label: "Pieces",
        render: (_, row) => {
          const progressLabel =
            row.status === "processing" ? formatScrapeProgressLabel(row.scrapeProgress) : null;
          if (row.status === "indexed" && row.chunkCount != null) {
            return (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {row.chunkCount}
              </Typography>
            );
          }
          if (row.status === "processing") {
            return (
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                  {row.chunkCount != null && row.chunkCount > 0 ? row.chunkCount : "0"}
                </Typography>
                {progressLabel ? (
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.info.light, display: "block", lineHeight: 1.35 }}
                  >
                    {progressLabel}
                  </Typography>
                ) : null}
              </Box>
            );
          }
          return (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              —
            </Typography>
          );
        },
      },
      {
        id: "status",
        label: "Status",
        render: (_, row) => {
          const colors = statusChipColor(row.status, theme);
          const progressLabel =
            row.status === "processing" && isWebSourceType(row.sourceType)
              ? formatScrapeProgressLabel(row.scrapeProgress)
              : null;
          const label =
            row.status === "processing"
              ? progressLabel
                ? `Scraping ${progressLabel.split(" · ")[0]}`
                : "Scraping…"
              : row.status === "indexed"
                ? "Indexed"
                : row.status;
          return (
            <Chip
              label={label}
              size="small"
              sx={{ ...colors, fontWeight: 600, textTransform: "capitalize", maxWidth: 220 }}
            />
          );
        },
      },
      {
        id: "scrapeLive",
        label: "Scrape timer",
        render: (_, row) =>
          row.status === "processing" &&
          isWebSourceType(row.sourceType) &&
          row.scrapeProgress ? (
            <AiTrainingScrapeLiveSummary progress={row.scrapeProgress} />
          ) : (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              —
            </Typography>
          ),
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
    [theme, previewSourceId],
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
              disabled={
                busy ||
                (row.status !== "indexed" &&
                  !(row.status === "processing" && (row.chunkCount ?? 0) > 0))
              }
              onClick={() =>
                onPreviewSource(previewSourceId === row.id ? null : row.id)
              }
            >
              {previewSourceId === row.id ? "Hide" : "Preview"}
            </Button>
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
    [rowBusyId, previewSourceId, onReindexRow, onDeleteRow, onPreviewSource],
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
          No website selected.
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
              title: "No training content yet",
              description:
                variant === "chatbot"
                  ? "Use + Add more training to import a sitemap, page, or FAQs for this website."
                  : "Use + Add more training to upload documents or FAQs for this website.",
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
