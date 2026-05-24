"use client";

import { useMemo, type ReactNode } from "react";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import StorageOutlined from "@mui/icons-material/StorageOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { Button } from "@/components/common";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { KbTrainingWebsiteSummary } from "@/api/ai-knowledge/types";
import { Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { AiTrainingWebsitesTable } from "./AiTrainingWebsitesTable";
import {
  aiTrainingOverviewCardSx,
  aiTrainingStatCardSx,
  aiTrainingStatGridSx,
} from "./ai-training-ui.styles";
import type { AiTrainingKbVariant } from "./ai-training-kb.utils";
import type { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";

function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  icon: ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  return (
    <Box sx={aiTrainingStatCardSx(accent)}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ color: theme.app.text.primary, lineHeight: 1.2 }}>
            {value}
          </Typography>
          {sub ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {sub}
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ color: accent, opacity: 0.9 }}>{icon}</Box>
      </Box>
    </Box>
  );
}

export function AiTrainingWebsitesOverview({
  variant,
  items,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  onSelectWebsite,
  onRefresh,
  showCompanyColumns,
  filtersActive,
  hasActiveTableFilters,
  filterPopoverOpen,
  onFilterPopoverOpenChange,
  hierarchy,
  showAllWebsites,
  onShowAllWebsitesChange,
  onApplyFilters,
  onClearFilters,
  onAddTraining,
}: {
  variant: AiTrainingKbVariant;
  items: KbTrainingWebsiteSummary[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorMessage: string | null;
  onSelectWebsite: (row: KbTrainingWebsiteSummary) => void;
  onRefresh: () => void;
  showCompanyColumns: boolean;
  filtersActive: boolean;
  hasActiveTableFilters: boolean;
  filterPopoverOpen: boolean;
  onFilterPopoverOpenChange: (open: boolean) => void;
  hierarchy: ReturnType<typeof useAiTrainingHierarchy>;
  showAllWebsites: boolean;
  onShowAllWebsitesChange: (v: boolean) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onAddTraining: () => void;
}) {
  const theme = useTheme() as AppTheme;
  const scopeLabel = variant === "chatbot" ? "Chatbot" : "Assistant";

  const stats = useMemo(() => {
    const trained = items.filter((i) => i.isTrained);
    return {
      trainedCount: trained.length,
      sourceCount: trained.reduce((s, i) => s + i.sourceCount, 0),
      chunkCount: trained.reduce((s, i) => s + i.totalChunks, 0),
      attentionCount: items.filter((i) => i.failedSourceCount > 0).length,
    };
  }, [items]);

  return (
    <Box sx={aiTrainingOverviewCardSx}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, mb: 2 }}>
        <Box>
          <Typography variant="mediumLarge" color="white" fontWeight={700}>
            Trained websites
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mt: 0.5, maxWidth: 560 }}>
            {filtersActive
              ? "Filtered list — clear filters to see every trained website."
              : "All websites that have training data. Open a row to see content items, or add new training."}
          </Typography>
        </Box>
        <Button
          type="button"
          variant="primary"
          sx={{ ...gradientPrimaryButtonSx, flexShrink: 0 }}
          onClick={onAddTraining}
        >
          + Add training
        </Button>
      </Box>

      <Box sx={aiTrainingStatGridSx}>
        <StatCard
          label="Websites trained"
          value={stats.trainedCount}
          sub={filtersActive ? "matching filter" : "in this list"}
          accent={theme.palette.success.light}
          icon={<CheckCircleOutline />}
        />
        <StatCard
          label="Content items"
          value={stats.sourceCount}
          accent={theme.app.dashboard.accentBlue}
          icon={<StorageOutlined />}
        />
        <StatCard
          label="Searchable pieces"
          value={stats.chunkCount}
          accent="#a78bfa"
          icon={<LanguageOutlined />}
        />
        <StatCard
          label="Needs attention"
          value={stats.attentionCount}
          sub="failed items"
          accent={theme.palette.warning.light}
          icon={<WarningAmberOutlined />}
        />
      </Box>

      {isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage ?? "Could not load website training summary."}
        </Alert>
      ) : null}

      <AiTrainingWebsitesTable
        variant={variant}
        items={items}
        isLoading={isLoading}
        isFetching={isFetching}
        showCompanyColumns={showCompanyColumns}
        filterPopoverOpen={filterPopoverOpen}
        onFilterPopoverOpenChange={onFilterPopoverOpenChange}
        hasActiveTableFilters={hasActiveTableFilters}
        hierarchy={hierarchy}
        showAllWebsites={showAllWebsites}
        onShowAllWebsitesChange={onShowAllWebsitesChange}
        onApplyFilters={onApplyFilters}
        onClearFilters={onClearFilters}
        onRefresh={onRefresh}
        onSelectWebsite={onSelectWebsite}
      />

      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 1.5 }}>
        Click a row to open <strong>{scopeLabel} training detail</strong> for that website.
      </Typography>
    </Box>
  );
}
