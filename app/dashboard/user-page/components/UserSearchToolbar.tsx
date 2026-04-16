"use client";

import Box from "@mui/material/Box";
import type { FilterKind, UserSuggestion } from "../types";
import { FILTER_KIND_OPTIONS } from "../types";
import { FilterableSearchBar, Button } from "@/components/common";
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
  } = props;

  const handleSearch = () => {
    onSearch();
  };

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

      <Button variant="outlined" sx={{ whiteSpace: "nowrap", minWidth: 120 }} onClick={handleSearch}>
        Search
      </Button>
    </Box>
  );
}
