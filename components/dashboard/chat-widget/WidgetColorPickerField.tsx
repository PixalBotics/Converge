"use client";

import { useId, useRef } from "react";
import Box from "@mui/material/Box";
import { useTheme, alpha } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Label } from "@/components/common";

export function toWidgetColorInputValue(raw: string | undefined, fallback: string): string {
  const t = (raw ?? "").trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t;
  if (/^[0-9A-Fa-f]{6}$/.test(t)) return `#${t}`;
  return fallback;
}

export function WidgetColorPickerField({
  label,
  value,
  onChange,
  disabled,
  fallback = "#2563eb",
  optional,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
  fallback?: string;
  /** When true, empty hex is allowed (e.g. theme primary falls back to launcher color). */
  optional?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const pickerRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const pickerValue = toWidgetColorInputValue(value, fallback);
  const swatchColor = value?.trim() ? toWidgetColorInputValue(value, fallback) : fallback;

  const openPicker = () => {
    if (disabled) return;
    pickerRef.current?.click();
  };

  return (
    <Box sx={{ minWidth: 0, width: "100%" }}>
      <Label
        htmlFor={fieldId}
        variant="mediumSmall"
        sx={{
          mb: 0.75,
          color: d.textMuted,
          fontWeight: 600,
          display: "block",
          lineHeight: 1.35,
        }}
      >
        {label}
        {optional ? (
          <Box component="span" sx={{ fontWeight: 400, opacity: 0.85 }}>
            {" "}
            (optional)
          </Box>
        ) : null}
      </Label>
      <Box sx={{ display: "flex", gap: 0.75, alignItems: "stretch", position: "relative" }}>
        <Box
          component="button"
          type="button"
          disabled={disabled}
          onClick={openPicker}
          aria-label={`${label} — open color picker`}
          sx={{
            m: 0,
            p: 0,
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 1.25,
            border: `2px solid ${alpha(d.cardBorder, 0.95)}`,
            background: swatchColor,
            cursor: disabled ? "not-allowed" : "pointer",
            boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.black, 0.14)}`,
            transition: "border-color 0.15s ease, transform 0.12s ease",
            "&:hover": disabled
              ? undefined
              : {
                  borderColor: theme.palette.primary.main,
                  transform: "scale(1.04)",
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
            width: 40,
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
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 13,
            letterSpacing: "0.02em",
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
