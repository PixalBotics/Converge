"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import type { FilterKind, UserListTypeFilter, UserSuggestion } from "../types";
import { FILTER_KIND_OPTIONS } from "../types";
import {
  FilterableSearchBar,
  FilterableComboField,
  Button,
  SegmentedControl,
  ToolbarFilterPopover,
  Typography,
  type FilterableComboOption,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import type { AppTheme } from "@/theme/theme";
import { overviewSearchFieldWrapper, overviewSearchRow } from "../overview.styles";

type Props = {
  filterKind: FilterKind;
  onFilterKindChange: (v: FilterKind) => void;
  searchInput: string;
  onSearchInputChange: (v: string) => void;
  suggestions: UserSuggestion[];
  selectedSuggestion?: UserSuggestion;
  setSelectedSuggestion: (v: UserSuggestion | undefined) => void;
  isSuggestionsLoading: boolean;
  onSearch: () => void;
  listUserTypeFilter: UserListTypeFilter;
  onListUserTypeFilterChange: (v: UserListTypeFilter) => void;
  showInternalUserTypeOption: boolean;
  listScopeResellerId: string;
  listScopeParentCompanyId: string;
  onListScopeResellerChange: (v: string) => void;
  onListScopeParentCompanyChange: (v: string) => void;
  resellerSelectOptions: FilterableComboOption[];
  parentCompanySelectOptions: FilterableComboOption[];
  resellerFilterDisabled?: boolean;
  onResetListFilters: () => void;
};

export function UserSearchToolbar(props: Props) {
  const {
    filterKind,
    onFilterKindChange,
    searchInput,
    onSearchInputChange,
    suggestions,
    selectedSuggestion,
    setSelectedSuggestion,
    isSuggestionsLoading,
    onSearch,
    listUserTypeFilter,
    onListUserTypeFilterChange,
    showInternalUserTypeOption,
    listScopeResellerId,
    listScopeParentCompanyId,
    onListScopeResellerChange,
    onListScopeParentCompanyChange,
    resellerSelectOptions,
    parentCompanySelectOptions,
    resellerFilterDisabled = false,
    onResetListFilters,
  } = props;

  const theme = useTheme() as AppTheme;
  const [filterOpen, setFilterOpen] = useState(false);

  const userTypeSegmentOptions = useMemo(
    () => [
      { value: "all", label: "All" },
      ...(showInternalUserTypeOption ? [{ value: "Internal", label: "Internal" }] : []),
      { value: "External", label: "External" },
    ],
    [showInternalUserTypeOption],
  );

  const handleSearch = () => {
    onSearch();
  };

  const filterActive =
    listUserTypeFilter !== "all"
    || Boolean(listScopeResellerId.trim())
    || Boolean(listScopeParentCompanyId.trim());

  const externalScopeEnabled = listUserTypeFilter === "External";
  const parentSelectDisabled = !externalScopeEnabled || !listScopeResellerId.trim();

  return (
    <Box sx={overviewSearchRow}>
      <FilterableSearchBar
        value={searchInput}
        onChange={onSearchInputChange}
        selectValue={filterKind}
        onSelectChange={(value) => onFilterKindChange(value as FilterKind)}
        selectOptions={FILTER_KIND_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
        selectedSuggestion={selectedSuggestion}
        onSelectedSuggestionChange={setSelectedSuggestion}
        suggestions={suggestions}
        isSuggestionsLoading={isSuggestionsLoading}
        searchAriaLabel="User search input"
        onEnter={handleSearch}
        sx={overviewSearchFieldWrapper}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap", flexShrink: 0 }}>
        <Button variant="outlined" sx={{ whiteSpace: "nowrap", minWidth: 120 }} onClick={handleSearch}>
          Search
        </Button>
        <ToolbarFilterPopover open={filterOpen} onOpenChange={setFilterOpen} active={filterActive}>
          <Box sx={{ p: 2, color: theme.app.text.primary, maxWidth: 400 }}>
            <Typography variant="medium" fontWeight={700} sx={{ mb: 0.5, color: theme.app.text.primary }}>
              List filters
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mb: 1.5, color: theme.app.dashboard.textMuted }}>
              Pick user type. For External, narrow by reseller, then parent company.
            </Typography>

            <Typography variant="caption" sx={{ display: "block", mb: 0.75, fontWeight: 600, color: theme.app.text.primary }}>
              User type
            </Typography>
            <SegmentedControl
              options={userTypeSegmentOptions}
              value={listUserTypeFilter}
              onChange={(v) => onListUserTypeFilterChange(v as UserListTypeFilter)}
              size="small"
              sx={{
                width: "100%",
                display: "flex",
                "& .MuiToggleButtonGroup-grouped": { flex: 1, minWidth: 0 },
              }}
            />

            {externalScopeEnabled ? (
              <>
                <Divider sx={{ my: 2, borderColor: theme.app.dashboard.cardBorder }} />
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.app.dashboard.cardBorder}`,
                    bgcolor: theme.app.dashboard.pillBg,
                  }}
                >
                  <Typography variant="caption" sx={{ display: "block", mb: 1.25, fontWeight: 600, color: theme.app.text.primary }}>
                    External scope
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", mb: 1.5, color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
                    Step 1: choose a reseller (optional). Step 2: parent companies load for that reseller; pick one to filter the list.
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <FilterableComboField
                      label="Reseller"
                      value={listScopeResellerId}
                      onChange={onListScopeResellerChange}
                      options={resellerSelectOptions}
                      placeholder="Type to find a reseller…"
                      disabled={resellerFilterDisabled}
                      inputAriaLabel="Filter users by reseller"
                    />
                    <FilterableComboField
                      label="Parent company"
                      value={listScopeParentCompanyId}
                      onChange={onListScopeParentCompanyChange}
                      options={parentCompanySelectOptions}
                      placeholder="Type to find a parent company…"
                      disabled={parentSelectDisabled}
                      inputAriaLabel="Filter users by parent company"
                    />
                  </Box>
                </Box>
              </>
            ) : null}

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "flex-end", mt: 2 }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  onResetListFilters();
                  setFilterOpen(false);
                }}
              >
                Reset
              </Button>
              <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setFilterOpen(false)}>
                Done
              </Button>
            </Box>
          </Box>
        </ToolbarFilterPopover>
      </Box>
    </Box>
  );
}
