"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { EmailBlockFieldDef } from "../../constants/email-block-fields";
import type { EmailFieldIconStyle } from "../../constants/email-block-fields";
import { EMAIL_ICON_STYLE_OPTIONS } from "../../utils/email-theme";
import { EmailFieldIcon } from "../../constants/email-field-icon-library";

const OPTION_HINTS: Record<EmailFieldIconStyle, string> = {
  mui: "SVG icons in email",
  emoji: "Unicode emoji",
  symbol: "Simple symbols",
  minimal: "Labels only",
};

function previewGlyph(
  field: EmailBlockFieldDef,
  style: EmailFieldIconStyle,
  accent: string,
): ReactNode {
  if (style === "minimal") {
    return (
      <Typography variant="caption" sx={{ color: "text.disabled", fontSize: 11, fontWeight: 700 }}>
        —
      </Typography>
    );
  }
  if (style === "mui") {
    return <EmailFieldIcon iconKey={field.iconKey} color={accent} size={22} />;
  }
  return (
    <Typography component="span" sx={{ fontSize: 20, lineHeight: 1 }}>
      {field.icons[style] || field.icons.emoji}
    </Typography>
  );
}

export function IconStylePicker({
  label = "Field icons",
  value,
  onChange,
  disabled,
  sampleField,
  accentColor,
  compact = false,
}: {
  label?: string;
  value: EmailFieldIconStyle;
  onChange: (next: EmailFieldIconStyle) => void;
  disabled?: boolean;
  sampleField: EmailBlockFieldDef;
  accentColor?: string;
  compact?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const accent = accentColor ?? theme.palette.primary.main;
  const d = theme.app.dashboard;

  return (
    <Box sx={{ minWidth: 0, maxWidth: "100%" }}>
      <Typography variant="caption" fontWeight={700} sx={{ mb: 0.75, display: "block" }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: compact
            ? "minmax(0, 1fr) minmax(0, 1fr)"
            : { xs: "minmax(0, 1fr) minmax(0, 1fr)", sm: "repeat(4, minmax(0, 1fr))" },
          gap: 0.75,
          minWidth: 0,
          maxWidth: "100%",
          "& > *": { minWidth: 0 },
        }}
      >
        {EMAIL_ICON_STYLE_OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <Box
              key={opt.value}
              component="button"
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(opt.value);
              }}
              aria-pressed={selected}
              sx={{
                m: 0,
                position: "relative",
                p: compact ? 1 : 1.25,
                textAlign: "center",
                cursor: disabled ? "not-allowed" : "pointer",
                borderRadius: 1.5,
                border: `1px solid ${selected ? alpha(accent, 0.7) : alpha(d.cardBorder, 0.9)}`,
                bgcolor: selected
                  ? `linear-gradient(160deg, ${alpha(accent, 0.22)} 0%, ${alpha(theme.palette.common.black, 0.12)} 100%)`
                  : alpha(theme.palette.common.white, 0.04),
                opacity: disabled ? 0.55 : 1,
                transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
                boxShadow: selected ? `0 4px 14px ${alpha(accent, 0.2)}` : "none",
                "&:hover": disabled
                  ? undefined
                  : {
                      borderColor: accent,
                      bgcolor: `${accent}14`,
                    },
              }}
            >
              {selected ? (
                <CheckCircleOutlined
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    fontSize: 14,
                    color: accent,
                  }}
                />
              ) : null}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 32,
                  mb: 0.5,
                }}
              >
                {previewGlyph(sampleField, opt.value, accent)}
              </Box>
              <Typography variant="caption" fontWeight={selected ? 700 : 600} sx={{ display: "block" }}>
                {opt.label.split(" (")[0]}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: d.textMuted,
                  display: "block",
                  lineHeight: 1.25,
                  mt: 0.25,
                  fontSize: 10,
                }}
              >
                {OPTION_HINTS[opt.value]}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export function FieldIconPreview({
  field,
  iconStyle,
  accent,
  visible = true,
}: {
  field: EmailBlockFieldDef;
  iconStyle: EmailFieldIconStyle;
  accent: string;
  visible?: boolean;
}) {
  if (!visible || iconStyle === "minimal") {
    return (
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1,
          bgcolor: "action.hover",
          flexShrink: 0,
        }}
      />
    );
  }
  if (iconStyle === "mui") {
    return (
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: `${accent}14`,
          border: `1px solid ${accent}33`,
          flexShrink: 0,
        }}
      >
        <EmailFieldIcon iconKey={field.iconKey} color={accent} size={17} />
      </Box>
    );
  }
  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "action.hover",
        fontSize: 16,
        flexShrink: 0,
      }}
    >
      {field.icons[iconStyle] || field.icons.emoji}
    </Box>
  );
}
