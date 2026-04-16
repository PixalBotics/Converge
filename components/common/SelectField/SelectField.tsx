"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Label } from "@/components/common/Label";
import {
  applyOutlineFieldCursorPosition,
  resetOutlineFieldCursorPosition,
} from "@/components/common/InputField/outlineFieldCursor";
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
  /** Cap visible menu height to this many rows; extra options scroll inside the panel. */
  menuMaxRows?: number;
}

/** Default MUI `MenuItem` (non-dense) min-height is 48px; small padding for list edges. */
const MENU_ITEM_APPROX_PX = 48;
const MENU_LIST_EDGE_PADDING_PX = 16;

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  menuMaxRows,
}: SelectFieldProps) {
  const theme = useTheme() as AppTheme;
  const fieldId = label.toLowerCase().replace(/\s+/g, "-");
  const menuListScrollSx =
    menuMaxRows != null && menuMaxRows > 0
      ? {
          maxHeight: menuMaxRows * MENU_ITEM_APPROX_PX + MENU_LIST_EDGE_PADDING_PX,
          overflowY: "auto",
        }
      : undefined;

  return (
    <Box sx={{ width: "100%" }}>
      <Label htmlFor={fieldId} variant="mediumLarge" sx={{ mb: 0.75 }}>
        {label}
      </Label>
      <TextField
        id={fieldId}
        select
        fullWidth
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onMouseMove={applyOutlineFieldCursorPosition}
        onMouseLeave={resetOutlineFieldCursorPosition}
        placeholder={placeholder}
        variant="outlined"
        sx={[textFieldStyles(theme), ...selectFieldStyles(theme)]}
        SelectProps={{
          MenuProps: {
            sx: {
              zIndex: 1600,
            },
            MenuListProps: menuListScrollSx ? { sx: menuListScrollSx } : undefined,
            PaperProps: {
              sx: selectMenuPaperSx(theme),
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={selectMenuItemSx(theme)}
          >
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

