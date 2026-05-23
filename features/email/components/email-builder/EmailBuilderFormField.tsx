"use client";

import { useId, useRef, type ReactNode } from "react";
import Box from "@mui/material/Box";
import { useTheme, alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { InputField, Label } from "@/components/common";
import type { InputFieldProps } from "@/components/common/InputField/InputField.types";
import { SelectField, type SelectFieldProps } from "@/components/common/SelectField/SelectField";

export function toColorInputValue(raw: string | undefined, fallback: string): string {
  const t = (raw ?? "").trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t;
  if (/^[0-9A-Fa-f]{6}$/.test(t)) return `#${t}`;
  return fallback;
}

/** Compact field stack for the email builder tools panel */
export const emailBuilderFieldSx: SxProps<Theme> = {
  "& label": {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.02em",
    marginBottom: "6px !important",
  },
  "& .MuiFormHelperText-root": {
    minHeight: 0,
    marginTop: "4px !important",
  },
};

export function EmailBuilderInputField({
  sx,
  ...props
}: InputFieldProps) {
  return (
    <InputField
      dense
      {...props}
      sx={[emailBuilderFieldSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    />
  );
}

export function EmailBuilderSelectField(props: SelectFieldProps) {
  return <SelectField dense searchable={false} menuMaxRows={8} {...props} />;
}

export function EmailBuilderColorField({
  label,
  value,
  onChange,
  disabled,
  fallback = "#ffffff",
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
  fallback?: string;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const pickerRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const pickerValue = toColorInputValue(value, fallback);
  const displayValue = value?.trim() || pickerValue;

  const openPicker = () => {
    if (disabled) return;
    pickerRef.current?.click();
  };

  return (
    <Box>
      <Label
        htmlFor={fieldId}
        variant="mediumSmall"
        sx={{ mb: 0.75, color: d.textMuted, fontWeight: 600 }}
      >
        {label}
      </Label>
      <Box sx={{ display: "flex", gap: 1, alignItems: "stretch", position: "relative" }}>
        <Box
          component="button"
          type="button"
          disabled={disabled}
          onClick={openPicker}
          aria-label={`${label} — open color picker`}
          sx={{
            m: 0,
            p: 0,
            width: 48,
            height: 40,
            flexShrink: 0,
            borderRadius: 1.25,
            border: `2px solid ${alpha(d.cardBorder, 0.95)}`,
            background: displayValue,
            cursor: disabled ? "not-allowed" : "pointer",
            boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.black, 0.12)}`,
            transition: "border-color 0.15s ease, transform 0.12s ease",
            "&:hover": disabled
              ? undefined
              : {
                  borderColor: theme.palette.primary.main,
                  transform: "scale(1.03)",
                },
          }}
        />
        <Box
          component="input"
          ref={pickerRef}
          type="color"
          value={pickerValue}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 48,
            height: 40,
            opacity: 0,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
          aria-label={`${label} color picker`}
        />
        <Box
          component="input"
          id={fieldId}
          type="text"
          value={value}
          disabled={disabled}
          placeholder={fallback}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} hex value`}
          sx={{
            flex: 1,
            minWidth: 0,
            height: 40,
            px: 1.25,
            borderRadius: 1.25,
            border: `1px solid ${d.cardBorder}`,
            bgcolor: d.overlayLight ?? alpha(theme.palette.common.white, 0.04),
            color: theme.palette.text.primary,
            fontFamily: "inherit",
            fontSize: 13,
            outline: "none",
            "&:focus": {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.22)}`,
            },
            "&:disabled": {
              opacity: 0.55,
              cursor: "not-allowed",
            },
          }}
        />
      </Box>
    </Box>
  );
}

export function EmailBuilderFieldStack({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={[
        {
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          "& > *": { width: "100%" },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
}
