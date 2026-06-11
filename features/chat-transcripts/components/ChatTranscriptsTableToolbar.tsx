"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  Calendar,
  FilterableSearchBar,
  ToolbarFilterPopover,
  ToolbarFilterPopoverPanel,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  ChatScopeFilterPopoverPanel,
  hasActiveChatScopeFilters,
  type ChatScopeFilterState,
} from "@/features/chat-shared";
import {
  overviewSearchFieldWrapper,
  overviewSearchRow,
} from "@/app/dashboard/user-page/overview.styles";
import {
  TRANSCRIPT_SEARCH_KIND_OPTIONS,
  type TranscriptSearchKind,
  type TranscriptSearchSuggestion,
} from "../types";

type Props = {
  searchKind: TranscriptSearchKind;
  onSearchKindChange: (kind: TranscriptSearchKind) => void;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  suggestions: TranscriptSearchSuggestion[];
  selectedSuggestion?: TranscriptSearchSuggestion;
  onSelectedSuggestionChange: (value: TranscriptSearchSuggestion | undefined) => void;
  isSuggestionsLoading: boolean;
  onSearch: () => void;
  scopeFilters: ChatScopeFilterState;
  onScopePatch: (patch: Partial<ChatScopeFilterState>) => void;
  onScopeReset: () => void;
  canFilterByResellerId: boolean;
  resellerOptions: Array<{ value: string; label: string }>;
  parentCompanyOptions: Array<{ value: string; label: string }>;
  childCompanyOptions: Array<{ value: string; label: string }>;
  websiteOptions: Array<{ value: string; label: string }>;
  showScopeFilters: boolean;
};

const SEARCH_PLACEHOLDER: Record<TranscriptSearchKind, string> = {
  reseller: "Type reseller name…",
  parentCompany: "Type parent company name…",
  childCompany: "Type child company name…",
  website: "Type website name or URL…",
  agent: "Type agent name (e.g. Joseph)…",
  conversationId: "Type visitor name or chat ID…",
};

export function ChatTranscriptsTableToolbar({
  searchKind,
  onSearchKindChange,
  searchInput,
  onSearchInputChange,
  suggestions,
  selectedSuggestion,
  onSelectedSuggestionChange,
  isSuggestionsLoading,
  onSearch,
  scopeFilters,
  onScopePatch,
  onScopeReset,
  canFilterByResellerId,
  resellerOptions,
  parentCompanyOptions,
  childCompanyOptions,
  websiteOptions,
  showScopeFilters,
}: Props) {
  const theme = useTheme() as AppTheme;
  const [filterOpen, setFilterOpen] = useState(false);

  const scopeActive = hasActiveChatScopeFilters(scopeFilters);
  const dateOnlyActive = Boolean(scopeFilters.dateFrom.trim() || scopeFilters.dateTo.trim());

  const filterPanel = useMemo(() => {
    if (!showScopeFilters) {
      return (
        <ToolbarFilterPopoverPanel
          footer={
            <>
              <Button
                type="button"
                variant="secondary"
                disabled={!dateOnlyActive}
                onClick={() => {
                  onScopePatch({ dateFrom: "", dateTo: "" });
                  setFilterOpen(false);
                }}
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="primary"
                sx={gradientPrimaryButtonSx}
                onClick={() => setFilterOpen(false)}
              >
                Done
              </Button>
            </>
          }
        >
          <Typography variant="medium" fontWeight={700} sx={{ color: theme.app.text.primary }}>
            Transcript filters
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", mb: 1.5, color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}
          >
            Filter by conversation start date (From / To).
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.25 }}>
            <Calendar
              label="From"
              value={scopeFilters.dateFrom}
              onChange={(v) => onScopePatch({ dateFrom: v })}
            />
            <Calendar
              label="To"
              value={scopeFilters.dateTo}
              onChange={(v) => onScopePatch({ dateTo: v })}
            />
          </Box>
        </ToolbarFilterPopoverPanel>
      );
    }
    return (
      <ChatScopeFilterPopoverPanel
        filters={scopeFilters}
        onPatch={onScopePatch}
        onReset={() => {
          onScopeReset();
          setFilterOpen(false);
        }}
        canFilterByResellerId={canFilterByResellerId}
        resellerOptions={resellerOptions}
        parentCompanyOptions={parentCompanyOptions}
        childCompanyOptions={childCompanyOptions}
        websiteOptions={websiteOptions}
        showDateRange
        hasActiveFilters={scopeActive}
        onClose={() => setFilterOpen(false)}
        title="Transcript filters"
        hint="Reseller, parent, child, website, and conversation start date (From / To)."
      />
    );
  }, [
    canFilterByResellerId,
    childCompanyOptions,
    onScopePatch,
    onScopeReset,
    parentCompanyOptions,
    resellerOptions,
    scopeActive,
    scopeFilters,
    showScopeFilters,
    dateOnlyActive,
    onScopePatch,
    theme.app.dashboard.textMuted,
    theme.app.text.primary,
    websiteOptions,
  ]);

  return (
    <Box sx={overviewSearchRow}>
      <FilterableSearchBar
        value={searchInput}
        onChange={onSearchInputChange}
        selectValue={searchKind}
        onSelectChange={(value) => onSearchKindChange(value as TranscriptSearchKind)}
        selectOptions={TRANSCRIPT_SEARCH_KIND_OPTIONS}
        selectedSuggestion={selectedSuggestion}
        onSelectedSuggestionChange={onSelectedSuggestionChange}
        suggestions={suggestions}
        isSuggestionsLoading={isSuggestionsLoading}
        placeholder={SEARCH_PLACEHOLDER[searchKind]}
        searchAriaLabel="Chat transcript search"
        onEnter={onSearch}
        sx={overviewSearchFieldWrapper}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexShrink: 0 }}>
        <Button variant="outlined" sx={{ whiteSpace: "nowrap", minWidth: 120 }} onClick={onSearch}>
          Search
        </Button>
        <ToolbarFilterPopover
          open={filterOpen}
          onOpenChange={setFilterOpen}
          active={showScopeFilters ? scopeActive : dateOnlyActive}
        >
          {filterPanel}
        </ToolbarFilterPopover>
      </Box>
    </Box>
  );
}
