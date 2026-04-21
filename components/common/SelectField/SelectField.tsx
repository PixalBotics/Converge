"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Label } from "@/components/common/Label";
import {
  applyOutlineFieldCursorPosition,
  resetOutlineFieldCursorPosition,
} from "@/components/common/InputField/outlineFieldCursor";
import { FORM_MODAL_MUI_OVERLAY_Z_INDEX } from "@/lib/ui/dialogStacking";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import { selectFieldStyles, selectMenuItemSx, selectMenuPaperSx } from "./SelectField.styles";

export interface SelectFieldOption {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectFieldOption[];
  placeholder?: string;
  disabled?: boolean;
  /** Cap visible menu height to this many rows; extra options scroll inside the panel. */
  menuMaxRows?: number;
  /**
   * When enabled, renders an autocomplete (typeahead) instead of a plain select.
   * Default: true (searchable across the dashboard).
   */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** For scroll-to-error: sets `data-setup-scroll-anchor` (comma-separated paths allowed). */
  scrollAnchorPath?: string;
}

/** Dense `MenuItem` row height used only when `menuMaxRows` is set (compact, predictable scroll). */
const MENU_ITEM_DENSE_APPROX_PX = 40;
const MENU_LIST_EDGE_PADDING_PX = 12;

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  menuMaxRows,
  searchable = true,
  searchPlaceholder,
  scrollAnchorPath,
}: SelectFieldProps) {
  const theme = useTheme() as AppTheme;
  const fieldId = label.toLowerCase().replace(/\s+/g, "-");
  const menuCapped = menuMaxRows != null && menuMaxRows > 0;
  const menuMaxHeightPx = menuCapped
    ? menuMaxRows * MENU_ITEM_DENSE_APPROX_PX + MENU_LIST_EDGE_PADDING_PX
    : null;

  /**
   * MUI Menu `Paper` defaults to a large max-height; we cap height and keep scrolling on the
   * `MenuList` so options are not visually “cut” at the panel edge.
   */
  const menuListSx = menuMaxHeightPx
    ? {
        flex: "1 1 auto",
        minHeight: 0,
        maxHeight: "100%",
        overflowY: "auto",
        overscrollBehavior: "contain",
        py: 0.5,
        // Keep dropdown scroll behavior but hide scrollbar visuals.
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }
    : undefined;

  const menuPaperSx = menuMaxHeightPx
    ? {
        maxHeight: `${menuMaxHeightPx}px`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }
    : undefined;

  const paperStyle = menuMaxHeightPx
    ? ({
        maxHeight: menuMaxHeightPx,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      } as const)
    : undefined;

  const selectedOption = options.find((o) => o.value === value) ?? null;

  if (searchable) {
    return (
      <Box
        sx={{ width: "100%" }}
        {...(scrollAnchorPath ? { "data-setup-scroll-anchor": scrollAnchorPath } : {})}
      >
        <Label htmlFor={fieldId} variant="mediumLarge" sx={{ mb: 0.75 }}>
          {label}
        </Label>

        <Autocomplete<SelectFieldOption, false, false, false>
          id={fieldId}
          options={options}
          value={selectedOption}
          disabled={disabled}
          getOptionLabel={(opt) => opt.label}
          onChange={(_, opt) => onChange(opt?.value ?? "")}
          autoHighlight
          isOptionEqualToValue={(a, b) => a.value === b.value}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.value || `__label__:${option.label}`}>
              {option.label}
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={searchPlaceholder ?? placeholder}
              variant="outlined"
              onMouseMove={applyOutlineFieldCursorPosition}
              onMouseLeave={resetOutlineFieldCursorPosition}
              sx={[textFieldStyles(theme), ...selectFieldStyles(theme)]}
              inputProps={{
                ...params.inputProps,
                "aria-label": label,
              }}
            />
          )}
          ListboxProps={{
            style: menuMaxHeightPx ? { maxHeight: menuMaxHeightPx, overflow: "auto" } : undefined,
          }}
          slotProps={{
            popper: {
              placement: "bottom-start",
              modifiers: [
                // Always open below the field (no auto-flip to top).
                { name: "flip", enabled: false },
                { name: "preventOverflow", enabled: true, options: { altAxis: true, padding: 8 } },
              ],
              sx: { zIndex: FORM_MODAL_MUI_OVERLAY_Z_INDEX },
            },
            paper: {
              sx: [selectMenuPaperSx(theme), menuPaperSx ?? {}],
            },
          }}
        />
      </Box>
    );
  }

  const emptyLabel = options.find((o) => o.value === "")?.label ?? placeholder ?? "— Select —";

  return (
    <Box
      sx={{ width: "100%" }}
      {...(scrollAnchorPath ? { "data-setup-scroll-anchor": scrollAnchorPath } : {})}
    >
      <Label htmlFor={fieldId} variant="mediumLarge" sx={{ mb: 0.75 }}>
        {label}
      </Label>
      <TextField
        id={fieldId}
        select
        fullWidth
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onMouseMove={applyOutlineFieldCursorPosition}
        onMouseLeave={resetOutlineFieldCursorPosition}
        placeholder={placeholder}
        variant="outlined"
        sx={[textFieldStyles(theme), ...selectFieldStyles(theme)]}
        SelectProps={{
          displayEmpty: true,
          renderValue: (selected) => {
            const v = String(selected ?? "");
            const isEmpty = !v.trim();
            const opt = options.find((o) => o.value === v);
            const text = isEmpty ? emptyLabel : (opt?.label ?? v);
            return (
              <Box
                component="span"
                sx={{
                  color: isEmpty ? theme.app.text.placeholder : theme.app.text.primary,
                  fontFamily: "Manrope",
                  fontWeight: 500,
                  fontSize: "14px",
                }}
              >
                {text}
              </Box>
            );
          },
          MenuProps: {
            sx: { zIndex: FORM_MODAL_MUI_OVERLAY_Z_INDEX },
            anchorOrigin: { vertical: "bottom", horizontal: "left" },
            transformOrigin: { vertical: "top", horizontal: "left" },
            ...(menuCapped ? { marginThreshold: 8 } : {}),
            MenuListProps: menuListSx ? { sx: menuListSx } : undefined,
            PaperProps: {
              sx: [selectMenuPaperSx(theme), menuPaperSx ?? {}],
              ...(paperStyle ? { style: paperStyle } : {}),
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            dense={menuCapped}
            sx={[
              selectMenuItemSx(theme),
              menuCapped
                ? {
                    minHeight: MENU_ITEM_DENSE_APPROX_PX,
                    py: 0.75,
                    fontSize: 13,
                  }
                : {},
            ]}
          >
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
