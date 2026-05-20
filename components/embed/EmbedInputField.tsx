"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  embedInputFieldSx,
  embedLabelTextSx,
} from "@/lib/widget-runtime/embed-theme-sx";
import type { RuntimeChatAppearance } from "@/lib/widget-runtime/widget-runtime-appearance";

export interface EmbedInputFieldProps {
  label: string;
  name: string;
  appearance: RuntimeChatAppearance;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email";
  error?: boolean;
  helperText?: string;
  inputMode?: "tel" | "text" | "email";
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  sx?: SxProps<Theme>;
}

/**
 * Pre-chat / composer field that uses only widget `chat.colors` (not dashboard `theme.app`).
 */
export function EmbedInputField({
  label,
  name,
  appearance,
  value,
  onChange,
  type = "text",
  error = false,
  helperText,
  inputMode,
  multiline = false,
  rows = 3,
  placeholder,
  sx,
}: EmbedInputFieldProps) {
  const fieldId = `embed-${name}`;

  return (
    <Box sx={sx}>
      <Box
        component="label"
        htmlFor={fieldId}
        sx={{ display: "block", mb: 0.5, ...embedLabelTextSx(appearance) }}
      >
        {label}
      </Box>
      <TextField
        id={fieldId}
        name={name}
        fullWidth
        variant="outlined"
        type={multiline ? undefined : type}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        helperText={helperText}
        placeholder={placeholder}
        inputProps={{
          inputMode,
          "aria-label": label,
        }}
        sx={embedInputFieldSx(appearance)}
      />
    </Box>
  );
}
