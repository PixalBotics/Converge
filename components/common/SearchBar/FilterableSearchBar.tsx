"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { hideScrollbarsSx } from "@/lib/ui/hideScrollbars";
import { Typography } from "@/components/common/Typography";
import { SearchIcon } from "@/components/common/icons";
import { resolveSx } from "@/utils/resolveSx";
import {
  selectMenuItemSx,
  selectMenuProps,
} from "@/components/common/SelectField/SelectField.styles";
import type { FilterableSearchBarProps } from "./FilterableSearchBar.types";
import { searchToolbarFieldMetrics } from "./searchToolbarMetrics";

export function FilterableSearchBar({
  value,
  onChange,
  selectValue,
  onSelectChange,
  selectOptions,
  selectedSuggestion,
  onSelectedSuggestionChange,
  suggestions = [],
  isSuggestionsLoading = false,
  placeholder = "Search...",
  searchAriaLabel = "Search input",
  onEnter,
  sx,
}: FilterableSearchBarProps) {
  const theme = useTheme() as AppTheme;
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasQuery = value.trim().length > 0;
  const shouldShowSuggestions = useMemo(
    () => suggestionOpen && hasQuery,
    [suggestionOpen, hasQuery],
  );

  useEffect(() => {
    if (!hasQuery) setSuggestionOpen(false);
  }, [hasQuery]);

  return (
    <ClickAwayListener onClickAway={() => setSuggestionOpen(false)}>
      <Box
        sx={
          [
            {
              position: "relative",
              width: "100%",
            },
            resolveSx(sx, theme),
          ] as SxProps<Theme>
        }
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          onEnter?.();
          setSuggestionOpen(false);
        }}
      >
        <Box
          onClick={() => inputRef.current?.focus()}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.25,
            borderRadius: "9999px",
            bgcolor: theme.app.dashboard.pillBg,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            cursor: "text",
            overflow: "hidden",
            ...searchToolbarFieldMetrics,
            "& .converge-search-input": {
              color: theme.app.text.primary,
              fontFamily: "Manrope",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: 0,
              caretColor: theme.app.text.primary,
              background: "transparent",
            },
            "& .converge-search-input::placeholder": {
              color: theme.app.text.placeholder,
              opacity: 1,
              fontFamily: "Manrope",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: 0,
            },
            "& .converge-search-input:-webkit-autofill": {
              WebkitBoxShadow: "0 0 0 100px transparent inset",
              boxShadow: "0 0 0 100px transparent inset",
              WebkitTextFillColor: theme.app.text.primary,
              transition: "background-color 5000s ease-in-out 0s",
            },
            "& .converge-search-input:-webkit-autofill:hover": {
              WebkitBoxShadow: "0 0 0 100px transparent inset",
              boxShadow: "0 0 0 100px transparent inset",
              WebkitTextFillColor: theme.app.text.primary,
            },
            "& .converge-search-input:-webkit-autofill:focus": {
              WebkitBoxShadow: "0 0 0 100px transparent inset",
              boxShadow: "0 0 0 100px transparent inset",
              WebkitTextFillColor: theme.app.text.primary,
            },
          }}
        >
          <Box
            aria-hidden
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              lineHeight: 0,
              color: theme.app.dashboard.iconMuted,
            }}
          >
            <SearchIcon width={18} height={18} />
          </Box>
          <input
            ref={inputRef}
            className="converge-search-input"
            aria-label={searchAriaLabel}
            value={value}
            onChange={(e) => {
              const nextValue = e.target.value;
              onChange(nextValue);
              setSuggestionOpen(nextValue.trim().length > 0);
            }}
            onFocus={() => {
              if (value.trim().length > 0) setSuggestionOpen(true);
            }}
            autoComplete="off"
            type="text"
            placeholder={placeholder}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              boxShadow: "none",
              flex: "1 1 auto",
              minWidth: 0,
              width: "100%",
            }}
          />
          {value && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                onSelectedSuggestionChange(undefined);
                setSuggestionOpen(false);
              }}
              sx={{ color: theme.app.dashboard.textMuted, p: 0.25 }}
            >
              ✕
            </IconButton>
          )}
          <TextField
            select
            size="small"
            value={selectValue}
            onChange={(e) => {
              onSelectChange(e.target.value);
              onSelectedSuggestionChange(undefined);
              setSuggestionOpen(false);
            }}
            sx={{
              minWidth: 118,
              width: "auto",
              flexShrink: 0,
              cursor: "pointer",
              "& .MuiOutlinedInput-root": {
                p: 0,
                bgcolor: "transparent",
                cursor: "pointer",
                "& fieldset": { border: "none" },
              },
              "& .MuiSelect-select": {
                py: 0.5,
                px: 1,
                color: theme.app.text.primary,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer !important",
              },
              "& .MuiSvgIcon-root": {
                color: theme.app.dashboard.textMuted,
              },
            }}
            SelectProps={{
              MenuProps: selectMenuProps(theme),
            }}
          >
            {selectOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={selectMenuItemSx(theme)}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {shouldShowSuggestions && (
          <Paper
            elevation={0}
            sx={{
              ...hideScrollbarsSx,
              mt: 1,
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 9999,
              maxHeight: 260,
              overflowY: "auto",
              borderRadius: 2,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              // Keep panel fully readable; avoid table text bleeding through.
              bgcolor: theme.app.dashboard.menuSurfaceBg,
              backgroundImage: "none",
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
              boxShadow: "none",
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
              suggestions.slice(0, 8).map((suggestion) => {
                const active = selectedSuggestion?.id === suggestion.id;
                return (
                  <Box
                    key={suggestion.id}
                    component="button"
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectedSuggestionChange(suggestion);
                      onChange(suggestion.label);
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
                      // Force opaque background even for selected/active row.
                      bgcolor: theme.app.dashboard.menuSurfaceBg,
                      borderLeft: active ? `3px solid ${theme.app.dashboard.accentBlue}` : "3px solid transparent",
                      borderBottom: `1px solid ${theme.app.dashboard.overlayLight}`,
                      "&:hover": {
                        bgcolor: theme.app.dashboard.pillBg,
                      },
                    }}
                  >
                    <Typography variant="medium">{suggestion.label}</Typography>
                    {suggestion.subtitle ? (
                      <Typography
                        variant="caption"
                        sx={{ display: "block", color: theme.app.dashboard.textMuted, mt: 0.25 }}
                      >
                        {suggestion.subtitle}
                      </Typography>
                    ) : null}
                  </Box>
                );
              })
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}
