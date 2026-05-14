"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { FORM_MODAL_MUI_OVERLAY_Z_INDEX } from "@/lib/ui/dialogStacking";
import { Label } from "@/components/common/Label";
import { Typography } from "@/components/common/Typography";
import { SearchIcon } from "@/components/dashboard/icons/SearchIcon";
import type { FilterableComboFieldProps, FilterableComboOption } from "./FilterableComboField.types";

/**
 * Type-to-filter dropdown aligned with {@link FilterableSearchBar}: pill field + suggestion panel.
 * Use for toolbar / filter popovers where options are a fixed list filtered by typed text.
 */
export function FilterableComboField({
  label,
  value,
  onChange,
  options,
  placeholder = "Type to filter…",
  disabled = false,
  noMatchesMessage = "No matches",
  listMaxHeight = 260,
  inputAriaLabel,
}: FilterableComboFieldProps) {
  const theme = useTheme() as AppTheme;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fieldId = label.toLowerCase().replace(/\s+/g, "-");

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value && !o.disabled)?.label ?? "",
    [options, value],
  );

  const [draft, setDraft] = useState(selectedLabel);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) return;
    setDraft(selectedLabel);
  }, [selectedLabel, open]);

  const filtered = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, draft]);

  const showPanel = open && !disabled;

  const pick = (opt: FilterableComboOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setDraft(opt.label);
    setOpen(false);
    inputRef.current?.blur();
  };

  const clear = () => {
    onChange("");
    setDraft("");
    setOpen(false);
  };

  const pillShellSx = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    px: 1.25,
    py: 0.6,
    borderRadius: "9999px",
    bgcolor: theme.app.dashboard.pillBg,
    border: `1px solid ${theme.app.dashboard.cardBorder}`,
    minHeight: 44,
    cursor: disabled ? "not-allowed" : "text",
    overflow: "hidden",
    opacity: disabled ? 0.55 : 1,
    pointerEvents: disabled ? "none" : "auto",
    "& .converge-filter-combo-input": {
      color: theme.app.text.primary,
      fontFamily: "Manrope",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: 0,
      caretColor: theme.app.text.primary,
      background: "transparent",
    },
    "& .converge-filter-combo-input::placeholder": {
      color: theme.app.text.placeholder,
      opacity: 1,
      fontFamily: "Manrope",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: 0,
    },
  } as const;

  return (
    <Box sx={{ width: "100%" }}>
      <Label htmlFor={fieldId} variant="mediumLarge" sx={{ mb: 0.75 }}>
        {label}
      </Label>
      <ClickAwayListener
        onClickAway={() => {
          setOpen(false);
          setDraft(selectedLabel);
        }}
      >
        <Box sx={{ position: "relative", width: "100%" }}>
          <Box
            onClick={() => {
              if (disabled) return;
              inputRef.current?.focus();
              setOpen(true);
            }}
            sx={pillShellSx}
          >
            <SearchIcon sx={{ color: theme.app.dashboard.iconMuted, fontSize: 18 }} width={18} height={18} />
            <input
              id={fieldId}
              ref={inputRef}
              className="converge-filter-combo-input"
              aria-label={inputAriaLabel ?? label}
              disabled={disabled}
              value={draft}
              onChange={(e) => {
                const next = e.target.value;
                setDraft(next);
                setOpen(true);
              }}
              onFocus={() => {
                if (disabled) return;
                setOpen(true);
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
            {(draft.trim().length > 0 || value.trim().length > 0) && !disabled ? (
              <IconButton
                size="small"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clear();
                }}
                sx={{ color: theme.app.dashboard.textMuted, p: 0.25 }}
                aria-label={`Clear ${label}`}
              >
                ✕
              </IconButton>
            ) : null}
          </Box>

          {showPanel ? (
            <Paper
              elevation={0}
              sx={{
                mt: 1,
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: FORM_MODAL_MUI_OVERLAY_Z_INDEX,
                maxHeight: listMaxHeight,
                overflowY: "auto",
                borderRadius: 2,
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
                bgcolor: theme.app.dashboard.menuSurfaceBg,
                backgroundImage: "none",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
                boxShadow: "none",
              }}
            >
              {filtered.length === 0 ? (
                <Box sx={{ px: 1.5, py: 1.25 }}>
                  <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                    {noMatchesMessage}
                  </Typography>
                </Box>
              ) : (
                filtered.map((opt) => {
                  const active = opt.value === value && !opt.disabled;
                  return (
                    <Box
                      key={`${opt.value}:${opt.label}`}
                      component="button"
                      type="button"
                      disabled={Boolean(opt.disabled)}
                      onMouseDown={(e) => {
                        if (opt.disabled) return;
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (opt.disabled) return;
                        pick(opt);
                      }}
                      sx={{
                        width: "100%",
                        textAlign: "left",
                        px: 1.5,
                        py: 1,
                        border: "none",
                        cursor: opt.disabled ? "default" : "pointer",
                        color: theme.app.text.primary,
                        bgcolor: theme.app.dashboard.menuSurfaceBg,
                        borderLeft: active ? `3px solid ${theme.app.dashboard.accentBlue}` : "3px solid transparent",
                        borderBottom: `1px solid ${theme.app.dashboard.overlayLight}`,
                        opacity: opt.disabled ? 0.65 : 1,
                        ...(!opt.disabled
                          ? {
                              "&:hover": {
                                bgcolor: theme.app.dashboard.pillBg,
                              },
                            }
                          : {}),
                      }}
                    >
                      <Typography variant="medium">{opt.label}</Typography>
                    </Box>
                  );
                })
              )}
            </Paper>
          ) : null}
        </Box>
      </ClickAwayListener>
    </Box>
  );
}
