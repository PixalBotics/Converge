/** Shared toolbar pairing for SearchBar / FilterableSearchBar + SearchSubmitButton. */
export const SEARCH_TOOLBAR_HEIGHT_PX = 44;

export const searchToolbarFieldMetrics = {
  height: SEARCH_TOOLBAR_HEIGHT_PX,
  minHeight: SEARCH_TOOLBAR_HEIGHT_PX,
  maxHeight: SEARCH_TOOLBAR_HEIGHT_PX,
  boxSizing: "border-box" as const,
};

export const searchSubmitButtonToolbarMetrics = {
  ...searchToolbarFieldMetrics,
  px: "22px",
  fontSize: 14,
  lineHeight: "20px",
  "&&": {
    py: 0,
    height: SEARCH_TOOLBAR_HEIGHT_PX,
    minHeight: SEARCH_TOOLBAR_HEIGHT_PX,
    maxHeight: SEARCH_TOOLBAR_HEIGHT_PX,
  },
};
