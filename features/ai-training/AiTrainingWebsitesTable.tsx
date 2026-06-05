"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { KbTrainingWebsiteSummary } from "@/api/ai-knowledge/types";
import { Button, DataTable, ToolbarFilterPopover, Typography } from "@/components/common";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import type { DataTableColumn } from "@/components/common";
import { AiTrainingScopeFilterPanel } from "./AiTrainingScopeFilterPanel";
import { sourceTypeHumanLabel, type AiTrainingKbVariant } from "./ai-training-kb.utils";
import type { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";

type WebsiteRow = KbTrainingWebsiteSummary & Record<string, unknown>;

function trainingStatusChip(
  row: KbTrainingWebsiteSummary,
  theme: AppTheme,
): { label: string; bgcolor: string; color: string } {
  if (!row.isTrained) {
    return {
      label: "Not trained",
      bgcolor: "rgba(148, 163, 184, 0.15)",
      color: theme.app.dashboard.textMuted,
    };
  }
  if (row.failedSourceCount > 0) {
    return {
      label: "Needs attention",
      bgcolor: `${theme.palette.error.main}22`,
      color: theme.palette.error.light,
    };
  }
  if (row.pendingSourceCount > 0) {
    return {
      label: "Processing",
      bgcolor: `${theme.palette.warning.main}22`,
      color: theme.palette.warning.light,
    };
  }
  return {
    label: "Trained",
    bgcolor: `${theme.palette.success.main}22`,
    color: theme.palette.success.light,
  };
}

export function AiTrainingWebsitesTable({
  variant,
  items,
  isLoading,
  isFetching,
  onSelectWebsite,
  onRefresh,
  showCompanyColumns,
  filterPopoverOpen,
  onFilterPopoverOpenChange,
  hasActiveTableFilters,
  hierarchy,
  showAllWebsites,
  onShowAllWebsitesChange,
  onApplyFilters,
  onClearFilters,
}: {
  variant: AiTrainingKbVariant;
  items: KbTrainingWebsiteSummary[];
  isLoading: boolean;
  isFetching: boolean;
  onSelectWebsite: (row: KbTrainingWebsiteSummary) => void;
  onRefresh: () => void;
  showCompanyColumns: boolean;
  filterPopoverOpen: boolean;
  onFilterPopoverOpenChange: (open: boolean) => void;
  hasActiveTableFilters: boolean;
  hierarchy: ReturnType<typeof useAiTrainingHierarchy>;
  showAllWebsites: boolean;
  onShowAllWebsitesChange: (v: boolean) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}) {
  const theme = useTheme() as AppTheme;
  const scopeLabel = variant === "chatbot" ? "Chatbot" : "Assistant";

  const rows = useMemo<WebsiteRow[]>(() => items.map((item) => ({ ...item })), [items]);

  const columns = useMemo<DataTableColumn<WebsiteRow>[]>(() => {
    const cols: DataTableColumn<WebsiteRow>[] = [
      {
        id: "website",
        label: "Website",
        render: (_, row) => (
          <Box sx={{ minWidth: 0, maxWidth: 280 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              {row.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.app.dashboard.textMuted, wordBreak: "break-all", display: "block" }}
            >
              {row.url}
            </Typography>
          </Box>
        ),
      },
    ];

    if (showCompanyColumns) {
      cols.push(
        {
          id: "parent",
          label: "Parent",
          render: (_, row) => (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 140 }}>
              {row.parentCompanyName}
            </Typography>
          ),
        },
        {
          id: "child",
          label: "Child",
          render: (_, row) => (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 140 }}>
              {row.childCompanyName}
            </Typography>
          ),
        },
      );
    }

    cols.push(
      {
        id: "training",
        label: "Status",
        render: (_, row) => {
          const colors = trainingStatusChip(row, theme);
          return (
            <Chip label={colors.label} size="small" sx={{ ...colors, fontWeight: 600, fontSize: 11 }} />
          );
        },
      },
      {
        id: "sources",
        label: "Items",
        align: "center",
        render: (_, row) => (
          <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
            {row.isTrained ? row.sourceCount : "—"}
          </Typography>
        ),
      },
      {
        id: "chunks",
        label: "Pieces",
        align: "center",
        render: (_, row) => (
          <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
            {row.isTrained ? row.totalChunks : "—"}
          </Typography>
        ),
      },
      {
        id: "lastIndexed",
        label: "Last trained",
        render: (_, row) => (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, whiteSpace: "nowrap" }}>
            {row.lastIndexedAt ? new Date(row.lastIndexedAt).toLocaleString() : "—"}
          </Typography>
        ),
      },
      {
        id: "types",
        label: "Types",
        render: (_, row) =>
          row.sourceTypes.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxWidth: 180 }}>
              {row.sourceTypes.slice(0, 2).map((t) => (
                <Chip
                  key={t}
                  label={sourceTypeHumanLabel(t)}
                  size="small"
                  sx={{ height: 20, fontSize: 10, maxWidth: 88 }}
                />
              ))}
              {row.sourceTypes.length > 2 ? (
                <Chip label={`+${row.sourceTypes.length - 2}`} size="small" sx={{ height: 20, fontSize: 10 }} />
              ) : null}
            </Box>
          ) : (
            "—"
          ),
      },
    );

    return cols;
  }, [showCompanyColumns, theme]);

  const actionColumn = useMemo(
    () => ({
      label: "Action",
      render: (row: WebsiteRow) => (
        <Box onClick={(e) => e.stopPropagation()}>
          <Button type="button" variant="secondary" size="small" onClick={() => onSelectWebsite(row)}>
            Open
          </Button>
        </Box>
      ),
    }),
    [onSelectWebsite],
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 1.5,
        }}
      >
        <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
          {items.length} website{items.length === 1 ? "" : "s"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ToolbarFilterPopover
            open={filterPopoverOpen}
            onOpenChange={onFilterPopoverOpenChange}
            active={hasActiveTableFilters}
          >
            <AiTrainingScopeFilterPanel
              hierarchy={hierarchy}
              showAllWebsites={showAllWebsites}
              onShowAllWebsitesChange={onShowAllWebsitesChange}
              hasActiveFilters={hasActiveTableFilters}
              onApply={onApplyFilters}
              onClear={() => {
                onClearFilters();
                onFilterPopoverOpenChange(false);
              }}
              onClose={() => onFilterPopoverOpenChange(false)}
            />
          </ToolbarFilterPopover>
          <Button
            type="button"
            variant="secondary"
            onClick={onRefresh}
            disabled={isFetching}
            sx={[filterChromeButtonSx, { minWidth: 0 }]}
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </Box>
      </Box>

      <DataTable<WebsiteRow>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.websiteId}
        onRowClick={(row) => onSelectWebsite(row)}
        actionColumn={actionColumn}
        isLoading={isLoading}
        minWidth={showCompanyColumns ? 1100 : 900}
        emptyState={{
          title: `No ${scopeLabel.toLowerCase()} training yet`,
          description: "Use + Add training to import a sitemap, page, FAQs, or documents.",
        }}
      />
    </Box>
  );
}
