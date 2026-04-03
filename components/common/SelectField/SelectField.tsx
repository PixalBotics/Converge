"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import { Label } from "@/components/common/Label";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import { selectFieldStyles } from "./SelectField.styles";

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
  const theme = useTheme();

  return (
    <Box sx={{ width: "100%" }}>
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, "-")} variant="mediumLarge" sx={{ mb: 0.75 }}>
        {label}
      </Label>
      <TextField
        id={label.toLowerCase().replace(/\s+/g, "-")}
        select
        fullWidth
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        variant="outlined"
        sx={[textFieldStyles(theme), ...selectFieldStyles(theme)]}
        SelectProps={{
          MenuProps: {
            sx: {
              zIndex: 1600,
            },
            PaperProps: {
              sx: {
                bgcolor: "#020617",
                borderRadius: 2,
                mt: 1,
                border: "1px solid rgba(148,163,184,0.3)",
                boxShadow: "0 18px 45px rgba(15,23,42,0.85)",
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              fontFamily: "Manrope",
              fontSize: 14,
              color: "rgba(249,250,251,0.9)",
              "&.Mui-selected": {
                bgcolor: "rgba(59,130,246,0.18)",
              },
              "&.Mui-selected:hover": {
                bgcolor: "rgba(59,130,246,0.24)",
              },
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

