"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import { Search as SearchIcon } from "@mui/icons-material";
import type { AppTheme } from "@/theme/theme";
import type { FilterKind, UserSuggestion } from "../types";
import { FILTER_KIND_OPTIONS } from "../types";
import { Typography, Button } from "@/components/common";
import {
  selectMenuItemSx,
  selectMenuPaperSx,
} from "@/components/common/SelectField/SelectField.styles";
import { overviewSearchFieldWrapper, overviewSearchRow } from "../overview.styles";

type Props = {
  theme: AppTheme;
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
    theme,
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
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasQuery = searchInput.trim().length > 0;
  const displaySuggestions = useMemo(
    () => suggestionOpen && hasQuery,
    [suggestionOpen, hasQuery],
  );

  useEffect(() => {
    if (!hasQuery) setSuggestionOpen(false);
  }, [hasQuery]);

  const handleSearch = () => {
    onSearch();
    setSuggestionOpen(false);
  };

  return (
    <Box sx={overviewSearchRow}>
      <ClickAwayListener onClickAway={() => setSuggestionOpen(false)}>
        <Box
          sx={{ ...overviewSearchFieldWrapper, position: "relative" }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
        >
          <Box
            onClick={() => inputRef.current?.focus()}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.25,
              py: 0.6,
              borderRadius: "9999px",
              bgcolor: theme.app.dashboard.pillBg,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              minHeight: 44,
              cursor: "text",
            }}
          >
            <SearchIcon sx={{ color: theme.app.dashboard.iconMuted, fontSize: 18 }} />
            <input
              ref={inputRef}
              aria-label="User search input"
              value={searchInput}
              onChange={(e) => {
                const v = e.target.value;
                onSearchInputChange(v);
                setSuggestionOpen(v.trim().length > 0);
              }}
              onFocus={() => {
                if (searchInput.trim().length > 0) setSuggestionOpen(true);
              }}
              autoComplete="off"
              type="text"
              placeholder="Search..."
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                color: theme.app.text.primary,
                fontSize: 14,
                flex: "1 1 auto",
                minWidth: 0,
                width: "100%",
              }}
            />
            {searchInput && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchInputChange("");
                  setSelectedSuggestion(undefined);
                  setSuggestionOpen(false);
                }}
                sx={{ color: theme.app.dashboard.textMuted, p: 0.25 }}
              >
                ✕
              </IconButton>
            )}
            <Box sx={{ width: 1, height: 24, bgcolor: theme.app.dashboard.cardBorder, mx: 0.5 }} />
            <TextField
              select
              size="small"
              value={filterKind}
              onChange={(e) => {
                onFilterKindChange(e.target.value as FilterKind);
                setSelectedSuggestion(undefined);
                setSuggestionOpen(false);
              }}
              sx={{
                minWidth: 118,
                flexShrink: 0,
                "& .MuiOutlinedInput-root": {
                  p: 0,
                  bgcolor: "transparent",
                  "& fieldset": { border: "none" },
                },
                "& .MuiSelect-select": {
                  py: 0.5,
                  px: 1,
                  color: theme.app.text.primary,
                  fontSize: 13,
                  fontWeight: 600,
                },
                "& .MuiSvgIcon-root": {
                  color: theme.app.dashboard.textMuted,
                },
              }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: selectMenuPaperSx(theme),
                  },
                },
              }}
            >
              {FILTER_KIND_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} sx={selectMenuItemSx(theme)}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {selectedSuggestion && (
            <Box sx={{ mt: 0.75 }}>
              <Chip
                label={`Selected: ${selectedSuggestion.label}`}
                onDelete={() => setSelectedSuggestion(undefined)}
                size="small"
                sx={{
                  color: theme.app.text.primary,
                  bgcolor: theme.app.dashboard.overlayLight,
                  border: `1px solid ${theme.app.dashboard.cardBorder}`,
                }}
              />
            </Box>
          )}

          {displaySuggestions && (
            <Paper
              elevation={0}
              sx={{
                mt: 1,
                position: "absolute",
                top: selectedSuggestion ? 78 : 52,
                left: 0,
                right: 0,
                zIndex: 1300,
                maxHeight: 260,
                overflowY: "auto",
                borderRadius: 2,
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
                bgcolor: theme.app.dashboard.pillBg,
                boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
              }}
            >
              {isSuggestionsLoading ? (
                <Box sx={{ px: 1.5, py: 1.25, display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={14} />
                  <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                    Loading suggestions...
                  </Typography>
                </Box>
              ) : suggestions.length === 0 ? (
                <Box sx={{ px: 1.5, py: 1.25 }}>
                  <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                    No suggestions
                  </Typography>
                </Box>
              ) : (
                suggestions.slice(0, 8).map((s) => {
                  const active = selectedSuggestion?.id === s.id;
                  return (
                    <Box
                      key={s.id}
                      component="button"
                      type="button"
                      onMouseDown={(e) => {
                        // Prevent focus-loss race so click always applies selected suggestion.
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSuggestion(s);
                        onSearchInputChange(s.label);
                        inputRef.current?.focus();
                        setSuggestionOpen(false);
                      }}
                      sx={{
                        width: "100%",
                        textAlign: "left",
                        px: 1.5,
                        py: 1,
                        border: "none",
                        cursor: "pointer",
                        color: theme.app.text.primary,
                        bgcolor: active ? theme.app.dashboard.navActiveBg : "transparent",
                        borderBottom: `1px solid ${theme.app.dashboard.overlayLight}`,
                        "&:hover": {
                          bgcolor: theme.app.dashboard.overlayLight,
                        },
                      }}
                    >
                      <Typography variant="medium">{s.label}</Typography>
                    </Box>
                  );
                })
              )}
            </Paper>
          )}
        </Box>
      </ClickAwayListener>

      <Button variant="outlined" sx={{ whiteSpace: "nowrap", minWidth: 120 }} onClick={handleSearch}>
        Search
      </Button>
    </Box>
  );
}
