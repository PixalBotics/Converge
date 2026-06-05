import type { SxProps, Theme } from "@mui/material/styles";

export interface FilterableSearchOption {
  value: string;
  label: string;
}

export interface FilterableSearchSuggestion {
  id: string;
  label: string;
  subtitle?: string;
}

export interface FilterableSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  selectValue: string;
  onSelectChange: (value: string) => void;
  selectOptions: FilterableSearchOption[];
  selectedSuggestion?: FilterableSearchSuggestion;
  onSelectedSuggestionChange: (value: FilterableSearchSuggestion | undefined) => void;
  suggestions?: FilterableSearchSuggestion[];
  isSuggestionsLoading?: boolean;
  placeholder?: string;
  searchAriaLabel?: string;
  onEnter?: () => void;
  sx?: SxProps<Theme>;
}
