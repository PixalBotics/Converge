"use client";

import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Label } from "@/components/common/Label";

export interface PolicyMinutesFieldProps {
  label: string;
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  helperText?: string;
}

export function PolicyMinutesField({
  label,
  value,
  onChange,
  disabled = false,
  min = 1,
  max = 1440,
  helperText,
}: PolicyMinutesFieldProps) {
  const theme = useTheme() as AppTheme;
  const fieldId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <Box>
      <Label htmlFor={fieldId} variant="mediumSmall" sx={{ mb: 0.75, display: "block" }}>
        {label}
      </Label>
      <TextField
        id={fieldId}
        type="number"
        disabled={disabled}
        value={String(value)}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isFinite(n)) return;
          onChange(Math.max(min, Math.min(max, Math.round(n))));
        }}
        inputProps={{ min, max, step: 1, "aria-label": label }}
        fullWidth
        helperText={helperText ?? "\u00a0"}
        FormHelperTextProps={{
          sx: {
            minHeight: "1.1rem",
            mt: 0.5,
            fontSize: 11,
            color: theme.app.dashboard.textMuted,
            ...(helperText ? {} : { visibility: "hidden" }),
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Box
                component="span"
                sx={{
                  px: 1,
                  py: 0.35,
                  borderRadius: 1,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  color: theme.app.dashboard.accentBlue,
                  bgcolor: alpha(theme.app.dashboard.accentBlue, 0.12),
                }}
              >
                min
              </Box>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            bgcolor: alpha(theme.app.dashboard.overlayLight, 0.45),
            border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.9)}`,
            "& fieldset": { border: "none" },
            "&:hover": {
              bgcolor: alpha(theme.app.dashboard.overlayLight, 0.65),
            },
            "&.Mui-focused": {
              borderColor: alpha(theme.app.dashboard.accentBlue, 0.55),
              boxShadow: `0 0 0 1px ${alpha(theme.app.dashboard.accentBlue, 0.25)}`,
            },
            "& input": {
              color: theme.app.text.primary,
              fontWeight: 600,
              fontSize: 15,
              py: 1.1,
            },
          },
        }}
      />
    </Box>
  );
}
