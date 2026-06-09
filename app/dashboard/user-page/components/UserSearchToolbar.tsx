"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { FilterKind, UserListTypeFilter, UserSuggestion } from "../types";
import { FILTER_KIND_OPTIONS } from "../types";
import {
  FilterableSearchBar,
  FilterableComboField,
  Button,
  SearchSubmitButton,
  SegmentedControl,
  ToolbarFilterPopover,
  FilterPanelHeader,
  ToolbarFilterPopoverPanel,
  Typography,
  Divider,
  type FilterableComboOption,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import type { AppTheme } from "@/theme/theme";
import type { SessionListFilterScope } from "@/lib/auth";
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
  searchSubmitDisabled?: boolean;
  listUserTypeFilter: UserListTypeFilter;
  onListUserTypeFilterChange: (v: UserListTypeFilter) => void;
  showInternalUserTypeOption: boolean;
  listFilterScope: SessionListFilterScope;
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
    searchSubmitDisabled = false,
    listUserTypeFilter,
    onListUserTypeFilterChange,
    showInternalUserTypeOption,
    listFilterScope,
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

  const userTypeSegmentOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    if (showInternalUserTypeOption) {
      opts.push({ value: "all", label: "All" });
      opts.push({ value: "Internal", label: "Internal" });
    }
    if (listFilterScope.mayPickExternal) {
      opts.push({ value: "External", label: "External" });
    }
    if (opts.length === 0) {
      opts.push({ value: "External", label: "External" });
    }
    return opts;
  }, [showInternalUserTypeOption, listFilterScope.mayPickExternal]);

  const tenantScopeVisible =
    listFilterScope.showTenantScopeFilters &&
    (listUserTypeFilter === "External" || !showInternalUserTypeOption);

  const resellerLocked = listFilterScope.resellerPickerMode === "locked";
  const parentLocked = listFilterScope.parentCompanyPickerMode === "locked";

  const filterActive =
    listUserTypeFilter !== listFilterScope.defaultUserTypeFilter
    || Boolean(listScopeResellerId.trim())
    || Boolean(listScopeParentCompanyId.trim());

  const parentSelectDisabled =
    !tenantScopeVisible || !listScopeResellerId.trim() || parentLocked;

  const filterDescription = showInternalUserTypeOption
    ? "Pick user type. For External, narrow by reseller, then parent company."
    : "Your session is tenant-scoped. Refine external users by parent company when allowed.";

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
        onEnter={onSearch}
        sx={overviewSearchFieldWrapper}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap", flexShrink: 0 }}>
        <SearchSubmitButton disabled={searchSubmitDisabled} onClick={onSearch} sx={{ minWidth: 120 }} />
        <ToolbarFilterPopover open={filterOpen} onOpenChange={setFilterOpen} active={filterActive}>
          <ToolbarFilterPopoverPanel
            footer={
              <>
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
              </>
            }
          >
            <FilterPanelHeader title="List filters" description={filterDescription} />

            {userTypeSegmentOptions.length > 1 ? (
              <>
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
              </>
            ) : null}

            {tenantScopeVisible ? (
              <>
                <Divider sx={{ my: 2, borderBottom: `1px solid ${theme.app.dashboard.cardBorder}` }} />
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.app.dashboard.cardBorder}`,
                    bgcolor: theme.app.dashboard.pillBg,
                  }}
                >
                  <Typography variant="caption" sx={{ display: "block", mb: 1.25, fontWeight: 600, color: theme.app.text.primary }}>
                    Tenant scope
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", mb: 1.5, color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
                    {resellerLocked
                      ? "Reseller is fixed to your session. Pick a parent company when your role allows it."
                      : "Choose a reseller (optional), then a parent company to narrow external users."}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {listFilterScope.resellerPickerMode !== "hidden" ? (
                      <FilterableComboField
                        label="Reseller"
                        value={listScopeResellerId}
                        onChange={onListScopeResellerChange}
                        options={resellerSelectOptions}
                        placeholder="Type to find a reseller…"
                        disabled={resellerFilterDisabled || resellerLocked}
                        inputAriaLabel="Filter users by reseller"
                      />
                    ) : null}
                    {listFilterScope.parentCompanyPickerMode !== "hidden" ? (
                      <FilterableComboField
                        label="Parent company"
                        value={listScopeParentCompanyId}
                        onChange={onListScopeParentCompanyChange}
                        options={parentCompanySelectOptions}
                        placeholder="Type to find a parent company…"
                        disabled={parentSelectDisabled}
                        inputAriaLabel="Filter users by parent company"
                      />
                    ) : null}
                  </Box>
                </Box>
              </>
            ) : null}
          </ToolbarFilterPopoverPanel>
        </ToolbarFilterPopover>
      </Box>
    </Box>
  );
}
