"use client";

import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Label } from "@/components/common/Label";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import {
  applyOutlineFieldCursorPosition,
  resetOutlineFieldCursorPosition,
} from "@/components/common/InputField/outlineFieldCursor";
import { mergeSx } from "@/lib/mui/merge-sx";

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
  const accent = theme.palette.primary.main;
  const isLight = theme.palette.mode === "light";
  const fieldId = label.toLowerCase().replace(/\s+/g, "-");
  const hasHelperMessage = Boolean(helperText?.trim());

  const minutesFieldSx: SxProps<Theme> = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: isLight ? "rgba(255, 255, 255, 0.16)" : "rgba(8, 12, 22, 0.18)",
      backgroundImage:
        "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
      border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.85)}`,
      "&::before": {
        display: "none",
      },
      "&:hover": {
        borderColor: theme.app.dashboard.cardBorder,
      },
      "&.Mui-focused": {
        borderColor: alpha(accent, 0.65),
      },
      "&::after": {
        background: `radial-gradient(180px at var(--input-cursor-x, 50%) var(--input-cursor-y, 50%), ${accent} 0%, ${accent} 28%, transparent 82%)`,
        filter: `drop-shadow(0 0 6px ${accent})`,
      },
      "& input": {
        fontWeight: 600,
        fontSize: 15,
        py: 1.25,
      },
    },
  };

  return (
    <Box>
      <Label htmlFor={fieldId} variant="mediumSmall" sx={{ mb: 0.75, display: "block" }}>
        {label}
      </Label>
      <TextField
        id={fieldId}
        type="number"
        variant="outlined"
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
        onMouseMove={applyOutlineFieldCursorPosition}
        onMouseLeave={resetOutlineFieldCursorPosition}
        FormHelperTextProps={{
          sx: {
            minHeight: "1.25rem",
            mt: 0.75,
            fontSize: 12,
            lineHeight: 1.43,
            color: theme.app.dashboard.textMuted,
            ...(!hasHelperMessage ? { visibility: "hidden" as const, userSelect: "none" } : {}),
          },
          ...(!hasHelperMessage ? { "aria-hidden": true } : {}),
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
                  color: accent,
                  bgcolor: alpha(accent, 0.14),
                  border: `1px solid ${alpha(accent, 0.28)}`,
                }}
              >
                min
              </Box>
            </InputAdornment>
          ),
        }}
        sx={mergeSx(textFieldStyles(theme), minutesFieldSx)}
      />
    </Box>
  );
}
