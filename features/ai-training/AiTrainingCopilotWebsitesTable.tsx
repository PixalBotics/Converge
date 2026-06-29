"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { CopilotWebsiteSummary } from "@/api/ai-training/website-setup.api";
import { Button, DataTable, ToolbarFilterPopover, Typography } from "@/components/common";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import type { DataTableColumn } from "@/components/common";
import { AiTrainingScopeFilterPanel } from "./AiTrainingScopeFilterPanel";
import type { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";

type CopilotRow = CopilotWebsiteSummary & Record<string, unknown>;

function copilotStatusChip(
  row: CopilotWebsiteSummary,
  theme: AppTheme,
): { label: string; bgcolor: string; color: string } {
  const s = row.copilotStatus;
  if (s.inheritsFromChatbotAndAssistant) {
    return {
      label: "Ready (inherited)",
      bgcolor: `${theme.palette.success.main}22`,
      color: theme.palette.success.light,
    };
  }
  if (s.copilotProfileConfigured) {
    return {
      label: "Ready (dedicated)",
      bgcolor: `${theme.palette.success.main}22`,
      color: theme.palette.success.light,
    };
  }
  if (s.chatbotConfigured && !s.assistantConfigured) {
    return {
      label: "Needs assistant",
      bgcolor: `${theme.palette.warning.main}22`,
      color: theme.palette.warning.light,
    };
  }
  if (!s.chatbotConfigured && s.assistantConfigured) {
    return {
      label: "Needs chatbot",
      bgcolor: `${theme.palette.warning.main}22`,
      color: theme.palette.warning.light,
    };
  }
  return {
    label: "Not set up",
    bgcolor: "rgba(148, 163, 184, 0.15)",
    color: theme.app.dashboard.textMuted,
  };
}

function boolChip(ok: boolean, theme: AppTheme) {
  return (
    <Chip
      label={ok ? "Yes" : "No"}
      size="small"
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 600,
        bgcolor: ok ? `${theme.palette.success.main}22` : "rgba(148, 163, 184, 0.12)",
        color: ok ? theme.palette.success.light : theme.app.dashboard.textMuted,
      }}
    />
  );
}

export function AiTrainingCopilotWebsitesTable({
  items,
  isLoading,
  isFetching,
  selectedWebsiteId,
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
  items: CopilotWebsiteSummary[];
  isLoading: boolean;
  isFetching: boolean;
  selectedWebsiteId?: string;
  onSelectWebsite: (row: CopilotWebsiteSummary) => void;
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
  const rows = useMemo<CopilotRow[]>(() => items.map((item) => ({ ...item })), [items]);

  const columns = useMemo<DataTableColumn<CopilotRow>[]>(() => {
    const cols: DataTableColumn<CopilotRow>[] = [
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
        id: "copilotStatus",
        label: "Copilot",
        render: (_, row) => {
          const colors = copilotStatusChip(row, theme);
          return (
            <Chip label={colors.label} size="small" sx={{ ...colors, fontWeight: 600, fontSize: 11 }} />
          );
        },
      },
      {
        id: "chatbot",
        label: "Chatbot LLM",
        align: "center",
        render: (_, row) => boolChip(row.copilotStatus.chatbotConfigured, theme),
      },
      {
        id: "assistant",
        label: "Assistant KB",
        align: "center",
        render: (_, row) => boolChip(row.copilotStatus.assistantConfigured, theme),
      },
      {
        id: "profile",
        label: "LLM profile",
        render: (_, row) => (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 160 }}>
            {row.copilotProfileName ?? "—"}
          </Typography>
        ),
      },
    );

    return cols;
  }, [showCompanyColumns, theme]);

  const actionColumn = useMemo(
    () => ({
      label: "Action",
      render: (row: CopilotRow) => (
        <Box sx={{ display: "flex", gap: 0.75 }} onClick={(e) => e.stopPropagation()}>
          <Button type="button" variant="secondary" size="small" onClick={() => onSelectWebsite(row)}>
            {selectedWebsiteId === row.websiteId ? "Selected" : "Manage"}
          </Button>
        </Box>
      ),
    }),
    [onSelectWebsite, selectedWebsiteId],
  );

  const readyCount = items.filter((i) => i.copilotStatus.copilotReady).length;

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
          {items.length} website{items.length === 1 ? "" : "s"} · {readyCount} copilot ready
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
            sx={mergeSx(filterChromeButtonSx, { minWidth: 0 })}
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </Box>
      </Box>

      <DataTable<CopilotRow>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.websiteId}
        onRowClick={(row) => onSelectWebsite(row)}
        actionColumn={actionColumn}
        isLoading={isLoading}
        minWidth={showCompanyColumns ? 1050 : 880}
        emptyState={{
          title: "No websites in scope",
          description: "Adjust filters or pick a child company to see copilot status per site.",
        }}
      />
    </Box>
  );
}
