"use client";

import { useCallback, useState, type ChangeEvent } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import {
  deriveWidgetChatColorsDraft,
  WIDGET_CHAT_COLOR_FIELD_GROUPS,
  type WidgetChatColorsDraft,
  type WidgetChatColorsDraftKey,
} from "@/lib/chat-widget/widget-colors-draft";

function normalizeHexInput(raw: string, fallback: string): string {
  const t = raw.trim();
  if (/^#[0-9A-Fa-f]{3,8}$/.test(t)) return t;
  if (/^[0-9A-Fa-f]{6}$/.test(t)) return `#${t}`;
  return fallback;
}

function ColorFieldRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const theme = useTheme() as AppTheme;
  const isHex = /^#[0-9A-Fa-f]{3,8}$/.test(value.trim());
  const pickerValue = isHex ? value.trim().slice(0, 7) : "#64748b";

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "140px 1fr" }, gap: 1, alignItems: "center" }}>
      <Typography variant="body2" sx={{ color: theme.app.text.primary }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          component="input"
          type="color"
          value={pickerValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          sx={{
            width: 40,
            height: 40,
            p: 0,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            borderRadius: "4px",
            bgcolor: "transparent",
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <InputField
          label=""
          name={`color-${label.replace(/\s+/g, "-").toLowerCase()}`}
          value={value}
          onChange={(e) => onChange(normalizeHexInput(e.target.value, value))}
          sx={{ "& .MuiFormLabel-root": { display: "none" } }}
        />
      </Box>
    </Box>
  );
}

export function WidgetChatColorsSection({
  colors,
  onChange,
  brandScalars,
}: {
  colors: WidgetChatColorsDraft;
  onChange: (next: WidgetChatColorsDraft) => void;
  brandScalars: {
    buttonColor: string;
    buttonHoverColor: string;
    iconColor: string;
    textColor: string;
    themeSecondaryColor: string;
    backgroundColor: string;
  };
}) {
  const theme = useTheme() as AppTheme;
  const [open, setOpen] = useState(true);

  const setField = useCallback(
    (key: WidgetChatColorsDraftKey, hex: string) => {
      onChange({ ...colors, [key]: hex });
    },
    [colors, onChange],
  );

  const resetFromBrand = () => {
    onChange(
      deriveWidgetChatColorsDraft({
        buttonColor: brandScalars.buttonColor,
        buttonHoverColor: brandScalars.buttonHoverColor,
        iconColor: brandScalars.iconColor,
        textColor: brandScalars.textColor,
        themeSecondaryColor: brandScalars.themeSecondaryColor,
        backgroundColor: brandScalars.backgroundColor,
      }),
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="medium16" sx={{ color: theme.app.text.primary, fontWeight: 600 }}>
            Widget UI colors (chat.colors)
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.75, lineHeight: 1.5 }}>
            Maps to <code>theme.designJson.chat.colors</code> — messages, form fields, inquiry pills, and handover
            button on the live embed.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button type="button" variant="secondary" onClick={() => setOpen((o) => !o)}>
            {open ? "Collapse" : "Expand"}
          </Button>
          <Button type="button" variant="secondary" onClick={resetFromBrand}>
            Reset from brand colors
          </Button>
        </Box>
      </Box>

      <Collapse in={open}>
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            p: 2,
            borderRadius: 2,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            bgcolor: "rgba(6, 12, 54, 0.25)",
          }}
        >
          {WIDGET_CHAT_COLOR_FIELD_GROUPS.map((group) => (
            <Box key={group.title}>
              <Typography variant="medium16" sx={{ color: theme.app.text.primary, fontWeight: 600, mb: 0.5 }}>
                {group.title}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1, lineHeight: 1.5 }}>
                {group.description}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {group.fields.map((f) => (
                  <ColorFieldRow
                    key={f.key}
                    label={f.label}
                    value={colors[f.key]}
                    onChange={(hex) => setField(f.key, hex)}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
