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
}

export function SelectField({ label, value, onChange, options, placeholder }: SelectFieldProps) {
  const theme = useTheme() as AppTheme;
  const fieldId = label.toLowerCase().replace(/\s+/g, "-");

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

