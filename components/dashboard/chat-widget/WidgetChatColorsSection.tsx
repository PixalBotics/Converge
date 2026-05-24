"use client";

import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { WidgetColorPickerField } from "@/components/dashboard/chat-widget/WidgetColorPickerField";
import {
  deriveWidgetChatColorsDraft,
  WIDGET_CHAT_COLOR_FIELD_GROUPS,
  type WidgetChatColorsDraft,
  type WidgetChatColorsDraftKey,
} from "@/lib/chat-widget/widget-colors-draft";

function ColorFieldRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <WidgetColorPickerField
      label={label}
      value={value}
      onChange={onChange}
      fallback="#64748b"
    />
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
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary }}>
            Widget UI colors (chat.colors)
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.5 }}>
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
              <Typography variant="subtitle2" sx={{ color: theme.app.text.primary, mb: 0.5 }}>
                {group.title}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
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
